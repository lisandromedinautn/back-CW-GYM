# back-CW-GYM

API del Sistema de Entrenamiento de Gimnasio (Proyecto 3 IyCS): NestJS + TypeORM + PostgreSQL con enfoque DDD.

* Planificación, glosario y modelo de dominio: [docs/PLANIFICACION.md](docs/PLANIFICACION.md)
* Mapa del repo: [ATLAS.md](ATLAS.md)
* Convenciones: [CLAUDE.md](CLAUDE.md)
* Testing: [docs/TESTING.md](docs/TESTING.md)
* Trazabilidad: [docs/TRAZABILIDAD.md](docs/TRAZABILIDAD.md)
* Auditoría de IA: [DECISIONES-IA.md](DECISIONES-IA.md)

Front: [front-CW-GYM](https://github.com/lisandromedinautn/front-CW-GYM).

## Puesta en marcha

Requisitos: Node 24 (`.nvmrc`), Yarn 1 y Docker.

```bash
yarn install --frozen-lockfile   # instala y activa los hooks de git (husky)
cp .env.example .env             # completá ADMIN_EMAIL y ADMIN_PASSWORD
yarn bd:levantar                 # Postgres de desarrollo (5442) y de test (5443)
yarn seed                        # datos iniciales (el Admin llega con US00)
yarn start:dev                   # API en http://localhost:3000
```

## Datos para probar US12

Después de `yarn seed`, ingresá como `us12-profesor01@cwgym.test` o `us12-profesor02@cwgym.test` con la contraseña indicada en `SEMILLA_CONTRASENIA` del `.env`. Cada profesor tiene dos alumnos vinculados y un plan vigente de 28 días de descanso. El primer alumno está asignado y el segundo está disponible para agregar. Los alumnos usan `us12-alumno01@cwgym.test` a `us12-alumno04@cwgym.test` con la misma contraseña.

Para completar el plan de `us12-alumno01@cwgym.test` con ejercicios en sus 28 días, ejecutá `yarn seed:plan-us12`. La operación conserva fechas y alumnos y rechaza planes que ya tengan otras rutinas.

La semilla conserva cambios en asignaciones al repetirse. Si las cuentas reservadas entran en conflicto o el plan de prueba existente ya no está vigente, informa el problema sin reemplazar esos datos.

## Comandos

| Comando | Qué hace |
| :-- | :-- |
| `yarn test` / `yarn test:cov` | Tests unitarios / con umbrales de cobertura (dominio 80%, resto 70%) |
| `yarn test:int` / `yarn test:e2e` | Integración / e2e de la API contra la base de test |
| `yarn lint` / `yarn formatear` | ESLint con las reglas de capas / Prettier |
| `yarn verificar:paquetes` | Regla de las 24 h sobre las dependencias |
| `yarn bd:levantar` / `yarn bd:bajar` | Bases dockerizadas |

Los commits pasan por dos hooks: el pre-commit (lint, formato, tests relacionados y paquetes) y el commit-msg (formato de la decisión 37). Ver [CLAUDE.md](CLAUDE.md).
