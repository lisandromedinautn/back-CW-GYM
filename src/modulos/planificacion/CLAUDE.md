# Módulo Planificación (`planificacion`)

Contexto central. Contiene las rutinas y los planes de entrenamiento que crea el profesor. No sabe nada de lo que el alumno ejecutó: el Entrenamiento es una copia (decisión 6).

* **Agregados:** Rutina (con Bloques, Circuitos y Ejercicios Prescriptos como entidades internas) y Plan de Entrenamiento (con sus 28 Días del plan).
* **Objetos de valor:** NombreRutina (RN-PLAN-21), Pausa (duración), ObjetivoPrescripto (repeticiones o tiempo, más peso si corresponde), ValidezPlan (inicio y fin calculado), TipoRutina (Bloques, Circuitos o Mixta, derivado).
* **Eventos que emite:** PlanCreado.
* **Fachada que expone a otros módulos:** obtener la rutina del día de un alumno (Entrenamiento la copia al iniciar).
* **Puertos:** RepositorioRutinas, RepositorioPlanes, ConsultaVinculos (lo implementa infraestructura con la Fachada de identidad), ConsultaEjercicios (Fachada de catálogo), Reloj (fecha actual, para poder testear la vigencia).

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-PLAN-01 | Una rutina es una secuencia ordenada de bloques y/o circuitos, con al menos uno. Es de Bloques, de Circuitos o Mixta según su contenido (derivado, no se elige) | Glosario, US06, US09, US10 | Vigente |
| RN-PLAN-02 | Un bloque tiene un ejercicio prescripto, N series (N ≥ 1), una micropausa entre series y una macropausa al final | Glosario, US06 | Vigente |
| RN-PLAN-03 | Un circuito tiene 2 o más ejercicios seguidos sin descanso. Cada vuelta es una serie y termina con macropausa. No tiene micropausas | Decisión 5, US09 | Vigente |
| RN-PLAN-04 | Un ejercicio prescripto por tiempo no tiene repeticiones, y uno por repeticiones no tiene tiempo. El tipo lo define el ejercicio del catálogo | Invariante 6 | Vigente |
| RN-PLAN-05 | El peso del ejercicio prescripto se indica solo si su tipo de carga incluye Peso Extra. Aun así es opcional: se puede prescribir sin peso | Glosario ("si corresponde"), decisión del 08/11/2026 | Vigente |
| RN-PLAN-06 | Una rutina referencia ejercicios del catálogo por id, y esos ejercicios tienen que existir | Modelo | Vigente |
| RN-PLAN-07 | Una rutina se puede editar siempre. Los cambios no alteran los entrenamientos ya realizados | Decisiones 9 y 14, invariante 5 | Vigente |
| RN-PLAN-08 | Importar una rutina crea una copia independiente. Un profesor solo ve, edita e importa sus propias rutinas | Decisión 8, US20, ZG-06 | Vigente |
| RN-PLAN-09 | El plan tiene fecha de inicio y 28 días. La fecha de fin es siempre inicio + 27 días y no es configurable | Invariante 1, decisión 11, US07 | Vigente |
| RN-PLAN-10 | Cada día del plan tiene una rutina o es de descanso | US07 | Vigente |
| RN-PLAN-11 | El Día N del plan corresponde a la fecha inicio + (N − 1) días | Glosario | Vigente |
| RN-PLAN-12 | El plan tiene un profesor y se crea con uno o más alumnos. Mientras está vigente puede quedar sin alumnos (RN-PLAN-16) | Glosario, decisión del 01/11/2026 | Vigente |
| RN-PLAN-13 | Solo se asignan a un plan alumnos vinculados al profesor del plan | Invariante 4 | Vigente |
| RN-PLAN-14 | Un alumno tiene como máximo un plan vigente. Lo valida el caso de uso al asignar, consultando el repositorio de planes | Invariante 3, decisión 10, US07 | Vigente |
| RN-PLAN-15 | Un plan está vigente si la fecha actual está entre inicio y fin, ambos incluidos | Derivado de RN-PLAN-09 | Vigente |
| RN-PLAN-16 | En un plan vigente se pueden agregar y quitar alumnos, respetando RN-PLAN-13 y 14. Se puede quitar al último alumno: el plan queda sin alumnos | US12 | Vigente |
| RN-PLAN-17 | Un plan no se puede finalizar antes de sus 28 días: deja de estar vigente solo cuando pasa su fecha de fin | ZG-07 (se quitó US19) | Vigente |
| RN-PLAN-18 | El alumno consulta la rutina del día de su plan vigente. Si es día de descanso, se informa descanso. Si no tiene plan vigente, se informa que no hay plan | US08 | Vigente |
| RN-PLAN-19 | El alumno consulta su plan completo con los 28 días y sus fechas | US11 | Vigente |
| RN-PLAN-20 | Un circuito no repite ejercicios: cada ejercicio del catálogo aparece una sola vez en el mismo circuito | US09, decisión del 10/11/2026 | Vigente |
| RN-PLAN-21 | La rutina tiene un nombre de 1 a 60 caracteres, sin contar los espacios de los extremos (se guarda recortado). Si el profesor no lo indica al crearla, se llama `Rutina N` (N = cantidad de rutinas del profesor + 1; si ese nombre ya está usado, el siguiente N libre). Un profesor no puede tener dos rutinas con el mismo nombre, comparando sin mayúsculas y sin espacios de los extremos (409). Se puede renombrar siempre, también con el mismo nombre que ya tiene. Distintos profesores pueden repetir nombres | T08, T09 (Lisandro, 11/11/2026) | Vigente |
| RN-PLAN-22 | Un profesor solo consulta sus propios planes. El listado se pagina (5, 10, 20, 50 o 100), se ordena por fecha de inicio del más nuevo al más viejo y muestra el estado de cada plan según RN-PLAN-15 con la fecha del reloj: Próximo (todavía no empezó), Vigente o Finalizado (pasó su fecha de fin). Se filtra por estado, por alumno y por rango de fecha de inicio (ambos extremos incluidos) | T13 (Lisandro, 21/11/2026) | Vigente |

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `crear-rutina.caso-uso.ts` ✅ | US06, US09, US10, T09 | 01–06, 20, 21 |
| `editar-rutina.caso-uso.ts` | US06 | 01–07 |
| `consultar-rutinas.caso-uso.ts` ✅ | T06 | 08 |
| `renombrar-rutina/renombrar-rutina.caso-uso.ts` ✅ | T09 | 08, 21 |
| `normalizar-nombres-rutinas/normalizar-nombres-rutinas.caso-uso.ts` ✅ (corre al arrancar, `PlanificacionModule.onApplicationBootstrap`) | T09 | 21 |
| `importar-rutina/importar-rutina.caso-uso.ts` ✅ | US20 | 08, 21 |
| `crear-plan/crear-plan.caso-uso.ts` ✅ | US07 | 08, 09–15, 17 |
| `agregar-alumno-a-plan.caso-uso.ts` | US12 | 13, 14, 16 |
| `quitar-alumno-de-plan.caso-uso.ts` | US12 | 12, 16 |
| `consultar-rutina-del-dia/consultar-rutina-del-dia.caso-uso.ts` ✅ | US08 | 11, 15, 18 |
| `consultar-plan-del-alumno/consultar-plan-del-alumno.caso-uso.ts` ✅ | US11 | 11, 15, 19 |
| `consultar-planes/consultar-planes.caso-uso.ts` ✅ | T13 | 10, 15, 22 |

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `POST /planificacion/rutinas` ✅ (acepta `nombre` opcional, RN-PLAN-21, y `orden` opcional en cada bloque y circuito, US10) | Profesor | crear-rutina |
| `GET /planificacion/rutinas?pagina=&tamanio=` ✅ (respuesta `{ items, total, pagina, tamanio }`; por defecto 1 y 10) | Profesor | consultar-rutinas |
| `PATCH /planificacion/rutinas/:id/nombre` ✅ | Profesor | renombrar-rutina |
| `PUT /planificacion/rutinas/:id` | Profesor | editar-rutina |
| `POST /planificacion/rutinas/:id/importacion` ✅ | Profesor | importar-rutina |
| `POST /planificacion/planes` ✅ (respuesta con `id`, `fechaInicio`, `fechaFin`, `dias[{ numero, fecha, rutinaId, esDescanso }]` y `alumnoIds`) | Profesor | crear-plan |
| `POST /planificacion/planes/:id/alumnos` | Profesor | agregar-alumno-a-plan |
| `DELETE /planificacion/planes/:id/alumnos/:alumnoId` | Profesor | quitar-alumno-de-plan |
| `GET /planificacion/mi-rutina-del-dia` ✅ | Alumno | consultar-rutina-del-dia |
| `GET /planificacion/mi-plan` ✅ | Alumno | consultar-plan-del-alumno |
| `GET /planificacion/planes?pagina=&tamanio=&estado=&alumnoId=&inicioDesde=&inicioHasta=` ✅ (respuesta `{ items, total, pagina, tamanio }`) | Profesor | consultar-planes |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-PLAN-07 | Se quita el bloqueo de rutinas: se editan siempre | Lisandro |
| 01/11/2026 | RN-PLAN-03, 08, 12, 15, 16, 17 | Se cierran ZG-06 y ZG-07: circuito con 2 o más ejercicios, cada profesor trabaja solo con sus rutinas, el plan puede quedar sin alumnos, no hay finalización anticipada (se quita US19 y el caso de uso finalizar-plan) | Lisandro |
| 08/11/2026 | RN-PLAN-05 | Se aclara que el peso es opcional aunque la carga incluya Peso Extra (US06) | Ignacio |
| 10/11/2026 | Nueva RN-PLAN-20 | Un circuito no repite ejercicios (US09) | Ignacio |
| 11/11/2026 | Nueva RN-PLAN-21 | La rutina tiene nombre (1 a 60 caracteres, recortado), por defecto `Rutina N`, único por profesor sin distinguir mayúsculas, y se puede renombrar (T08, T09) | Lisandro |
| 17/11/2026 | RN-PLAN-08 | Se elimina la pregunta sobre si la copia modificada es una rutina nueva; se conserva la copia independiente y el acceso a las rutinas propias (CG-40, US20) | Desarrollador |
| 21/11/2026 | Nueva RN-PLAN-22 | El profesor consulta sus propios planes, paginados, con estado y filtros por estado, alumno y rango de fecha de inicio (T13) | Lisandro |

## Decisiones de implementación (US06)

* El formato de los números (series enteras; repeticiones y segundos enteros ≥ 1; pausas enteras ≥ 0 s; peso > 0) se valida en el DTO de entrada (400 sin código RN), no en el dominio, porque no hay RN sobre eso. Las series se dejan llegar al dominio para que 0 responda RN-PLAN-02, y una lista de bloques vacía responde RN-PLAN-01. Decidido por Ignacio el 08/11/2026.
* La rutina guarda el id del **usuario** profesor que la creó (`profesorUsuarioId`, el `sub` del JWT). El nombre de la rutina se rige por RN-PLAN-21 (11/11/2026).
* RN-PLAN-06 responde 404 (`no-encontrado`) con código `RN-PLAN-06`.
* US09 (10/11/2026, Ignacio): el body de `POST /planificacion/rutinas` acepta `bloques` y `circuitos` como listas separadas, las dos opcionales. US06 no cambia. El orden entre bloques y circuitos de una rutina mixta se resuelve en US10. Una rutina con bloques y circuitos se deriva como Mixta, pero se testea en US10. `vueltas` y la cantidad de ejercicios del circuito llegan al dominio sin validar en el DTO, para que respondan RN-PLAN-03.
* El catálogo se consulta por `FachadaCatalogo` (`src/modulos/catalogo/fachada-catalogo.ts`) a través del puerto `ConsultaEjercicios`.
* T06 (11/11/2026): `GET /planificacion/rutinas` pagina con `PaginacionDto` (`src/compartido/presentacion/paginacion/`): tamaños 5, 10, 20, 50 o 100 (por defecto 10) y página desde 1; un valor inválido responde 400 desde el DTO, sin código RN. El caso de uso ya no acota valores. Orden: más nuevas primero.
* RN-PLAN-21: la unicidad se comprueba en los casos de uso (crear y renombrar) con `listarNombresPorProfesor` del puerto; no hay índice único en la base. El largo lo valida `NombreRutina` (400 `RN-PLAN-21`), no el DTO. La columna `nombre` es `varchar(60)` con default `'Rutina 1'` para las filas que ya existían.
* Al renombrar, el mapper deriva el id de las filas de ejercicios de circuito a partir del circuito y la posición, para que guardar de nuevo la rutina actualice esas filas en vez de duplicarlas.

## Decisiones de implementación (US20)

* Importar crea una rutina independiente con nuevos IDs de rutina, bloques y circuitos, conservando datos, referencias al catálogo y orden. No modifica ni asigna automáticamente un plan.
* El nombre se genera por profesor como `Nombre - Copia`, `Nombre - Copia 2`, etc.; se recorta el nombre original si hace falta para respetar los 60 caracteres (RN-PLAN-21).
* Una rutina ajena o inexistente responde 404 con `RN-PLAN-08`. No se solicita confirmación sobre si la copia es una rutina nueva.

## Decisiones de implementación (US10)

* El body de `POST /planificacion/rutinas` sigue con `bloques` y `circuitos` separados, y cada uno acepta `orden` opcional: la posición en la rutina (1..N). Sin `orden` en ninguno, van los bloques y después los circuitos (US06 y US09 no cambian). Decidido por Ignacio el 15/11/2026.
* Si se usa `orden`, tiene que venir en todos y ser exactamente 1..N, sin repetir ni saltear; si no, responde 400 `RN-PLAN-01`. El DTO solo valida que sea entero; la secuencia la valida el dominio. Decidido por Ignacio el 15/11/2026.
* El agregado `Rutina` guarda una única secuencia (`elementos`, cada uno `bloque` o `circuito`); `bloques`, `circuitos` y `ordenDe` se derivan de ella.
* La respuesta de crear, consultar y renombrar suma `orden` en cada bloque y circuito. La rutina del día (US08) no cambia por ahora: sumarle `orden` exige modificar su test e2e. Decidido por Ignacio el 15/11/2026.
* Persistencia sin cambio de esquema: la columna `orden` de `bloques_rutina` y `circuitos_rutina` pasa a ser la posición en la rutina. Las rutinas de antes de US10 que tenían bloques y circuitos (numerados por separado) se leen como antes, bloques primero.

## Decisiones de implementación (US07)

* El agregado `Plan` valida las invariantes propias (RN-PLAN-09, 10, 11, 12): 28 días exactos, números 1..28 sin repetir, fecha de cada día derivada del inicio, al menos un alumno y `alumnoIds` sin repetidos. `ValidezPlan` calcula el fin (inicio + 27) y la vigencia (RN-PLAN-15).
* Las reglas que cruzan agregados quedan en el caso de uso: RN-PLAN-13 consulta `ConsultaVinculos` (fachada de identidad) y RN-PLAN-14 consulta `RepositorioPlanes.listarVigentesPorAlumno` con la fecha del `Reloj`. RN-PLAN-17 no agrega lógica: el plan no tiene operación de finalización.
* Las rutinas referenciadas por los días se buscan con `RepositorioRutinas.buscarPorId`; si no existe o es de otro profesor responde `RN-PLAN-08` con categoría `no-encontrado` (404), igual que en el resto del módulo.
* `fechaInicio` viaja como `AAAA-MM-DD` y se interpreta en UTC (`dominio/plan/fechas.ts`). El DTO no acepta `fechaFin`: el `ValidationPipe` global la descarta y el fin siempre sale de `ValidezPlan` (RN-PLAN-09).
* `Reloj` es un puerto compartido (`src/compartido/dominio/reloj/reloj.puerto.ts`) con implementación `RelojSistema`; los tests usan `RelojFijo`. Así RN-PLAN-14 no depende de la fecha real.
* Al crear se guardan `planes`, `dias_plan` y `plan_alumnos` en una transacción y se publica el evento `PlanCreado` por `PUBLICADOR_EVENTOS`.
* La pantalla de crear plan necesita los alumnos del profesor: se agregó `GET /identidad/alumnos` (solo Profesor) en el módulo identidad, que devuelve `{ id, nombre, apellido }` de los vinculados. Planificación lo consume desde el front, no desde el back (no hay import cruzado).

## Decisiones de implementación (US08)

* `GET /planificacion/mi-rutina-del-dia` admite solo Alumno. El caso de uso recibe el `sub` del JWT y obtiene la ficha del alumno a través de `ConsultaVinculos` y la Fachada de identidad; no recibe un alumno elegido por el cliente.
* El resultado tiene `estado: rutina`, `descanso` o `sin-plan`. Incluye `fecha` (`AAAA-MM-DD`, UTC, como US07) y, si hay plan vigente, `numeroDia`. La fecha sale exclusivamente del puerto `Reloj`.
* La vigencia incluye inicio y fin (RN-PLAN-15); `Plan.diaPorFecha` resuelve el día según RN-PLAN-11. La respuesta de rutina conserva series, vueltas, objetivos, peso y pausas, y resuelve nombres del catálogo por `ConsultaNombresEjercicios`, sin exponer el catálogo al rol Alumno.
* Los tests de API fijan el reloj mediante el puerto, incluidos 31/10, 01/11, 28/11 y 29/11 para un plan que empieza el 01/11/2026. Casos confirmados por Martina el 14/11/2026. No cambian las reglas de negocio.

## Decisiones de implementación (US11)

* Martina confirmó el 14/11/2026 consultar únicamente el plan vigente del Alumno. La fecha se toma del `Reloj` y la identidad del usuario autenticado se resuelve con `ConsultaVinculos`, como en US08.
* `ConsultarPlanDelAlumno` devuelve `{ estado: 'sin-plan', fecha }` o `{ estado: 'plan', fecha, plan: { id, fechaInicio, fechaFin, dias } }`. Cada día incluye `numero`, `fecha` y `rutina` (detalle con ejercicios y pausas, o `null` si es descanso). No expone profesor ni alumnos asignados.
* Los días se ordenan por número sin modificar el agregado. Las fechas provienen de `DiaPlan`; las rutinas repetidas se resuelven una vez por consulta y comparten la transformación de US08. Una referencia a una rutina inexistente informa el error RN-PLAN-08, no descanso.
* `GET /planificacion/mi-plan` usa exclusivamente `usuario.sub` y requiere rol Alumno. Ignora un alumno enviado por query. No cambia reglas, esquema ni dependencias.

## Nota para US12 (Martina): qué cambió con T13 (21/11/2026)

T13 (CG-84) ya está en `develop` y toca archivos que US12 también va a tocar. Antes de seguir, traé `develop` (`git pull`) y mergealo en tu rama local para resolver los choques temprano.

* **Puerto `RepositorioPlanes`** (`dominio/plan/repositorio-planes.puerto.ts`): ahora exporta `FiltrosPlanes` y tiene el método abstracto `listarPorProfesor`. Si agregás `buscarPorId` u otro método, sumalo al lado; toda implementación tiene que cumplir los dos.
* **`plan.repositorio-typeorm.ts`**: tiene `listarPorProfesor` (query builder con `EXISTS` sobre `plan_alumnos`) y el import de `In`. El filtro por alumno lee esa tabla: si cambiás cómo se guardan los alumnos del plan, revisalo.
* **Doble `RepositorioPlanesEnMemoria`** (`test/dobles/planificacion.ts`): suma `listarPorProfesor`. Es el choque más probable; si lo editás, el hook de T10 pide `Tests-aprobados-por`.
* **Controlador** (`planificacion.controlador.ts`): nuevo `@Get('planes')` (Profesor). Tus `POST /planificacion/planes/:id/alumnos` y `DELETE /planificacion/planes/:id/alumnos/:alumnoId` van en el mismo archivo; no chocan como rutas.
* **`planificacion.module.ts`**: nueva fábrica de `ConsultarPlanes`; las tuyas van al lado.
* **Reutilizable**: `ConsultarPlanes` ya devuelve `estado` (`proximo`, `vigente`, `finalizado`) y `alumnoIds` de cada plan. RN-PLAN-16 solo permite cambiar alumnos de un plan **vigente**: usá el mismo cálculo (`ValidezPlan.estaVigente` con el `Reloj`).
* **Doc compartida**: `docs/TRAZABILIDAD.md`, `CHANGELOG.md` (Sin publicar), `DECISIONES-IA.md`, `ATLAS.md`, `FICHAS-TEST.md` y este archivo tienen entradas nuevas de T13: al mergear, conservá las dos. Ya existe la RN-PLAN-22; si necesitás una regla nueva, es la RN-PLAN-23.

## Decisiones de implementación (T13)

* Los filtros (profesor, estado, alumno, rango de inicio), el orden (`fechaInicio` desc, `id` asc) y la paginación los resuelve `RepositorioPlanes.listarPorProfesor` en la base. El filtro por alumno usa `EXISTS` y luego se cargan los planes completos de la página, para no recortar `alumnoIds`.
* El estado (`proximo`, `vigente`, `finalizado`) se calcula en `ConsultarPlanes` con la fecha UTC del `Reloj` (RN-PLAN-15, reutiliza `ValidezPlan`); el repositorio recibe `hoy` solo para filtrar por estado.
* `diasConRutina` y `diasDeDescanso` salen de los días del plan (RN-PLAN-10).
* Un valor inválido (`tamanio`, `estado`, `alumnoId`, fechas mal formadas o inexistentes) responde 400 desde `ConsultarPlanesDto`, sin código RN. Por defecto pagina 1 y tamaño 10.
