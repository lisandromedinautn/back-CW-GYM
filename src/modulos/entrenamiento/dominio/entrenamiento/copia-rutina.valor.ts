export interface EjercicioPrescriptoCopiado {
  ejercicioId: string;
  nombre: string;
  repeticiones: number | null;
  segundos: number | null;
  pesoKg: number | null;
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
