# Módulo Catálogo (`catalogo`)

Contexto central. Contiene los ejercicios como materia prima. Solo el Admin los registra; los profesores los usan al armar rutinas.

* **Agregados:** Ejercicio.
* **Objetos de valor:** TipoEjercicio, TipoCarga, FactorPesoCorporal, Musculo, GrupoMuscular.
* **Eventos que emite:** ninguno por ahora.
* **Fachada que expone a otros módulos:** obtener un ejercicio por id con su tipo, tipo de carga, factor y grupo muscular. Planificación la usa para validar referencias y Entrenamiento para calcular carga, grupos y récords.
* **Puertos (repositorios):** RepositorioEjercicios.

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-CAT-01 | Solo el Admin registra ejercicios. Son obligatorios: nombre, descripción, tipo, tipo de carga y músculo principal. El músculo secundario es opcional | US01, ZG-05 | Vigente |
| RN-CAT-02 | El tipo de ejercicio es "por tiempo" o "por repeticiones" y no admite otro valor | Glosario | Vigente |
| RN-CAT-03 | El tipo de carga es Sin Peso, Peso Corporal, Peso Extra o Peso Corporal + Peso Extra y no admite otro valor | Glosario | Vigente |
| RN-CAT-04 | El factor de peso corporal es un porcentaje mayor que 0% y hasta 100% (0% no es válido, 100% sí). Vale 100% si no se indica | Reglas de cálculo, ZG-03 | Vigente |
| RN-CAT-05 | El músculo se elige de una lista cerrada, y el grupo muscular se deriva del músculo según la tabla de abajo | Decisión 3, ZG-04 | Vigente |
| RN-CAT-06 | El factor de peso corporal solo interviene en los tipos de carga que incluyen peso corporal | Reglas de cálculo | Vigente |
| RN-CAT-07 | El nombre del ejercicio es único en el catálogo | ZG-05 | Vigente |

### Músculos y grupo muscular (RN-CAT-05)

| Grupo muscular | Músculos |
| :-- | :-- |
| Piernas | Cuádriceps, Isquiotibiales, Glúteos, Gemelos, Sóleo |
| Pecho | Pectoral |
| Espalda | Dorsal, Trapecio, Lumbar |
| Hombros | Deltoides |
| Brazos | Bíceps, Tríceps, Antebrazo |
| Core | Abdominales, Oblicuos |
| Cardio | Cardiovascular |

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `registrar-ejercicio.caso-uso.ts` | US01 | 01–07 |
| `listar-ejercicios.caso-uso.ts` | US06 (soporte) | — |

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `POST /catalogo/ejercicios` | Admin | registrar-ejercicio |
| `GET /catalogo/ejercicios` | Admin, Profesor | listar-ejercicios |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-CAT-01, 04, 05, 07 | Se cierran ZG-03, ZG-04 y ZG-05: secundario opcional, factor entre 0% (excluido) y 100%, lista cerrada de músculos (se agregó Sóleo), nombre único | Lisandro |
