import { Bloque } from '../dominio/bloque.entidad.js';
import { Rutina } from '../dominio/rutina.entidad.js';
import { BloqueRutinaEsquema, RutinaEsquema } from './rutina.esquema.js';

export const RutinaMapper = {
  aEsquema(rutina: Rutina): RutinaEsquema {
    const esquema = new RutinaEsquema();
    esquema.id = rutina.id;
    esquema.profesorUsuarioId = rutina.profesorUsuarioId;
    esquema.bloques = rutina.bloques.map((bloque, indice) => {
      const fila = new BloqueRutinaEsquema();
      fila.id = bloque.id;
      fila.orden = indice + 1;
      fila.ejercicioId = bloque.ejercicio.ejercicioId;
      fila.series = bloque.series;
      fila.micropausaSegundos = bloque.micropausa.segundos;
      fila.macropausaSegundos = bloque.macropausa.segundos;
      fila.repeticiones = bloque.ejercicio.objetivo.repeticiones;
      fila.segundos = bloque.ejercicio.objetivo.segundos;
      fila.pesoKg = bloque.ejercicio.objetivo.pesoKg;
      return fila;
    });
    return esquema;
  },

  aDominio(esquema: RutinaEsquema): Rutina {
    const bloques = [...esquema.bloques]
      .sort((a, b) => a.orden - b.orden)
      .map((fila) =>
        Bloque.reconstruir(fila.id, {
          ejercicioId: fila.ejercicioId,
          series: fila.series,
          micropausaSegundos: fila.micropausaSegundos,
          macropausaSegundos: fila.macropausaSegundos,
          repeticiones: fila.repeticiones,
          segundos: fila.segundos,
          pesoKg: fila.pesoKg,
        }),
      );
    return Rutina.reconstruir(esquema.id, esquema.profesorUsuarioId, bloques);
  },
};
