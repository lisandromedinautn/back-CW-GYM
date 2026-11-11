import type { RepositorioRutinas } from '../../dominio/rutina/repositorio-rutinas.puerto.js';
import type { Rutina } from '../../dominio/rutina/rutina.entidad.js';

const clave = (nombre: string): string => nombre.trim().toLowerCase();

/**
 * T09 · RN-PLAN-21: corre al arrancar el back. Las rutinas anteriores a la columna `nombre`
 * quedaron todas como "Rutina 1"; por profesor y de la más vieja a la más nueva, la primera
 * con un nombre lo conserva y cada repetida pasa al siguiente "Rutina N" libre.
 * Devuelve cuántas rutinas renombró.
 */
export class NormalizarNombresRutinas {
  constructor(private readonly rutinas: RepositorioRutinas) {}

  async ejecutar(): Promise<number> {
    const porProfesor = new Map<string, Rutina[]>();
    for (const rutina of await this.rutinas.listarTodasPorAntiguedad()) {
      const lista = porProfesor.get(rutina.profesorUsuarioId) ?? [];
      lista.push(rutina);
      porProfesor.set(rutina.profesorUsuarioId, lista);
    }

    let renombradas = 0;
    for (const lista of porProfesor.values()) {
      const conservados = new Set<string>();
      const repetidas: Rutina[] = [];
      for (const rutina of lista) {
        if (conservados.has(clave(rutina.nombre))) repetidas.push(rutina);
        else conservados.add(clave(rutina.nombre));
      }
      let n = 1;
      for (const rutina of repetidas) {
        while (conservados.has(clave(`Rutina ${n}`))) n++;
        rutina.renombrar(`Rutina ${n}`);
        conservados.add(clave(rutina.nombre));
        await this.rutinas.guardar(rutina);
        renombradas++;
      }
    }
    return renombradas;
  }
}
