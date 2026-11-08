import { CODIGO_NO_ENCONTRADO, ErrorDominio } from '../../../compartido/dominio/error-dominio.js';
import type { Profesor } from '../dominio/profesor.entidad.js';
import type { RepositorioProfesores } from '../dominio/repositorio-profesores.puerto.js';

/** El profesor del usuario que hizo el pedido. Si el token no corresponde a un profesor, 404. */
export async function buscarProfesorDelUsuario(
  profesores: RepositorioProfesores,
  usuarioId: string,
): Promise<Profesor> {
  const profesor = await profesores.buscarPorUsuarioId(usuarioId);
  if (!profesor)
    throw new ErrorDominio(CODIGO_NO_ENCONTRADO, 'No se encontró el profesor', 'no-encontrado');
  return profesor;
}
