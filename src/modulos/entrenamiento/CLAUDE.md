# Módulo Entrenamiento (`entrenamiento`)

Contexto central. Contiene lo que el alumno realizó y sus récords personales. El Entrenamiento guarda una copia independiente de la rutina y el peso corporal del día, así que no depende de que la rutina siga igual (decisión 6).

* **Agregados:** Entrenamiento (con sus Series Realizadas) y Récord Personal.
* **Objetos de valor:** CopiaRutina, CargaEfectiva, VolumenSerie, UnoRMEstimado, RPE (1 a 10), SensacionFuerza (1 a 5), Duracion.
* **Estrategias:** una por tipo de carga para calcular la carga efectiva y una por tipo de ejercicio para determinar qué récords aplican.
* **Eventos que emite:** EntrenamientoIniciado, SerieRealizada, EntrenamientoFinalizado, RécordBatido.
* **Puertos:** RepositorioEntrenamientos, RepositorioRecords, ConsultaRutinaDelDia (Fachada de planificación), ConsultaAlumno (Fachada de identidad: peso actual y profesor), ConsultaEjercicios (Fachada de catálogo), Reloj.

## Reglas de negocio

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-ENT-01 | El alumno solo puede iniciar el entrenamiento de la rutina de hoy de su plan vigente, y una sola vez por día. No se recuperan días pasados ni se adelantan días futuros. Un día de descanso no se puede iniciar | US13, ZG-08 | Vigente |
| RN-ENT-02 | Al iniciar se guardan una copia independiente de la rutina, el peso corporal actual del alumno y la hora de inicio, y se emite EntrenamientoIniciado | US13, decisiones 6, 12 y 13 | Vigente |
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
| `iniciar-entrenamiento.caso-uso.ts` | US13 | 01, 02 |
| `consultar-entrenamiento-en-curso.caso-uso.ts` | US13 | 20 |
| `registrar-serie-realizada.caso-uso.ts` | US14 | 03, 04, 19, 20 |
| `finalizar-entrenamiento.caso-uso.ts` | US15, US16 | 05–13, 17, 19, 20 |
| `registrar-percepcion.caso-uso.ts` | US17 | 14, 15, 16 |
| `consultar-entrenamientos-de-alumnos.caso-uso.ts` | US18 | 18 |

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `POST /entrenamiento/entrenamientos` | Alumno | iniciar-entrenamiento |
| `GET /entrenamiento/mi-entrenamiento-en-curso` | Alumno | consultar-entrenamiento-en-curso |
| `POST /entrenamiento/entrenamientos/:id/series` | Alumno | registrar-serie-realizada |
| `POST /entrenamiento/entrenamientos/:id/finalizacion` | Alumno | finalizar-entrenamiento |
| `PUT /entrenamiento/entrenamientos/:id/percepcion` | Alumno | registrar-percepcion |
| `GET /entrenamiento/alumnos/:alumnoId/entrenamientos` | Profesor | consultar-entrenamientos-de-alumnos |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-ENT-15 | Escala de sensación de fuerza fijada de 1 a 5 | Lisandro |
| 01/11/2026 | RN-ENT-01, 09, 13, 16; nueva RN-ENT-20 | Se cierran ZG-08 a ZG-12: solo la rutina de hoy y una vez por día, los grupos incluyen el secundario, récord estrictamente mayor sin anunciar la primera marca, RPE y sensación opcionales y cargables después, entrenamiento abandonado a la medianoche | Lisandro |
