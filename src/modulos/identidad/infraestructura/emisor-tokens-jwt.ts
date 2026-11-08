import type { JwtService } from '@nestjs/jwt';
import type { DatosToken, EmisorTokens } from '../dominio/usuario/emisor-tokens.puerto.js';

export class EmisorTokensJwt implements EmisorTokens {
  constructor(private readonly jwt: JwtService) {}

  emitir(datos: DatosToken): Promise<string> {
    return this.jwt.signAsync({ sub: datos.sub, rol: datos.rol });
  }
}
