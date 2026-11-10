# Fichas de test — Planificación

Una fila por caso de test. La entrada y el esperado los **confirma el desarrollador antes** de escribir el test (ver `docs/TESTING.md`). "Obtenido" se actualiza en cada corrida que falla y cuando pasa a verde. Cambiar "Esperado" requiere que antes haya cambiado la regla en `CLAUDE.md` del módulo.

Ejercicios de los ejemplos (fixture `test/datasets/ejercicios-fixture.json`): `lever chest press` (por repeticiones, Peso Extra), `weighted front plank` (por tiempo, Peso Corporal + Peso Extra), `3/4 sit-up` (por repeticiones, Peso Corporal).

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `dominio/rutina/rutina.entidad.spec.ts` › con un bloque de lever chest press la rutina es de Bloques | RN-PLAN-01 | Unitario | `Rutina.crear` con 1 bloque de lever chest press, 3 series, 10 reps | tipo `Bloques` | tipo `Bloques` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › sin bloques se rechaza con RN-PLAN-01 | RN-PLAN-01 | Unitario | `Rutina.crear` con `bloques: []` | `ErrorDominio` código `RN-PLAN-01` | `ErrorDominio` código `RN-PLAN-01` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › dos bloques respetan el orden dado | RN-PLAN-01 | Unitario | bloques lever chest press y weighted front plank, en ese orden | ejercicios `[lever chest press, weighted front plank]` | ejercicios `[lever chest press, weighted front plank]` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › con 1 serie el bloque se crea | RN-PLAN-02 | Unitario | bloque de lever chest press con `series: 1` | series `1` | series `1` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › con 0 series se rechaza con RN-PLAN-02 | RN-PLAN-02 | Unitario | bloque de lever chest press con `series: 0` | `ErrorDominio` código `RN-PLAN-02` | `ErrorDominio` código `RN-PLAN-02` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › la micropausa de 60 s y la macropausa de 120 s quedan guardadas | RN-PLAN-02 | Unitario | `micropausaSegundos: 60`, `macropausaSegundos: 120` | micropausa `60`, macropausa `120` | micropausa `60`, macropausa `120` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › lever chest press (por repeticiones) con 10 repeticiones se acepta | RN-PLAN-04 | Unitario | `repeticiones: 10` | repeticiones `10`, segundos `null` | repeticiones `10`, segundos `null` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › lever chest press con 30 segundos se rechaza con RN-PLAN-04 | RN-PLAN-04 | Unitario | `segundos: 30` | `ErrorDominio` código `RN-PLAN-04` | `ErrorDominio` código `RN-PLAN-04` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › weighted front plank (por tiempo) con 45 segundos se acepta | RN-PLAN-04 | Unitario | `segundos: 45` | segundos `45`, repeticiones `null` | segundos `45`, repeticiones `null` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › weighted front plank con 12 repeticiones se rechaza con RN-PLAN-04 | RN-PLAN-04 | Unitario | `repeticiones: 12` | `ErrorDominio` código `RN-PLAN-04` | `ErrorDominio` código `RN-PLAN-04` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › lever chest press (Peso Extra) con 40 kg se acepta | RN-PLAN-05 | Unitario | `pesoKg: 40` | peso `40` | peso `40` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › weighted front plank (Peso Corporal + Peso Extra) con 10 kg se acepta | RN-PLAN-05 | Unitario | `pesoKg: 10` | peso `10` | peso `10` | 09/11/2026 |
| `dominio/rutina/rutina.entidad.spec.ts` › 3/4 sit-up (Peso Corporal) con 5 kg se rechaza con RN-PLAN-05 | RN-PLAN-05 | Unitario | `pesoKg: 5` | `ErrorDominio` código `RN-PLAN-05` | `ErrorDominio` código `RN-PLAN-05` | 09/11/2026 |
| `aplicacion/crear-rutina/crear-rutina.caso-uso.spec.ts` › con un ejercicio inexistente se rechaza con RN-PLAN-06 (no encontrado) | RN-PLAN-06 | Unitario | `ejercicioId: 'no-existe'` | `ErrorDominio` código `RN-PLAN-06`, categoría `no-encontrado` | `ErrorDominio` código `RN-PLAN-06`, categoría `no-encontrado` | 09/11/2026 |
| `aplicacion/crear-rutina/crear-rutina.caso-uso.spec.ts` › con ejercicios existentes la rutina queda guardada | RN-PLAN-06 | Unitario | 1 bloque de lever chest press, profesor `u-laura` | el repositorio tiene 1 rutina del profesor `u-laura` | el repositorio tiene 1 rutina del profesor `u-laura` | 09/11/2026 |
| `test/e2e/planificacion/crear-rutina.e2e-spec.ts` › el Profesor crea una rutina: 201 con id y tipo Bloques | RN-PLAN-01 | e2e | POST con 1 bloque de lever chest press | 201, tipo `Bloques`, id string | 201, tipo `Bloques`, id string | 09/11/2026 |
| `test/e2e/planificacion/crear-rutina.e2e-spec.ts` › con un ejercicio inexistente responde 404 RN-PLAN-06 | RN-PLAN-06 | e2e | `ejercicioId` UUID que no existe | 404 `RN-PLAN-06` | 404 `RN-PLAN-06` | 09/11/2026 |
| `test/e2e/planificacion/crear-rutina.e2e-spec.ts` › con peso en 3/4 sit-up responde 400 RN-PLAN-05 | RN-PLAN-05 | e2e | 3/4 sit-up con `pesoKg: 5` | 400 `RN-PLAN-05` | 400 `RN-PLAN-05` | 09/11/2026 |
| `test/e2e/planificacion/crear-rutina.e2e-spec.ts` › con el token de Admin o Alumno responde 403 RN-IDE-03 | RN-IDE-03 | e2e | POST con token de Admin / Alumno | 403 `RN-IDE-03` | 403 `RN-IDE-03` | 09/11/2026 |
