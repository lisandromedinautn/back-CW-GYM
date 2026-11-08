# Módulo Catálogo (`catalogo`)

Contexto central. Contiene los ejercicios como materia prima. En el MVP el catálogo se carga desde el dataset público [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (T01, decisión 41); el registro manual de ejercicios (US01) quedó fuera del MVP como deuda técnica DT-06. Los profesores usan el catálogo al armar rutinas.

* **Agregados:** Ejercicio.
* **Objetos de valor:** TipoEjercicio, TipoCarga, FactorPesoCorporal, Musculo, GrupoMuscular.
* **Eventos que emite:** ninguno por ahora.
* **Fachada que expone a otros módulos:** obtener un ejercicio por id con su tipo, tipo de carga, factor y grupo muscular. Planificación la usa para validar referencias y Entrenamiento para calcular carga, grupos y récords.
* **Puertos (repositorios):** RepositorioEjercicios. Puerto técnico: FuenteDatasetEjercicios (lee el archivo del dataset).

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-CAT-01 | El catálogo se carga desde el dataset de ejercicios (no hay registro manual en el MVP). Todo ejercicio tiene nombre, descripción, tipo, tipo de carga y músculo principal, obligatorios. El músculo secundario es opcional | T01, ZG-05, decisión 41 | Vigente |
| RN-CAT-02 | El tipo de ejercicio es "por tiempo" o "por repeticiones" y no admite otro valor | Glosario | Vigente |
| RN-CAT-03 | El tipo de carga es Sin Peso, Peso Corporal, Peso Extra o Peso Corporal + Peso Extra y no admite otro valor | Glosario | Vigente |
| RN-CAT-04 | El factor de peso corporal es un porcentaje mayor que 0% y hasta 100% (0% no es válido, 100% sí). Vale 100% si no se indica | Reglas de cálculo, ZG-03 | Vigente |
| RN-CAT-05 | El músculo se elige de una lista cerrada, y el grupo muscular se deriva del músculo según la tabla de abajo | Decisión 3, ZG-04 | Vigente |
| RN-CAT-06 | El factor de peso corporal solo interviene en los tipos de carga que incluyen peso corporal | Reglas de cálculo | Vigente |
| RN-CAT-07 | El nombre del ejercicio es único en el catálogo. Si el dataset repite un nombre, queda el primero que aparece en el archivo | ZG-05, T01 | Vigente |
| RN-CAT-08 | Cada registro del dataset se traduce al modelo según la tabla "Mapeo del dataset". Un músculo secundario que no figura en la tabla se ignora (queda sin secundario) | T01, decisión 41 | Vigente |
| RN-CAT-09 | La carga del dataset es idempotente: un ejercicio cuyo id de dataset ya existe no se duplica ni se modifica. Guarda la URL del GIF con la atribución "© Gym visual — https://gymvisual.com/" | T01, decisión 41 | Vigente |

### Músculos y grupo muscular (RN-CAT-05)

| Grupo muscular | Músculos |
| :-- | :-- |
| Piernas | Cuádriceps, Isquiotibiales, Glúteos, Gemelos, Sóleo, Aductores, Abductores |
| Pecho | Pectoral, Serrato |
| Espalda | Dorsal, Trapecio, Lumbar, Elevador de la escápula |
| Hombros | Deltoides |
| Brazos | Bíceps, Tríceps, Antebrazo |
| Core | Abdominales, Oblicuos |
| Cardio | Cardiovascular |

### Mapeo del dataset (RN-CAT-08)

* **Nombre:** el `name` original, en inglés. **Descripción:** `instructions.es`.
* **Tipo de ejercicio:** "por tiempo" si `category` es `cardio`, si el nombre termina en `plank` o si contiene `isometric`. El resto, "por repeticiones" (por ejemplo, `kettlebell hang clean` es por repeticiones).
* **Tipo de carga** (según `equipment`): `body weight` y `assisted` → Peso Corporal · `weighted` → Peso Corporal + Peso Extra · `stationary bike`, `elliptical machine`, `stepmill machine`, `skierg machine`, `upper body ergometer`, `roller`, `wheel roller`, `band`, `resistance band`, `stability ball` y `bosu ball` → Sin Peso · el resto (barbell, dumbbell, cable, máquinas, kettlebell, etc.) → Peso Extra. Factor de peso corporal: 100%.
* **Músculo principal** (según `target`): abs → Abdominales · quads → Cuádriceps · hamstrings → Isquiotibiales · glutes → Glúteos · calves → Gemelos · adductors → Aductores · abductors → Abductores · pectorals → Pectoral · serratus anterior → Serrato · lats → Dorsal · upper back y traps → Trapecio · spine → Lumbar · levator scapulae → Elevador de la escápula · delts → Deltoides · biceps → Bíceps · triceps → Tríceps · forearms → Antebrazo · cardiovascular system → Cardiovascular.
* **Músculo secundario:** el primero de `secondary_muscles` que tenga traducción y sea distinto del principal. Traducciones: shoulders, deltoids, rear deltoids, rotator cuff → Deltoides · hamstrings → Isquiotibiales · forearms, wrists, wrist flexors, wrist extensors, grip muscles, hands → Antebrazo · brachialis, biceps → Bíceps · triceps → Tríceps · quadriceps → Cuádriceps · calves → Gemelos · soleus → Sóleo · glutes → Glúteos · core, abdominals, lower abs → Abdominales · obliques → Oblicuos · chest, upper chest → Pectoral · lower back → Lumbar · rhomboids, trapezius, traps, upper back → Trapecio · back, latissimus dorsi, lats → Dorsal · inner thighs, groin → Aductores. Sin traducción (se ignoran): hip flexors, ankles, ankle stabilizers, feet, shins, sternocleidomastoid.
* **Media:** se guarda la URL del GIF en GitHub (`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/<gif_url>`) y la atribución del registro. Los datos del dataset son MIT; la media es © Gym visual y se muestra siempre con su atribución.

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `cargar-dataset-ejercicios.caso-uso.ts` (semilla de `yarn seed`) | T01 | 01–09 |
| `listar-ejercicios.caso-uso.ts` | T01, US06 (soporte) | — |
| ~~`registrar-ejercicio.caso-uso.ts`~~ | US01 (fuera del MVP, DT-06) | — |

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `GET /catalogo/ejercicios` | Admin, Profesor | listar-ejercicios |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-CAT-01, 04, 05, 07 | Se cierran ZG-03, ZG-04 y ZG-05: secundario opcional, factor entre 0% (excluido) y 100%, lista cerrada de músculos (se agregó Sóleo), nombre único | Lisandro |
| 08/11/2026 | RN-CAT-01, 05, 07; nuevas RN-CAT-08 y 09 | US01 sale del MVP (DT-06): el catálogo se carga desde el dataset hasaneyldrm/exercises-dataset. Se amplía la lista de músculos (Aductores, Abductores, Serrato, Elevador de la escápula), se fija el mapeo del dataset y la carga idempotente | Lisandro |
