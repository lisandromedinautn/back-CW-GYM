import type { Alumno } from '../dominio/alumno.entidad.js';
import { AlumnoEsquema } from './alumno.esquema.js';

export const AlumnoMapper = {
  aEsquema(alumno: Alumno): AlumnoEsquema {
    return Object.assign(new AlumnoEsquema(), {
      id: alumno.id,
      usuarioId: alumno.usuarioId,
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      domicilio: alumno.domicilio,
      tipoDocumento: alumno.documento.tipo,
      numeroDocumento: alumno.documento.numero,
      alturaCm: alumno.salud.alturaCm,
      pesoKg: alumno.salud.pesoKg,
      edad: alumno.salud.edad,
      profesorId: alumno.profesorId,
    });
  },
};
