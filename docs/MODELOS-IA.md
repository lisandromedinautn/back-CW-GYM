# Uso de modelos de IA y delegación

La última palabra sobre qué modelo usar la tiene el desarrollador. Esta guía es la recomendación por defecto.

## Roles y modelos (Claude)

| Rol | Modelo | Esfuerzo | Para qué |
| :-- | :-- | :-- | :-- |
| Orquestador | Opus 5.5 | medio / low | Planificación, división en subtareas, decisiones de diseño, revisión de reportes de subagentes, redacción de reglas y fichas con el desarrollador |
| Implementación transversal | Sonnet 5.5 | **low** | Features que cruzan módulos o conectan front y back, contratos de API, tests de integración y e2e |
| Tareas simples | Haiku 5.5 | **low** | Escritura de documentación simple, tests unitarios de una RN ya fichada, correcciones acotadas, lint |

## Política de delegación

1. **Se prioriza delegar.** El orquestador divide la tarea en subacciones cuando lo amerita y las reparte.
2. **Se pregunta por consola antes de delegar.** El orquestador presenta el reparto (subtarea → modelo → archivos) y espera la confirmación del desarrollador.
3. **Paralelo si no hay conflicto.** Se pueden lanzar varios subagentes a la vez si sus archivos no se pisan. Si dos subtareas tocan el mismo archivo, van en serie.
4. **Ajustar la tarea al modelo.** No se le da a Haiku un módulo entero con lógica compleja solo para cumplir con la regla de delegar. La lógica de dominio con invariantes cruzadas va a Sonnet, o la hace el orquestador.
5. **Los tests no se delegan sin ficha.** Ningún subagente escribe un test cuya ficha (entrada y esperado) no esté confirmada por el desarrollador.
6. El orquestador revisa cada reporte antes de dar la subtarea por terminada: no confía en el "pasó" del subagente sin ver el número de tests y la tabla camino → test.

## Equivalencias con otras IAs (referencia)

Los nombres de modelos cambian seguido: verificá los vigentes antes de usarlos. Lo que importa es el nivel.

| Nivel | Claude | OpenAI | Google |
| :-- | :-- | :-- | :-- |
| Orquestador (razonamiento alto) | Opus 5.5 | Modelo GPT insignia de la línea actual, razonamiento medio | Gemini Pro de la línea actual |
| Implementación | Sonnet 5.5 low | Variante "mini" de la línea actual, razonamiento bajo | Gemini Flash de la línea actual |
| Tareas simples | Haiku 5.5 low | Variante "nano" de la línea actual | Gemini Flash-Lite de la línea actual |

Cuando se use otra IA, se registra en `DECISIONES-IA.md` qué modelo y qué nivel de esfuerzo se usó.

## Plantilla: orquestador (Opus 5.5)

```
<Objetivo de la sesión en una frase>. Repos: back-CW-GYM / front-CW-GYM. Rama: develop. NO hagas commit.

## Antes de empezar
- Leé ATLAS.md y el CLAUDE.md de los módulos involucrados. No navegues fuera de eso sin motivo.
- Listá las RN involucradas y marcá las "a confirmar": esas no se implementan.

## Qué entregar
1. División en subtareas: subtarea → modelo sugerido → archivos → dependencias.
2. Qué puede ir en paralelo y qué en serie.
3. Preguntas abiertas para el desarrollador (entradas y esperados de cada test, zonas grises).
Esperá la confirmación antes de delegar.

## Al cerrar
- Revisá los reportes: N passed / M failed y tabla camino → test.
- Actualizá TRAZABILIDAD.md, ATLAS.md y fichas.
- Proponé la entrada de DECISIONES-IA.md (qué hizo la IA, qué decidió el desarrollador, qué se descartó).
```

## Plantilla: Haiku 5.5 low (tareas simples, tests, correcciones)

```
<Una frase con la tarea concreta>. Repo: <ruta>. Rama: develop. NO hagas commit.

## Contexto
<2-4 líneas: qué cambió y por qué, qué NO cambió. RN involucradas por ID.>

## Alcance
- Archivos que podés editar: <lista cerrada>.
- Archivos que NO podés tocar: <producción / otros módulos / zonas ajenas>.

## Qué hacer
1. <paso concreto con el criterio ya decidido>
2. <paso concreto>
3. Si un caso no está cubierto por estas reglas, no lo decidas: reportalo como zona gris.

## Reglas
- PROHIBIDO debilitar aserciones: nada de toBeTruthy en lugar de toBe, skip/only/todo,
  aflojar valores ni borrar asserts que sigan valiendo.
- Tests existentes: no se modifican. Si uno falla, reportá entrada / esperado / obtenido.
- Cada test cita su RN en el describe y usa el esperado literal de la ficha.
- Después de 3 intentos fallidos en algo, detenete y reportalo; no lo fuerces.
- Si dudás de si algo pisa una zona ajena, cortá y reportá.
- Si el CLAUDE.md del repo choca con este brief, manda este brief, salvo en las reglas de tests.
- No dejes procesos en segundo plano.

## Cómo verificar
<comando exacto de tests/lint>
Objetivo: <criterio objetivo, p. ej. "módulo X en verde">.
Fallas que no son tuyas: listalas aparte, sin tocarlas.

## Reporte (máximo 300 palabras, sin pegar código)
1. Archivos tocados. 2. Qué agregaste/modificaste/borraste y por qué.
3. Resultado numérico (N passed / M failed). 4. Sospechas de bug con archivo:línea.
5. Decisiones en zonas grises.
```

## Plantilla: Sonnet 5.5 low (features transversales, front + back)

```
<Una frase con la feature> [<ID de tarjeta>]. Repo: <ruta>. Rama: develop. NO hagas commit.

## Prioridad ante choques
1. Zona ajena (<módulos o personas>): ante cualquier duda, cortá y reportá.
2. Este brief manda sobre el CLAUDE.md del repo, salvo en las reglas de tests.
3. El CLAUDE.md manda sobre tu costumbre.

## Contexto y decisiones cerradas
<Reglas de negocio ya decididas, una por línea, con su ID RN. No se discuten.>

## Contrato (back y front se programan contra esto)
- Request: <campos, tipos, obligatorios u opcionales>
- Respuesta: <forma exacta, claves>
- Errores: <código HTTP y { codigo: "RN-...", mensaje }>
- Sin el parámetro nuevo, la respuesta no cambia.

## Archivos
Podés editar: <lista>. No tocar: <lista>. Si necesitás algo fuera, reportalo.

## Tests
Un test por cada camino de cada condición compuesta. Casos mínimos (de las fichas confirmadas):
- <camino 1>
- <camino 2>
- <caso límite / error>
- <rendimiento: cantidad de consultas acotada>
Tests existentes: no se modifican salvo que rompan por una decisión de arriba (decilo).

## Reglas
- PROHIBIDO debilitar aserciones (toBeTruthy en vez de toBe, skip/only/todo, aflojar valores, borrar asserts).
- 3 intentos fallidos → detenete y reportá.
- Caso no cubierto por las decisiones: zona gris, reportalo, no lo decidas.
- Antes de terminar, listá los caminos de la sección Tests y el test que cubre cada uno.
- Si un test de concurrencia o de regla nueva pasa, verificá que falla sin el cambio de producción.
- No dejes procesos en segundo plano.

## Cómo verificar
<comando exacto, una base de datos o entorno propio por proceso>
Fallas ajenas: en lista aparte.

## Reporte (máximo 300 palabras, sin pegar código)
1. Archivos tocados. 2. Tabla camino → test, y tests agregados/modificados.
3. N passed / M failed por módulo. 4. Sospechas de bug con archivo:línea. 5. Zonas grises.
```
