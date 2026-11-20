# Fichas de test — Entrenamiento

Una fila por caso de test. La entrada y el esperado los **confirma el desarrollador antes** de escribir el test (ver `docs/TESTING.md`). "Obtenido" se actualiza en cada corrida que falla y cuando pasa a verde. Cambiar "Esperado" requiere que antes haya cambiado la regla en `CLAUDE.md` del módulo.

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `entrenamiento.entidad.spec.ts` › conserva peso, hora y prescripción | RN-ENT-02 | Unit | Inicio con 80 kg y rutina mixta; se cambia peso, orden y repeticiones del origen | Quedan 80 kg, hora original, bloque en posición 2 y 10 repeticiones; evento de inicio | ✅ | 20/11/2026 |
| `entrenamiento.entidad.spec.ts` › cambia el día | RN-ENT-20 | Unit | Inicio 20/11 a las 23:59 UTC; consultas antes y en la medianoche | `en-curso` y luego `abandonado` | ✅ | 20/11/2026 |
| `iniciar-entrenamiento.e2e-spec.ts` › Profesor | RN-IDE-03 | e2e | POST con token de Profesor | 403 · `RN-IDE-03` | ✅ | 20/11/2026 |
| `iniciar-entrenamiento.e2e-spec.ts` › sin plan o en descanso | RN-ENT-01 | e2e | POST sin plan vigente y en un día sin rutina | 409 · `RN-ENT-01` en ambos | ✅ | 20/11/2026 |
| `iniciar-entrenamiento.e2e-spec.ts` › inicio único, recarga y nuevo día | RN-ENT-01, 02, 20 | e2e | Dos inicios simultáneos con 80 kg y rutina mixta; se cambia el nombre y el peso, consulta otro alumno y se pasa la medianoche UTC | 201 y 409, un evento; datos originales al retomar, otro alumno sin entrenamiento, abandono y nuevo inicio con datos actualizados | ✅ | 20/11/2026 |
