/**
 * Puerto del reloj. El tiempo entra siempre por acá para que los tests no dependan de la
 * fecha real (docs/TESTING.md).
 */
export abstract class Reloj {
  abstract ahora(): Date;
}
