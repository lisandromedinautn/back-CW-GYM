import type { CopiaRutina } from './copia-rutina.valor.js';
import { EntrenamientoIniciado } from './entrenamiento-iniciado.evento.js';

export interface DatosEntrenamiento {
  id: string;
  alumnoId: string;
  inicio: string;
  pesoCorporalKg: number;
  rutina: CopiaRutina;
}

export class Entrenamiento {
  private constructor(private readonly registro: DatosEntrenamiento) {}

  static crear(datos: DatosEntrenamiento): Entrenamiento {
    return new Entrenamiento(structuredClone(datos));
  }

  static reconstruir(datos: DatosEntrenamiento): Entrenamiento {
    return new Entrenamiento(datos);
  }

  get datos(): DatosEntrenamiento {
    return structuredClone(this.registro);
  }

  get fecha(): string {
    return this.registro.inicio.slice(0, 10);
  }

  estadoEn(instante: Date): 'en-curso' | 'abandonado' {
    return instante.toISOString().slice(0, 10) > this.fecha ? 'abandonado' : 'en-curso';
  }

  eventoDeInicio(): EntrenamientoIniciado {
    return new EntrenamientoIniciado(
      this.registro.id,
      this.registro.alumnoId,
      this.registro.inicio,
    );
  }
}
