# Métricas del sprint 2 y reestimación del trabajo pendiente

Corte: **14/11/2026** · Sprint calendario: **09–15/11/2026** · Reestimación solicitada por Martina.

Este es un corte provisional: el sprint todavía no cerró. Se conserva la base original de **129 puntos** para medir avance histórico y se estima por separado el esfuerzo que falta. Las cifras de implementación no certifican el cumplimiento de toda la definición de terminado ni el estado del tablero.

## 1. Criterios y fuentes

- Martina confirmó que **US06 sigue parcial** mientras falte editar rutinas, como exige el plan. La creación implementada no permite computar los 13 puntos de la historia como terminados.
- Martina informó que **no hay registro de horas efectivas ni disponibilidad semanal**. Horas, productividad por hora, costo y desvío de esfuerzo real quedan como **ND**, no como cero.
- Se cuentan historias completas una sola vez, incluyendo back y front. Los puntos originales de las historias ya realizadas no se cambian retroactivamente.
- El sprint calendario 2 no equivale a la fase funcional 2: US09 pertenece a la fase 3, pero se implementó durante este sprint.
- Fuentes: `PLANIFICACION.md`, `PLAN-IMPLEMENTACION.md`, `TRAZABILIDAD.md`, los dos `ATLAS.md`, las entradas de `DECISIONES-IA.md`, el código y las referencias Git locales. No se consultó ni modificó Jira/Trello ni se sincronizó el Google Doc original.
- Estado Git observado: ambos repos están en `feat/consultar-rutina`; `develop` sigue en los cierres del 11/11 (`fa65c02` back, `96221ff` front). US07 está en las ramas de trabajo (`95cf880`, `b7b0a26`); la terminación y los tests adicionales de US08 incluyen cambios sin commit. Ambos `package.json` siguen en 1.1.0 y existe el tag local v1.1.0. No se verificó una publicación de v1.2.0.

## 2. Trabajo observado en el sprint

| Ítem | Puntos originales | Estado técnico al corte | Puntos de US completas computables en este corte | Evidencia |
| :-- | --: | :-- | --: | :-- |
| US06 · rutina por bloques | 13 | Parcial: creación disponible; edición pendiente | 0 | Atlas, matriz, ausencia de editar-rutina y confirmación de Martina |
| US07 · plan de 28 días | 11 | Implementada con pruebas; integración a develop pendiente | 11 | Código, ramas del 13/11 y auditoría de US07 |
| US08 · rutina del día | 4 | Implementada y verificada; cambios finales sin commit | 4 | 11 e2e de API y 10 tests de pantalla aprobados en la laptop el 14/11 |
| US09 · rutina por circuitos | 11 | Implementada e integrada en develop | 11 | Cierres del 10/11 en ambos repos y pruebas documentadas |
| **Total de historias completas técnicamente** | | **3 historias; 1 parcial** | **26** | Sin contar dos veces back y front |

También se realizaron T06 (paginación de los listados existentes), T07 (filtros del catálogo), T08 (consulta de rutinas), T09 (nombre de rutina) y T10 (protección de tests). **Cinco ítems técnicos sin estimación previa registrada**: se registran como trabajo adicional, pero no se inventan puntos para aumentar la velocidad histórica. Esto no declara terminada la paginación o los filtros de todos los listados futuros de DT-07/DT-08.

## 3. Métricas de avance

| Métrica | Cálculo | Resultado | Lectura |
| :-- | :-- | --: | :-- |
| Puntos técnicos de US completas del sprint 2 al corte | 11 + 4 + 11 | **26 pts** | Acumulación provisional, no velocity de un sprint cerrado |
| Historias completas / historias en trabajo observadas | 3 / 4 | **75,0%** | US06–US09; no es cumplimiento de compromiso semanal |
| Avance de la fase funcional 2 por puntos de historias completas | (US07 11 + US08 4) / 28 | **53,6%** | Faltan los criterios de US06; sin puntos parciales |
| Historias completas de la fase 2 | 2 / 3 | **66,7%** | US07 y US08 |
| Adelanto de la fase 3 | US09 11 / 36 | **30,6%** | Trabajo realizado fuera de la fase 2 |
| Parte del avance del sprint correspondiente a ese adelanto | 11 / 26 | **42,3%** | Explica por qué avance del sprint y cierre de fase difieren |
| Base acumulada informada al 08/11 | Fases 0 y 1 | **26 pts** | Base histórica conservada |
| Acumulado técnico del proyecto | 26 + 26 | **52 pts** | Base original V1 |
| Avance sobre el backlog original | 52 / 129 | **40,3%** | No incluye puntos inventados para T06–T10 |
| Pendiente nominal sobre la base original | 129 − 52 | **77 pts** | Incluye los 13 originales de US06 todavía sin cerrar |
| Puntos del sprint listos pero no integrados en develop | US07 11 + US08 4 | **15 pts; 57,7% de 26** | Deuda de integración, no nuevas funcionalidades |
| Puntos de historias completas del sprint integrados en develop | US09 | **11 pts; 42,3% de 26** | Integración comprobada; no certifica todos los otros criterios DoD |
| Nuevas minor publicadas del sprint verificadas localmente | Tags / versión de ambos repos | **0** | v1.2.0 sigue pendiente; no confundir implementado con publicado |
| Velocity formal de sprint terminado | Sprint 2 sin cerrar y DoD/tablero no comprobados completamente | **ND** | No se sustituye por 26 ni por 0 |
| Predictibilidad del compromiso semanal | No hay lista de compromiso semanal congelada | **ND** | Los 28 puntos de la fase 2 no son ese compromiso |
| Horas, productividad por hora y desvío de esfuerzo | Sin registro confirmado por Martina | **ND** | El intervalo entre commits no mide trabajo efectivo |

### Comparación con los controles anteriores

| Corte | Meta ideal anterior | Meta pesimista anterior | Evidencia real |
| :-- | --: | --: | :-- |
| 08/11 | 45 | 37 | 26 acumulados según el registro histórico |
| **14/11, provisional** | — | — | **52 acumulados técnicamente** |
| 15/11 | 78 | 63 | Todavía sin cierre; al 14/11 faltan 26 frente a la ideal y 11 frente a la pesimista |
| 22/11 | 129 | 100 | Fecha futura; no hay resultado real todavía |

US06, si cumple sus criterios antes del cierre, liberaría sus 13 puntos históricos y llevaría el acumulado a 65 y el sprint a 39. Es una posibilidad, no un resultado contabilizado. No se elimina la edición para obtener esa cifra.

US08 se verificó el **14/11**, frente al vencimiento pesimista de tarjeta **13/11** informado por Martina: **+1 día calendario en la evidencia de verificación**. No se infiere una fecha anterior de aceptación a partir del commit del 13/11. La fase 2 sigue abierta, por lo que su desvío final todavía no se puede medir.

## 4. Calidad y trazabilidad

Esta cobertura cuenta **RN con algún test referenciado en la matriz**, no porcentaje de líneas, ramas ni completitud de todos los comportamientos de una regla. No incluye RN-UI.

| Módulo | RN vigentes | Con test referenciado | Cobertura documental | Por diseño, sin test propio | Sin evidencia automatizada ni justificación por diseño |
| :-- | --: | --: | --: | --: | --: |
| Identidad | 14 | 14 | 100,0% | 0 | 0 |
| Catálogo | 9 | 9 | 100,0% | 0 | 0 |
| Planificación | 21 | 17 | 81,0% | 1 | 3 |
| Entrenamiento | 20 | 0 | 0,0% | 0 | 20 |
| **Total** | **64** | **40** | **62,5%** | **1** | **23** |

La RN-PLAN-17 se cumple por diseño según la matriz y no se suma como test automatizado. Las brechas de Planificación son RN-PLAN-07 (editar), RN-PLAN-16 (gestionar alumnos) y RN-PLAN-19 (plan completo). RN-PLAN-08 y RN-PLAN-01 tienen evidencia parcial de sus capacidades; disponer de un test no acredita importar rutinas o rutinas mixtas todavía pendientes.

| Métrica de verificación | Resultado y alcance |
| :-- | :-- |
| Última verificación relacionada con US08 | **50/50 casos**: 29 unitarios de back (12 de US08 y 17 de planes), 11 e2e de API y 10 de pantalla |
| Origen de esos resultados | Unitarios en homelab; API y pantalla ejecutados en la laptop por Martina y compartidos el 14/11 |
| Casos nuevos agregados al completar US08 | **15**: 3 unitarios, 6 de API y 6 de pantalla |
| Tipos, lint y formato en la sesión de US08 | Aprobados en los alcances registrados en la auditoría |
| Últimos grupos completos informados en la auditoría de US07, 13/11 | 170 unitarios back + 54 e2e API + 96 front = 320 casos en esos grupos; dato histórico, no inventario actual ni ejecución nueva |
| Cobertura actual de líneas y ramas del sprint 2 | **ND**: no hay un reporte completo actual en este corte. No se trasladan los porcentajes del 08/11 |
| Bugs en demo / defectos escapados / tiempo para registrar una serie | **ND**, no cero; no hay medición de demo o uso que permita calcularlos |

Los 50 casos relacionados no se suman a los 320 históricos: son alcances y ejecuciones superpuestos. Un porcentaje de aprobación de esa selección tampoco equivale a la cobertura del sistema.

## 5. Correcciones a la estimación anterior

1. Los **17 pts/h** del 08/11 se obtuvieron de una ventana entre commits de aproximadamente 1,3 h. Se conservan como antecedente, pero dejan de considerarse productividad real medida: faltan horas efectivas y esa ventana no identifica interrupciones ni trabajo paralelo.
2. Los **7,5 pts/h**, las **14 h pendientes** y la capacidad de **51,5 pts/semana** del 08/11 eran hipótesis. No se presentan como capacidad demostrada ni se convierten en una nueva promesa horaria.
3. Los **37 pts/semana** del proyecto anterior son una referencia para un escenario favorable condicional, no un piso garantizado para el dominio de Entrenamiento.
4. Se mantienen los **129 puntos** de V1 como base histórica y sus historias cerradas conservan sus puntos. El residual V2 estima solamente lo que falta, sin cobrar otra vez el trabajo reutilizable de US06 ni de US09.
5. Se estima el trabajo de cierre que antes figuraba «sin estimar (margen)». No se duplican los tests, validación de entrada y revisión ordinaria que ya forman parte de cada US.

## 6. Nueva estimación residual V2

Escala conservada: S = 1, M = 3, L = 5 por tarea. Son estimaciones técnicas para planificar, no horas reales ni cambios a las reglas de negocio.

| US pendiente | Referencia nominal V1 | Tareas que faltan / estimación V2 | Residual V2 | Motivo |
| :-- | --: | :-- | --: | :-- |
| US06 · edición restante | 13 | Back M 3 + front M 3 | **6** | Se reutilizan agregado, validaciones, repositorio y editor de creación. RN-PLAN-07 sigue pendiente; el residual no es el costo total de la US |
| US10 · rutina mixta | 6 | Back L 5 + front M 3 | **8** | El tipo ya se deriva, pero faltan el orden combinado y su representación/persistencia, además de habilitar y verificar la UI |
| US20 · importar rutina | 6 | Back M 3 + front M 3 | **6** | Copia independiente, propiedad y nombre; se reutilizan repositorio y selección de rutinas |
| US11 · plan del alumno | 4 | Back S 1 + front M 3 | **4** | Se reutilizan Plan, sus 28 fechas y la consulta del alumno; falta endpoint y vista completa |
| US13 · iniciar / retomar entrenamiento | 9 | Modelar M 3 + back L 5 + front M 3 | **11** | Nuevo agregado, copia independiente, varias fachadas, propiedad, inicio único y abandono al cambiar el día |
| US14 · registrar series | 8 | Back M 3 + front L 5 | **8** | Sin evidencia para reducir: registro por serie y UX de 10 segundos todavía no construidos |
| US15 · finalizar / resumen | 8 | Back L 5 + front M 3 | **8** | Volumen, grupos y duración siguen pendientes |
| US16 · récords | 11 | Modelar L 5 + back L 5 + front S 1 | **11** | Estrategias, límites de Epley, comparación y eventos; se conserva la estimación alta |
| US17 · percepción | 2 | Back S 1 + front S 1 | **2** | Validaciones y formulario acotados, con entrenamiento finalizado como dependencia |
| US12 · alumnos del plan | 4 | Back M 3 + front S 1 | **4** | Se reutilizan vínculos y repositorio; agregar/quitar y sus restricciones no están implementados |
| US18 · seguimiento del profesor | 6 | Back M 3 + front M 3 | **6** | Consulta por propiedad y listado; depende del registro de entrenamientos |
| **Total de US pendientes** | **77** | | **74** | **77 − 7 de reutilización en US06 + 2 en US10 + 2 en US13** |

### Trabajo de cierre antes omitido o pendiente

Estos son paquetes locales de planificación; no se crearon tarjetas en un tablero externo.

| Paquete | Puntos | Alcance que evita duplicaciones |
| :-- | --: | :-- |
| Regularización de lo ya implementado | 3 | Integración y validación conjunta de ramas pendientes, cobertura y demo de ese trabajo; no vuelve a implementar US07/US08 |
| e2e de API de flujos completos | 3 | Regresión entre historias y módulos; los e2e propios de cada US siguen incluidos en su estimación |
| Playwright de flujos pendientes | 5 | Entrenamiento y seguimiento de punta a punta; se reutilizan los e2e de creación ya existentes |
| Revisión final y correcciones | 3 | Reserva explícita de correcciones/regresión, no un número medido de bugs |
| Informe y cierres de versión futuros | 3 | Evidencias, métricas, trazabilidad y preparación de publicación de los hitos restantes; no incluye la regularización anterior |
| **Total de cierre** | **17** | 14 de cierre global + 3 de regularización actual |

**Pendiente operativo revisado: 74 + 17 = 91 puntos.** Frente al residual nominal V1 de 77, se reconocen **14 puntos más (+18,2%)**. Frente al cálculo del 08/11 de 103 pendientes, ahora son 91 con un alcance de cierre explícito; no se comparan como si el alcance fuese idéntico.

La referencia de capacidad acumulada del plan revisado sería **52 históricos + 91 pendientes = 143**, frente a 129 en V1. No se usa 143 para recalcular retrospectivamente velocity ni porcentajes históricos. La base de avance comunicada sigue siendo 52/129.

## 7. Pronósticos de finalización

Se parte de **91 puntos residuales**, comenzando el **15/11** como primer día completo posterior al corte. Se conserva el convenio del plan anterior de distribuir capacidad entre siete días calendario. Fórmula: `días = techo(91 × 7 / capacidad_semanal)`; fin = 14/11 + esos días. No hay inferencia de cuántos días u horas trabaja realmente el equipo.

| Escenario | Capacidad supuesta | Días calendario | Fin funcional de las US, sin los 17 de cierre | Fin incluyendo cierre |
| :-- | --: | --: | :-- | :-- |
| Favorable condicional | 37 pts/semana | 18 | **28/11/2026** | **02/12/2026** |
| Central provisional | 26 pts/semana | 25 | **04/12/2026** | **09/12/2026** |
| Conservador supuesto | 20 pts/semana | 32 | **10/12/2026** | **16/12/2026** |

- **26** es una hipótesis prudente de repetición del avance técnico ya acumulado en el sprint parcial, suponiendo que no se cierren más puntos antes del 15/11. No es velocity formal observada en una semana cerrada.
- **37** toma la referencia histórica; requiere sostener esa capacidad en el nuevo dominio y regularizar integración. No se promete que se alcance.
- **20** es una hipótesis de capacidad aproximadamente 25% menor que 26, redondeada, para examinar el riesgo del nuevo dominio y las restricciones de verificación. No es un percentil estadístico.
- No se asignan probabilidades P50/P80 ni intervalos de confianza con un único corte parcial. Se recalcula al cerrar el sprint, al terminar US06 y después del primer flujo US13–US15.

### Ajuste de los hitos anteriores

Fechas centrales bajo secuencia estricta de fases y 26 pts/semana; no implican publicación automática ni cambian la autorización sobre `main`.

| Hito | Ideal / pesimista del plan operativo anterior | Residual V2 del hito | Residual acumulado | Pronóstico central |
| :-- | :-- | --: | --: | :-- |
| v1.2.0 · fase 2 | 12/11 / 14/11 | 6 de US06 + 3 de regularización = **9** | 9 | **17/11** |
| v1.3.0 · fase 3 | 17/11 / 20/11 | 8 + 6 + 4 + 11 = **29**; US09 ya implementada | 38 | **25/11** |
| v1.4.0 · fase 4 | 21/11 / 27/11 | **33** | 71 | **04/12** |
| v1.5.0 · fase 5 y cierre | 22/11 / 28/11, margen al 01/12 | 6 de US18 + 14 de cierre = **20** | 91 | **09/12** |

Las fechas históricas de la hoja de versiones de `PLANIFICACION.md` y el plan operativo diferían en algunos días; para esta comparación se usa explícitamente el plan operativo del 08/11. Ambos quedan subordinados a este corte para el pronóstico actual.

### Qué requieren las fechas objetivo

| Objetivo conservado | Días completos disponibles desde el 15/11 | Capacidad mínima para 91 puntos |
| :-- | --: | --: |
| 22/11/2026 | 8 | **79,6 pts/semana** |
| 01/12/2026 | 17 | **37,5 pts/semana** |

El 22/11 exige aproximadamente 3,06 veces la hipótesis central. El 01/12 exige aproximadamente 44,1% más que 26. La afirmación anterior de llegada «con holgura» deja de estar sustentada bajo esta estimación residual.

La decisión de recortar o aumentar capacidad es del equipo. Las candidatas documentadas siguen siendo US20, US10, US18 y US12; a residual V2 liberarían **6 + 8 + 6 + 4 = 24 puntos**. No se recortó ninguna. Aun quedando 67, al ritmo central serían 19 días, hasta el 03/12; para el 01/12 se necesitarían aproximadamente 27,6 pts/semana. Esto evita prometer que esos recortes, por sí solos, aseguran la fecha.

## 8. OKR actualizados

| Resultado clave | Valor al corte | Meta / siguiente medición |
| :-- | :-- | :-- |
| O1 · RN con test referenciado | 40/64 = **62,5%** | 100%; separar la justificación por diseño de RN-PLAN-17 |
| O1 · Cobertura actual de código | ND | Dominio ≥ 80%, resto ≥ 70%; ejecutar reportes completos antes de publicar |
| O1 · Bugs en demo | ND | ≤ 2 por sprint; registrar demo y defectos |
| O2 · Avance del bloque funcional de fase 2 | 15/28 = **53,6%** | Completar US06 sin cambiar su alcance |
| O2 · Compromiso semanal terminado | ND | ≥ 90%; registrar un compromiso de sprint y su cierre |
| O2 · Productividad y desvío real de esfuerzo | ND | Registrar horas efectivas por sesión; no usar intervalos Git |
| O2 · Trabajo técnico sin estimación previa | **5 ítems T06–T10** | 0 en el próximo sprint; estimar antes de empezar |
| O2 · Brecha de integración de historias listas del sprint | **15/26 pts = 57,7%** | 0 antes de declarar el hito publicado |
| O3 · Registro de serie, RPE y adherencia | ND | Se medirán al implementar y usar Entrenamiento; conservar metas de 10 s, 80% y 70% |

No se calcula un puntaje global de OKR ni se convierte ND en un incumplimiento de 0: faltan bases comparables, compromiso y mediciones de uso.

## 9. COCOMO y horas

Se conservan como referencia histórica los 10 puntos de aplicación de las fases 1 y 2: `10/7 ≈ 1,43 personas-mes` o `10/50 = 0,20 personas-mes`, según las productividades hipotéticas usadas antes. Las 32 h del segundo caso asumen 160 h por persona-mes; no son horas observadas del equipo.

No se actualiza un factor «COCOMO sobreestima 12 veces» con una ventana entre commits: falta esfuerzo real comparable. La razón entre ese modelo y las horas reales queda ND. Tampoco se estima el resto del sistema con esos mismos 10 puntos de aplicación: habría que inventariar las pantallas y componentes aún no construidos.

## 10. Próximo control

Al cierre del **15/11**, registrar US aceptadas, integración, compromiso y pruebas ejecutadas; recalcular puntos sin duplicar los dos repos. Revisar si se completó US06 y si la capacidad provisional cambia. Acordar capacidad semanal antes de comprometer una nueva fecha de entrega. La regla de no modificar `main` antes del 22/11 y la necesidad de autorización para publicar/mergear se conservan.

Para las próximas sesiones basta registrar fecha, US/tarea, minutos efectivos, minutos de espera de infraestructura por separado, estado al terminar y evidencia de pruebas. No se requiere instalar herramientas para empezar esa medición.
