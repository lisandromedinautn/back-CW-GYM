# Fichas de test — Catálogo

Una fila por caso de test. La entrada y el esperado los **confirma el desarrollador antes** de escribir el test (ver `docs/TESTING.md`). "Obtenido" se actualiza en cada corrida que falla y cuando pasa a verde. Cambiar "Esperado" requiere que antes haya cambiado la regla en `CLAUDE.md` del módulo.

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `dominio/tipo-ejercicio.spec.ts` › "por tiempo" es un tipo válido | RN-CAT-02 | Unitario | `TipoEjercicio.desde('por tiempo')` | valor `por tiempo` | valor `por tiempo` | 08/11/2026 |
| `dominio/tipo-ejercicio.spec.ts` › "por repeticiones" es un tipo válido | RN-CAT-02 | Unitario | `TipoEjercicio.desde('por repeticiones')` | valor `por repeticiones` | valor `por repeticiones` | 08/11/2026 |
| `dominio/tipo-ejercicio.spec.ts` › "por distancia" se rechaza con RN-CAT-02 | RN-CAT-02 | Unitario | `TipoEjercicio.desde('por distancia')` | `ErrorDominio` código `RN-CAT-02` | `ErrorDominio` código `RN-CAT-02` | 08/11/2026 |
