#!/usr/bin/env node
// Hook commit-msg: protege los tests y la propia protección. Mismo archivo en back y front.
//
// 1. Si el commit modifica, borra o renombra un test existente o su soporte (dobles, setup,
//    fichas, config de Vitest/Playwright), el mensaje tiene que traer la aprobación explícita
//    de quien hace el commit:
//        Tests-aprobados-por: <git config user.name>
//    Los tests nuevos (agregados) no la piden: es el ciclo normal de TDD.
// 2. Si el commit toca la protección (.husky/, .claude/settings.json o este script), tiene que
//    traer un justificativo escrito. El registro es el historial de git (autor, fecha y texto):
//        Justificacion-hook: <por qué se cambia, 30 caracteres o más>
//    Auditoría: git log --grep="Justificacion-hook" --format="%h %an %ad%n%b"
//
// Los merges no se revisan: cada commit de la rama ya pasó por este hook.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const TESTS = [
  /\.(spec|int-spec|e2e-spec)\.ts$/, // back
  /\.test\.tsx?$/, // front
  /^test\//, // back: e2e, integración, dobles y datasets
  /^e2e\//, // front: Playwright
  /^src\/pruebas\//, // front: setup de Vitest y red falsa
  /(^|\/)FICHAS-TEST\.md$/,
  /(^|\/)(vitest|vite|playwright)[^/]*\.config\.[cm]?[jt]s$/,
];
const PROTECCION = [
  /^\.husky\//,
  /^\.claude\/settings(\.local)?\.json$/,
  /^scripts\/proteger-tests\.mjs$/,
];
const MINIMO_JUSTIFICATIVO = 30;

const gitDir = git('rev-parse', '--git-dir');
if (existsSync(join(gitDir, 'MERGE_HEAD'))) process.exit(0);

const mensaje = readFileSync(process.argv[2], 'utf8')
  .split(/\r?\n/)
  .filter((linea) => !linea.startsWith('#'))
  .join('\n');
const trailer = (clave) =>
  mensaje.match(new RegExp(`^${clave}:[ \\t]*(.*)$`, 'mi'))?.[1].trim() ?? '';

/** [estado, ruta] de lo staged. En un renombre se mira la ruta de origen. */
const cambios = git('diff', '--cached', '--name-status', '-M')
  .split('\n')
  .filter(Boolean)
  .map((linea) => {
    const [estado, origen] = linea.split('\t');
    return [estado[0], origen];
  });

const coincide = (patrones) => (ruta) => patrones.some((p) => p.test(ruta));
const testsTocados = cambios
  .filter(([estado, ruta]) => estado !== 'A' && coincide(TESTS)(ruta))
  .map(([estado, ruta]) => `${estado} ${ruta}`);
const proteccionTocada = cambios
  .filter(([, ruta]) => coincide(PROTECCION)(ruta))
  .map(([estado, ruta]) => `${estado} ${ruta}`);

const errores = [];

if (testsTocados.length > 0) {
  const usuario = git('config', 'user.name');
  const aprobado = trailer('Tests-aprobados-por');
  if (aprobado.toLowerCase() !== usuario.toLowerCase()) {
    errores.push(`
✖ El commit modifica tests existentes y necesita tu aprobación explícita:

    ${testsTocados.join('\n    ')}

  Agregá al final del mensaje (tal cual tu git user.name):
    Tests-aprobados-por: ${usuario}
  ${aprobado ? `(se encontró "${aprobado}", que no coincide)` : ''}
  Antes de aprobar: test, RN, entrada, esperado y obtenido (CLAUDE.md, "Testing").`);
  }
}

if (proteccionTocada.length > 0 && trailer('Justificacion-hook').length < MINIMO_JUSTIFICATIVO) {
  errores.push(`
✖ El commit cambia la protección de los tests y queda registrado:

    ${proteccionTocada.join('\n    ')}

  Agregá un justificativo escrito (${MINIMO_JUSTIFICATIVO} caracteres o más):
    Justificacion-hook: por qué se cambia y qué se protege distinto`);
}

if (errores.length > 0) {
  console.error(errores.join('\n'));
  process.exit(1);
}
