import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

export const TIPOS_DOCUMENTO = ['DNI', 'LC', 'LE', 'Pasaporte'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

/** Documento de una persona (RN-IDE-06). Único por tipo y número. */
export class Documento {
  private constructor(
    readonly tipo: TipoDocumento,
    readonly numero: string,
  ) {}

  static crear(tipo: string, numero: string): Documento {
    if (!TIPOS_DOCUMENTO.includes(tipo as TipoDocumento)) {
      throw new ErrorDominio(
        'RN-IDE-06',
        `El tipo de documento "${tipo}" no existe: los tipos son DNI, LC, LE y Pasaporte`,
      );
    }
    if (!numero.trim()) {
      throw new ErrorDominio('RN-IDE-06', 'El número de documento es obligatorio');
    }
    return new Documento(tipo as TipoDocumento, numero.trim());
  }

  igualA(otro: Documento): boolean {
    return this.tipo === otro.tipo && this.numero === otro.numero;
  }
}
