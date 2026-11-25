import type { OpenAPIObject } from '@nestjs/swagger';

// @nestjs/swagger no exporta los tipos de OpenAPI: se derivan del documento.
type Schema = NonNullable<NonNullable<OpenAPIObject['components']>['schemas']>[string];
type ReferenceObject = Extract<Schema, { $ref: string }>;
type SchemaObject = Exclude<Schema, ReferenceObject>;

const esReferencia = (schema: Schema): schema is ReferenceObject => '$ref' in schema;

const escapar = (texto: string): string =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '&#124;');

/** `#/components/schemas/Entidad.DiaPlan` → `DiaPlan`. */
const nombreReferencia = (ref: string): string =>
  ref
    .split('/')
    .pop()!
    .replace(/^[^.]+\./, '');

function tipo(schema: Schema): string {
  if (esReferencia(schema)) return nombreReferencia(schema.$ref);
  if (schema.allOf?.length) return schema.allOf.map(tipo).join(' & ');
  if (schema.oneOf?.length) return schema.oneOf.map(tipo).join(' | ');
  let base: string;
  if (schema.type === 'array' && schema.items) base = `${tipo(schema.items)}[]`;
  else if (schema.enum?.length)
    base = schema.enum.map((valor) => JSON.stringify(valor)).join(' | ');
  else base = `${String(schema.type ?? 'object')}${schema.format ? ` (${schema.format})` : ''}`;
  return schema.nullable ? `${base} | null` : base;
}

const ejemplo = (schema: Schema): string => {
  if (esReferencia(schema) || schema.example === undefined) return '';
  const texto = JSON.stringify(schema.example);
  return texto.length > 60 ? `${texto.slice(0, 57)}…` : texto;
};

/** Propiedades propias y heredadas (`extends` se publica como `allOf`). */
function propiedades(
  schema: SchemaObject,
  schemas: Record<string, Schema>,
): { nombre: string; valor: Schema; requerido: boolean }[] {
  const heredadas = (schema.allOf ?? []).flatMap((parte) => {
    const resuelto = esReferencia(parte) ? schemas[parte.$ref.split('/').pop()!] : parte;
    return resuelto && !esReferencia(resuelto) ? propiedades(resuelto, schemas) : [];
  });
  const propias = Object.entries(schema.properties ?? {}).map(([nombre, valor]) => ({
    nombre,
    valor,
    requerido: schema.required?.includes(nombre) ?? false,
  }));
  return [...heredadas, ...propias];
}

function seccionModelo(
  nombre: string,
  schema: SchemaObject,
  schemas: Record<string, Schema>,
): string {
  const filas = propiedades(schema, schemas)
    .map(({ nombre: campo, valor, requerido }) => {
      const descripcion = esReferencia(valor) ? '' : (valor.description ?? '');
      return (
        `<tr><td><code>${campo}</code></td>` +
        `<td><code>${escapar(tipo(valor))}</code></td><td>${requerido ? 'Sí' : 'No'}</td>` +
        `<td>${escapar(descripcion)}</td><td>${ejemplo(valor) ? `<code>${escapar(ejemplo(valor))}</code>` : ''}</td></tr>`
      );
    })
    .join('');
  const titulo = nombre.replace(/^[^.]+\./, '');
  const descripcion = schema.description ? ` — ${escapar(schema.description)}` : '';
  return (
    `<details><summary><b>${titulo}</b>${descripcion}</summary>` +
    '<table><thead><tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Descripción</th>' +
    '<th>Ejemplo</th></tr></thead>' +
    `<tbody>${filas}</tbody></table></details>`
  );
}

/**
 * Arma, a partir de los schemas del documento, las secciones "Entidades" y "DTO de entrada"
 * que se muestran al principio de Swagger UI: un desplegable por modelo con sus campos. Swagger
 * UI no muestra tags sin endpoints, por eso van en la descripción y no como tags.
 */
export function seccionesModelos(documento: OpenAPIObject): string {
  const schemas = (documento.components?.schemas ?? {}) as Record<string, Schema>;
  const grupo = (prefijo: string): string =>
    Object.entries(schemas)
      .filter(([nombre, schema]) => nombre.startsWith(prefijo) && !esReferencia(schema))
      .map(([nombre, schema]) => seccionModelo(nombre, schema as SchemaObject, schemas))
      .join('');
  return (
    '\n\n### Entidades\n\nForma pública de cada entidad del dominio.\n\n' +
    grupo('Entidad.') +
    '\n\n### DTO de entrada\n\nLo que recibe la API en el cuerpo o en la query.\n\n' +
    grupo('Dto.')
  );
}
