# Módulo Notificaciones (`notificaciones`)

Contexto de soporte. Avisa al profesor, dentro de la app, cuando un alumno suyo finaliza un Entrenamiento por debajo de lo prescripto (US21). No decide qué es "por debajo": eso lo calcula Entrenamiento (RN-ENT-21) y lo informa en `EntrenamientoFinalizado`. Este módulo lo **escucha** (Observador), clasifica la gravedad y guarda la notificación para el profesor.

* **Agregado:** Notificación.
* **Objetos de valor:** Gravedad (Leve o Grave), SeriePorDebajo (lo prescripto y lo realizado de una serie), Percepción (RPE y sensación de fuerza, reservado para US17).
* **Eventos que escucha:** EntrenamientoFinalizado (de Entrenamiento). Con US17, también PercepcionRegistrada.
* **Eventos que emite:** ninguno.
* **Puertos:** RepositorioNotificaciones, ConsultaProfesores (Fachada de identidad: el profesor de un alumno, el profesor de un usuario y el nombre del alumno), Reloj.

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-NOT-01 | Si un Entrenamiento finalizado tiene al menos una serie por debajo de lo prescripto (RN-ENT-21), el profesor vinculado al alumno recibe **una** notificación con el alumno (nombre y apellido), la rutina, la fecha y hora de inicio, la gravedad, la cantidad de series por debajo sobre el total de series prescriptas y cada serie por debajo con lo prescripto y lo realizado. Sin series por debajo, o si el alumno no tiene profesor, no se genera. Un mismo Entrenamiento genera como máximo una notificación | US21 | Vigente |
| RN-NOT-02 | La gravedad se calcula con el porcentaje de series por debajo sobre el total de series prescriptas: **Grave** si es del 40% o más; **Leve** si es mayor que 0 y menor que el 40%. Ejemplos: 1 de 10 → Leve; 3 de 8 (37,5%) → Leve; 2 de 5 (40%) → Grave; 1 de 2 (50%) → Grave; finalizar sin registrar ninguna serie → Grave | US21 | Vigente (los ejemplos son literales obligatorios en los tests) |
| RN-NOT-03 | El profesor ve solo sus notificaciones, de la más nueva a la más vieja, paginadas, junto con la cantidad de no leídas | US21 | Vigente |
| RN-NOT-04 | Una notificación nace no leída y el profesor la marca como leída. Marcar otra vez una notificación leída no cambia nada. Una notificación de otro profesor, o inexistente, responde 404, para no revelar que existe | US21 | Vigente |
| RN-NOT-05 | La notificación muestra el RPE y la sensación de fuerza del Entrenamiento cuando el alumno los carga (US17), aunque lleguen después de crearse la notificación (RN-ENT-16) | US21, US17 | **A confirmar** (con US17): no se implementa ni se testea. Ver "Preparado para US17" |

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `notificar-entrenamiento-por-debajo/notificar-entrenamiento-por-debajo.caso-uso.ts` ✅ | US21 | 01, 02 |
| `consultar-notificaciones/consultar-notificaciones.caso-uso.ts` ✅ | US21 | 03 |
| `contar-no-leidas/contar-no-leidas.caso-uso.ts` ✅ | US21 | 03 |
| `marcar-notificacion-leida/marcar-notificacion-leida.caso-uso.ts` ✅ | US21 | 04 |
| `sumar-percepcion/sumar-percepcion.caso-uso.ts` | US17 | 05 (a confirmar) |

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

### Preparado para US17 (RN-NOT-05, a confirmar)

US17 todavía no está implementada. Para no tener que cambiar el contrato después:

* La tabla tiene `percepcion` jsonb null.
* La respuesta incluye `percepcion: null` (luego `{ rpe, sensacionFuerza }`, cada uno null si el alumno no lo cargó). El front la muestra solo si no es null.
* Lo que falta al implementar US17:
  * Entrenamiento emite `PercepcionRegistrada` (`entrenamientoId`, `rpe`, `sensacionFuerza`).
  * Este módulo lo escucha con `sumar-percepcion` y llama a `Notificacion.sumarPercepcion`. Si el Entrenamiento no tiene notificación, no hace nada.
* Preguntas abiertas para cuando se trabaje US17 (no se deciden ahora):
  * ¿Cargar la percepción vuelve la notificación a no leída?
  * ¿Una percepción baja notifica aunque no haya series por debajo?

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 24/11/2026 | RN-NOT-01 a 05 | Versión inicial (US21): una notificación por Entrenamiento por debajo, gravedad Leve o Grave con el umbral del 40% (inclusive en Grave, manda el porcentaje), bandeja con no leídas, percepción reservada para US17 | Ulises |

## Decisiones de implementación (CG-89, US21)

Implementado el 24/11/2026.

* `PUT .../:id/lectura` valida el id con `ParseUUIDPipe`, como el resto del repo: un id que no es UUID responde `400`, y uno válido ajeno o inexistente, `404` (RN-NOT-04).
* El repositorio guarda con `INSERT ... ON CONFLICT DO NOTHING` (`orIgnore`) sobre el único de `entrenamiento_id`, así que un evento duplicado concurrente no rompe. Si el id ya existe, actualiza la fila.
* Si el usuario del JWT no es profesor, la bandeja sale vacía y el contador en 0. En la práctica no pasa, porque el guard exige el rol Profesor.
* La respuesta no expone `profesorId` ni `leidaEn`: expone `leida` (boolean).
* Los e2e existentes ahora usan el publicador real (salvo los que lo sobreescriben con un mock), así que al finalizar se crean notificaciones. Ningún e2e existente cambió y todos pasan.
