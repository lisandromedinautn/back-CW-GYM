import { createHash } from 'node:crypto';
import { Bloque } from '../../dominio/rutina/bloque.entidad.js';
import { Circuito } from '../../dominio/rutina/circuito.entidad.js';
import { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import {
  BloqueRutinaEsquema,
  CircuitoRutinaEsquema,
  EjercicioCircuitoEsquema,
  RutinaEsquema,
} from './rutina.esquema.js';

/**
 * El ejercicio prescripto de un circuito no tiene identidad en el dominio, pero la fila sí la necesita.
 * Se deriva del circuito y la posición para que guardar de nuevo la misma rutina (por ejemplo al
 * renombrarla) actualice las filas en vez de duplicarlas.
 */
const idDeEjercicioDeCircuito = (circuitoId: string, posicion: number): string => {
  const hex = createHash('sha256').update(`${circuitoId}:${posicion}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

const porOrden = <T extends { orden: number }>(filas: T[] | undefined): T[] =>
  [...(filas ?? [])].sort((a, b) => a.orden - b.orden);

export const RutinaMapper = {
  aEsquema(rutina: Rutina): RutinaEsquema {
    const esquema = new RutinaEsquema();
    esquema.id = rutina.id;
    esquema.profesorUsuarioId = rutina.profesorUsuarioId;
    esquema.nombre = rutina.nombre;
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
    esquema.circuitos = rutina.circuitos.map((circuito, indice) => {
      const fila = new CircuitoRutinaEsquema();
      fila.id = circuito.id;
      fila.orden = indice + 1;
      fila.vueltas = circuito.vueltas;
      fila.macropausaSegundos = circuito.macropausa.segundos;
      fila.ejercicios = circuito.ejercicios.map((ejercicio, posicion) => {
        const hija = new EjercicioCircuitoEsquema();
        hija.id = idDeEjercicioDeCircuito(circuito.id, posicion);
        hija.orden = posicion + 1;
        hija.ejercicioId = ejercicio.ejercicioId;
        hija.repeticiones = ejercicio.objetivo.repeticiones;
        hija.segundos = ejercicio.objetivo.segundos;
        hija.pesoKg = ejercicio.objetivo.pesoKg;
        return hija;
      });
      return fila;
    });
    return esquema;
  },

  aDominio(esquema: RutinaEsquema): Rutina {
    const bloques = porOrden(esquema.bloques).map((fila) =>
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
    const circuitos = porOrden(esquema.circuitos).map((fila) =>
      Circuito.reconstruir(fila.id, {
        vueltas: fila.vueltas,
        macropausaSegundos: fila.macropausaSegundos,
        ejercicios: porOrden(fila.ejercicios).map((hija) => ({
          ejercicioId: hija.ejercicioId,
          repeticiones: hija.repeticiones,
          segundos: hija.segundos,
          pesoKg: hija.pesoKg,
        })),
      }),
    );
    return Rutina.reconstruir(
      esquema.id,
      esquema.profesorUsuarioId,
      bloques,
      circuitos,
      esquema.nombre,
    );
  },
};
