# Matriz de trazabilidad (obligatoria)

Une cada historia de usuario con sus reglas de negocio, el caso de uso del back, la pantalla del front y los tests que la validan. Existe igual en los dos repos. **Se actualiza en el mismo commit que agrega o cambia un test.**

Estados: ⬜ sin empezar · 🟥 test en rojo (TDD; solo en el working tree, nunca se commitea, decisión 37) · 🟩 test en verde · ⚠ RN a confirmar (no se testea; hoy no hay ninguna).

## Historia → regla → implementación

| US | RN | Caso de uso (back) | Pantalla (front) | Unit | Int | e2e API | Front (Vitest / Playwright) | Estado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| US00 | RN-IDE-01, 02, 03, 05, 06, 07, 12, 13, 14 · RN-UI-IDE-01, 02 | ingresar-al-sistema, sembrar-admin, sembrar-usuarios | PaginaIngreso | `src/modulos/identidad/dominio/*.spec.ts`, `src/modulos/identidad/aplicacion/*.spec.ts`, `src/compartido/presentacion/guard-roles/guard-roles.spec.ts` | `test/integracion/identidad/sembrar-usuarios.int-spec.ts` | `test/e2e/identidad/ingreso.e2e-spec.ts` | `src/modulos/identidad/presentacion/ingreso/PaginaIngreso.int.test.tsx`, `src/compartido/presentacion/ruta-protegida/RutaProtegida.int.test.tsx`, `src/compartido/presentacion/menu/MenuPrincipal.int.test.tsx`, `src/compartido/infraestructura/cliente-http/clienteHttp.int.test.tsx` | back 🟩, front 🟩 |
| ~~US01~~ | ~~RN-CAT-01…07~~ | ~~registrar-ejercicio~~ | ~~PaginaRegistrarEjercicio~~ | — | — | — | — | fuera del MVP (DT-06) |
| US02 | RN-IDE-04, 06, 13 | dar-alta-profesor | PaginaAltaProfesor | `src/modulos/identidad/aplicacion/dar-alta-profesor/dar-alta-profesor.caso-uso.spec.ts` | — | `test/e2e/identidad/alta-profesor.e2e-spec.ts` | `src/modulos/identidad/presentacion/alta-profesor/PaginaAltaProfesor.int.test.tsx` | back 🟩, front 🟩 |
| US04 | RN-IDE-08 | generar-codigo-profesor, consultar-codigo-profesor | PaginaCodigoProfesor | `src/modulos/identidad/aplicacion/codigo-profesor/generar-codigo-profesor.caso-uso.spec.ts`, `src/modulos/identidad/infraestructura/profesor/generador-codigos-aleatorio.spec.ts` | — | `test/e2e/identidad/codigo-profesor.e2e-spec.ts` | `src/modulos/identidad/presentacion/codigo-profesor/PaginaCodigoProfesor.int.test.tsx` | back 🟩, front 🟩 |
| US05 | RN-IDE-09, 10, 11 | vincular-alumno | PaginaVincularProfesor | `src/modulos/identidad/aplicacion/vincular-alumno/vincular-alumno.caso-uso.spec.ts` | — | `test/e2e/identidad/vinculo-alumno.e2e-spec.ts` | `src/modulos/identidad/presentacion/vinculo/PaginaVincularProfesor.int.test.tsx` | back 🟩, front 🟩 |
| T01 | RN-CAT-01, 05, 07, 08, 09 | cargar-dataset-ejercicios, listar-ejercicios | ListaEjercicios | `src/modulos/catalogo/dominio/*.spec.ts`, `src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.spec.ts` | `test/integracion/catalogo/cargar-dataset-ejercicios.int-spec.ts` | `test/e2e/catalogo/listar-ejercicios.e2e-spec.ts` | `src/modulos/catalogo/presentacion/lista-ejercicios/ListaEjercicios.int.test.tsx` | back 🟩, front 🟩 |
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
| RN-IDE-01 | `src/modulos/identidad/aplicacion/ingresar-al-sistema/ingresar-al-sistema.caso-uso.spec.ts` (3 casos) · `test/e2e/identidad/ingreso.e2e-spec.ts` (3 casos) · `src/modulos/identidad/presentacion/ingreso/PaginaIngreso.int.test.tsx` (4 casos) | 🟩 |
| RN-IDE-02 | `src/modulos/identidad/dominio/rol/rol.valor.spec.ts` (4 casos) | 🟩 |
| RN-IDE-03 | `src/compartido/presentacion/guard-roles/guard-roles.spec.ts` (4 casos) · `test/e2e/identidad/alta-profesor.e2e-spec.ts` (2 casos) · `test/e2e/identidad/codigo-profesor.e2e-spec.ts` (2 casos) · `test/e2e/identidad/vinculo-alumno.e2e-spec.ts` (1 caso) · `test/e2e/catalogo/listar-ejercicios.e2e-spec.ts` (3 casos) · `src/compartido/presentacion/ruta-protegida/RutaProtegida.int.test.tsx` (2 casos) | 🟩 |
| RN-IDE-04 | `src/modulos/identidad/dominio/profesor/profesor.entidad.spec.ts` (2 casos) · `src/modulos/identidad/aplicacion/dar-alta-profesor/dar-alta-profesor.caso-uso.spec.ts` (2 casos) · `test/e2e/identidad/alta-profesor.e2e-spec.ts` (2 casos) · `src/modulos/identidad/presentacion/alta-profesor/PaginaAltaProfesor.int.test.tsx` (3 casos) | 🟩 |
| RN-IDE-05 | `src/modulos/identidad/dominio/alumno/alumno.entidad.spec.ts` (2 casos) | 🟩 |
| RN-IDE-06 | `src/modulos/identidad/dominio/documento/documento.valor.spec.ts` (7 casos) · `src/modulos/identidad/aplicacion/dar-alta-profesor/dar-alta-profesor.caso-uso.spec.ts` (2 casos) · `src/modulos/identidad/presentacion/alta-profesor/PaginaAltaProfesor.int.test.tsx` (1 caso) | 🟩 |
| RN-IDE-07 | `src/modulos/identidad/dominio/alumno/alumno.entidad.spec.ts` (1 caso) | 🟩 |
| RN-IDE-08 | `src/modulos/identidad/aplicacion/codigo-profesor/generar-codigo-profesor.caso-uso.spec.ts` (3 casos) · `src/modulos/identidad/infraestructura/profesor/generador-codigos-aleatorio.spec.ts` (1 caso) · `test/e2e/identidad/codigo-profesor.e2e-spec.ts` (2 casos) · `src/modulos/identidad/presentacion/codigo-profesor/PaginaCodigoProfesor.int.test.tsx` (5 casos) | 🟩 |
| RN-IDE-09 | `src/modulos/identidad/aplicacion/vincular-alumno/vincular-alumno.caso-uso.spec.ts` (3 casos) · `test/e2e/identidad/vinculo-alumno.e2e-spec.ts` (1 caso) · `src/modulos/identidad/presentacion/vinculo/PaginaVincularProfesor.int.test.tsx` (1 caso) | 🟩 |
| RN-IDE-10 | `src/modulos/identidad/aplicacion/vincular-alumno/vincular-alumno.caso-uso.spec.ts` (1 caso) · `test/e2e/identidad/vinculo-alumno.e2e-spec.ts` (1 caso) · `src/modulos/identidad/presentacion/vinculo/PaginaVincularProfesor.int.test.tsx` (1 caso) | 🟩 |
| RN-IDE-11 | `src/modulos/identidad/aplicacion/vincular-alumno/vincular-alumno.caso-uso.spec.ts` (2 casos) · `test/e2e/identidad/vinculo-alumno.e2e-spec.ts` (1 caso) · `src/modulos/identidad/presentacion/vinculo/PaginaVincularProfesor.int.test.tsx` (1 caso) | 🟩 |
| RN-IDE-12 | `src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.spec.ts` (7 casos) · `test/integracion/identidad/sembrar-usuarios.int-spec.ts` (1 caso) | 🟩 |
| RN-IDE-13 | `src/modulos/identidad/aplicacion/sembrar-usuarios/sembrar-usuarios.caso-uso.spec.ts` (1 caso) · `src/modulos/identidad/aplicacion/dar-alta-profesor/dar-alta-profesor.caso-uso.spec.ts` (1 caso) · `src/modulos/identidad/presentacion/alta-profesor/PaginaAltaProfesor.int.test.tsx` (1 caso) | 🟩 |
| RN-IDE-14 | `src/modulos/identidad/aplicacion/sembrar-admin/sembrar-admin.caso-uso.spec.ts` (6 casos) | 🟩 |
| RN-UI-IDE-01 | `src/compartido/presentacion/menu/MenuPrincipal.int.test.tsx` (3 casos) | 🟩 |
| RN-UI-IDE-02 | `src/compartido/infraestructura/cliente-http/clienteHttp.int.test.tsx` (1 caso) | 🟩 |
| RN-CAT-01 | `src/modulos/catalogo/dominio/ejercicio/ejercicio.entidad.spec.ts` (2 casos) · `test/e2e/catalogo/listar-ejercicios.e2e-spec.ts` (1 caso) · `src/modulos/catalogo/presentacion/lista-ejercicios/ListaEjercicios.int.test.tsx` (4 casos) | 🟩 |
| RN-CAT-02 | `src/modulos/catalogo/dominio/tipo-ejercicio/tipo-ejercicio.valor.spec.ts` (3 casos) | 🟩 |
| RN-CAT-03 | `src/modulos/catalogo/dominio/tipo-carga/tipo-carga.valor.spec.ts` (5 casos) | 🟩 |
| RN-CAT-04 | `src/modulos/catalogo/dominio/factor-peso-corporal/factor-peso-corporal.valor.spec.ts` (5 casos) | 🟩 |
| RN-CAT-05 | `src/modulos/catalogo/dominio/musculo/musculo.valor.spec.ts` (6 casos) · `test/e2e/catalogo/listar-ejercicios.e2e-spec.ts` (1 caso) | 🟩 |
| RN-CAT-06 | `src/modulos/catalogo/dominio/ejercicio/ejercicio.entidad.spec.ts` (2 casos) | 🟩 |
| RN-CAT-07 | `src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.spec.ts` (1 caso) · `test/integracion/catalogo/cargar-dataset-ejercicios.int-spec.ts` (1 caso) | 🟩 |
| RN-CAT-08 | `src/modulos/catalogo/dominio/dataset/mapear-registro-dataset.spec.ts` (13 casos) | 🟩 |
| RN-CAT-09 | `src/modulos/catalogo/aplicacion/cargar-dataset-ejercicios/cargar-dataset-ejercicios.caso-uso.spec.ts` (2 casos) · `test/integracion/catalogo/cargar-dataset-ejercicios.int-spec.ts` (1 caso) · `src/modulos/catalogo/presentacion/lista-ejercicios/ListaEjercicios.int.test.tsx` (1 caso) | 🟩 |
| RN-PLAN-01 … RN-PLAN-19 | — | ⬜ |
| RN-ENT-01 … RN-ENT-20 | — | ⬜ |

Cuando se escriba el primer test de una RN, se separa en su propia fila.
