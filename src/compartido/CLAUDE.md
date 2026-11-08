# Kernel compartido (`compartido`)

Lo mínimo que comparten todos los módulos. **Acá no va lógica de negocio de ningún contexto.** Si algo solo lo usa un módulo, va en ese módulo.

| Capa | Contenido planificado |
| :-- | :-- |
| `aplicacion/` | ✅ `semilla.ts`: puerto `Semilla` de las semillas de `yarn seed` (idempotentes). Cada semilla concreta es un caso de uso de su módulo y se registra en `src/semillas.ts` |
| `dominio/` | ✅ `error-dominio.ts`: `ErrorDominio` (código de regla, mensaje y categoría). ✅ `publicador-eventos.puerto.ts`: puerto `PublicadorEventos` y la interfaz `EventoDominio`. Pendiente: clase base de entidad (identidad e igualdad), clase base de evento de dominio, puerto `Reloj` |
| `infraestructura/` | ✅ `publicador-eventos-log.ts`: `PublicadorEventosLog`, que solo registra los eventos en el log hasta que haya un suscriptor. Pendiente: configuración de TypeORM y de la base de datos (desarrollo / test), `RelojSistema`, publicador sobre el EventEmitter de Nest (reemplazará al de log), emisión y validación de JWT. (Hoy la emisión del JWT está en `identidad/infraestructura/emisor-tokens-jwt.ts`) |
| `presentacion/` | ✅ `guard-roles.ts`: `GuardRoles` y el decorador `@Roles(...)` (RN-IDE-03). Verifica el JWT y el rol; no hay un `GuardJwt` separado. ✅ El decorador `@UsuarioActual()` da al controlador el usuario del token (`sub`, `rol`). ✅ `filtro-error-dominio.ts`: `FiltroErrorDominio` traduce `ErrorDominio` a una respuesta HTTP con `{ codigo, mensaje }` |
| Raíz del kernel | ✅ `compartido.module.ts`: JWT global, `GuardRoles` y `FiltroErrorDominio` registrados como `APP_GUARD` y `APP_FILTER` |

## Categoría de error → código HTTP

`ErrorDominio` lleva una categoría. El dominio no conoce HTTP: el filtro es el único que la traduce (`filtro-error-dominio.ts`).

| Categoría | Código HTTP | Cuándo se usa |
| :-- | :-- | :-- |
| `validacion` | 400 Bad Request | Un dato no cumple una regla de formato o una invariante (por ejemplo RN-IDE-02, RN-IDE-06) |
| `credenciales` | 401 Unauthorized | Ingreso con email o contraseña incorrectos (RN-IDE-01), o sin token o con token inválido (RN-IDE-03) |
| `prohibido` | 403 Forbidden | Usuario autenticado con un rol que no corresponde al endpoint (RN-IDE-03) |
| `no-encontrado` | 404 Not Found | El recurso referenciado no existe |
| `conflicto` | 409 Conflict | La operación choca con un estado existente (por ejemplo, un alumno que ya tiene plan vigente, RN-PLAN-14) |

Contrato de errores (fijado en T02, 02/11/2026; `ErrorDominio`, el filtro y la tabla de arriba se implementaron en US00): `{ "codigo": "RN-PLAN-14", "mensaje": "El alumno ya tiene un plan vigente" }`. El `codigo` es el ID de la regla violada, para que el front y los tests e2e puedan verificarlo sin depender del texto. Única excepción (08/11/2026, Lisandro): `NO-ENCONTRADO` (404) para un recurso que no existe y no corresponde a ninguna regla, como un token válido de un usuario sin profesor o alumno asociado (`CODIGO_NO_ENCONTRADO` en `error-dominio.ts`). En el front, `ERROR-RED` es el código que arma el cliente cuando la respuesta no trae `{ codigo, mensaje }`.
