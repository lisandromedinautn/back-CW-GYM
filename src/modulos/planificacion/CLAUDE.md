# Módulo Planificación (`planificacion`)

Contexto central. Contiene las rutinas y los planes de entrenamiento que crea el profesor. No sabe nada de lo que el alumno ejecutó: el Entrenamiento es una copia (decisión 6).

* **Agregados:** Rutina (con Bloques, Circuitos y Ejercicios Prescriptos como entidades internas) y Plan de Entrenamiento (con sus 28 Días del plan).
* **Objetos de valor:** Pausa (duración), ObjetivoPrescripto (repeticiones o tiempo, más peso si corresponde), ValidezPlan (inicio y fin calculado), TipoRutina (Bloques, Circuitos o Mixta, derivado).
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
| RN-PLAN-05 | El peso del ejercicio prescripto se indica solo si su tipo de carga incluye Peso Extra | Glosario ("si corresponde") | Vigente |
| RN-PLAN-06 | Una rutina referencia ejercicios del catálogo por id, y esos ejercicios tienen que existir | Modelo | Vigente |
| RN-PLAN-07 | Una rutina se puede editar siempre. Los cambios no alteran los entrenamientos ya realizados | Decisiones 9 y 14, invariante 5 | Vigente |
| RN-PLAN-08 | Importar una rutina crea una copia independiente. Si se modifica la copia importada, se pregunta si es una rutina nueva. Un profesor solo ve, edita e importa sus propias rutinas | Decisión 8, US20, ZG-06 | Vigente |
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

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `crear-rutina.caso-uso.ts` | US06, US09, US10 | 01–06 |
| `editar-rutina.caso-uso.ts` | US06 | 01–07 |
| `importar-rutina.caso-uso.ts` | US20 | 08 |
| `crear-plan.caso-uso.ts` | US07 | 09–14 |
| `agregar-alumno-a-plan.caso-uso.ts` | US12 | 13, 14, 16 |
| `quitar-alumno-de-plan.caso-uso.ts` | US12 | 12, 16 |
| `consultar-rutina-del-dia.caso-uso.ts` | US08 | 11, 15, 18 |
| `consultar-plan-del-alumno.caso-uso.ts` | US11 | 11, 19 |

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `POST /planificacion/rutinas` | Profesor | crear-rutina |
| `PUT /planificacion/rutinas/:id` | Profesor | editar-rutina |
| `POST /planificacion/rutinas/:id/importacion` | Profesor | importar-rutina |
| `POST /planificacion/planes` | Profesor | crear-plan |
| `POST /planificacion/planes/:id/alumnos` | Profesor | agregar-alumno-a-plan |
| `DELETE /planificacion/planes/:id/alumnos/:alumnoId` | Profesor | quitar-alumno-de-plan |
| `GET /planificacion/mi-rutina-del-dia` | Alumno | consultar-rutina-del-dia |
| `GET /planificacion/mi-plan` | Alumno | consultar-plan-del-alumno |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-PLAN-07 | Se quita el bloqueo de rutinas: se editan siempre | Lisandro |
| 01/11/2026 | RN-PLAN-03, 08, 12, 15, 16, 17 | Se cierran ZG-06 y ZG-07: circuito con 2 o más ejercicios, cada profesor trabaja solo con sus rutinas, el plan puede quedar sin alumnos, no hay finalización anticipada (se quita US19 y el caso de uso finalizar-plan) | Lisandro |
