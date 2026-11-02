# Kernel compartido (`compartido`)

Lo mínimo que comparten todos los módulos. **Acá no va lógica de negocio de ningún contexto.** Si algo solo lo usa un módulo, va en ese módulo.

| Capa | Contenido planificado |
| :-- | :-- |
| `dominio/` | Clase base de entidad (identidad e igualdad), clase base de evento de dominio, `ErrorDominio` (lo lanzan las entidades cuando se viola una invariante), puerto `Reloj`, puerto `PublicadorEventos` |
| `infraestructura/` | Configuración de TypeORM y de la base de datos (desarrollo / test), `RelojSistema`, publicador de eventos sobre el EventEmitter de Nest, emisión y validación de JWT |
| `presentacion/` | `GuardJwt`, `GuardRoles` y el decorador `@Roles(...)` (RN-IDE-03), filtro que traduce `ErrorDominio` a una respuesta HTTP 4xx con mensaje en español |

Contrato de errores (tentativo, se fija en T02): `{ "codigo": "RN-PLAN-14", "mensaje": "El alumno ya tiene un plan vigente" }`. El `codigo` es el ID de la regla violada, para que el front y los tests e2e puedan verificarlo sin depender del texto.
