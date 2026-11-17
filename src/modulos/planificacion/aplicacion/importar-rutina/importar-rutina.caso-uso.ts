import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';
import { NombreRutina } from '../../dominio/rutina/nombre-rutina.valor.js';
import { ErrorDominio } from '../../../../compartido/dominio/error-dominio/error-dominio.js';

export class ImportarRutina {
  constructor(private readonly rutinas: RepositorioRutinas) {}

  async ejecutar(profesorUsuarioId: string, id: string): Promise<Rutina> {
    const original = await this.rutinas.buscarPorId(id);
    if (!original || original.profesorUsuarioId !== profesorUsuarioId) {
      throw new ErrorDominio('RN-PLAN-08', 'La rutina no existe o no es tuya', 'no-encontrado');
    }
    const existentes = await this.rutinas.listarNombresPorProfesor(profesorUsuarioId);
    let numero = 1;
    let nombre: NombreRutina;
    do {
      const sufijo = numero === 1 ? ' - Copia' : ` - Copia ${numero}`;
      nombre = NombreRutina.crear(
        `${original.nombre.slice(0, 60 - sufijo.length).trimEnd()}${sufijo}`,
      );
      numero += 1;
    } while (existentes.some((existente) => nombre.equivale(existente.nombre)));
    const copia = original.copiar(nombre.valor);
    await this.rutinas.guardar(copia);
    return copia;
  }
}
