# Módulo Identidad y Vínculos (`identidad`)

Contexto de soporte. Maneja los usuarios (Admin, Profesor, Alumno), el ingreso al sistema con JWT y el vínculo alumno-profesor mediante el Código de Profesor. Los alumnos (y profesores de prueba) llegan por una semilla de usuarios de `yarn seed` (decisión 41; T01 pasó a ser el dataset de ejercicios). El modelo de Alumno no depende de quién lo creó (DT-01, DT-02).

* **Agregados:** Profesor, Alumno, Admin.
* **Objetos de valor:** Documento (tipo y número), DatosSalud (altura, peso, edad), CodigoProfesor, Rol.
* **Eventos que emite:** AlumnoVinculado.
* **Fachada que expone a otros módulos:** consultar el profesor de un alumno, consultar si un alumno está vinculado a un profesor y obtener el peso actual del alumno.
* **Puertos (repositorios):** RepositorioProfesores, RepositorioAlumnos, RepositorioUsuarios. Puerto técnico: HasheadorContrasenias.

## Reglas de negocio

Estado: **vigente** se puede testear e implementar. **A confirmar** no se toca hasta que el desarrollador decida (ver ZG en `docs/PLANIFICACION.md`).

| ID | Regla | Origen | Estado |
| :-- | :-- | :-- | :-- |
| RN-IDE-01 | Un usuario ingresa al sistema con email y contraseña y recibe un JWT que incluye su rol. Si las credenciales son inválidas, se rechaza sin indicar qué dato falló | US00, ZG-13 | Vigente |
| RN-IDE-02 | Cada usuario tiene exactamente un rol: Admin, Profesor o Alumno | US00 | Vigente |
| RN-IDE-03 | Un usuario solo accede a las funciones de su rol. Sin token: 401. Con un rol que no corresponde: 403 | US00 | Vigente |
| RN-IDE-04 | Solo el Admin da de alta profesores. El profesor tiene datos personales y legajo. El legajo es único: no hay dos profesores con el mismo legajo | US02, ZG-01 | Vigente |
| RN-IDE-05 | El alumno tiene datos personales (nombre, apellido, domicilio, tipo y número de documento) y de salud (altura, peso, edad) | Glosario, decisión 41 | Vigente |
| RN-IDE-06 | El Documento es un objeto de valor de tipo y número. Es único: no hay dos personas con el mismo tipo y número | Modelo, ZG-01 | Vigente |
| RN-IDE-07 | El peso del alumno no tiene historial: un cambio sobrescribe el valor anterior | Decisión 13 | Vigente |
| RN-IDE-08 | Un profesor tiene como máximo un Código de Profesor vigente. El código no vence y lo pueden usar todos sus alumnos. Generar uno nuevo invalida el anterior | US04, ZG-02 | Vigente |
| RN-IDE-09 | Un alumno que ingresa un código válido queda vinculado al profesor que lo generó y se emite AlumnoVinculado | US05 | Vigente |
| RN-IDE-10 | Un alumno que ya tiene profesor no se puede vincular a otro | US05, invariante 2, decisión 7 | Vigente |
| RN-IDE-11 | Un código inexistente o invalidado por regeneración no vincula y devuelve un error | US05, ZG-02 | Vigente |
| RN-IDE-12 | Los alumnos y profesores de prueba se crean con la semilla de usuarios (3 profesores, legajos P-001 a P-003, y 20 alumnos sin vincular). La contraseña inicial es común y sale de la variable `SEMILLA_CONTRASENIA`; se guarda hasheada. La semilla es idempotente: no duplica a nadie cuyo documento o email ya existe | ZG-01, ZG-13, decisión 41 | Vigente |
| RN-IDE-13 | El email es único entre todos los usuarios, porque es el identificador de ingreso | Derivada de ZG-13 | Vigente |
| RN-IDE-14 | El Admin inicial se crea con un seed que toma el email y la contraseña de las variables de entorno `ADMIN_EMAIL` y `ADMIN_PASSWORD`. La contraseña se guarda hasheada. El seed es idempotente: si ya existe un usuario con ese email, no lo duplica ni lo modifica. Si faltan las variables, falla con un mensaje claro | ZG-14, decisión 40 | Vigente |

## Casos de uso planificados

| Archivo (`aplicacion/`) | US | RN |
| :-- | :-- | :-- |
| `ingresar-al-sistema.caso-uso.ts` | US00 | 01, 02 |
| `sembrar-admin.caso-uso.ts` | US00 | 02, 13, 14 |
| `dar-alta-profesor.caso-uso.ts` | US02 | 04, 06, 13 |
| `generar-codigo-profesor.caso-uso.ts` | US04 | 08 |
| `vincular-alumno.caso-uso.ts` | US05 | 09, 10, 11 |
| `sembrar-usuarios.caso-uso.ts` | US00 (semilla) | 05, 06, 07, 12, 13 |

RN-IDE-03 se implementa en `src/compartido` (guard de roles) y se prueba con e2e de cada módulo.

## Endpoints tentativos

| Método y ruta | Rol | Caso de uso |
| :-- | :-- | :-- |
| `POST /identidad/ingreso` | Público | ingresar-al-sistema |
| `POST /identidad/profesores` | Admin | dar-alta-profesor |
| `POST /identidad/profesores/codigo` | Profesor | generar-codigo-profesor |
| `POST /identidad/alumnos/vinculo` | Alumno | vincular-alumno |

## Historial de cambios de reglas

| Fecha | RN | Cambio | Quién lo decidió |
| :-- | :-- | :-- | :-- |
| 01/11/2026 | Todas | Versión inicial | Lisandro |
| 01/11/2026 | RN-IDE-01, 04, 06, 08, 11, 12; nueva RN-IDE-13 | Se cierran ZG-01, ZG-02 y ZG-13: ingreso con email, legajo y documento únicos, código reutilizable sin vencimiento que se invalida al regenerarlo, dataset con contraseña inicial | Lisandro |
| 02/11/2026 | Nueva RN-IDE-14 | Se cierra ZG-14: el Admin inicial se crea con un seed tomado de variables de entorno | Lisandro |
| 08/11/2026 | RN-IDE-05, 12 | El dataset es de ejercicios, no de alumnos: los alumnos y profesores de prueba se crean con una semilla de usuarios (decisión 41) | Lisandro |
