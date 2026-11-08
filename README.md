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

## Comandos

| Comando | Qué hace |
| :-- | :-- |
| `yarn test` / `yarn test:cov` | Tests unitarios / con umbrales de cobertura (dominio 80%, resto 70%) |
| `yarn test:int` / `yarn test:e2e` | Integración / e2e de la API contra la base de test |
| `yarn lint` / `yarn formatear` | ESLint con las reglas de capas / Prettier |
| `yarn verificar:paquetes` | Regla de las 24 h sobre las dependencias |
| `yarn bd:levantar` / `yarn bd:bajar` | Bases dockerizadas |

Los commits pasan por dos hooks: el pre-commit (lint, formato, tests relacionados y paquetes) y el commit-msg (formato de la decisión 37). Ver [CLAUDE.md](CLAUDE.md).
