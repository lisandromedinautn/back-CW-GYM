/** T07 (RN-UI-LIS-01 y 02): filtros opcionales de la consulta de ejercicios; los presentes se combinan con Y. */
export interface FiltrosEjercicios {
  /** Contiene, sin distinguir mayúsculas, sobre el nombre. */
  busqueda?: string;
  /** Grupo muscular: los músculos de ese grupo según RN-CAT-05. */
  grupoMuscular?: string;
  /** Músculo principal exacto. */
  musculo?: string;
  /** RN-CAT-02. */
  tipo?: string;
  /** RN-CAT-03. */
  tipoCarga?: string;
}
