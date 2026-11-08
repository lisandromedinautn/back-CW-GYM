# Sistema de Entrenamiento de Gimnasio — Planificación, lenguaje ubicuo, US y modelo DDD

Versión 3 · 02/11/2026 · Lisandro (Licha)
Original: Google Doc "Sistema de Entrenamiento de Gimnasio — Lenguaje ubicuo, US y modelo DDD" (31/10/2026). Este archivo es la copia versionada; existe igual en `back-CW-GYM` y `front-CW-GYM`. Si cambia, se actualizan los dos repos y el Google Doc.

**Cambios respecto de la versión 2:** en T02 el back pasó de Jest a Vitest (decisión 21) y se fijaron las versiones del stack (decisión 17). Se agregaron la regla de microcommits (decisión 37), el versionado semántico del sistema (decisión 38) y el calendario con dos escenarios: ideal al 22/11 y pesimista al 01/12 (decisión 39). Se cerró ZG-14: el Admin inicial se crea con un seed (decisión 40). La decisión 41 (08/11/2026) saca US01 del MVP (pasa a DT-06), carga el catálogo desde un dataset público de ejercicios (T01) y crea los alumnos y profesores de prueba con una semilla de usuarios; el total baja a 127 pts. El orden de trabajo y el checklist de cada fase están en [`docs/PLAN-IMPLEMENTACION.md`](PLAN-IMPLEMENTACION.md).

**Cambios respecto de la versión 1:** se cerraron los cuatro pendientes (bloqueo de rutinas, stack y arquitectura, formato del informe, escala de sensación de fuerza). Se agregaron las convenciones técnicas, el catálogo de reglas de negocio con IDs y la matriz de trazabilidad obligatoria. Se detectaron y cerraron 13 zonas grises (decisiones 24 a 36). Se quitó US19: un plan no se puede finalizar antes de tiempo.

## Contexto del sistema

El sistema gestiona entrenamientos rutinarios de gimnasio. El Profesor arma rutinas y las organiza en un Plan de Entrenamiento de 28 días. El Alumno ejecuta la rutina de cada día y registra lo que realmente hizo. Al finalizar, el sistema calcula el volumen, los grupos musculares trabajados y los récords personales.

Hay tres roles: **Profesor**, **Alumno** y **Admin**.

## Decisiones de dominio

| # | Tema | Decisión |
| :-- | :-- | :-- |
| 1 | Alta de alumnos | Se cargan con una semilla de usuarios de prueba (3 profesores y 20 alumnos sin vincular, decisión 41). El ABM de alumnos queda como deuda técnica (DT-01) |
| 2 | Ejecución de una rutina | Se llama **Entrenamiento**. Para el login se dice "ingresar al sistema" |
| 3 | Grupos musculares | Piernas, Pecho, Espalda, Hombros, Brazos, Core y Cardio |
| 4 | Volumen y récords | Carga Efectiva con factor de peso corporal. Récords de máx. repeticiones, máx. volumen en serie, 1RM estimado y máx. tiempo |
| 5 | Circuito | Cada vuelta es una serie y termina con macropausa. No hay micropausas entre ejercicios |
| 6 | Entrenamiento | Es una copia independiente de la rutina en la que se basó y solo se usa para comparar |
| 7 | Profesor por alumno | Un alumno tiene un solo profesor |
| 8 | Reutilizar rutinas | Se reutilizan por importación. Si se modifica la importada, se pregunta si es una rutina nueva |
| 9 | Cambios en rutinas | No afectan los entrenamientos ya realizados |
| 10 | Planes vigentes | Un alumno tiene como máximo un plan vigente |
| 11 | Validez del plan | Fija: 28 días desde la fecha de inicio, no configurable |
| 12 | Eventos | Al iniciar el entrenamiento arrancan el contador y el registro. Al finalizar se calculan los récords |
| 13 | Peso del alumno | Sin historial: se sobrescribe. Cada entrenamiento guarda el peso del día |
| 14 | Bloqueo de rutinas | **No hay bloqueo**: la rutina se puede editar siempre. La decisión 6 ya protege lo realizado |
| 15 | Sensación de fuerza | Escala entera de **1 a 5** |
| 16 | Informe | La **matriz de trazabilidad es obligatoria** (`docs/TRAZABILIDAD.md`) |
| 17 | Stack | NestJS 12 (ESM) + TypeORM + PostgreSQL 18 en el back. React 19 + Vite 8 en el front. TypeScript 6. Node 24 LTS. Gestor de paquetes: Yarn 1 (classic) |
| 18 | Arquitectura | Modular. Cada módulo tiene las capas dominio / aplicación / infraestructura / presentación. Sin services: un caso de uso por archivo. Entidades ricas. Repositorios como puertos |
| 19 | Autenticación | JWT con guard por rol |
| 20 | Idioma | Todo en español: dominio, código, archivos, carpetas, tests y commits |
| 21 | Testing | Back: Vitest (unitarios, integración y e2e de API; hasta el 02/11/2026 decía Jest, se cambió porque Nest 12 es solo ESM y su base oficial usa Vitest). Front: Vitest + Testing Library (unitarios e integración) y Playwright (e2e de navegador, se configura al crear la suite de tests). La base de datos de test es independiente y dockerizada |
| 22 | Cobertura | Capa de dominio: 80% como mínimo, con la intención de superarlo. Resto del código: 70% |
| 23 | Ramas | `main` y `develop`. Se puede commitear directo a `develop`; lo protegen las reglas de testing y lint. Cada commit referencia una tarjeta de Trello |
| 24 | Ingreso al sistema | Con email y contraseña. El email es único. La contraseña inicial de cada alumno sale de la semilla de usuarios (`SEMILLA_CONTRASENIA`), no de un dataset (ZG-13) |
| 25 | Unicidad | El legajo del profesor y el documento (tipo + número) son únicos. La semilla no duplica a nadie cuyo documento o email ya existe (ZG-01) |
| 26 | Código de Profesor | Uno vigente por profesor, reutilizable y sin vencimiento. Generar uno nuevo invalida el anterior (ZG-02) |
| 27 | Factor de peso corporal | Mayor que 0% y hasta 100% (ZG-03) |
| 28 | Músculos | Lista cerrada, con su grupo muscular derivado (tabla en el módulo Catálogo) (ZG-04) |
| 29 | Ejercicio | Nombre único. El músculo secundario es opcional (ZG-05) |
| 30 | Rutinas por profesor | Cada profesor ve, edita e importa solo sus propias rutinas (ZG-06) |
| 31 | Fin del plan | Un plan no se puede finalizar antes de sus 28 días. Se quita US19 (ZG-07) |
| 32 | Inicio del entrenamiento | Solo la rutina de hoy, una vez por día (ZG-08). Un entrenamiento sin finalizar se retoma ese mismo día; a la medianoche queda abandonado (ZG-12) |
| 33 | Grupos trabajados | Incluyen los grupos del músculo principal y del secundario (ZG-09) |
| 34 | Récord batido | Solo si la marca es estrictamente mayor. La primera marca se guarda pero no se anuncia (ZG-10) |
| 35 | RPE y sensación de fuerza | Opcionales. Se pueden cargar después de finalizar (ZG-11) |
| 36 | Circuito y alumnos del plan | Un circuito tiene 2 o más ejercicios. El plan se crea con alumnos, pero mientras está vigente puede quedar sin ninguno |
| 37 | Microcommits | Cada commit es un único cambio lógico que compila y pasa lint y tests. En TDD, el test y la implementación mínima de una regla van juntos y el refactor va aparte. Así cada acción queda trazable y se puede revertir sola |
| 38 | Versionado | SemVer `MAJOR.MINOR.PATCH`, con front y back sincronizados. Se queda en 1.x mientras dure el MVP. La minor sube al cerrar cada hito funcional (una fase del plan) y el patch sube con los arreglos. Los tags van en `develop` |
| 39 | Calendario | Escenario ideal: MVP completo el **22/11/2026**. Escenario pesimista: **01/12/2026**. **`main` no se toca hasta el 22/11.** Según la velocity histórica, el escenario ideal no se alcanza (ver "Métricas y estimación") |
| 40 | Admin inicial | Se crea con un seed idempotente que toma el email y la contraseña de variables de entorno (ZG-14) |
| 41 | Catálogo y usuarios de prueba (08/11/2026) | US01 sale del MVP y pasa a DT-06. El catálogo se carga con T01 desde el dataset de ejercicios [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (1324 ejercicios; datos MIT, GIFs © Gym visual con atribución). Los alumnos y profesores de prueba se crean con la semilla de usuarios (`sembrar-usuarios`, dentro de US00). Total: 127 pts; fase 1: 20 pts |
| 42 | Métricas con IA (08/11/2026) | La planificación se mide en **puntos por hora de sesión** y **horas de sesión por semana**; la velocity semanal es el producto de las dos. La velocity histórica (37 pts/semana, sin IA) queda solo como piso del escenario pesimista. Se suman T04 (reestimación) y T05 (ajuste de métricas), 1 pt cada una: el backlog pasa a 129 pts. Detalle en "Reestimación del 08/11/2026" |

## Glosario de lenguaje ubicuo

Un término por concepto. Estos nombres se usan igual en conversaciones, tarjetas, código, tests e informe.

| Término | Definición |
| :-- | :-- |
| **Admin** | Usuario que gestiona el catálogo de ejercicios y el alta de profesores |
| **Profesor** | Usuario que crea rutinas y planes y asigna alumnos. Tiene datos personales y legajo |
| **Alumno** | Usuario que ejecuta los planes. Tiene datos personales (nombre, apellido, domicilio, tipo y número de documento) y de salud (altura, peso, edad). Tiene un solo profesor |
| **Código de Profesor** | Código que genera un profesor para que un alumno se vincule con él |
| **Ejercicio** | Materia prima del catálogo: nombre (único), descripción, tipo, tipo de carga, factor de peso corporal, músculo principal y músculo secundario (opcional) |
| **Tipo de ejercicio** | Por tiempo o por repeticiones |
| **Tipo de carga** | Sin Peso, Peso Corporal, Peso Extra o Peso Corporal + Peso Extra |
| **Grupo muscular** | Se deriva del músculo principal: Piernas, Pecho, Espalda, Hombros, Brazos, Core o Cardio |
| **Ejercicio Prescripto** | Ejercicio dentro de una rutina con su objetivo: repeticiones o tiempo, y peso si corresponde |
| **Bloque** | Un ejercicio prescripto repetido N series, con micropausa entre series y macropausa al final |
| **Circuito** | Varios ejercicios seguidos sin descanso. Cada vuelta es una serie y termina con macropausa |
| **Serie** | Una pasada de un bloque (un ejercicio) o una vuelta de un circuito (todos sus ejercicios) |
| **Repetición** | Una ejecución individual del movimiento dentro de una serie |
| **Micropausa** | Descanso entre series de un bloque |
| **Macropausa** | Descanso al final de un bloque o de cada vuelta de un circuito |
| **Rutina** | Secuencia ordenada de bloques y/o circuitos que crea el profesor. Según su contenido es de Bloques, de Circuitos o Mixta. Se puede editar siempre |
| **Importar rutina** | Reutilizar una rutina existente en otro plan, como copia |
| **Plan de Entrenamiento** | Período fijo de 28 días con un profesor, sus alumnos y una rutina (o descanso) por día. Se crea con uno o más alumnos y no se puede finalizar antes de tiempo |
| **Día del plan** | Día 1 a Día 28 del plan, traducido a una fecha concreta a partir de la fecha de inicio |
| **Entrenamiento** | Ejecución de la rutina del día por un alumno: copia independiente de la rutina, hora de inicio y de fin, series realizadas, peso corporal del día, RPE y sensación de fuerza |
| **Entrenamiento abandonado** | Entrenamiento iniciado que no se finalizó antes de la medianoche. No calcula récords ni cuenta para la adherencia |
| **Serie Realizada** | Lo que el alumno hizo efectivamente en una serie, comparable con lo prescripto |
| **Carga Efectiva** | Peso que cuenta por repetición según el tipo de carga |
| **Factor de Peso Corporal** | Porcentaje del peso del alumno que mueve un ejercicio (100% por defecto) |
| **Volumen de Serie** | Carga efectiva × repeticiones |
| **1RM Estimado** | Peso máximo estimado a una repetición, calculado con la fórmula de Epley |
| **Récord Personal** | Mejor marca del alumno en un ejercicio: máx. repeticiones, máx. volumen de serie, 1RM estimado o máx. tiempo |
| **RPE** | Esfuerzo autopercibido, escala entera de 1 a 10 |
| **Sensación de fuerza** | Percepción del alumno sobre su fuerza en el entrenamiento, escala entera de 1 a 5 |

## Reglas de cálculo

El volumen de una serie es carga efectiva × repeticiones. El volumen del entrenamiento es la suma de todas sus series.

| Tipo de carga | Carga efectiva por repetición |
| :-- | :-- |
| Sin Peso | 0: no suma volumen |
| Peso Extra | Peso extra |
| Peso Corporal | Peso corporal × factor del ejercicio |
| Peso Corporal + Peso Extra | Peso corporal × factor + peso extra |

El Admin carga el factor de peso corporal en cada ejercicio; por defecto es 100%. Como referencia, una flexión de brazos mueve cerca del 64% del peso corporal, una sentadilla sin carga cerca del 67% y una dominada casi el 100% ([fuente](https://hakaru.io/tools/body-weight-exercise-calculator)). El peso corporal que se usa es el que se guardó en el Entrenamiento al iniciarlo.

| Tipo de ejercicio | Récords |
| :-- | :-- |
| Por repeticiones, con carga | Máx. repeticiones en una serie, máx. volumen de serie, 1RM estimado |
| Por repeticiones, sin peso | Máx. repeticiones en una serie |
| Por tiempo | Máx. tiempo en una serie |

El 1RM se estima con la fórmula de Epley, solo para series de hasta 10 repeticiones, porque con más repeticiones sobreestima ([fuente](https://en.wikipedia.org/wiki/One-repetition_maximum)):

`1RM = carga × (1 + repeticiones / 30)`

**Ejemplo de referencia** (se usa como dato literal en los tests): un alumno de 80 kg hace dominadas (factor 100%) con 10 kg extra y 6 repeticiones. Carga efectiva: 90 kg. Volumen de serie: 540 kg. 1RM estimado: 90 × 1,2 = 108 kg.

## Modelo de dominio

| Contexto (módulo) | Carpeta | Responsabilidad | Agregados |
| :-- | :-- | :-- | :-- |
| Catálogo | `catalogo` | Ejercicios como materia prima | Ejercicio |
| Planificación | `planificacion` | Rutinas y planes creados por el profesor | Rutina, Plan de Entrenamiento |
| Entrenamiento | `entrenamiento` | Lo que realizó el alumno y sus récords | Entrenamiento, Récord Personal |
| Identidad y Vínculos (soporte) | `identidad` | Usuarios, roles, ingreso al sistema y vínculo alumno-profesor | Profesor, Alumno, Admin |

**Contenido de cada agregado**

* **Ejercicio**: nombre, descripción, tipo, tipo de carga, factor de peso corporal y músculos. El grupo muscular es un valor derivado.
* **Rutina**: lista ordenada de bloques y circuitos, cada uno con sus ejercicios prescriptos, series y pausas. Referencia los ejercicios por id.
* **Plan de Entrenamiento**: fecha de inicio, 28 días (cada uno con una rutina o descanso), profesor y alumnos por id.
* **Entrenamiento**: copia de la rutina, inicio y fin, peso corporal del día, series realizadas, RPE y sensación de fuerza.
* **Récord Personal**: mejor marca por alumno, ejercicio y tipo de récord.

**Objetos de valor:** Carga Efectiva, Pausa (duración), Documento (tipo y número), Validez del plan (inicio y fin calculado), RPE y Sensación de Fuerza.

**Invariantes**

1. La fecha de fin del plan es siempre inicio + 27 días.
2. Un alumno tiene un solo profesor.
3. Un alumno tiene como máximo un plan vigente. Esta regla cruza agregados (un plan no ve los otros planes del alumno), así que la valida el caso de uso de asignación apoyado en el repositorio de planes.
4. Solo se pueden asignar a un plan alumnos vinculados al profesor del plan.
5. Los cambios en una rutina no alteran los entrenamientos realizados.
6. Un ejercicio prescripto por tiempo no tiene repeticiones, y uno por repeticiones no tiene tiempo.

**Eventos de dominio**

| Evento | Contexto | Qué dispara |
| :-- | :-- | :-- |
| AlumnoVinculado | Identidad y Vínculos | El alumno aparece en la lista del profesor |
| PlanCreado | Planificación | Los alumnos asignados ven su plan |
| EntrenamientoIniciado | Entrenamiento | Copia la rutina y el peso del día, arranca el contador y habilita el registro de series |
| SerieRealizada | Entrenamiento | Registra lo hecho frente a lo prescripto |
| EntrenamientoFinalizado | Entrenamiento | Registra la hora de fin y calcula volumen, grupos trabajados y récords |
| RécordBatido | Entrenamiento | Se muestra en el resumen del entrenamiento |

**Cálculos de dominio (sin services):** carga efectiva, volumen y 1RM estimado son comportamiento de objetos de valor y entidades (patrón Estrategia por tipo de carga). La detección de récords es comportamiento del agregado Récord Personal. La validación de plan vigente único la hace el caso de uso que asigna alumnos.

**Catálogo de reglas de negocio:** cada regla tiene un ID `RN-<MÓDULO>-<nn>` y vive en el `CLAUDE.md` de su módulo en el back, que es la fuente de verdad. Prefijos: `RN-IDE`, `RN-CAT`, `RN-PLAN`, `RN-ENT`.

## Convenciones técnicas (resumen)

Están detalladas en el `CLAUDE.md` de cada repo y en `docs/TESTING.md`.

* **Arquitectura modular**: `src/modulos/<modulo>/{dominio,aplicacion,infraestructura,presentacion}`. Un archivo por caso de uso. Los módulos se hablan solo a través de su API pública (Fachada) o de eventos de dominio (Observador).
* **Entidad rica**: se crea con un método de fábrica que valida sus invariantes. Un estado inválido no se puede construir.
* **Repositorios**: interfaz (puerto) en `dominio`, implementación TypeORM en `infraestructura`. Así se invierte la dependencia contra PostgreSQL.
* **SOLID y patrones** (Sommerville, cap. 6 y 7): arquitectura en capas y repositorio, Fachada, Observador, Estrategia, Fábrica y Decorador.
* **Paquetes**: Yarn 1. **No se instala ninguna versión publicada hace menos de 24 horas.** Las versiones se fijan exactas.
* **Testing**: cada test cita la regla de negocio que valida. TDD estricto (rojo antes de verde). Ningún test se modifica sin preguntarle al desarrollador si cambió la regla.
* **Auditoría de IA**: `DECISIONES-IA.md` en cada repo.
* **Modelos de IA**: ver `docs/MODELOS-IA.md`.

## Microcommits y trazabilidad

Cada acción del desarrollo queda registrada en su propio commit. Así, desde una regla de negocio se llega al commit que la implementó, y desde un commit se llega a su tarjeta (decisión 37).

**Qué es un microcommit**

* Tiene **un único cambio lógico**: una regla de negocio, un caso de uso, una pantalla, un refactor o una dependencia. Si el mensaje necesita un "y", son dos commits.
* **Se sostiene solo**: compila y pasa lint y tests. Los hooks de husky lo verifican y **nunca se saltean** (`--no-verify` está prohibido).
* **Es chico**: como referencia, menos de 150 líneas de código cambiadas, sin contar `yarn.lock` ni archivos generados. Si es más grande, casi siempre se puede dividir.
* **No mezcla tipos**: un `feat` no trae refactors ni cambios de formato de otros archivos. Una dependencia nueva va en su propio `chore(deps)` con su `yarn.lock`.

**Ciclo TDD en commits.** El hook exige los tests en verde, así que el rojo no se commitea:

1. Se escribe el test de la regla y se ve fallar (🟥 en la matriz, solo en el working tree).
2. Se escribe la implementación mínima hasta el verde. **Commit 1**: test e implementación juntos, `feat(...)` si es comportamiento nuevo o `test(...)` si la implementación ya existía.
3. Si hace falta refactorizar, **commit 2**: `refactor(...)`, sin cambiar comportamiento ni tests.

En el mismo commit se actualiza `docs/TRAZABILIDAD.md` (decisión 16), así la matriz y el código nunca se desfasan.

**Formato del mensaje**

```
tipo(módulo): verbo en primera persona y en presente [ID-TARJETA]

Cuerpo opcional: por qué se hizo, no qué se hizo.

Reglas: RN-PLAN-09, RN-PLAN-10
```

* Tipos: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`. Ejemplo: `feat(planificacion): calculo la fecha de fin del plan [US07]`.
* El pie `Reglas:` es obligatorio cuando el commit agrega o cambia el test de una RN. Permite buscar con `git log --grep "RN-PLAN-09"`.
* Los commits de cierre de versión llevan la versión en lugar de la tarjeta: `chore(release): publico la versión 1.2.0 [v1.2.0]`.

**Ramas.** Cada tarjeta se trabaja en una subrama que sale de `develop` (`feat/US07-crear-plan`, `fix/BUG-03-volumen-negativo`, `docs/T03-glosario`). Se integra con `merge --no-ff` y el mensaje `US07 — Crear plan de 28 días`. Así, en el historial cada tarjeta queda como un grupo de microcommits. Después del merge se borra la subrama. No se hace squash, y no se reescribe historia ya pusheada (nada de `amend` ni `rebase` sobre commits publicados).

## Versionado del sistema

Se usa versionado semántico `MAJOR.MINOR.PATCH` (decisión 38). Como el sistema es un MVP, la versión se queda en 1.x.

| Parte | Cuándo sube | Ejemplo |
| :-- | :-- | :-- |
| **MAJOR** | Solo por decisión explícita del desarrollador, cuando el MVP termina o cuando se rompe el contrato de la API (por ejemplo, al pagar DT-04, más de un profesor por alumno). No está previsto que suba en este cuatrimestre | 2.0.0 |
| **MINOR** | Al cerrar un hito funcional, es decir, una fase de `docs/PLAN-IMPLEMENTACION.md`. Las fases no coinciden con los sprints: en una semana se pueden cerrar dos. Una US terminada no sube la versión por sí sola: se acumula en la minor del hito | 1.2.0 |
| **PATCH** | Al publicar arreglos sobre una versión ya publicada (bugs encontrados en la demo, en la revisión o en uso). Los bugs que se corrigen antes del cierre del hito son parte de esa minor y no suben patch | 1.2.1 |

**Hoja de ruta de versiones**

| Versión | Hito | Fase | Fin ideal | Fin pesimista |
| :-- | :-- | :-- | :-- | :-- |
| 1.0.0 | Base técnica: proyecto arrancable, baseline de tests, hooks y seed (T02) | 0 | 03/11 | 03/11 |
| 1.1.0 | Ingreso al sistema, catálogo de ejercicios, alta de profesores, semilla de usuarios y vínculo alumno-profesor | 1 | 07/11 | 08/11 |
| 1.2.0 | Rutina por bloques, plan de 28 días y rutina del día | 2 | 11/11 | 13/11 |
| 1.3.0 | Circuitos, rutina mixta, importar rutina, plan del alumno e inicio del entrenamiento | 3 | 16/11 | 20/11 |
| 1.4.0 | Series realizadas, resumen, récords, RPE y alumnos del plan vigente | 4 | 21/11 | 26/11 |
| 1.5.0 | Seguimiento del profesor y cierre del MVP | 5 | 22/11 | 27/11 (margen hasta 01/12) |

**Front y back sincronizados.** Los dos repos publican la misma `MAJOR.MINOR` en cada hito: el front 1.2.x funciona con el back 1.2.x. El patch puede diferir entre los dos, porque un arreglo que toca un solo repo sube el patch solo en ese repo.

**Dónde vive la versión**

* En el campo `version` del `package.json` de cada repo.
* En un **tag anotado** `v1.2.0` sobre el commit de release en `develop` (decisión 39: `main` no se toca hasta el 22/11).
* En `CHANGELOG.md` en la raíz de cada repo. Tiene una sección por versión con las categorías Agregado, Cambiado, Corregido y Eliminado, y cada entrada cita su tarjeta (`US07`, `BUG-03`). Mientras se trabaja, los cambios se anotan en la sección "Sin publicar".

**Cómo se publica una minor (cierre de fase)**

1. En `develop`: se mueven las entradas de "Sin publicar" a la nueva versión en `CHANGELOG.md`, se actualiza `version` en `package.json` y se commitea `chore(release): publico la versión 1.2.0 [v1.2.0]`.
2. Se pone el tag anotado `v1.2.0` sobre ese commit y se pushean `develop` y el tag.
3. Se repite en el otro repo con la misma versión.

**Cómo se publica un patch.** El arreglo se trabaja en `fix/BUG-xx-...` desde `develop`, con su test de regresión en el mismo microcommit. Se mergea a `develop` y se publica como `v1.2.1` con el mismo procedimiento. La entrada va en la sección Corregido del `CHANGELOG.md`.

**`main`** (decisión 39). No se toca hasta el 22/11. Ese día, con el permiso del desarrollador, se hace merge `--no-ff` de `develop` a `main` con la última versión publicada (en el escenario ideal, 1.5.0). Si se da el escenario pesimista, hay un segundo merge al cerrar, como tarde el 01/12. Después de la entrega, cada versión nueva pasa por `main`.

## Historias de usuario

El backlog suma 129 puntos (US19 se quitó por la decisión 31, US01 sale del MVP por la decisión 41: 9 pts, DT-06, y se suman T04 y T05 por la decisión 42: 2 pts). Escala: L = 5, M = 3, S = 1. Cada historia suma sus tareas Modelar, Backend y Frontend.

**Nota de calendario (decisión 39).** Los cinco "sprints" de abajo son agrupaciones funcionales y coinciden con las fases 1 a 5 del plan de implementación. El calendario real es de 3 sprints de una semana (escenario ideal, hasta el 22/11) o de 4 (escenario pesimista, hasta el 01/12). Las fechas de cada fase están en `docs/PLAN-IMPLEMENTACION.md`.

### Sprint 1: base del sistema (24 pts)

| ID | Historia | Tareas | Pts |
| :-- | :-- | :-- | :-- |
| US00 | Como **usuario** quiero ingresar al sistema con mi rol para acceder solo a las funciones que me corresponden | Backend L, Frontend M | 8 |
| ~~US01~~ | ~~Como **Admin** quiero registrar un ejercicio con su tipo, carga, factor de peso corporal y músculos para que los profesores puedan usarlo al armar rutinas~~ (fuera del MVP, DT-06) | ~~Modelar M, Backend M, Frontend M~~ | ~~9~~ |
| US02 | Como **Admin** quiero dar de alta a un profesor con su legajo para que pueda empezar a planificar | Backend S, Frontend S | 2 |
| US04 | Como **Profesor** quiero generar un código de profesor para que mis alumnos puedan vincularse conmigo | Modelar S, Backend S, Frontend S | 3 |
| US05 | Como **Alumno** quiero ingresar el código de mi profesor para quedar vinculado y recibir sus planes | Backend M, Frontend S | 4 |
| T01 | Carga del dataset de ejercicios (idempotente) | M | 3 |
| T02 | Setup del proyecto y baseline de tests: Nest + TypeORM, React + Vite, Vitest con umbrales de cobertura, Playwright para e2e del front, ESLint + Prettier, husky + lint-staged, Postgres dockerizado (desarrollo y test por separado), verificación de antigüedad de paquetes | M | 3 |
| T03 | Glosario de lenguaje ubicuo, atlas y `CLAUDE.md` por módulo en los repositorios | S | 1 |

Criterio adicional de US05: no se puede vincular un alumno que ya tiene profesor.

### Sprint 2: planificación (28 pts)

| ID | Historia | Tareas | Pts |
| :-- | :-- | :-- | :-- |
| US06 | Como **Profesor** quiero crear una rutina por bloques indicando series, repeticiones o tiempo, peso y pausas para prescribir con precisión el trabajo de cada ejercicio | Modelar M, Backend L, Frontend L | 13 |
| US07 | Como **Profesor** quiero crear un plan de 28 días y asignar una rutina a cada día para organizar el período de mis alumnos | Modelar M, Backend L, Frontend M | 11 |
| US08 | Como **Alumno** quiero consultar la rutina del día para saber exactamente qué tengo que entrenar | Backend S, Frontend M | 4 |

Criterios adicionales de US07: la fecha de fin se calcula sola; se permiten días de descanso; no se puede asignar un alumno que ya tiene un plan vigente.

### Sprint 3: más rutinas e inicio del entrenamiento (36 pts)

| ID | Historia | Tareas | Pts |
| :-- | :-- | :-- | :-- |
| US09 | Como **Profesor** quiero crear una rutina por circuitos para trabajar varios ejercicios seguidos sin descanso | Modelar M, Backend L, Frontend M | 11 |
| US10 | Como **Profesor** quiero crear una rutina mixta combinando bloques y circuitos para adaptar el entrenamiento a cada objetivo | Backend M, Frontend M | 6 |
| US20 | Como **Profesor** quiero importar una rutina existente para reutilizarla en otro plan sin tener que rearmarla | Backend M, Frontend M | 6 |
| US11 | Como **Alumno** quiero consultar mi plan de entrenamiento completo para ver cómo se organizan mis 28 días | Backend S, Frontend M | 4 |
| US13 | Como **Alumno** quiero iniciar un entrenamiento a partir de la rutina del día para que quede registrada la hora en que empiezo | Modelar M, Backend M, Frontend M | 9 |

Criterio adicional de US13: al iniciar se copian la rutina y el peso corporal del alumno.

### Sprint 4: registro, resumen y récords (33 pts)

| ID | Historia | Tareas | Pts |
| :-- | :-- | :-- | :-- |
| US14 | Como **Alumno** quiero registrar cada serie realizada para comparar lo que hice con lo que propuso mi profesor | Backend M, Frontend L | 8 |
| US15 | Como **Alumno** quiero finalizar el entrenamiento y ver un resumen con peso total levantado, grupos musculares trabajados y duración para conocer el resultado de mi entrenamiento | Backend L, Frontend M | 8 |
| US16 | Como **Alumno** quiero saber si batí un récord personal en algún ejercicio para ver mi progreso | Modelar L, Backend L, Frontend S | 11 |
| US17 | Como **Alumno** quiero registrar mi RPE y mi sensación de fuerza para que mi profesor entienda cómo me sentí | Backend S, Frontend S | 2 |
| US12 | Como **Profesor** quiero agregar o quitar alumnos de un plan vigente para ajustar los grupos cuando lo necesite | Backend M, Frontend S | 4 |

### Sprint 5: seguimiento del profesor (6 pts)

| ID | Historia | Tareas | Pts |
| :-- | :-- | :-- | :-- |
| US18 | Como **Profesor** quiero consultar los entrenamientos de mis alumnos para ajustar sus planes según lo que realmente hicieron | Backend M, Frontend M | 6 |

US19 (finalizar un plan antes de sus 28 días) se eliminó del backlog: un plan no se puede finalizar antes de tiempo (decisión 31). En el escenario ideal no queda capacidad libre: los e2e de API se escriben dentro de cada US, y los de Playwright, los ajustes y el informe usan el margen del escenario pesimista.

## Deuda técnica

| ID | Deuda | Historia futura | Motivo |
| :-- | :-- | :-- | :-- |
| DT-01 | ABM de alumnos | Como **Admin** quiero dar de alta, modificar y dar de baja alumnos para gestionarlos sin depender de una semilla | Para el MVP los alumnos se cargan con una semilla de usuarios |
| DT-02 | Autorregistro de alumnos | Como **Alumno** quiero registrarme por mi cuenta para no depender del Admin | Fuera del alcance inicial |
| DT-03 | Actualización de peso por el alumno | Como **Alumno** quiero actualizar mi peso y altura para que mis métricas se calculen con datos actuales | Sin ABM, el peso solo cambia por semilla |
| DT-04 | Más de un profesor por alumno | Como **Alumno** quiero entrenar con más de un profesor para combinar disciplinas | La regla actual es un solo profesor |
| DT-05 | Atlas generado por script | Regenerar `ATLAS.md` desde el código | Por ahora el atlas se mantiene a mano |
| DT-06 | Registro de ejercicios | Como **Admin** quiero registrar un ejercicio con su tipo, carga, factor de peso corporal y músculos para ampliar el catálogo | El catálogo del MVP se carga desde un dataset. En el front queda solo un botón "Registrar ejercicio" deshabilitado (decisión 41) |
| DT-07 | Paginación en todos los listados (T06, CG-73) | Como **usuario** quiero elegir cuántos ítems ver por página (5, 10, 20, 50 o 100) para recorrer listados largos, como los 1318 ejercicios | Pedido el 08/11/2026. Está en el backlog de Jira con la etiqueta `verificacion`, sin puntos ni fase: se estima y se le asigna fase cuando se replanifique. Antes de testear hace falta una RN-UI de paginación |
| DT-08 | Reglas de filtros por atributo en los listados (T07, CG-74; RN-UI-LIS-01 a 04, a confirmar en `src/compartido/CLAUDE.md` del front) | Como **usuario** quiero filtrar los listados por sus atributos (grupo muscular, tipo de carga, legajo, documento, etc.) para encontrar rápido lo que busco | Pedido el 08/11/2026. Depende de DT-07. Mismo estado: backlog con `verificacion`, sin puntos ni fase |

El modelo de Alumno no debe depender de quién lo creó. Así, pagar DT-01 y DT-02 solo cambia quién ejecuta el alta.

## Métricas y estimación

La velocity del proyecto anterior fue de 37 puntos por semana: el promedio de tres semanas completas en el tablero de Trello (L = 5, M = 3, S = 1).

| Semana | Puntos terminados |
| :-- | :-- |
| 7 al 13 de septiembre | 24 |
| 14 al 20 de septiembre | 53 |
| 21 al 27 de septiembre | 34 |
| 28 de septiembre (cierre) | 9 |

En total se terminaron 48 tarjetas y 120 puntos. Hay tres alertas para el nuevo tablero: 13 tarjetas no tenían estimación (8 de ellas terminadas, que no sumaron), el pico de 53 coincide con movimientos en bloque y hay IDs duplicados (dos PA-046).

**Nota (decisión 41, 08/11/2026):** el recorte de US01 deja 9 pts de margen. El backlog pasa de 136 a 127 pts, pero las tablas de esta sección se dejan con las cifras originales.

**Calendario frente a velocity (decisión 39)**

| Escenario | Fin | Semanas | Velocity necesaria | Frente a la histórica (37) |
| :-- | :-- | :-- | :-- | :-- |
| Ideal | 22/11/2026 | 3 | 45,3 pts/semana | **22% por encima: con los datos históricos no se alcanza** |
| Pesimista | 01/12/2026 | 4 + 2 días | 37 pts/semana alcanzan para terminar cerca del 27/11 | Viable, con unos 4 días (~21 pts) de margen |

El ideal se deja como objetivo porque la semana de 53 puntos muestra que el equipo puede superar los 45. Pero ese pico coincide con movimientos en bloque en el tablero, así que **no se toma como base**. La planificación realista es la pesimista. Al cierre de cada sprint se compara lo acumulado con las dos líneas:

| Corte | Acumulado ideal | Acumulado pesimista |
| :-- | :-- | :-- |
| 08/11 | 45 | 37 |
| 15/11 | 91 | 74 |
| 22/11 | 136 | 111 |
| 01/12 | — | 136 |

Si en un corte lo acumulado queda por debajo de la línea pesimista, se le consulta al desarrollador un recorte de alcance. Las candidatas, en este orden, son US20, US10, US18 y US12: nada depende de ellas.

**Reglas para el nuevo tablero:** misma escala y misma división en tareas, para que la velocity sea comparable. Ninguna tarjeta entra a READY sin estimación. Las tarjetas se mueven a DONE cuando se terminan. Ninguna tarea supera L; si parece mayor, se divide. Cada commit referencia el ID de su tarjeta.

**Estimación paramétrica (COCOMO II, puntos de aplicación).** Para los sprints 1 y 2 hay 6 pantallas simples (1 punto cada una) y 2 medias (editor de rutina y creación de plan, 2 puntos cada una): 10 puntos de aplicación. Con productividad baja (7 NAP por persona-mes), el esfuerzo es de unas 1,4 personas-mes. Comparar esa cifra con las horas reales es parte del análisis de desvío.

### Reestimación del 08/11/2026 (T04) y ajuste de métricas (T05)

**Qué pasó en el sprint 1.** Del 01 al 02/11 se hicieron la planificación y la base técnica (fase 0, 4 pts). La implementación arrancó recién el **domingo 08/11**: entre el 03 y el 07/11 no hubo commits. Ese día, en una sola sesión con IA (Opus 5.5 orquestando, Sonnet 5.5 y Haiku 5.5 como subagentes), se terminó la fase 1 completa en back y front: 20 pts, más T04 y T05 (2 pts). El sprint 1 cierra con **26 pts reales**, contra 45 de la línea ideal y 37 de la pesimista originales. El atraso no viene del ritmo, sino de que hubo un solo día de trabajo.

**Datos medidos en la fase 1**

| Dato | Valor | Cómo se midió |
| :-- | :-- | :-- |
| Puntos terminados | 22 (20 de la fase + T04 y T05) | Tarjetas en DONE |
| Horas de sesión | ≈ 1,3 h (15:10 a 16:30) | Primer y último commit del día en los dos repos, más la redacción de la reestimación |
| Productividad | ≈ 17 pts por hora de sesión | 22 / 1,3 |
| Backend de la fase (14 pts) | ≈ 45 min | 15:22 a 16:01, commits del back |
| Tests | 113 en el back (99,2% de líneas), 28 en el front (93,2%) | `yarn test:cov` |
| Bugs en demo | Pendiente | La demo de la fase 1 todavía no se hizo |

**Por qué cambia la métrica (decisión 42).** La velocity de 37 pts/semana se midió en un proyecto sin agentes de IA. Con IA, el cuello de botella deja de ser escribir código y pasa a ser el tiempo del desarrollador: confirmar fichas por tarjeta, decidir zonas grises, revisar los reportes de los subagentes y hacer las demos. Por eso se mide:

* **Puntos por hora de sesión**, por fase, a partir del primer y el último commit de cada sesión.
* **Horas de sesión por semana**, que dependen de la disponibilidad del desarrollador.
* **Velocity semanal = puntos por hora × horas por semana.** Se sigue comparando con las líneas del calendario.

**Factor de complejidad.** La fase 1 fue mayormente alta, consulta y reglas simples. Las fases 2 a 4 tienen el dominio más rico (rutina por bloques y circuitos, plan de 28 días, carga efectiva, récords), con más fichas para confirmar. Se estima una productividad 2 a 2,5 veces menor: **7 a 8 pts por hora de sesión**. Se recalcula al cerrar cada fase.

**Lo que falta.** 103 pts (fases 2 a 5). A 7,5 pts/h son unas **14 horas de sesión**.

| Escenario | Ritmo necesario | Horas de sesión por semana (a 7,5 pts/h) | Fin | Viabilidad |
| :-- | :-- | :-- | :-- | :-- |
| **Ideal** | 51,5 pts/semana (7,4 pts/día) | ≈ 7 h | dom 22/11 | Viable si el desarrollador sostiene unas 3 sesiones de 2 a 2,5 h por semana |
| **Pesimista** | 37 pts/semana (5,3 pts/día, la velocity histórica) | ≈ 5 h | sáb 28/11, con margen hasta el mar 01/12 (~16 pts) | Viable con holgura |

**Nuevos cortes de control** (reemplazan a los de "Calendario frente a velocity", que quedan como registro histórico)

| Corte | Acumulado ideal | Acumulado pesimista | Real |
| :-- | :-- | :-- | :-- |
| dom 08/11 | — | — | 26 |
| dom 15/11 | 78 | 63 | |
| dom 22/11 | 129 | 100 | |
| sáb 28/11 | — | 129 | |
| mar 01/12 | — | margen | |

**Recortes.** Lo real del 08/11 (26) quedó debajo de la línea pesimista original (37), y la regla dice consultar un recorte. Con el ritmo medido no hace falta recortar: la propuesta es **no recortar** y volver a mirar el corte del 15/11. Las candidatas siguen siendo US20, US10, US18 y US12, en ese orden. La decisión es del desarrollador.

**COCOMO II.** Los puntos de aplicación de los sprints 1 y 2 siguen siendo 10 NAP, porque la lista de ejercicios reemplaza a la pantalla de registro (DT-06). Con productividad muy alta (50 NAP por persona-mes) el modelo da 0,2 personas-mes, unas 32 h, y para las 5 pantallas de la fase 1 unas 16 h. El real fue de unas 1,3 h: COCOMO sobreestima unas 12 veces, porque no modela agentes de IA. Se mantiene como referencia del esfuerzo "sin IA" para el informe, pero no se usa para planificar.

**Estado de los OKR al 08/11**

| Resultado clave | Valor al 08/11 | Meta |
| :-- | :-- | :-- |
| O1 · Cobertura de dominio (back) | ≈ 99% | 80% o más |
| O1 · Cobertura del resto | 99,2% back · 93,2% front | 70% o más |
| O1 · RN vigentes de la fase 1 con al menos un test | 100% | 100% |
| O2 · Desvío de calendario de la fase 1 | +1 día contra el ideal (07/11); 0 contra el pesimista (08/11) | 20% o menos |
| O2 · Historias comprometidas terminadas en el sprint 1 | 100% (7 de 7, sin US01) | 90% o más |
| O2 · Tarjetas terminadas sin estimación | 0% | 0% |
| O2 · Desvío de esfuerzo estimado/real | Base nueva: 17 pts/h en la fase 1. Se mide desde la fase 2 contra los 7,5 pts/h estimados | 20% o menos |

### OKR

**O1: Construir un sistema confiable y fácil de mantener**

| Resultado clave | Base | Meta |
| :-- | :-- | :-- |
| Cobertura de tests en la capa de dominio | 0% | 80% o más |
| Cobertura del resto del código | 0% | 70% o más |
| Cambios de dominio que actualizan el glosario | Medir en sprint 1 | 100% |
| Reglas de negocio con al menos un test en la matriz | 0% | 100% |
| Bugs encontrados en demo o revisión | Medir en sprint 1 | 2 o menos por sprint |

**O2: Entregar el MVP a tiempo con estimaciones confiables**

| Resultado clave | Base | Meta |
| :-- | :-- | :-- |
| Desvío entre esfuerzo estimado y real | Medir en sprint 1 | 20% o menos |
| Historias comprometidas terminadas por sprint | Medir en sprint 1 | 90% o más |
| Tarjetas terminadas sin estimación | 17% (8 de 48) | 0% |

**O3: Que los alumnos registren sus entrenamientos sin fricción**

| Resultado clave | Meta |
| :-- | :-- |
| Tiempo para registrar una serie realizada | 10 segundos o menos |
| Entrenamientos finalizados con RPE cargado | 80% o más |
| Adherencia: días con entrenamiento sobre días con rutina | 70% o más |

Puntaje de cada resultado clave al cierre: (logrado − base) / (meta − base), con tope en 1. Un 0,7 se considera bueno.

## Pendientes cerrados

* ☑ **Bloqueo de rutinas**: se quita. La rutina se puede editar siempre (decisión 14).
* ☑ **Stack y arquitectura**: NestJS + React, arquitectura modular con casos de uso (decisiones 17 y 18).
* ☑ **Formato del informe**: la matriz de trazabilidad es obligatoria (decisión 16). Las demás secciones que exija la cátedra se agregan cuando se conozcan.
* ☑ **Escala de sensación de fuerza**: de 1 a 5 (decisión 15).

## Zonas grises (cerradas el 01/11/2026)

Surgieron al escribir el catálogo de reglas y las decidió Lisandro. Si aparecen zonas grises nuevas, se agregan acá con estado abierto y no se implementan ni se testean hasta que se decidan.

| ID | Pregunta | Decisión | Afecta |
| :-- | :-- | :-- | :-- |
| ZG-01 | ¿Legajo y documento únicos? | Sí, los dos | RN-IDE-04, 06, 12 |
| ZG-02 | ¿Cómo funciona el código de profesor? | Reutilizable, sin vencimiento; regenerarlo invalida el anterior | RN-IDE-08, 11 |
| ZG-03 | ¿Rango del factor de peso corporal? | Mayor que 0% y hasta 100% | RN-CAT-04 |
| ZG-04 | ¿Lista de músculos y su grupo? | Lista cerrada propuesta, con Sóleo agregado | RN-CAT-05 |
| ZG-05 | ¿Nombre de ejercicio único? ¿Secundario obligatorio? | Nombre único; secundario opcional | RN-CAT-01, 07 |
| ZG-06 | ¿Qué rutinas ve un profesor? | Solo las propias | RN-PLAN-08 |
| ZG-07 | ¿Fecha de fin al finalizar antes? | No se puede finalizar antes; se quita US19 | RN-PLAN-15, 17 |
| ZG-08 | ¿Qué entrenamiento se puede iniciar? | Solo el de hoy, una vez por día | RN-ENT-01 |
| ZG-09 | ¿Los grupos trabajados incluyen el secundario? | Sí, principal y secundario | RN-ENT-09 |
| ZG-10 | ¿Empate y primera marca son récord batido? | No: estrictamente mayor; la primera marca se guarda sin anunciarse | RN-ENT-13 |
| ZG-11 | ¿RPE y sensación obligatorios? | Opcionales, cargables después de finalizar | RN-ENT-16 |
| ZG-12 | ¿Entrenamiento nunca finalizado? | Se retoma el mismo día; a la medianoche queda abandonado | RN-ENT-20 |
| ZG-13 | ¿Credenciales de ingreso? | Email + contraseña; el dataset trae la contraseña inicial | RN-IDE-01, 12, 13 |
| ZG-14 | ¿Cómo se crea el Admin? (cerrada el 02/11/2026) | Seed idempotente con email y contraseña tomados de variables de entorno | RN-IDE-14 |
