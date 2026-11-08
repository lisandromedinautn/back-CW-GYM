import { Alumno } from '../dominio/alumno.entidad.js';
import { Documento } from '../dominio/documento.valor.js';
import { AlumnoEsquema } from './alumno.esquema.js';

export const AlumnoMapper = {
  aDominio(fila: AlumnoEsquema): Alumno {
    return Alumno.reconstruir({
      id: fila.id,
      usuarioId: fila.usuarioId,
      nombre: fila.nombre,
      apellido: fila.apellido,
      domicilio: fila.domicilio,
      documento: Documento.crear(fila.tipoDocumento, fila.numeroDocumento),
      salud: { alturaCm: fila.alturaCm, pesoKg: fila.pesoKg, edad: fila.edad },
      profesorId: fila.profesorId,
    });
  },

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
