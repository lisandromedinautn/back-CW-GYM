import { randomInt } from 'node:crypto';
import type { GeneradorCodigos } from '../dominio/generador-codigos.puerto.js';

/** Sin 0, O, 1 ni I para que el alumno no los confunda al tipear (RN-IDE-08). */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LARGO = 6;

export class GeneradorCodigosAleatorio implements GeneradorCodigos {
  generar(): string {
    return Array.from({ length: LARGO }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
  }
}
