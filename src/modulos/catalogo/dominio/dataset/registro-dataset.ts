/** Un registro del dataset reducido (`datos/ejercicios-dataset.json`). Los nombres son los del origen. */
export interface RegistroDataset {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  instrucciones: string;
  gif_url: string;
  attribution: string;
}
