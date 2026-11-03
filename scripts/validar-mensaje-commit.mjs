#!/usr/bin/env node
// Hook commit-msg: valida el formato de la decisión 37 (docs/PLANIFICACION.md, "Microcommits y trazabilidad").
//
//   tipo(módulo): verbo en primera persona [ID]     feat(planificacion): calculo la fecha de fin [US07]
//   ID — Título                                     US07 — Crear plan de 28 días   (merge --no-ff)
//
// Tipos: feat, fix, test, refactor, docs, chore. IDs: T01, US07, BUG-3, v1.2.0 (commits de release).
import { readFileSync } from 'node:fs';

const TIPOS = ['feat', 'fix', 'test', 'refactor', 'docs', 'chore'];
const ID = '(T\\d{2}|US\\d{2}|BUG-\\d+)';
const COMMIT = new RegExp(
  `^(${TIPOS.join('|')})\\([a-z0-9-]+\\): \\S.* \\[(${ID.slice(1, -1)}|v\\d+\\.\\d+\\.\\d+)\\]$`,
);
const MERGE = new RegExp(`^${ID} — \\S.*$`);

const archivo = process.argv[2];
const primeraLinea =
  readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .find((linea) => linea.trim() !== '' && !linea.startsWith('#')) ?? '';

if (COMMIT.test(primeraLinea) || MERGE.test(primeraLinea)) process.exit(0);

console.error(`
✖ El mensaje de commit no respeta el formato de la decisión 37:

    ${primeraLinea || '(vacío)'}

  Commit:  tipo(módulo): verbo en primera persona [ID]
           feat(planificacion): calculo la fecha de fin del plan [US07]
  Merge:   ID — Título
           US07 — Crear plan de 28 días
  Release: chore(release): publico la versión 1.2.0 [v1.2.0]

  Tipos: ${TIPOS.join(', ')}. Módulo en minúsculas y sin tildes.
  El ID es la tarjeta (T01, US07, BUG-3). Detalle: docs/PLANIFICACION.md, "Microcommits y trazabilidad".
`);
process.exit(1);
