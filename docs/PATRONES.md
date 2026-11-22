# Patrones de diseño aplicados

Relevamiento del 21/11/2026 sobre `develop` (back `9c23451`, front `82bb99a`), hasta US13. Existe igual en `back-CW-GYM` y `front-CW-GYM`. Los patrones previstos están en [`PLANIFICACION.md`](PLANIFICACION.md) y en la tabla "SOLID y patrones" del `CLAUDE.md` del back (Sommerville, cap. 6 y 7). Este documento registra cuáles están **aplicados en el código**, dónde, y cuáles siguen pendientes.

Estado: ✅ aplicado · 🔶 aplicado en parte · ⬜ previsto, todavía sin código.

## Back (NestJS + TypeORM)

### Arquitectura

| Patrón | Estado | Dónde se aplica |
| :-- | :-- | :-- |
| Arquitectura en capas | ✅ | Los cuatro módulos (`identidad`, `catalogo`, `planificacion`, `entrenamiento`) tienen `dominio`, `aplicacion`, `infraestructura` y `presentacion` |
| Puertos y adaptadores (hexagonal) | ✅ | 17 puertos `*.puerto.ts` en `dominio` (repositorios, `Reloj`, `PublicadorEventos`, `EmisorTokens`, `HasheadorContrasenias`, `GeneradorCodigos`, `FuenteDatasetEjercicios`, consultas a otros módulos); las implementaciones están en `infraestructura` |
| Monolito modular | ✅ | Un módulo Nest por contexto acotado; un módulo no importa el interior de otro |
| Kernel compartido | ✅ | `src/compartido/`: `ErrorDominio`, paginación, `Reloj`, `PublicadorEventos`, guard de roles y filtro de errores |

### DDD táctico

| Patrón | Estado | Dónde se aplica |
| :-- | :-- | :-- |
| Agregado / entidad rica | ✅ | `Rutina` (con `Bloque` y `Circuito`), `Plan` (con `DiaPlan`), `Entrenamiento`, `Alumno`, `Profesor`, `Usuario`, `Ejercicio`. Sin setters: métodos con nombre de dominio |
| Objeto valor | ✅ | 12 `*.valor.ts`: `ValidezPlan`, `NombreRutina`, `Pausa`, `ObjetivoPrescripto`, `TipoRutina`, `Documento`, `Rol`, `TipoCarga`, `TipoEjercicio`, `Musculo`, `FactorPesoCorporal`, `CopiaRutina` |
| Evento de dominio | ✅ | `AlumnoVinculado`, `PlanCreado`, `EntrenamientoIniciado` (`*.evento.ts`) |
| Caso de uso (application service) | ✅ | Un caso de uso por archivo en `aplicacion/<accion>/` (SRP) |
| Data Mapper | ✅ | `*.mapper.ts` traduce entre la entidad de dominio y el esquema de TypeORM (`plan`, `rutina`, `alumno`, `profesor`, `usuario`, `ejercicio`) |

### Patrones GoF y de framework

| Patrón | Estado | Dónde se aplica |
| :-- | :-- | :-- |
| Repositorio | ✅ | `RepositorioRutinas`, `RepositorioPlanes`, `RepositorioEntrenamientos`, `RepositorioAlumnos`, `RepositorioProfesores`, `RepositorioUsuarios`, `RepositorioEjercicios`; implementaciones `*.repositorio-typeorm.ts` |
| Fábrica (método de fábrica estático) | ✅ | `crear(...)` valida invariantes y `reconstruir(...)` rehidrata sin emitir eventos, en 15 clases de dominio |
| Fábrica (inyección) | ✅ | Los casos de uso se arman con `useFactory` en cada `*.module.ts`, sin decoradores de Nest en `aplicacion` |
| Fachada | ✅ | `fachada-identidad.ts`, `fachada-catalogo.ts`, `fachada-planificacion.ts`: la única API pública de cada módulo hacia los demás |
| Adaptador (anticorrupción) | ✅ | Planificación define su puerto y lo implementa sobre la fachada ajena: `consulta-vinculos.fachada-identidad.ts`, `consulta-ejercicios.fachada-catalogo.ts`, `consulta-nombres-ejercicios.fachada-catalogo.ts`. Entrenamiento hace lo mismo con Planificación |
| Decorador | ✅ | `@Roles(...)` (19 usos) y `@UsuarioActual()` (14 usos) en `compartido/presentacion/guard-roles/guard-roles.ts`; validación de DTO con `class-validator` |
| Cadena de responsabilidad (pipeline de Nest) | ✅ | `GuardRoles` global (`APP_GUARD`) → `ValidationPipe` → controlador → `FiltroErrorDominio` global (`APP_FILTER`), que traduce `ErrorDominio` a `{ codigo: "RN-...", mensaje }` |
| DTO | ✅ | 7 `*.dto.ts` en `presentacion` (entrada validada; la respuesta no expone entidades) |
| Observador | 🔶 | Los casos de uso publican eventos por el puerto `PublicadorEventos`, pero la única implementación (`PublicadorEventosLog`) los registra en el log: **todavía no hay suscriptores**. Se completa cuando un evento dispare otra acción (p. ej. `EntrenamientoFinalizado` → récords, US15/US16) |
| Estrategia | ✅ | `entrenamiento/dominio/carga-efectiva/estrategias/` (Sin Peso, Peso Extra, Peso Corporal, Peso Corporal + Peso Extra) y `marcas-por-tipo-ejercicio/` (por tiempo, por repeticiones sin peso, por repeticiones con carga). La selección vive en `seleccionar-estrategia-*.ts` (US16, modelado) |
| Doble de prueba por puerto (Reloj fijo) | ✅ | `RelojSistema` en producción y `RelojFijo` en los tests; dobles en `test/dobles/` |

### Principios SOLID

| Principio | Estado | Evidencia |
| :-- | :-- | :-- |
| SRP | ✅ | Un caso de uso por archivo; mapper, esquema y repositorio separados |
| OCP | ✅ | Un tipo de carga o de récord nuevo se agrega como estrategia nueva sin editar las existentes (US16); los casos de uso y endpoints también se suman sin tocar los anteriores |
| LSP | ✅ | Las implementaciones de cada puerto (TypeORM, dobles en memoria, `RelojFijo`) son intercambiables en los tests |
| ISP | ✅ | Puertos chicos y específicos (`ConsultaNombresEjercicios` separado de `ConsultaEjercicios`) |
| DIP | ✅ | `dominio` y `aplicacion` dependen de puertos; `infraestructura` los implementa y el módulo los conecta |

## Front (React + Vite)

| Patrón | Estado | Dónde se aplica |
| :-- | :-- | :-- |
| Arquitectura en capas | ✅ | Cada módulo tiene `dominio`, `aplicacion`, `infraestructura` y `presentacion`; ningún componente hace `fetch` directo |
| Custom hook como caso de uso de UI | ✅ | 18 hooks `usar*` en `aplicacion` (`usarIniciarEntrenamiento`, `usarCrearPlan`, `usarMiPlan`, `usarImportarRutina`, etc.): orquestan estado, carga y errores |
| Gateway / cliente de API | ✅ | Un cliente por módulo (`apiPlanificacion.ts`, `apiEntrenamiento.ts`, `apiCatalogo.ts`, `apiIdentidad.ts`) sobre `compartido/infraestructura/cliente-http/clienteHttp.ts` |
| Puertos en `aplicacion` | 🔶 | El `CLAUDE.md` del front dice que `infraestructura` implementa puertos de `aplicacion`. En el código los hooks **importan el cliente de API directamente**: la dirección de la dependencia es correcta, pero no hay una interfaz intermedia. Los tests la reemplazan con MSW |
| Contenedor / presentacional | ✅ | Las páginas (`PaginaMiPlan`, `PaginaCrearPlan`, `PaginaEntrenamientoEnCurso`) usan hooks; componentes como `DetalleRutina`, `BotonesOrden`, `EditorBloque`, `EditorCircuito` y `Paginador` solo reciben props |
| Ruta protegida (guard de rol) | ✅ | `compartido/presentacion/ruta-protegida/RutaProtegida.tsx` (RN-IDE-03) |
| Traductor de errores | ✅ | `clienteHttp` normaliza toda respuesta fallida a `ErrorApi { codigo, mensaje }`; la UI decide por `codigo`, no por el texto. Un 401 con sesión cierra la sesión (RN-UI-IDE-02) |
| Tabla de despacho de rutas | ✅ | `PAGINAS` y `SUBPAGINAS: Record<Rol, ...>` en `Aplicacion.tsx` eligen la página según el rol |
| Componente compartido reutilizable | ✅ | `Paginador` + `usarTamanioPagina` (T06), `DisenioConMenu`, `Proximamente` |

## Pendientes y observaciones

1. **Estrategia** (✅): aplicada en US16 para carga efectiva (4 tipos) y marcas por tipo de ejercicio (3 estrategias). La detección al finalizar, la persistencia de récords y el endpoint siguen pendientes (US15/US16).
2. **Observador** (🔶): los eventos se publican, pero nadie los escucha. Para que cuente como patrón aplicado hace falta un suscriptor real.
3. **Puertos del front** (🔶): o se agrega la interfaz en `aplicacion`, o se ajusta el `CLAUDE.md` del front a lo que el código hace hoy. Es una decisión del equipo; no se cambió código.
4. No se usan Singleton, Builder, Comando ni Plantilla, y el plan no los pide.
