# Módulo Notificaciones (`notificaciones`)

Contexto de soporte. Avisa al profesor, dentro de la app, cuando un alumno suyo finaliza un Entrenamiento por debajo de lo prescripto (US21) o carga una percepción mala (US17). No decide qué es "por debajo": eso lo calcula Entrenamiento (RN-ENT-21) y lo informa en `EntrenamientoFinalizado`. Este módulo lo **escucha** (Observador), clasifica la gravedad y guarda la notificación para el profesor.

* **Agregado:** Notificación.
* **Objetos de valor:** Gravedad (Leve o Grave), SeriePorDebajo (lo prescripto y lo realizado de una serie), Percepción (RPE y sensación de fuerza; sabe si es mala, US17).
* **Eventos que escucha:** EntrenamientoFinalizado y PercepcionRegistrada (de Entrenamiento).
* **Eventos que emite:** ninguno.
* **Puertos:** RepositorioNotificaciones, ConsultaProfesores (Fachada de identidad: el profesor de un alumno, el profesor de un usuario y el nombre del alumno), Reloj.

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-NOT-01 | El profesor vinculado al alumno recibe **una** notificación de un Entrenamiento finalizado si tiene al menos una serie por debajo de lo prescripto (RN-ENT-21) **o** una percepción mala (RN-NOT-06). La notificación muestra el alumno (nombre y apellido), la rutina, la fecha y hora de inicio, la gravedad, la cantidad de series por debajo sobre el total de series prescriptas y cada serie por debajo con lo prescripto y lo realizado. Sin ninguno de los dos motivos, o si el alumno no tiene profesor, no se genera. Un mismo Entrenamiento genera como máximo una notificación | US21, US17 | Vigente |
| RN-NOT-02 | La gravedad se calcula con el porcentaje de series por debajo sobre el total de series prescriptas: **Grave** si es del 40% o más; **Leve** si es mayor que 0 y menor que el 40%. Ejemplos: 1 de 10 → Leve; 3 de 8 (37,5%) → Leve; 2 de 5 (40%) → Grave; 1 de 2 (50%) → Grave; finalizar sin registrar ninguna serie → Grave | US21 | Vigente (los ejemplos son literales obligatorios en los tests) |
| RN-NOT-03 | El profesor ve solo sus notificaciones, de la más nueva a la más vieja, paginadas, junto con la cantidad de no leídas | US21 | Vigente |
| RN-NOT-04 | Una notificación nace no leída y el profesor la marca como leída. Marcar otra vez una notificación leída no cambia nada. Una notificación de otro profesor, o inexistente, responde 404, para no revelar que existe | US21 | Vigente |
| RN-NOT-05 | Cuando el alumno carga su percepción (RN-ENT-16) y el Entrenamiento ya tiene notificación, la notificación suma el RPE y la sensación de fuerza, recalcula la gravedad (RN-NOT-07) y **vuelve a no leída**, aunque el profesor ya la hubiera leído | US21, US17 | Vigente |
| RN-NOT-06 | La percepción es **mala** si el RPE es 9 o más **o** la sensación de fuerza es 2 o menos. Una percepción mala sin series por debajo genera una notificación (sin series en el detalle) con gravedad **Leve** si cumple una sola condición y **Grave** si cumple las dos. Ejemplos: RPE 9 y sensación 3 → Leve; RPE 7 y sensación 2 → Leve; RPE 10 y sensación 1 → Grave; RPE 8 y sensación 3 → no es mala | US17 | Vigente (los ejemplos son literales obligatorios en los tests) |
| RN-NOT-07 | Si hay series por debajo y percepción mala, la gravedad de la notificación es la **mayor** entre la de las series (RN-NOT-02) y la de la percepción (RN-NOT-06). Ejemplos: series Leve y percepción Grave → Grave; series Leve y percepción Leve → Leve; series Grave y percepción Leve → Grave; series Leve y percepción que no es mala → Leve | US17 | Vigente (los ejemplos son literales obligatorios en los tests) |

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `notificar-entrenamiento-por-debajo/notificar-entrenamiento-por-debajo.caso-uso.ts` ✅ | US21 | 01, 02 |
| `consultar-notificaciones/consultar-notificaciones.caso-uso.ts` ✅ | US21 | 03 |
| `contar-no-leidas/contar-no-leidas.caso-uso.ts` ✅ | US21 | 03 |
| `marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.ts` ✅ | US21 | 04 |
| `sumar-percepcion/sumar-percepcion.caso-uso.ts` ✅ | US17 | 01, 05, 06, 07 |

## Endpoints

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `GET /notificaciones/mis-notificaciones` ✅ | Profesor | consultar-notificaciones |
| `GET /notificaciones/mis-notificaciones/no-leidas` ✅ | Profesor | contar-no-leidas |
| `PUT /notificaciones/mis-notificaciones/:id/lectura` ✅ | Profesor | marcar-notificacion-leida |

## Modelo (decidido por Ulises el 24/11/2026)

### Dominio (`dominio/`)

* `notificacion/notificacion.entidad.ts`: agregado **Notificación**.
  * `Notificacion.crear(datos)` valida la invariante "al menos una serie por debajo" y calcula la gravedad con `Gravedad.desde(porDebajo, total)`. Nace no leída y sin percepción.
  * `Notificacion.reconstruir(datos)` rehidrata desde la base.
  * `marcarLeida(instante)` es idempotente: si ya estaba leída, conserva la primera fecha de lectura.
  * No tiene setters: el único cambio de estado es `marcarLeida` (y, con US17, `sumarPercepcion`).
* `notificacion/gravedad.valor.ts`: objeto de valor **Gravedad** (`'leve' | 'grave'`).
  * `Gravedad.desde(porDebajo, total)` compara en enteros (`5 × porDebajo ≥ 2 × total` → Grave), así el 40% exacto no depende del redondeo.
  * Rechaza `porDebajo` 0, mayor que `total` o `total` 0.
* `notificacion/serie-por-debajo.valor.ts`: lo que identifica la serie (`orden`, `numero`, `posicion`, `nombre` del ejercicio) junto con lo prescripto y lo realizado (`null` si no se registró).
* `notificacion/repositorio-notificaciones.puerto.ts`, `notificacion/consulta-profesores.puerto.ts`.
* `notificacion/entrenamiento-finalizado-recibido.ts`: el **contrato propio** del evento que escucha este módulo, como interfaz de primitivos.
  * No se importa la clase `EntrenamientoFinalizado` de Entrenamiento, por la regla de dependencia 4.
  * Es la capa anticorrupción del lado del consumidor, igual que los puertos `Consulta*` de Planificación.

### Aplicación (`aplicacion/`)

* `NotificarEntrenamientoPorDebajo` recibe el evento.
  * Si no hay series por debajo, no hace nada.
  * Busca el profesor del alumno por `ConsultaProfesores`. Sin profesor, no hace nada.
  * Si ya existe una notificación de ese Entrenamiento, no hace nada (idempotencia).
  * Crea la notificación con `Notificacion.crear` y la guarda.
* Los casos de uso de consulta y lectura reciben el usuario del JWT y lo traducen a profesor con `ConsultaProfesores`. Así el módulo no depende del `sub` del token.

### Infraestructura (`infraestructura/`)

* `notificacion/notificacion.esquema.ts`: tabla `notificaciones`.
  * Columnas: `id`, `profesor_id`, `alumno_id`, `entrenamiento_id` **único**, `creada`, `leida_en` (null si no está leída), `gravedad`, `detalle` jsonb (alumno, rutina, inicio, total y series por debajo) y `percepcion` jsonb null.
  * El índice único sobre `entrenamiento_id` garantiza RN-NOT-01 aunque el evento llegue dos veces.
* `notificacion/notificacion.mapper.ts`, `notificacion/notificaciones.repositorio-typeorm.ts`.
* `notificacion/consulta-profesores.fachada-identidad.ts`: implementa el puerto sobre `FachadaIdentidad`.
  * `profesorDelAlumno(alumnoId)` usa `obtenerAlumnoPorId`, que ya devuelve `profesorId`, nombre y apellido.
  * `profesorDeUsuario(usuarioId)` necesita un método nuevo en la fachada, `obtenerProfesorPorUsuarioId`, que usa `RepositorioProfesores.buscarPorUsuarioId`.
* `suscriptores/entrenamiento-finalizado.suscriptor.ts`: al iniciar el módulo (`onModuleInit`) se suscribe a `'EntrenamientoFinalizado'` en el `SuscriptorEventos` compartido e invoca al caso de uso.
  * Es un adaptador de entrada, como un controlador, pero disparado por un evento.

### Presentación (`presentacion/`)

* `controlador/notificaciones.controlador.ts` con `@Roles('Profesor')`.
* Paginación con el `PaginacionDto` compartido (5, 10, 20, 50 o 100; 10 por defecto).
* `GET` devuelve `{ items, total, pagina, tamanio, noLeidas }`. Cada ítem es `{ id, creada, leida, gravedad, alumno: { id, nombre, apellido }, entrenamiento: { id, rutina, inicio }, totalSeries, seriesPorDebajo, percepcion }`. `percepcion` es `null` hasta US17.
* `GET .../no-leidas` devuelve `{ cantidad }`. `PUT .../:id/lectura` responde `204`.

### Kernel compartido (Observador)

* `PublicadorEventosLog`, que solo escribía en el log, se reemplazó por `PublicadorEventosEnProceso` en `compartido/infraestructura/publicador-eventos/` ✅.
  * Implementa el puerto `PublicadorEventos` y un puerto nuevo, `SuscriptorEventos` (`suscribir(nombre, manejador)`), en `compartido/dominio/publicador-eventos/`.
  * Sigue escribiendo cada evento en el log.
  * No suma paquetes: no se instala `@nestjs/event-emitter`.
* El evento se publica después de guardar el cierre (como hoy en `CerrarEntrenamiento`). Los manejadores se esperan en orden.
  * Si un manejador falla, el error se registra en el log y **no revierte ni hace fallar la finalización** del alumno.
  * Riesgo aceptado para el MVP: esa notificación se pierde y no hay reintentos.
* Con esto, Observador pasó a ✅ en `docs/PATRONES.md` (24/11/2026).

### Percepción del alumno (US17, CG-60)

Decidido por Ulises el 24/11/2026. Cierra las dos preguntas que US21 había dejado abiertas.

* **Dominio:**
  * `Percepcion` (en `dominio/notificacion/percepcion.valor.ts`) pasa de tipo a objeto de valor con `esMala()` (RN-NOT-06).
  * `Gravedad` suma `Gravedad.dePercepcion(percepcion)` (null si no es mala) y `Gravedad.mayor(a, b)` (RN-NOT-07). `Gravedad.desde(porDebajo, total)` no cambia.
* **Entidad `Notificacion`:**
  * La invariante de `crear` pasa a ser "al menos un motivo": series por debajo o percepción mala.
  * `Notificacion.crearPorPercepcion(datos)` crea una sin series por debajo, con la gravedad de la percepción.
  * `sumarPercepcion(percepcion)` guarda la percepción, recalcula la gravedad (la mayor) y vuelve a no leída (`leidaEn = null`, RN-NOT-05).
  * Es el único cambio de estado nuevo, sin setters.
* **Evento escuchado:** `PercepcionRegistrada`, con su contrato propio en `dominio/notificacion/percepcion-registrada-recibida.ts` (primitivos, sin importar la clase de Entrenamiento).
* **Caso de uso `SumarPercepcion`** (`aplicacion/sumar-percepcion/`):
  * si el Entrenamiento tiene notificación, `sumarPercepcion` y guardar;
  * si no la tiene y la percepción es mala, busca el profesor del alumno, `crearPorPercepcion` y guardar;
  * si no es mala, o el alumno no tiene profesor, no hace nada.
* **Repositorio:** suma `buscarPorEntrenamiento(entrenamientoId)`.
* **Infraestructura:** suscriptor `suscriptores/percepcion-registrada.suscriptor.ts`. La columna `percepcion` ya existe.
* **Contrato:** no cambia. `percepcion` pasa a venir con `{ rpe, sensacionFuerza }` (los dos números) una vez cargada. Una notificación solo por percepción trae `seriesPorDebajo: []`.

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 24/11/2026 | RN-NOT-01 a 05 | Versión inicial (US21): una notificación por Entrenamiento por debajo, gravedad Leve o Grave con el umbral del 40% (inclusive en Grave, manda el porcentaje), bandeja con no leídas, percepción reservada para US17 | Ulises |
| 24/11/2026 | RN-NOT-01, 05; nuevas RN-NOT-06 y 07 | Con US17 la notificación también nace por percepción mala (RPE ≥ 9 o sensación ≤ 2; Leve con una condición, Grave con las dos), queda la gravedad mayor, y al sumar la percepción vuelve a no leída | Ulises |

## Decisiones de implementación (CG-89, US21)

Implementado el 24/11/2026.

* `PUT .../:id/lectura` valida el id con `ParseUUIDPipe`, como el resto del repo: un id que no es UUID responde `400`, y uno válido ajeno o inexistente, `404` (RN-NOT-04).
* El repositorio guarda con `INSERT ... ON CONFLICT DO NOTHING` (`orIgnore`) sobre el único de `entrenamiento_id`, así que un evento duplicado concurrente no rompe. Si el id ya existe, actualiza la fila.
* Si el usuario del JWT no es profesor, la bandeja sale vacía y el contador en 0. En la práctica no pasa, porque el guard exige el rol Profesor.
* La respuesta no expone `profesorId` ni `leidaEn`: expone `leida` (boolean).
* Los e2e existentes ahora usan el publicador real (salvo los que lo sobreescriben con un mock), así que al finalizar se crean notificaciones. Ningún e2e existente cambió y todos pasan.

## Decisiones de implementación (CG-61, US17)

Implementado el 24/11/2026.

* **Tipos de la percepción:** `Percepcion` es una clase. El tipo de datos se llama `DatosPercepcion`: es el de `DatosNotificacion.percepcion` y el de la columna. `rpe` y `sensacionFuerza` admiten `null` en el tipo, y un `null` no cuenta como condición mala; con US17 los dos siempre llegan.
* **Gravedad:** `Gravedad.reconstruir(valor)` rearma la gravedad guardada para compararla con `mayor`.
* **Suscriptor:** `infraestructura/suscriptores/percepcion-registrada.suscriptor.ts`. `buscarPorEntrenamiento` usa el índice único de `entrenamiento_id`.
