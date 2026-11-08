# Fichas de test — Catálogo

Una fila por caso de test. La entrada y el esperado los **confirma el desarrollador antes** de escribir el test (ver `docs/TESTING.md`). "Obtenido" se actualiza en cada corrida que falla y cuando pasa a verde. Cambiar "Esperado" requiere que antes haya cambiado la regla en `CLAUDE.md` del módulo.

| Test (archivo › caso) | RN | Nivel | Entrada | Esperado | Obtenido (último run) | Fecha |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `dominio/tipo-ejercicio.spec.ts` › "por tiempo" es un tipo válido | RN-CAT-02 | Unitario | `TipoEjercicio.desde('por tiempo')` | valor `por tiempo` | valor `por tiempo` | 08/11/2026 |
| `dominio/tipo-ejercicio.spec.ts` › "por repeticiones" es un tipo válido | RN-CAT-02 | Unitario | `TipoEjercicio.desde('por repeticiones')` | valor `por repeticiones` | valor `por repeticiones` | 08/11/2026 |
| `dominio/tipo-ejercicio.spec.ts` › "por distancia" se rechaza con RN-CAT-02 | RN-CAT-02 | Unitario | `TipoEjercicio.desde('por distancia')` | `ErrorDominio` código `RN-CAT-02` | `ErrorDominio` código `RN-CAT-02` | 08/11/2026 |
| `dominio/tipo-carga.spec.ts` › "Sin Peso" es un tipo de carga válido | RN-CAT-03 | Unitario | `TipoCarga.desde('Sin Peso')` | valor `Sin Peso` | valor `Sin Peso` | 08/11/2026 |
| `dominio/tipo-carga.spec.ts` › "Peso Corporal" es un tipo de carga válido | RN-CAT-03 | Unitario | `TipoCarga.desde('Peso Corporal')` | valor `Peso Corporal` | valor `Peso Corporal` | 08/11/2026 |
| `dominio/tipo-carga.spec.ts` › "Peso Extra" es un tipo de carga válido | RN-CAT-03 | Unitario | `TipoCarga.desde('Peso Extra')` | valor `Peso Extra` | valor `Peso Extra` | 08/11/2026 |
| `dominio/tipo-carga.spec.ts` › "Peso Corporal + Peso Extra" es un tipo de carga válido | RN-CAT-03 | Unitario | `TipoCarga.desde('Peso Corporal + Peso Extra')` | valor `Peso Corporal + Peso Extra` | valor `Peso Corporal + Peso Extra` | 08/11/2026 |
| `dominio/tipo-carga.spec.ts` › "Mancuerna" se rechaza con RN-CAT-03 | RN-CAT-03 | Unitario | `TipoCarga.desde('Mancuerna')` | `ErrorDominio` código `RN-CAT-03` | `ErrorDominio` código `RN-CAT-03` | 08/11/2026 |
| `dominio/factor-peso-corporal.spec.ts` › 0% se rechaza con RN-CAT-04 | RN-CAT-04 | Unitario | `FactorPesoCorporal.crear(0)` | `ErrorDominio` código `RN-CAT-04` | `ErrorDominio` código `RN-CAT-04` | 08/11/2026 |
| `dominio/factor-peso-corporal.spec.ts` › 0,5% es válido | RN-CAT-04 | Unitario | `FactorPesoCorporal.crear(0.5)` | porcentaje 0.5 | porcentaje 0.5 | 08/11/2026 |
| `dominio/factor-peso-corporal.spec.ts` › 100% es válido | RN-CAT-04 | Unitario | `FactorPesoCorporal.crear(100)` | porcentaje 100 | porcentaje 100 | 08/11/2026 |
| `dominio/factor-peso-corporal.spec.ts` › 100,1% se rechaza con RN-CAT-04 | RN-CAT-04 | Unitario | `FactorPesoCorporal.crear(100.1)` | `ErrorDominio` código `RN-CAT-04` | `ErrorDominio` código `RN-CAT-04` | 08/11/2026 |
| `dominio/factor-peso-corporal.spec.ts` › sin indicar el factor, vale 100% | RN-CAT-04 | Unitario | `FactorPesoCorporal.crear()` | porcentaje 100 | porcentaje 100 | 08/11/2026 |
