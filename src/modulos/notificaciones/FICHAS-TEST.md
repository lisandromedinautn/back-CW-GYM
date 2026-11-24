# Fichas de test — Notificaciones

Una fila por caso de test. La entrada y el esperado los **confirma el desarrollador antes** de escribir el test (ver `docs/TESTING.md`). "Obtenido" se actualiza en cada corrida que falla y cuando pasa a verde. Cambiar "Esperado" requiere que antes haya cambiado la regla en `CLAUDE.md` del módulo.

## US21 — Notificar al profesor (confirmadas por Ulises el 24/11/2026)

Datos comunes de los unitarios de aplicación: profesores `p1` y `p2`; el alumno Medina, Santiago (`a1`) está vinculado a `p1`; el alumno `a2` no tiene profesor. El "ejemplo de RN-ENT-21" es: bloque press de 5 series de 10 × 30, con las series 3 (8 × 30), 4 (10 × 25) y 5 (sin registrar) por debajo.

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `dominio/notificacion/gravedad.valor.spec.ts` › 1 de 10 | RN-NOT-02 | Unitario | 1 serie por debajo de 10 | Leve | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `gravedad.valor.spec.ts` › 3 de 8 | RN-NOT-02 | Unitario | 3 de 8 (37,5%) | Leve | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `gravedad.valor.spec.ts` › 2 de 5 | RN-NOT-02 | Unitario | 2 de 5 (40%) | Grave | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `gravedad.valor.spec.ts` › 1 de 2 | RN-NOT-02 | Unitario | 1 de 2 (50%) | Grave | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `gravedad.valor.spec.ts` › sin registrar ninguna serie | RN-NOT-02 | Unitario | 5 de 5 | Grave | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `gravedad.valor.spec.ts` › cantidades inválidas | RN-NOT-02 | Unitario | 0 de 5, 6 de 5 y 0 de 0 | `ErrorDominio` con código `RN-NOT-02` en los tres | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `dominio/notificacion/notificacion.entidad.spec.ts` › sin series por debajo no se crea | RN-NOT-01 | Unitario | `Notificacion.crear` con 0 series por debajo | `ErrorDominio` con código `RN-NOT-01` | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `notificacion.entidad.spec.ts` › marcar como leída es idempotente | RN-NOT-04 | Unitario | Se crea; se marca leída a las 11:00 y otra vez a las 12:00 | Nace no leída; queda leída a las 11:00 y no cambia | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `aplicacion/notificar-entrenamiento-por-debajo/notificar-entrenamiento-por-debajo.caso-uso.spec.ts` › notifica al profesor del alumno | RN-NOT-01, 02 | Unitario | Evento de `a1` con el ejemplo de RN-ENT-21 | 1 notificación para `p1`: Grave, alumno "Medina, Santiago", `totalSeries` 5, series 3, 4 y 5 | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `notificar-entrenamiento-por-debajo.caso-uso.spec.ts` › sin series por debajo no notifica | RN-NOT-01 | Unitario | Evento de `a1` sin series por debajo | Ninguna notificación guardada | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `notificar-entrenamiento-por-debajo.caso-uso.spec.ts` › alumno sin profesor no notifica | RN-NOT-01 | Unitario | Evento de `a2` con el ejemplo de RN-ENT-21 | Ninguna notificación guardada | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `notificar-entrenamiento-por-debajo.caso-uso.spec.ts` › una por entrenamiento | RN-NOT-01 | Unitario | El mismo evento de `a1` dos veces | 1 sola notificación | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `aplicacion/consultar-notificaciones/consultar-notificaciones.caso-uso.spec.ts` › solo las propias, de la más nueva a la más vieja | RN-NOT-03 | Unitario | `p1` tiene notificaciones de las 10:00, 11:00 (leída) y 12:00; `p2` tiene una. Se pide la página 1 de tamaño 2 | Ítems [12:00, 11:00], `total` 3, `noLeidas` 2; la de `p2` no aparece | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `aplicacion/contar-no-leidas/contar-no-leidas.caso-uso.spec.ts` › cuenta las no leídas propias | RN-NOT-03 | Unitario | Los mismos datos | `p1` → 2 | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `aplicacion/marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.spec.ts` › marca la propia | RN-NOT-04 | Unitario | `p1` marca la de las 10:00 | Queda leída; no leídas de `p1` → 1 | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `marcar-notificacion-leida.caso-uso.spec.ts` › ajena o inexistente | RN-NOT-04 | Unitario | `p2` marca una de `p1`; `p1` marca un id inexistente | `ErrorDominio` no encontrado (404) en los dos | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `src/compartido/infraestructura/publicador-eventos/publicador-eventos-en-proceso.spec.ts` › un manejador que falla no corta la publicación | RN-NOT-01 (decisión del modelo: no revierte la finalización) | Unitario | Dos manejadores suscriptos a `EntrenamientoFinalizado`; el primero lanza un error | `publicar` no lanza y el segundo manejador se ejecuta | = esperado (verde el 24/11/2026) | 24/11/2026 |
| `test/e2e/notificaciones/notificaciones.e2e-spec.ts` › notificación, bandeja y lectura | RN-NOT-01, 02, 03, 04 · RN-ENT-21 · RN-IDE-03 | e2e | profesor01 con alumno01 y alumno02 vinculados y un plan de hoy con el bloque press de 5 × 10 × 30. alumno01 finaliza con 10 × 30, 10 × 30, 8 × 30, 10 × 25 y la 5 sin registrar; alumno02 finaliza con las 5 completas | profesor01: 1 ítem Grave, `totalSeries` 5 y 3 series por debajo, `noLeidas` 1, `percepcion: null`; `no-leidas` → `{ cantidad: 1 }`. profesor02: 0 ítems y 404 al marcar la de profesor01. profesor01 marca: `204`, `{ cantidad: 0 }`; marcar otra vez: `204`. Un alumno en la bandeja: 403 | = esperado (verde el 24/11/2026) | 24/11/2026 |

Comprobación por mutación US21 (24/11/2026). En cada caso se rompió la línea de producción, el test dio rojo y se restauró:

* Gravedad: `>=` → `>` (cae 2 de 5).
* Entidad: `marcarLeida` sin la guarda de ya leída (cae la idempotencia).
* Notificar:
  * sin `existeParaEntrenamiento`;
  * sin el corte por alumno sin profesor;
  * sin el corte por series vacías.
* Marcar: comparación de profesor anulada y `guardar` quitado. Este último sobrevivía con un doble que devolvía la misma instancia; se corrigió el doble para guardar copias.
* Consultar y contar: profesor fijo `p2`, `noLeidas: 0` y `leida: false`.
* Publicador: sin el try/catch (cae N9).
* e2e:
  * suscripción vacía en `onModuleInit`;
  * `listarDeProfesor` sin filtro de profesor;
  * `contarNoLeidas` sin `leida_en IS NULL`.

No se cubre con mutación el `ON CONFLICT DO NOTHING` del índice único de `entrenamiento_id` (el e2e no dispara eventos duplicados concurrentes). La regla "una por entrenamiento" la cubre el unitario.

## US17 — Percepción en la notificación (confirmadas por Ulises el 24/11/2026)

Percepción escrita como RPE/sensación: "9/3" es RPE 9 y sensación de fuerza 3.

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `dominio/notificacion/percepcion.valor.spec.ts` › percepción mala | RN-NOT-06 | Unitario | 9/3, 7/2, 10/1 y 8/3 | Mala, mala, mala y no mala | | 24/11/2026 |
| `dominio/notificacion/gravedad.valor.spec.ts` › (`describe` nuevo) gravedad de la percepción | RN-NOT-06 | Unitario | Gravedad de la percepción con 9/3, 7/2, 10/1 y 8/3 | Leve, Leve, Grave y `null` | | 24/11/2026 |
| `gravedad.valor.spec.ts` › (`describe` nuevo) queda la mayor | RN-NOT-07 | Unitario | La mayor de: Leve y Grave; Leve y Leve; Grave y Leve; Leve y `null` | Grave, Leve, Grave y Leve | | 24/11/2026 |
| `notificacion.entidad.spec.ts` › (`describe` nuevo) sumar la percepción | RN-NOT-05, 07 | Unitario | Notificación Leve, leída a las 11:00, a la que se suma 10/1. En otro caso, una Leve leída a la que se suma 8/3 | La primera queda Grave, no leída y con percepción `{ rpe: 10, sensacionFuerza: 1 }`. La segunda queda Leve y no leída | | 24/11/2026 |
| `notificacion.entidad.spec.ts` › (mismo `describe`) crear solo por percepción | RN-NOT-01, 06 | Unitario | `crearPorPercepcion` con 7/2; después con 8/3 | Con 7/2: Leve, `seriesPorDebajo: []` y no leída. Con 8/3: `ErrorDominio` con código `RN-NOT-01` | | 24/11/2026 |
| `aplicacion/sumar-percepcion/sumar-percepcion.caso-uso.spec.ts` › cuatro caminos | RN-NOT-01, 05, 06 | Unitario | (a) Ya hay notificación del entrenamiento de `a1`; llega 9/3. (b) No hay notificación; `a1` tiene profesor `p1`; llega 7/2. (c) No hay notificación; llega 8/3. (d) `a2` sin profesor; llega 10/1 | (a) La notificación suma la percepción. (b) Se crea una Leve para `p1`, sin series. (c) No se guarda nada. (d) No se guarda nada | | 24/11/2026 |
| `test/e2e/notificaciones/percepcion.e2e-spec.ts` › percepción de punta a punta | RN-NOT-01, 05, 06, 07 · RN-ENT-16 | e2e | Plan de hoy con el bloque press de 5 × 10 × 30 para alumno01, alumno02 y alumno03, vinculados a profesor01. alumno01 finaliza con el ejemplo de RN-ENT-21 (Grave); profesor01 la marca leída; alumno01 carga 9/3. alumno02 completa todo y carga 10/1. alumno03 completa todo y carga 8/3 | La notificación de alumno01 queda Grave, no leída y con percepción `{ rpe: 9, sensacionFuerza: 3 }`. Hay una nueva notificación de alumno02, Grave y con `seriesPorDebajo: []`. alumno03 no tiene notificación. profesor01: `total` 2 y `noLeidas` 2 | | 24/11/2026 |
