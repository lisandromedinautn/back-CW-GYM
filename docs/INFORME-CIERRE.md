# Informe de cierre — insumos para la documentación

Estado al **24/11/2026**, con `develop` y `main` iguales en los dos repos. Fuentes: Jira (proyecto CG, leído el 24/11), `docs/PLAN-IMPLEMENTACION.md`, `docs/PLANIFICACION.md`, `docs/METRICAS-SPRINT-2.md`, `docs/TRAZABILIDAD.md`, `DECISIONES-IA.md`, `CHANGELOG.md`, `git log` y el código en `src/modulos/*/dominio`. Este archivo es **material de trabajo** para armar los informes: cada dato marca su origen con [F] (fuente citada), [I] (inferencia o cálculo) o [ND] (no hay dato).

> Idéntico en `back-CW-GYM/docs` y `front-CW-GYM/docs`.

## 1. Cierre de estimaciones

### 1.1 Base V1 y alcance agregado

La **base V1 = 129 pts** es el backlog comprometido en la reestimación del 08/11 (T04). Lo que entró después se registra aparte como **alcance agregado**, para medir cuánto creció el alcance sin mover la meta. Lo agregado suma igual a la velocity del sprint en que se hizo.

| Ítem | Historia | Pts V1 | Pts Jira | Sprint Jira | Estado 24/11 |
| :-- | :-- | --: | --: | :-- | :-- |
| T02 | Setup y baseline | 3 | 3 | S1 | Hecha |
| US00 | Ingreso al sistema | 8 | 8 | S1 | Hecha |
| US01 | Registrar ejercicio | — | 0 | — | Descartada (dataset T01) |
| US02 | Alta de profesor | 2 | 2 | S1 | Hecha |
| T01 | Dataset de ejercicios | 3 | 3 | S1 | Hecha |
| US04 | Código de profesor | 3 | 3 | S1 | Hecha |
| US05 | Vincular alumno | 4 | 4 | S1 | Hecha |
| T04, T05 | Reestimación y métricas | 2 | — | S1 | Hechas |
| US06 | Rutina por bloques (crear, consultar, editar) | 13 | 13 | S2 | Hecha. La edición (RN-PLAN-07) recién el 24/11 |
| US07 | Plan de 28 días | 11 | 11 | S2 | Hecha |
| US08 | Rutina del día | 4 | 4 | S2 | Hecha |
| US09 | Rutina por circuitos | 11 | 11 | S2 | Hecha |
| US10 | Rutina mixta | 6 | 6 | S3 | Hecha |
| US20 | Importar rutina | 6 | 6 | S3 | Hecha |
| US11 | Plan del alumno | 4 | 4 | S3 | Hecha |
| US13 | Iniciar entrenamiento | 9 | 9 | S3 | Hecha |
| US12 | Alumnos del plan | 4 | 4 | S3 | Hecha |
| US14 | Registrar series | 8 | 8 | S4 | Hecha |
| US15 | Finalizar y resumen | 8 | 8 | S4 | Hecha |
| US16 | Récords personales | 11 | 11 | S4 | Hecha (integrada el 24/11, PR #16 back y #19 front) |
| US17 | RPE y sensación de fuerza | 2 | **8** | S4 | Hecha. Se reestimó en Jira al crecer con notificaciones (decisión 46) |
| US18 | Seguimiento del profesor | 6 | 6 | S4 | Hecha |
| **Total base V1** | | **129** | | | **129/129 = 100 %** [I] |

**Alcance agregado** (fuera de la base V1) [F Jira]:

| Ítem | Qué | Pts | Sprint | Pedido por |
| :-- | :-- | --: | :-- | :-- |
| US17 (diferencia) | Reestimación 2 → 8 | +6 | S4 | Ulises |
| T08, T09, T10, T14 | Listado de rutinas, nombre, protección de tests, GIF | 4 | S2–S3 | Equipo |
| T15 | e2e de navegador | 11 | S4 | Ulises |
| US21 | Notificar al profesor un entrenamiento por debajo | 11 | S4 | Ulises (decisión 45) |
| US22 | Editar los días de un plan (CG-91) | 8 | S4 | Lisandro |
| US23 | Alerta de incumplimiento repetido (CG-92) | 5 | S4 | Lisandro |
| T16 | Volver al inicio desde el resumen (CG-93) | 1 | S4 | Lisandro |
| **Total agregado** | | **46** | | |

- Sin puntos en Jira: T04, T05, T06, T07 y T13 [F]. El OKR O2 pedía cero tarjetas sin estimar y no se cumplió.
- Crecimiento del alcance: 46 / 129 = **+35,7 %** [I].
- Alcance total entregado: 129 + 46 = **175 pts** [I].

### 1.2 Velocity por sprint

| Sprint | Fechas | Pts en Jira | Comentario |
| :-- | :-- | --: | :-- |
| S1 | 02–08/11 | 26 [F] | Meta ideal 45, pesimista 37. Un solo día de trabajo (08/11). |
| S2 | 09–15/11 | 39 [F] | Incluye los 13 de US06, que quedó parcial hasta el 24/11. Sin US06: 26 [I]. El sprint de Jira nunca se inició y se cerró el 21/11. |
| S3 | 16–22/11 | 25 [F] | |
| S4 | 23/11–01/12 (abierto) | 77 al 24/11 [I] | US14 8, US15 8, US16 11, US17 8, US18 6, T15 11, US21 11, US22 8, US23 5, T16 1. El sprint figura **"future"** en Jira: nunca se inició. |

- Promedio S1–S3: 30 pts con el criterio de Jira, 26 si US06 se cuenta al cerrarse [I].
- S4 multiplica por 2,5 el promedio, en dos días. Se explica por el trabajo paralelo con varios subagentes y por la carga acumulada del cierre [I].
- La velocity formal de METRICAS-SPRINT-2 sigue en [ND]: no hay horas registradas.

### 1.3 Contra las metas

- Meta ideal (129 al 22/11): no se cumplió. Al 22/11 había unos 90 [F].
- Meta pesimista (100): se cruzó el 23/11 con 103 [F].
- La base V1 completa se alcanzó el **24/11**, dos días después de la ideal y siete antes del cierre pesimista (01/12) [I].
- Pronóstico del 14/11: fin central el 09/12 [F]. La realidad lo adelantó unas dos semanas [I].

### 1.4 Desvíos

- **Horas:** [ND]. Nunca se registraron horas efectivas. Las "17 pts/h" del 08/11 se descartaron como medida.
- **Estados falsos en Jira:** US06 y US16 figuraron en Listo antes de estar integradas. S2 y S4 nunca se iniciaron en Jira.
- **Cierre pendiente:** quedan 17 pts de cierre del plan sin hacer: e2e de API de flujos completos, regularización, revisión final e informe. T15, el e2e de navegador, sí está hecho.
- **Versionado:** tags v1.0.0 a v1.3.0. v1.4.0 y v1.5.0 están sin publicar y `CHANGELOG` tiene "Sin publicar" desde v1.3.0.
- **main:** se integró el 24/11 con permiso de Lisandro (decisión 39). Tenía PRs revertidos por error (#1 del back el 08/11 y #17 del front el 24/11). Por eso se mergeó con contenido igual a develop.

## 2. Métricas

### 2.1 Públicas (cliente y docente)

| Métrica | Valor |
| :-- | :-- |
| Avance de la base V1 | 129/129 pts (100 %) [I] |
| Alcance agregado | +46 pts (+35,7 %) [I] |
| Velocity | S1 26 · S2 39 (26 sin US06) · S3 25 · S4 77 parcial [F/I] |
| Burndown de la base (pts restantes) | 129 → 103 (08/11) → ~90 (14/11) → ~39 (22/11) → 26 (23/11) → 0 (24/11). Los puntos intermedios son aproximados [I]. |
| Historias | 22 historias y 9 tareas técnicas hechas. US01 descartada [F Jira]. |
| Tests | Última corrida completa (24/11, después de US16): back 463/463 unitarios con e2e, más 12 de integración; front 203/203 [F]. Después de US22, US23 y T16 (solo los relacionados): back 253 unitarios y 12 e2e; front 165 [F]. e2e de navegador: 14/14 (T15) [F]. |
| Cobertura de código | Último reporte lcov del 11/11: back 97,4 % líneas y 91,5 % ramas; front 94,7 % líneas y 80,3 % ramas [F]. Ramas del front el 24/11: 81,28 % [F, DECISIONES-IA]. Umbral: dominio ≥ 80 %, resto ≥ 70 %. |
| Cobertura de reglas | Todas las RN vigentes tienen test según TRAZABILIDAD (RN-ENT-10 a 13 desde US16, RN-PLAN-23, RN-NOT-08) [F]. El último conteo formal fue 40/64 al 14/11. |
| Defectos | Demo con cliente: [ND], no se hizo. Detectados en desarrollo y corregidos: filas huérfanas al editar rutinas (US06), contador de notificaciones que tardaba 60 s (US21, lo encontró Playwright), test de récords desactualizado frente a US15 [F]. |
| Lead time por historia | 1 a 2 días en general. US11: 5 días. US06 edición: 14 días [I, git]. |

### 2.2 Privadas (equipo)

| Métrica | Valor |
| :-- | :-- |
| Commits (develop) | Back 228, front 191 [F] |
| Por autor, back | PIPICBA 137 · Ulises 30 · Martina 26 · Ignacio 12 · Julian 6 · RamaDoglio 4 · alex 4 · Ramiro Doglio 3 · otros [F] |
| Por autor, front | PIPICBA 104 · Ulises 44 · Martina 18 · Ignacio 9 · Julian 5 · Marti 3 · Ramiro Doglio 3 · Julian Fermani 2 [F] |
| Identidades | **PIPICBA es el `git user.name` de Lisandro** (orquesta las sesiones con IA), no una cuenta compartida [F]. Hay personas con más de una identidad: Martina y Marti, Julian y Julian Fermani, Ramiro Doglio y RamaDoglio. Los conteos no sirven como esfuerzo individual. |
| Concentración | Lisandro 60 % del back y 54 % del front [I] |
| Commits por día (back) | Picos el 08/11 (~84), 21–22/11 (14 y 17) y 24/11 (45). Del 03 al 07/11 no hubo commits [F]. |
| Uso de IA | Opus 5.5 orquesta. Haiku 5.5 low hace los tests en rojo y las tareas chicas. Sonnet 5.5 (low o medium) implementa. El 24/11 se trabajó con hasta 4 subagentes en paralelo usando worktrees [F, DECISIONES-IA]. |
| Tokens y costos de IA | [ND]: no se registran |
| Retrabajo | Reorganización de carpetas del 08/11 (49 archivos). Contrato de US10 rehecho. Tests reemplazados en US06 con aprobación. Reglas de US17 y US21 que cambiaron el mismo día. Rama de US18 de alex descartada por obsoleta [F]. |
| Huecos de test anotados | Carga simultánea de percepción (`AND percepcion IS NULL`), `ON CONFLICT DO NOTHING` de notificaciones, dos mutaciones del evento en E7, sensación de fuerza 6, mutaciones del back de US22 no hechas [F]. |
| Proceso de tests | TDD con rojo verificado. Fichas confirmadas por el desarrollador. Hook que exige `Tests-aprobados-por` para tocar tests o fichas [F]. Desde el 24/11, durante el desarrollo se corren solo los tests relacionados y la suite completa queda para el cierre. |
| Horas efectivas | [ND] |

## 3. Value Objects (back, `src/modulos/<módulo>/dominio`)

| VO | Módulo | Invariante |
| :-- | :-- | :-- |
| FactorPesoCorporal | catálogo | RN-CAT-04: mayor que 0 y hasta 100 |
| Musculo (y GrupoMuscular) | catálogo | RN-CAT-05: lista cerrada; el grupo se deriva |
| TipoCarga | catálogo | RN-CAT-03 y 06: cuatro valores; indica si usa factor corporal |
| TipoEjercicio | catálogo | RN-CAT-02: por tiempo o por repeticiones |
| Documento | identidad | RN-IDE-06: DNI, LC, LE o Pasaporte, con número |
| Rol | identidad | RN-IDE-02: Admin, Profesor o Alumno |
| ObjetivoPrescripto | planificación | RN-PLAN-04 y 05: tiempo o repeticiones; peso solo con Peso Extra |
| Pausa | planificación | Segundos. VO débil: el DTO valida el formato |
| ValidezPlan | planificación | RN-PLAN-09, 11 y 15: 28 días, fin = inicio + 27, vigencia con los dos extremos incluidos |
| NombreRutina | planificación | RN-PLAN-21: 1 a 60 caracteres, sin distinguir mayúsculas |
| TipoRutina | planificación | RN-PLAN-01: Bloques, Circuitos o Mixta (derivado) |
| CopiaRutina | entrenamiento | RN-ENT-02: copia independiente con `urlGif` |
| SerieRealizada | entrenamiento | RN-ENT-03: lo hecho junto a lo prescripto |
| CargaEfectiva | entrenamiento | Peso por repetición según el tipo de carga (patrón Estrategia, US16) |
| VolumenSerie | entrenamiento | Carga efectiva × repeticiones (US16) |
| UnoRmEstimado | entrenamiento | Epley, solo hasta 10 repeticiones (US16) |
| Rpe | entrenamiento | RN-ENT-14: entero de 1 a 10 |
| SensacionFuerza | entrenamiento | RN-ENT-15: entero de 1 a 5 |
| Percepcion | entrenamiento | RN-ENT-16: RPE y sensación juntos |
| Gravedad | notificaciones | RN-NOT-02, 06 y 07: Leve o Grave; la combinada es la mayor |
| Percepcion | notificaciones | RN-NOT-06: es mala si RPE ≥ 9 o sensación ≤ 2 |
| SeriePorDebajo | notificaciones | RN-ENT-21: lo prescripto y lo realizado |

Hay funciones de dominio que no son VO: `calcular-resumen`, `series-por-debajo`, `detectarRachasDeIncumplimiento` (US23) y `DetectorRecords` (US16).

## 4. Aggregate Roots

| Agregado | Módulo | Contiene | Invariantes |
| :-- | :-- | :-- | :-- |
| Ejercicio | catálogo | TipoEjercicio, TipoCarga, FactorPesoCorporal, Musculo | RN-CAT-01, 04, 06 y 09 |
| Rutina | planificación | Bloque, Circuito (entidades), ObjetivoPrescripto, Pausa, NombreRutina, TipoRutina | RN-PLAN-01 a 08, 20 y 21 (`Rutina.editar`, RN-PLAN-07) |
| Plan | planificación | DiaPlan (entidad), ValidezPlan | RN-PLAN-09 a 12, 15 y 17. `Plan.editarDia` (RN-PLAN-23, US22). Las reglas entre agregados (13, 14 y entrenamiento iniciado hoy) las valida el caso de uso. |
| Entrenamiento | entrenamiento | CopiaRutina, SerieRealizada, Percepcion | RN-ENT-01 a 05, 16, 20 y 21. Eventos EntrenamientoIniciado, EntrenamientoFinalizado y PercepcionRegistrada. |
| RecordPersonal | entrenamiento | marca, tipo y valor | RN-ENT-10 a 13: estrictamente mayor; la primera marca no se anuncia; evento RécordBatido (US16) |
| Notificacion | notificaciones | Gravedad, Percepcion, SeriePorDebajo; `tipo` (`entrenamiento` o `alerta-incumplimiento`) | RN-NOT-01 a 08. Única por (entrenamiento, tipo). |
| Usuario, Profesor, Alumno | identidad | Rol, Documento | RN-IDE-01 a 10, 13 y 14. El Admin es un Usuario con rol Admin. |

Los contextos acotados son catálogo, identidad, planificación, entrenamiento y notificaciones (soporte). Notificaciones escucha eventos de Entrenamiento con el patrón Observador y guarda su propio historial (`finalizaciones_alumno`) para no leer otro módulo.

## 5. Lenguaje ubicuo

| Término | Definición |
| :-- | :-- |
| Admin / Profesor / Alumno | Roles. El Admin gestiona el catálogo y da de alta profesores. El Profesor crea rutinas y planes. El Alumno ejecuta su plan y tiene un solo profesor. |
| Código de Profesor | Código vigente, reutilizable y sin vencimiento, con el que el alumno se vincula |
| Vínculo | Relación alumno-profesor (evento AlumnoVinculado) |
| Ejercicio | Ítem del catálogo, con nombre único, tipo y tipo de carga |
| Tipo de carga | Sin Peso, Peso Corporal, Peso Extra, o Peso Corporal + Peso Extra |
| Factor de peso corporal | Porcentaje del peso del alumno que mueve el ejercicio |
| Músculo / Grupo muscular | Lista cerrada; el grupo sale del músculo principal |
| Ejercicio prescripto | Ejercicio dentro de una rutina, con su objetivo (repeticiones o tiempo, y peso si corresponde) |
| Bloque | Un ejercicio repetido N series, con micropausa entre series y macropausa al final |
| Circuito | Dos o más ejercicios seguidos sin descanso. Cada vuelta es una serie. |
| Serie / Repetición / Vuelta | Una pasada de un bloque / un movimiento / una pasada de un circuito |
| Micropausa / Macropausa | Descanso entre series / al final de un bloque o vuelta |
| Rutina | Secuencia ordenada de bloques y circuitos. Su tipo (Bloques, Circuitos o Mixta) se deriva. Se edita siempre. |
| Importar rutina | Hacer una copia independiente de una rutina propia |
| Plan de entrenamiento | 28 días con un profesor y sus alumnos; cada día tiene una rutina o es de descanso. No se finaliza antes de tiempo. |
| Día del plan / Descanso | Día 1 a 28 con fecha concreta. Descanso es un día sin rutina. |
| Plan Próximo / Vigente / Finalizado | Estado del plan según la fecha de hoy. Un alumno tiene como máximo un plan vigente. |
| Editar días del plan | Cambiar la rutina de un día de hoy en adelante, o pasarlo a descanso (US22) |
| Entrenamiento | Ejecución de la rutina del día. Es una copia independiente, con inicio, fin y peso del día. |
| Entrenamiento abandonado | Iniciado y no finalizado antes de las 00:00 UTC |
| Serie realizada | Lo que hizo el alumno, al lado de lo prescripto |
| Serie por debajo de lo prescripto | Menos repeticiones, tiempo o peso de lo indicado. Una serie no registrada cuenta como no hecha. |
| Carga efectiva | Peso que cuenta por repetición según el tipo de carga |
| Volumen | Carga efectiva × repeticiones; el del entrenamiento es la suma |
| 1RM estimado | Fórmula de Epley, hasta 10 repeticiones |
| Récord personal / Récord batido | Mejor marca por alumno, ejercicio y tipo. Solo cuenta si es estrictamente mayor; la primera marca no se anuncia. |
| RPE / Sensación de fuerza / Percepción | Esfuerzo percibido de 1 a 10 / fuerza de 1 a 5 / los dos juntos, cargados una sola vez |
| Percepción mala | RPE ≥ 9 o sensación ≤ 2 |
| Resumen | Volumen, grupos musculares trabajados, duración y récords batidos |
| Notificación | Aviso dentro de la app al profesor. Nace no leída. |
| Gravedad | Leve o Grave (40 % o más de series por debajo, o las dos condiciones de percepción mala) |
| Alerta de incumplimiento | Aviso cuando el alumno finaliza 3 entrenamientos seguidos por debajo de lo prescripto (US23) |
| Racha de incumplimiento | Entrenamientos finalizados seguidos por debajo. Uno que cumple la corta; al alertar vuelve a cero. |
| Bandeja de notificaciones | Pantalla del profesor con el contador de no leídas |
| Fachada / Puerto | API pública de cada módulo / interfaz del dominio que implementa infraestructura |
| Ingresar al sistema | Login |

## 6. Sprint Review (S4, al 24/11)

**Para mostrar** (con API y pantalla):
- Todo lo de S1 a S3: ingreso por rol, alta de profesor, código y vínculo, catálogo de 1.318 ejercicios, rutinas por bloques, circuitos y mixtas, importar, plan de 28 días, mi plan y rutina del día.
- US06 completa: editar rutinas desde el lápiz de la tarjeta.
- US14 y US15: entrenamiento paso a paso con GIF, registro de series, finalizar y resumen.
- US16: récords personales en el resumen.
- US17: percepción en el resumen; el profesor la ve en el seguimiento.
- US18: seguimiento de los entrenamientos de los alumnos.
- US21: bandeja de notificaciones con contador.
- US22: editar los días de un plan vigente.
- US23: alerta por 3 incumplimientos seguidos.
- T16: "Volver al inicio".
- 14 e2e de navegador en verde.

**Pendiente o con salvedades:**
- Publicar v1.4.0 y v1.5.0 con `CHANGELOG`.
- Demo con el cliente registrando defectos.
- e2e de API de flujos completos, revisión final e informe.
- Suite completa y cobertura actualizada después de US22 y US23.
- Iniciar y cerrar el Sprint 4 en Jira.

## 7. Retrospectivas por sprint

### Sprint 1 (02–08/11) — 26 pts

**Lo bueno**
- Se cerró la fase 1 completa (ingreso, alta de profesor, código, vínculo y dataset) con TDD y mutación desde el inicio. La cobertura arrancó en 99 % de líneas en el back.
- La planificación fue sólida: 13 zonas grises cerradas y decisiones de microcommits, versionado y calendario.
- El riesgo de calendario se detectó temprano y se reestimó con datos.

**Lo malo**
- Un solo día de trabajo: el 08/11 se hizo el 79 % de los commits. Se llegó a 26 pts contra una meta de 37 a 45.
- No se registraron horas, y las "17 pts/h" resultaron engañosas.
- Hubo retrabajo el mismo día: 49 archivos movidos a carpetas por concepto.
- No hubo demo.

**Qué podemos mejorar**
- Repartir el trabajo a lo largo de la semana.
- Registrar los minutos de cada sesión desde el primer día.
- Definir la estructura antes de escribir código.
- Hacer la demo del hito.

### Sprint 2 (09–15/11) — 26 pts reales (39 según Jira)

**Lo bueno**
- Entraron el plan de 28 días, la rutina del día y los circuitos.
- Se sumaron la paginación, los filtros y el nombre de las rutinas.
- El hook protege los tests y exige aprobación para tocarlos.
- El trabajo se repartió entre Haiku (tests en rojo) y Sonnet (implementación).
- El corte de métricas fue honesto: se marcó [ND] donde no había datos.

**Lo malo**
- US06 se marcó Listo sin la edición, con 13 pts que todavía no correspondían.
- Hubo cinco tarjetas técnicas sin estimar.
- El 57,7 % de los puntos estaba listo pero sin integrar en develop.
- El sprint de Jira nunca se inició.

**Qué podemos mejorar**
- Abrir y cerrar los sprints de Jira en fecha.
- Estimar cada tarjeta antes de que entre a READY.
- Integrar apenas esté en verde.
- No dar una historia por lista si tiene una regla sin código: verificarlo con TRAZABILIDAD.

### Sprint 3 (16–22/11) — 25 pts

**Lo bueno**
- La fase 3 cerró el 20/11, cinco días antes del pronóstico.
- Hubo PRs propios de varias personas: Ignacio, Julián y Martina.
- Se publicaron v1.2.0 y v1.3.0 con su `CHANGELOG`.
- Se relevaron los patrones de diseño aplicados.

**Lo malo**
- Casi no hubo actividad del 16 al 20; el trabajo se concentró el 21 y el 22.
- La v1.2.0 salió con deuda conocida (US06 sin edición).
- No hubo un compromiso de sprint congelado, así que la predictibilidad no se puede medir.

**Qué podemos mejorar**
- Congelar la lista de tarjetas comprometidas en cada sprint.
- Repartir la carga a lo largo de la semana.
- No publicar con deuda sin una decisión registrada.
- Mantener los PRs chicos por historia.

### Sprint 4 (23/11–01/12, abierto) — 77 pts al 24/11

**Lo bueno**
- En dos días se completó toda la base V1 y entraron cuatro ítems nuevos (US21, US22, US23 y T16).
- Se trabajó con hasta cuatro subagentes en paralelo, en worktrees separados.
- El e2e de navegador encontró un bug real antes de entregar.
- Primer módulo de soporte (notificaciones) con el patrón Observador.
- main quedó integrada e igual a develop.

**Lo malo**
- El alcance creció un 35,7 % sobre la base, y US21 entró sin tarjeta previa.
- Reglas que cambiaron el mismo día en que se escribieron.
- Jira mostró US16 en Listo sin estar integrada, y el sprint nunca se inició.
- Hubo PRs mergeados a main por error y después revertidos.
- Quedaron huecos de test anotados.
- Los agentes en paralelo compartieron la base de test, lo que dio un falso rojo.

**Qué podemos mejorar**
- Que toda historia nueva tenga tarjeta y puntos antes de empezar.
- Proteger `main` en GitHub para que no entren PRs por error.
- Correr solo los tests relacionados durante el desarrollo y la suite completa al cierre.
- Usar una base de test por agente cuando se trabaje en paralelo.
- Publicar v1.4.0 y v1.5.0 y hacer la demo con registro de defectos.
- Registrar tokens y costos de IA.
