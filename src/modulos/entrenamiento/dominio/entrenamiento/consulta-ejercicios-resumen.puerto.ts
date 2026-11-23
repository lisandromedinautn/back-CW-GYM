export type TipoCargaResumen =
  'Sin Peso' | 'Peso Extra' | 'Peso Corporal' | 'Peso Corporal + Peso Extra';

export interface DatosEjercicioResumen {
  tipoCarga: TipoCargaResumen;
  factorPesoCorporal: number | null;
  grupoPrincipal: string;
  grupoSecundario: string | null;
}

export interface ConsultaEjerciciosResumen {
  obtenerEjercicio(id: string): Promise<DatosEjercicioResumen | null>;
}
