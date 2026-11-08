import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { type CategoriaError, ErrorDominio } from '../../dominio/error-dominio/error-dominio.js';

const ESTADO_POR_CATEGORIA: Record<CategoriaError, HttpStatus> = {
  validacion: HttpStatus.BAD_REQUEST,
  credenciales: HttpStatus.UNAUTHORIZED,
  prohibido: HttpStatus.FORBIDDEN,
  'no-encontrado': HttpStatus.NOT_FOUND,
  conflicto: HttpStatus.CONFLICT,
};

/** Traduce un ErrorDominio al contrato con el front: `{ codigo, mensaje }` (src/compartido/CLAUDE.md). */
@Catch(ErrorDominio)
export class FiltroErrorDominio implements ExceptionFilter {
  catch(error: ErrorDominio, host: ArgumentsHost): void {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(ESTADO_POR_CATEGORIA[error.categoria])
      .json({ codigo: error.codigo, mensaje: error.message });
  }
}
