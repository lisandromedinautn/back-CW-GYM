#!/usr/bin/env node
// Regla del CLAUDE.md: PROHIBIDO instalar una versión publicada hace menos de 24 horas.
//
//   node scripts/verificar-antiguedad-paquetes.mjs          dependencias directas de package.json:
//                                                          versión exacta y publicada hace más de 24 h
//   node scripts/verificar-antiguedad-paquetes.mjs --lock   además, las entradas de yarn.lock que no
//                                                          estaban en el último commit (transitivas)
//
// Corre sola en el pre-commit (lint-staged) cuando cambian package.json o yarn.lock.
// Sin conexión al registro de npm, falla: la regla no se saltea.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const HORAS_MINIMAS = 24;
const LIMITE = Date.now() - HORAS_MINIMAS * 60 * 60 * 1000;
const REGISTRO = 'https://registry.npmjs.org';
const CONCURRENCIA = 8;
const VERSION_EXACTA = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const errores = [];

function dependenciasDirectas() {
  const paquete = JSON.parse(readFileSync('package.json', 'utf8'));
  return Object.entries({ ...paquete.dependencies, ...paquete.devDependencies });
}

// yarn.lock v1: un encabezado sin sangría ("nombre@rango", ...:) seguido de `  version "x.y.z"`.
function entradasDelLock(texto) {
  const entradas = new Set();
  let nombre = null;
  for (const linea of texto.split(/\r?\n/)) {
    if (linea && !linea.startsWith(' ') && !linea.startsWith('#') && linea.endsWith(':')) {
      const especificacion = linea.split(',')[0].replace(/"/g, '').replace(/:$/, '').trim();
      nombre = especificacion.slice(0, especificacion.lastIndexOf('@'));
    } else if (nombre && linea.startsWith('  version ')) {
      entradas.add(`${nombre}@${linea.trim().split(' ')[1].replace(/"/g, '')}`);
      nombre = null;
    }
  }
  return entradas;
}

function lockDelUltimoCommit() {
  try {
    return execFileSync('git', ['show', 'HEAD:yarn.lock'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

async function fechaDePublicacion(nombre, version) {
  const respuesta = await fetch(`${REGISTRO}/${nombre.replace('/', '%2F')}`);
  if (!respuesta.ok) throw new Error(`el registro respondió ${respuesta.status}`);
  const datos = await respuesta.json();
  const fecha = datos.time?.[version];
  if (!fecha) throw new Error(`la versión ${version} no existe en el registro`);
  return Date.parse(fecha);
}

async function verificar(nombre, version) {
  try {
    const publicada = await fechaDePublicacion(nombre, version);
    if (publicada > LIMITE) {
      const horas = ((Date.now() - publicada) / 3_600_000).toFixed(1);
      errores.push(
        `${nombre}@${version} se publicó hace ${horas} h (mínimo ${HORAS_MINIMAS} h). Elegí la versión anterior.`,
      );
    }
  } catch (error) {
    errores.push(`${nombre}@${version}: no se pudo verificar (${error.message}).`);
  }
}

async function enLotes(tareas) {
  for (let i = 0; i < tareas.length; i += CONCURRENCIA) {
    await Promise.all(tareas.slice(i, i + CONCURRENCIA).map((tarea) => tarea()));
  }
}

const directas = dependenciasDirectas();
for (const [nombre, version] of directas) {
  if (!VERSION_EXACTA.test(version)) {
    errores.push(
      `${nombre}: "${version}" no es una versión exacta. Instalá con \`yarn add ${nombre}@<versión> --exact\`.`,
    );
  }
}
const aVerificar = new Map(
  directas
    .filter(([, version]) => VERSION_EXACTA.test(version))
    .map(([n, v]) => [`${n}@${v}`, [n, v]]),
);

if (process.argv.includes('--lock')) {
  const anteriores = entradasDelLock(lockDelUltimoCommit());
  for (const entrada of entradasDelLock(readFileSync('yarn.lock', 'utf8'))) {
    if (anteriores.has(entrada)) continue;
    const separador = entrada.lastIndexOf('@');
    aVerificar.set(entrada, [entrada.slice(0, separador), entrada.slice(separador + 1)]);
  }
}

await enLotes(
  [...aVerificar.values()].map(
    ([nombre, version]) =>
      () =>
        verificar(nombre, version),
  ),
);

if (errores.length > 0) {
  console.error('\n✖ Verificación de antigüedad de paquetes (regla de las 24 h):\n');
  for (const error of errores) console.error(`  - ${error}`);
  console.error(
    '\nSi una dependencia transitiva es demasiado nueva, fijá una versión anterior con "resolutions" en package.json.\n',
  );
  process.exit(1);
}
console.log(
  `✔ ${aVerificar.size} versiones verificadas: todas exactas y publicadas hace más de ${HORAS_MINIMAS} h.`,
);
