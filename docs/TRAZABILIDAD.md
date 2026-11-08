# Matriz de trazabilidad (obligatoria)

Une cada historia de usuario con sus reglas de negocio, el caso de uso del back, la pantalla del front y los tests que la validan. Existe igual en los dos repos. **Se actualiza en el mismo commit que agrega o cambia un test.**

Estados: ⬜ sin empezar · 🟥 test en rojo (TDD; solo en el working tree, nunca se commitea, decisión 37) · 🟩 test en verde · ⚠ RN a confirmar (no se testea; hoy no hay ninguna).

## Historia → regla → implementación

| US | RN | Caso de uso (back) | Pantalla (front) | Unit | Int | e2e API | Front (Vitest / Playwright) | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| US00 | RN-IDE-01, 02, 03, 05, 06, 07, 12, 13, 14 | ingresar-al-sistema, sembrar-admin, sembrar-usuarios | PaginaIngreso | — | — | — | — | ⬜ |
| ~~US01~~ | ~~RN-CAT-01…07~~ | ~~registrar-ejercicio~~ | ~~PaginaRegistrarEjercicio~~ | — | — | — | — | fuera del MVP (DT-06) |
| US02 | RN-IDE-04, 06, 13 | dar-alta-profesor | PaginaAltaProfesor | — | — | — | — | ⬜ |
| US04 | RN-IDE-08 | generar-codigo-profesor | PaginaCodigoProfesor | — | — | — | — | ⬜ |
| US05 | RN-IDE-09, 10, 11 | vincular-alumno | PaginaVincularProfesor | — | — | — | — | ⬜ |
| T01 | RN-CAT-01, 05, 07, 08, 09 | cargar-dataset-ejercicios | ListaEjercicios | — | — | — | — | ⬜ |
| US06 | RN-PLAN-01, 02, 04, 05, 06, 07 | crear-rutina, editar-rutina | EditorRutina | — | — | — | — | ⬜ |
| US07 | RN-PLAN-09…15, 17 | crear-plan | PaginaCrearPlan | — | — | — | — | ⬜ |
| US08 | RN-PLAN-11, 15, 18 | consultar-rutina-del-dia | PaginaRutinaDelDia | — | — | — | — | ⬜ |
| US09 | RN-PLAN-01, 03, 04 | crear-rutina | EditorRutina | — | — | — | — | ⬜ |
| US10 | RN-PLAN-01 | crear-rutina | EditorRutina | — | — | — | — | ⬜ |
| US20 | RN-PLAN-08 | importar-rutina | PaginaImportarRutina | — | — | — | — | ⬜ |
| US11 | RN-PLAN-11, 19 | consultar-plan-del-alumno | PaginaMiPlan | — | — | — | — | ⬜ |
| US13 | RN-ENT-01, 02, 20 | iniciar-entrenamiento, consultar-entrenamiento-en-curso | PaginaEntrenamientoEnCurso | — | — | — | — | ⬜ |
| US14 | RN-ENT-03, 04, 19, 20 | registrar-serie-realizada | PaginaEntrenamientoEnCurso | — | — | — | — | ⬜ |
| US15 | RN-ENT-05, 06, 07, 08, 09, 17 | finalizar-entrenamiento | PaginaResumenEntrenamiento | — | — | — | — | ⬜ |
| US16 | RN-ENT-10, 11, 12, 13 | finalizar-entrenamiento | PaginaResumenEntrenamiento | — | — | — | — | ⬜ |
| US17 | RN-ENT-14, 15, 16 | registrar-percepcion | PaginaResumenEntrenamiento | — | — | — | — | ⬜ |
| US12 | RN-PLAN-12, 13, 14, 16 | agregar-alumno-a-plan, quitar-alumno-de-plan | PaginaAlumnosDelPlan | — | — | — | — | ⬜ |
| US18 | RN-ENT-18 | consultar-entrenamientos-de-alumnos | PaginaEntrenamientosDeAlumnos | — | — | — | — | ⬜ |

En las columnas Unit, Int, e2e y Front va la ruta del archivo de test (o `archivo › caso`) cuando exista.

## Regla → tests (cobertura de reglas)

Toda RN vigente tiene que tener al menos un test. Una RN sin test es una brecha que se reporta en la revisión del sprint (OKR O1).

| RN | Tests que la validan | Estado |
| :-- | :-- | :-- |
| RN-IDE-01 … RN-IDE-14 | — | ⬜ |
| RN-CAT-01 … RN-CAT-09 | — | ⬜ |
| RN-PLAN-01 … RN-PLAN-19 | — | ⬜ |
| RN-ENT-01 … RN-ENT-20 | — | ⬜ |

Cuando se escriba el primer test de una RN, se separa en su propia fila.
