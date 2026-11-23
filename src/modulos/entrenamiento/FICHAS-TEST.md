# Fichas de test — Entrenamiento

Una fila por caso de test. La entrada y el esperado los **confirma el desarrollador antes** de escribir el test (ver `docs/TESTING.md`). "Obtenido" se actualiza en cada corrida que falla y cuando pasa a verde. Cambiar "Esperado" requiere que antes haya cambiado la regla en `CLAUDE.md` del módulo.

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `entrenamiento.entidad.spec.ts` › conserva peso, hora y prescripción | RN-ENT-02 | Unit | Inicio con 80 kg y rutina mixta; se cambia peso, orden y repeticiones del origen | Quedan 80 kg, hora original, bloque en posición 2 y 10 repeticiones; evento de inicio | ✅ | 20/11/2026 |
| `entrenamiento.entidad.spec.ts` › cambia el día | RN-ENT-20 | Unit | Inicio 20/11 a las 23:59 UTC; consultas antes y en la medianoche | `en-curso` y luego `abandonado` | ✅ | 20/11/2026 |
| `entrenamiento.entidad.spec.ts` › serie de bloque | RN-ENT-03 | Unit | Bloque `orden 2` (Press, 3 series, 10 reps, 30 kg); se registra la serie 3 con 8 reps y 30 kg | Serie `orden 2`, `numero 3`, sin posición; prescripta 10 reps y 30 kg; realizada 8 reps y 30 kg | ✅ | 22/11/2026 |
| `entrenamiento.entidad.spec.ts` › vuelta de circuito | RN-ENT-03 | Unit | Circuito `orden 1` (2 vueltas; posición 1: Plancha 30 s); se registra la vuelta 2, posición 1, con 25 s | Serie `orden 1`, `numero 2`, `posicion 1`; prescripta 30 s; realizada 25 s sin peso | ✅ | 22/11/2026 |
| `entrenamiento.entidad.spec.ts` › emite SerieRealizada | RN-ENT-03 | Unit | Registro de la serie 3 del bloque `orden 2` | Evento `SerieRealizada` con el id del entrenamiento | ✅ | 22/11/2026 |
| `entrenamiento.entidad.spec.ts` › referencias y medidas inválidas | RN-ENT-03 | Unit | Serie 4 de 3; vuelta 3 de 2; posición 3 de 2; circuito sin posición; bloque con posición; orden inexistente; `segundos` en un ejercicio de reps; reps en uno de segundos; sin medida; peso −1 | `RN-ENT-03` en cada caso | ✅ | 22/11/2026 |
| `entrenamiento.entidad.spec.ts` › límite de repeticiones | RN-ENT-03 | Unit | 0 reps y −1 rep | 0 se acepta; −1 da `RN-ENT-03` | ✅ | 22/11/2026 |
| `entrenamiento.entidad.spec.ts` › corrección | RN-ENT-03 | Unit | La misma serie se registra con 8 reps y después con 9 | Una sola serie, con 9 reps | ✅ | 22/11/2026 |
| `entrenamiento.entidad.spec.ts` › abandonado | RN-ENT-20, 04 | Unit | Inicio 20/11 23:59 UTC; registro a las 23:59:59.999 y a las 00:00 del 21/11 | El primero se acepta; el segundo da `RN-ENT-20` | ✅ | 22/11/2026 |
| `registrar-serie-realizada.e2e-spec.ts` › Profesor | RN-IDE-03 | e2e | POST de serie con token de Profesor | 403 · `RN-IDE-03` | ✅ | 22/11/2026 |
| `registrar-serie-realizada.e2e-spec.ts` › otro alumno | RN-ENT-19 | e2e | El alumno02 registra una serie en el entrenamiento del alumno01 | 404 | ✅ | 22/11/2026 |
| `registrar-serie-realizada.e2e-spec.ts` › registra, retoma y abandona | RN-ENT-03, 20 · RN-UI-ENT-02 | e2e | El alumno01 registra la serie 3 del bloque (8 reps, 30 kg), consulta el entrenamiento en curso y vuelve a registrar después de la medianoche UTC | 201 con la serie y un evento `SerieRealizada`; el GET incluye la serie; después de las 00:00, 409 · `RN-ENT-20` | ✅ | 22/11/2026 |
| `registrar-serie-realizada.e2e-spec.ts` › referencia inválida | RN-ENT-03 | e2e | Serie 4 de un bloque de 3 | 400 · `RN-ENT-03` | ✅ | 22/11/2026 |
| `iniciar-entrenamiento.e2e-spec.ts` › Profesor | RN-IDE-03 | e2e | POST con token de Profesor | 403 · `RN-IDE-03` | ✅ | 20/11/2026 |
| `iniciar-entrenamiento.e2e-spec.ts` › sin plan o en descanso | RN-ENT-01 | e2e | POST sin plan vigente y en un día sin rutina | 409 · `RN-ENT-01` en ambos | ✅ | 20/11/2026 |
| `iniciar-entrenamiento.e2e-spec.ts` › inicio único, recarga y nuevo día | RN-ENT-01, 02, 20 | e2e | Dos inicios simultáneos con 80 kg y rutina mixta; se cambia el nombre y el peso, consulta otro alumno y se pasa la medianoche UTC | 201 y 409, un evento; datos originales al retomar, otro alumno sin entrenamiento, abandono y nuevo inicio con datos actualizados | ✅ | 20/11/2026 |
| `consultar-entrenamientos-de-alumnos.caso-uso.spec.ts` › alumno propio | RN-ENT-18 | Unit | Profesor P1, alumno A1 vinculado con entrenamientos el 20/11 y el 21/11; reloj 21/11 12:00 UTC | 2 entrenamientos: primero el del 21/11 `en-curso`, después el del 20/11 `abandonado`; `total: 2` | ✅ | 22/11/2026 |
| `consultar-entrenamientos-de-alumnos.caso-uso.spec.ts` › alumno de otro profesor | RN-ENT-18 | Unit | P1 consulta a A2, vinculado a P2 | 403 · `RN-ENT-18` | ✅ | 22/11/2026 |
| `consultar-entrenamientos-de-alumnos.caso-uso.spec.ts` › alumno inexistente | RN-ENT-18 | Unit | P1 consulta un alumno que no existe | 403 · `RN-ENT-18` | ✅ | 22/11/2026 |
| `consultar-entrenamientos-de-alumnos.e2e-spec.ts` › Alumno | RN-IDE-03 | e2e | GET con token de Alumno | 403 · `RN-IDE-03` | ✅ | 22/11/2026 |
| `consultar-entrenamientos-de-alumnos.e2e-spec.ts` › alumno propio con series | RN-ENT-18 | e2e | profesor01 consulta a alumno01, que inició y registró la serie 3 del bloque (8 reps, 30 kg) | 200 con 1 entrenamiento `en-curso` y esa serie en `series` | ✅ | 22/11/2026 |
| `consultar-entrenamientos-de-alumnos.e2e-spec.ts` › otro profesor | RN-ENT-18 | e2e | profesor02 consulta a alumno01 | 403 · `RN-ENT-18` | ✅ | 22/11/2026 |
| `consultar-entrenamientos-de-alumnos.e2e-spec.ts` › paginación | RN-ENT-18 | e2e | alumno01 con entrenamientos el 20/11 y el 21/11, `tamanio=5` | El del 21/11 primero; `total: 2` | ✅ | 22/11/2026 |
| `copia-rutina.valor.spec.ts` › agrega el GIF | RN-ENT-02 | Unit | Copia con un bloque de `press` y un circuito con `press` y `plancha`; el catálogo tiene `https://gifs.test/press.gif` para `press` | Bloque y `press` del circuito con esa URL | ✅ | 22/11/2026 |
| `copia-rutina.valor.spec.ts` › ejercicio sin GIF | RN-ENT-02 | Unit | Igual, sin GIF para `plancha` | `plancha` con `urlGif: null` | ✅ | 22/11/2026 |
| `gif-en-la-copia.e2e-spec.ts` › al iniciar | RN-ENT-02 | e2e | alumno01 inicia la rutina "Fuerza" del fixture (bloque `lever chest press`, circuito con `weighted front plank`) | `rutina.bloques[0].urlGif` = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0577-T0yTjgW.gif` y `rutina.circuitos[0].ejercicios[0].urlGif` = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2135-VBAWRPG.gif` | ✅ | 22/11/2026 |
| `gif-en-la-copia.e2e-spec.ts` › al retomar | RN-ENT-02 | e2e | `GET /entrenamiento/mi-entrenamiento-en-curso` después de iniciar | Las mismas dos URL | ✅ | 22/11/2026 |
