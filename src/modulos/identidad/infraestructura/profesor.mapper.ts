import { Documento } from '../dominio/documento/documento.valor.js';
import { Profesor } from '../dominio/profesor/profesor.entidad.js';
import { ProfesorEsquema } from './profesor.esquema.js';

export const ProfesorMapper = {
  aDominio(fila: ProfesorEsquema): Profesor {
    return Profesor.reconstruir({
      id: fila.id,
      usuarioId: fila.usuarioId,
      nombre: fila.nombre,
      apellido: fila.apellido,
      documento: Documento.crear(fila.tipoDocumento, fila.numeroDocumento),
      legajo: fila.legajo,
      codigo: fila.codigo,
    });
  },

  aEsquema(profesor: Profesor): ProfesorEsquema {
    return Object.assign(new ProfesorEsquema(), {
      id: profesor.id,
      usuarioId: profesor.usuarioId,
      nombre: profesor.nombre,
      apellido: profesor.apellido,
      tipoDocumento: profesor.documento.tipo,
      numeroDocumento: profesor.documento.numero,
      legajo: profesor.legajo,
      codigo: profesor.codigo,
    });
  },
};
