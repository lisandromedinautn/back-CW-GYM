const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const dosDigitos = (numero: number): string => String(numero).padStart(2, '0');

const partes = (fecha: string): { anio: number; mes: number; dia: number } => ({
  anio: Number(fecha.slice(0, 4)),
  mes: Number(fecha.slice(5, 7)),
  dia: Number(fecha.slice(8, 10)),
});

/** `true` si el texto es una fecha `AAAA-MM-DD` que existe en el calendario. */
export function esFechaValida(fecha: string): boolean {
  if (!PATRON_FECHA.test(fecha)) return false;
  const { anio, mes, dia } = partes(fecha);
  const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    fechaUtc.getUTCFullYear() === anio &&
    fechaUtc.getUTCMonth() === mes - 1 &&
    fechaUtc.getUTCDate() === dia
  );
}

/** La fecha de un instante como `AAAA-MM-DD`, en UTC. */
export function fechaIso(fecha: Date): string {
  return `${fecha.getUTCFullYear()}-${dosDigitos(fecha.getUTCMonth() + 1)}-${dosDigitos(fecha.getUTCDate())}`;
}

/** Suma (o resta, con un número negativo) días a una fecha `AAAA-MM-DD`. */
export function sumarDias(fecha: string, dias: number): string {
  const { anio, mes, dia } = partes(fecha);
  const resultado = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return fechaIso(resultado);
}
