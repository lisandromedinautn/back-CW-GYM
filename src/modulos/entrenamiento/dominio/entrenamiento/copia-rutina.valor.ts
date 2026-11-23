export interface EjercicioPrescriptoCopiado {
  ejercicioId: string;
  nombre: string;
  repeticiones: number | null;
  segundos: number | null;
  pesoKg: number | null;
  /** RN-ENT-02 (T14). Los entrenamientos iniciados antes de T14 no lo tienen. */
  urlGif?: string | null;
}

/** Datos propios del entrenamiento: no dependen de entidades de Planificación. */
export interface CopiaRutina {
  id: string;
  nombre: string;
  tipo: string;
  bloques: (EjercicioPrescriptoCopiado & {
    orden: number;
    series: number;
    micropausaSegundos: number;
    macropausaSegundos: number;
  })[];
  circuitos: {
    orden: number;
    vueltas: number;
    macropausaSegundos: number;
    ejercicios: EjercicioPrescriptoCopiado[];
  }[];
}

/** RN-ENT-02 (T14): suma a la copia el GIF del catálogo de cada ejercicio, o `null` si no tiene. */
export function conGifs(copia: CopiaRutina, gifs: ReadonlyMap<string, string>): CopiaRutina {
  const conGif = <T extends EjercicioPrescriptoCopiado>(ejercicio: T): T => ({
    ...ejercicio,
    urlGif: gifs.get(ejercicio.ejercicioId) ?? null,
  });
  return {
    ...copia,
    bloques: copia.bloques.map(conGif),
    circuitos: copia.circuitos.map((circuito) => ({
      ...circuito,
      ejercicios: circuito.ejercicios.map(conGif),
    })),
  };
}
