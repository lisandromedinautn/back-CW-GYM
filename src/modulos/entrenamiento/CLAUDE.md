# Módulo Entrenamiento (`entrenamiento`)

Contexto central. Contiene lo que el alumno realizó y sus récords personales. El Entrenamiento guarda una copia independiente de la rutina y el peso corporal del día, así que no depende de que la rutina siga igual (decisión 6).

* **Agregados:** Entrenamiento (con sus Series Realizadas) y Récord Personal.
* **Objetos de valor:** CopiaRutina, SerieRealizada, CargaEfectiva, VolumenSerie, UnoRMEstimado, RPE (1 a 10), SensacionFuerza (1 a 5), Duracion.
* **Estrategias:** una por tipo de carga para calcular la carga efectiva y una por tipo de ejercicio para determinar qué récords aplican.
* **US16:** MarcasPorTipoEjercicio (3 estrategias), RecordPersonal, RecordBatido, DetectorRecords y la detección/persistencia al finalizar (`CerrarEntrenamientoConRecords`, `RepositorioRecords`).
* **Eventos que emite:** EntrenamientoIniciado, SerieRealizada, EntrenamientoFinalizado, RécordBatido.
* **Puertos:** RepositorioEntrenamientos, RepositorioRecords, ConsultaEjerciciosRecords (Fachada de catálogo para récords), ConsultaRutinaDelDia (Fachada de planificación), ConsultaAlumno (Fachada de identidad), ConsultaEjercicios (Fachada de catálogo para el GIF), Reloj.

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-ENT-01 | El alumno solo puede iniciar el entrenamiento de la rutina de hoy de su plan vigente, y una sola vez por día. No se recuperan días pasados ni se adelantan días futuros. Un día de descanso no se puede iniciar | US13, ZG-08 | Vigente |
| RN-ENT-02 | Al iniciar se guardan una copia independiente de la rutina (con el nombre y el GIF del catálogo de cada ejercicio; `urlGif` es `null` si el catálogo no lo tiene), el peso corporal actual del alumno y la hora de inicio, y se emite EntrenamientoIniciado | US13, decisiones 6, 12 y 13, T14 | Vigente |
| RN-ENT-03 | Cada serie realizada registra lo hecho (repeticiones o tiempo, y peso si corresponde) asociado a la serie prescripta de la copia, para poder compararlos | US14 | Vigente |
| RN-ENT-04 | Solo se registran series en un entrenamiento iniciado y no finalizado | US14 | Vigente |
| RN-ENT-05 | Al finalizar se registra la hora de fin. La duración es fin − inicio. Un entrenamiento finalizado no se vuelve a finalizar | US15 | Vigente |
| RN-ENT-06 | Volumen de serie = carga efectiva × repeticiones. Volumen del entrenamiento = suma de todas las series | Reglas de cálculo, US15 | Vigente |
| RN-ENT-07 | Carga efectiva por tipo de carga: Sin Peso → 0; Peso Extra → peso extra; Peso Corporal → peso corporal × factor; Peso Corporal + Peso Extra → peso corporal × factor + peso extra | Reglas de cálculo | Vigente |
| RN-ENT-08 | El peso corporal que se usa en los cálculos es el guardado al iniciar el entrenamiento, aunque el alumno cambie de peso después | Decisión 13 | Vigente |
| RN-ENT-09 | Los grupos musculares trabajados son los del músculo principal y los del secundario (si tiene) de cada ejercicio con al menos una serie realizada, sin repetir grupos | US15, ZG-09 | Vigente |
| RN-ENT-10 | Récords según el tipo de ejercicio: por repeticiones con carga → máx. repeticiones, máx. volumen de serie y 1RM estimado; por repeticiones sin peso → máx. repeticiones; por tiempo → máx. tiempo | Reglas de cálculo, US16 | Vigente |
| RN-ENT-11 | 1RM estimado = carga × (1 + repeticiones / 30), solo para series de hasta 10 repeticiones. Con más de 10 no se calcula | Reglas de cálculo | Vigente |
| RN-ENT-12 | Ejemplo de referencia: alumno de 80 kg, dominada (factor 100%), 10 kg extra, 6 repeticiones → carga efectiva 90 kg, volumen 540 kg, 1RM 108 kg | Reglas de cálculo | Vigente (dato literal obligatorio en los tests) |
| RN-ENT-13 | Los récords se calculan al finalizar el entrenamiento. Se bate un récord solo si la marca es estrictamente mayor que la anterior: el empate no cuenta. La primera marca de un ejercicio se guarda como récord pero no se anuncia como batido. Cada récord batido emite RécordBatido y se muestra en el resumen | Decisión 12, US16, ZG-10 | Vigente |
| RN-ENT-14 | El RPE es un entero de 1 a 10 | Glosario, US17 | Vigente |
| RN-ENT-15 | La sensación de fuerza es un entero de 1 a 5 | Decisión 15, US17 | Vigente |
| RN-ENT-16 | El RPE y la sensación de fuerza son opcionales: no se piden para finalizar, y el alumno puede cargarlos en un entrenamiento ya finalizado | US17, ZG-11 | Vigente |
| RN-ENT-17 | El resumen muestra el peso total levantado (volumen), los grupos musculares trabajados, la duración y los récords batidos | US15, US16 | Vigente |
| RN-ENT-18 | El profesor consulta solo los entrenamientos de sus alumnos | US18, invariante 2 | Vigente |
| RN-ENT-19 | Un alumno solo registra series y finaliza sus propios entrenamientos | US14, US15 | Vigente |
| RN-ENT-20 | Un entrenamiento iniciado y no finalizado se retoma durante el mismo día. Pasada la medianoche queda **abandonado**: no admite series, no se finaliza, no calcula récords y no cuenta para la adherencia | ZG-12 | Vigente |

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `iniciar-entrenamiento.caso-uso.ts` ✅ | US13 | 01, 02 |
| `consultar-entrenamiento-en-curso.caso-uso.ts` ✅ | US13 | 20 |
| `registrar-serie-realizada.caso-uso.ts` ✅ | US14 | 03, 04, 19, 20 |
| `finalizar-entrenamiento/cerrar-entrenamiento.caso-uso.ts` ✅, `dominio/entrenamiento/calcular-resumen.ts` ✅ | US15 | 05–09, 17, 19, 20 |
| `registrar-percepcion.caso-uso.ts` | US17 | 14, 15, 16 |
| `consultar-entrenamientos-de-alumnos.caso-uso.ts` ✅ | US18 | 18 |

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `POST /entrenamiento/entrenamientos` ✅ | Alumno | iniciar-entrenamiento |
| `GET /entrenamiento/mi-entrenamiento-en-curso` ✅ | Alumno | consultar-entrenamiento-en-curso |
| `POST /entrenamiento/entrenamientos/:id/series` ✅ | Alumno | registrar-serie-realizada |
| `POST /entrenamiento/entrenamientos/:id/finalizacion` ✅ | Alumno | cerrar-entrenamiento |
| `PUT /entrenamiento/entrenamientos/:id/percepcion` | Alumno | registrar-percepcion |
| `GET /entrenamiento/alumnos/:alumnoId/entrenamientos` ✅ | Profesor | consultar-entrenamientos-de-alumnos |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-ENT-15 | Escala de sensación de fuerza fijada de 1 a 5 | Lisandro |
| 01/11/2026 | RN-ENT-01, 09, 13, 16; nueva RN-ENT-20 | Se cierran ZG-08 a ZG-12: solo la rutina de hoy y una vez por día, los grupos incluyen el secundario, récord estrictamente mayor sin anunciar la primera marca, RPE y sensación opcionales y cargables después, entrenamiento abandonado a la medianoche | Lisandro |
| 22/11/2026 | RN-ENT-02 | La copia guarda también el GIF de cada ejercicio, para mostrarlo durante el entrenamiento (T14) | Ulises |

## Decisiones de implementación (CG-46, US13)

* El alumno sale del JWT. El inicio no recibe rutina ni fecha del cliente: ambas se resuelven en el servidor, con el mismo instante del `Reloj` y la fecha UTC de Planificación.
* `POST` devuelve `201` con `{ id, alumnoId, inicio, pesoCorporalKg, rutina }`. Sin plan, descanso o inicio duplicado devuelve `409` con `RN-ENT-01`. PostgreSQL garantiza la unicidad por alumno y fecha UTC; solo se publica `EntrenamientoIniciado` después de insertar.
* La prescripción se guarda como una copia JSON independiente, conservando `orden` entre bloques y circuitos. La fachada interna de Planificación lo expone sin cambiar el contrato HTTP de US08.
* `GET` devuelve `200` con `{ estado: 'en-curso' | 'abandonado', entrenamiento }` o `{ estado: 'sin-entrenamiento' }`. El estado se calcula al consultar el último entrenamiento del alumno: a las 00:00 UTC deja de estar en curso. No hace falta una tarea programada. El abandono no impide iniciar la rutina del nuevo día.

## Decisiones de implementación (US14)

* El cuerpo es `{ orden, numero, posicion?, repeticiones?, segundos?, pesoKg? }`. `orden` identifica el bloque o el circuito de la copia; `numero` es la serie del bloque (1..series) o la vuelta del circuito (1..vueltas); `posicion` (desde 1) es el ejercicio dentro del circuito y solo se usa en circuitos. Una referencia inexistente responde `400` con `RN-ENT-03`.
* Registrar otra vez la misma serie la reemplaza (corrección). En la base la clave primaria es `(entrenamiento_id, orden, numero, posicion)`, con upsert; `posicion` 0 es la serie de bloque.
* Se exige la medida prescripta (repeticiones o segundos), entera y ≥ 0; `pesoKg` es opcional y ≥ 0. Si no se cumple, responde `400` con `RN-ENT-03`. La medida que no corresponde a lo prescripto se ignora.
* Un entrenamiento de otro alumno responde `404`, para no revelar que existe (RN-ENT-19).
* Un entrenamiento abandonado responde `409` con `RN-ENT-20`. El chequeo de "finalizado" de RN-ENT-04 llega con US15.
* `POST` responde `201` con `{ orden, numero, posicion, ejercicioId, nombre, prescripta, realizada }` y publica `SerieRealizada` después de guardar. `GET /entrenamiento/mi-entrenamiento-en-curso` y el `POST` de inicio incluyen `series` en el entrenamiento, para retomar (RN-UI-ENT-02). El front tiene que replicar este contrato.

## Decisiones de implementación (US18)

* El profesor sale del JWT. El vínculo se consulta con el puerto `ConsultaVinculos`, que implementa la Fachada de identidad (`alumnoVinculadoAProfesor`).
* Un alumno ajeno o inexistente responde `403` con `RN-ENT-18`, el mismo error en los dos casos para no revelar si el alumno existe.
* `GET` devuelve una página `{ items, total, pagina, tamanio }` (tamaños 5, 10, 20, 50 o 100; 10 por defecto), del más nuevo al más viejo por fecha, sin filtros. Cada ítem es el entrenamiento completo (`id, alumnoId, inicio, pesoCorporalKg, rutina, series`) más `estado`.
* Los abandonados se listan con `estado: 'abandonado'`. El estado `finalizado` se suma con US15.

## Decisiones de implementación (US15)

* El cierre guarda la hora de fin y el resumen con volumen, duración en segundos y grupos sin repetir. Sin series, devuelve 0 kg y grupos vacíos. Los récords se implementan en US16.
* La fachada de Catálogo aporta tipo de carga, factor y grupos; el peso corporal es el guardado al iniciar. El resumen queda persistido para recuperarlo en el entrenamiento finalizado.
* El repositorio bloquea el entrenamiento para serializar el cierre con el registro de series. Una segunda finalización responde RN-ENT-05; registrar una serie tras finalizar responde RN-ENT-04. El alumno se resuelve con el JWT.
* `GET /entrenamiento/mi-entrenamiento-en-curso` puede devolver estado `finalizado` con `fin` y `resumen`; US14 incluye pantalla de registro de series.

## Decisiones de implementación (US16)

* `CargaEfectiva` (4 estrategias), `VolumenSerie`, `UnoRMEstimado`, `MarcasPorTipoEjercicio` (3 estrategias), `RecordPersonal`, `RecordBatido` y `DetectorRecords` se implementaron en el modelado y ahora se usan al finalizar.
* `factorPesoCorporal` es un porcentaje: 100 = 100 %, 64 = 64 %. "Por repeticiones sin peso" es solo `Sin Peso`; `Peso Corporal` cuenta como "con carga".
* El 1RM se estima solo entre 1 y 10 repeticiones. Con 0 repeticiones no se genera 1RM (ni con más de 10).
* `RecordPersonal` conserva el mismo `id` cuando una marca lo supera (upsert por `(alumno_id, ejercicio_id, tipo)`). La primera marca se guarda sin evento y el empate no cuenta (RN-ENT-13).
* `RecordBatido` lleva `alumnoId`, `ejercicioId`, `tipo`, `valorAnterior`, `valorNuevo` y `entrenamientoId`.
* **Detección al finalizar (A2):** `CerrarEntrenamientoConRecords` envuelve a `CerrarEntrenamiento` sin tocar sus tests. Cierra, re-lee el entrenamiento finalizado, si no hay series devuelve el resumen, carga los datos de catálogo de cada ejercicio único con `ConsultaEjerciciosRecords`, arma un `SerieParaRecords` por serie con el `pesoCorporalKg` del entrenamiento, calcula marcas con `MarcasPorTipoEjercicio`, **agrupa por `(ejercicioId, tipo)` y se queda con la mejor marca** (necesario: `DetectorRecords` actualiza su mapa por marca, dos series del mismo ejercicio podrían emitir un récord intra-entrenamiento y repetir el `id` en el upsert), busca previos con `RepositorioRecords.buscarPorAlumnoYEjercicios`, detecta, guarda con upsert y publica cada `RecordBatido`.
* **Respuesta:** `ResumenEntrenamientoConRecords` extiende `ResumenEntrenamiento` con `recordsBatidos?: RecordBatidoResumen[]` (`{ ejercicioId, nombre, tipo, valorAnterior, valorNuevo }`). Se omite cuando está vacío para no romper los tests de US15 (usan `toEqual`). El resumen persistido y el `GET` del entrenamiento no cambian.
* **Catálogo:** `ConsultaEjerciciosRecords` devuelve `{ id, nombre, tipo, tipoCarga, factorPesoCorporal }` o `null`; el adaptador valida `tipo` y `tipoCarga`. Falta el ejercicio → `RN-ENT-09`. Peso corporal sin factor → `RN-ENT-07`. No se tocó `ConsultaEjerciciosResumen` de US15.
* **Persistencia:** tabla `records_personales` (`id uuid`, `alumno_id`, `ejercicio_id`, `tipo varchar`, `valor double precision`, `entrenamiento_id`, `fecha date`), única por `(alumno_id, ejercicio_id, tipo)`. Repositorio TypeORM con `In` para la búsqueda y `upsert` para el guardado, no-op si la lista está vacía.
* **Limitación aceptada:** si falla la persistencia de récords, el entrenamiento ya quedó finalizado y `EntrenamientoFinalizado` ya se publicó. Se documenta y no se revierte.
* **Diferido:** FK `entrenamiento_id` con `ON DELETE CASCADE` (los e2e de US15 hacen `TRUNCATE entrenamientos CASCADE`, que hoy no limpia `records_personales`) y las filas de `FICHAS-TEST.md` con fecha 23/11/2026.

## Decisiones de implementación (CG-85, T14)

Decididas por Ulises el 22/11/2026.

* Para mostrar el GIF durante el entrenamiento, la copia guarda `urlGif` en cada ejercicio de bloques y circuitos (RN-ENT-02). Lo agrega `IniciarEntrenamiento` con la función de dominio `conGifs`, consultando el puerto `ConsultaEjercicios`, que implementa directo la Fachada de catálogo (`EjercicioPublico` suma `urlGif`).
* No se toca Planificación: sus respuestas (`mi-rutina-del-dia`, `mi-plan`) siguen iguales. El catálogo sigue siendo solo para Admin y Profesor.
* Los entrenamientos iniciados antes de T14 no tienen `urlGif` en su copia (no se migran); el front los muestra sin imagen.
