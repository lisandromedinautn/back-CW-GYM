import type { Profesor } from '../dominio/profesor.entidad.js';
import { ProfesorEsquema } from './profesor.esquema.js';

export const ProfesorMapper = {
  aEsquema(profesor: Profesor): ProfesorEsquema {
    return Object.assign(new ProfesorEsquema(), {
      id: profesor.id,
      usuarioId: profesor.usuarioId,
      nombre: profesor.nombre,
      apellido: profesor.apellido,
      tipoDocumento: profesor.documento.tipo,
      numeroDocumento: profesor.documento.numero,
      legajo: profesor.legajo,
    });
  },
};
