import { parse, type TypeNode } from 'graphql';

/**
 * Explicit OpenSearch mappings for the @searchable models, derived from the
 * GraphQL schema.
 *
 * Without explicit mappings the indexes are created by dynamic mapping, which
 * guesses field types from the first documents indexed. Date detection turns
 * free-text fields such as display_date into `date` fields, and every later
 * document whose value doesn't parse (e.g. "circa 1920") is rejected. The
 * streaming Lambda swallows those errors, so the documents silently go
 * missing from search.
 *
 * Type mapping:
 *   String, ID, AWSEmail, AWSURL, ...  text + .keyword subfield
 *   fields in DATE_FIELDS             date in DATE_FORMATS, ignore_malformed
 *   Boolean                           boolean
 *   Int / Float                       long / double
 *   AWSDateTime / AWSDate             date
 *   AWSJSON                           object, not indexed (kept in _source)
 * Attributes not declared in the schema are kept in _source but not indexed
 * ("dynamic": false).
 */

// String fields in the schema whose values are dates in varying formats.
// They're indexed as dates so range filters and sorts compare them as dates;
// a value that doesn't parse is left out of the field instead of the whole
// document being rejected. The resolvers sort on these fields directly rather
// than on a .keyword subfield (nonKeywordFields in resolvers/*.req.vtl).
export const DATE_FIELDS = [
  'date',
  'start_date',
  'end_date',
  'embargo_start_date',
  'embargo_end_date',
];

const DATE_FORMATS = [
  'yyyy/MM/dd HH:mm:ss',
  'yyyy/MM/dd',
  'yyyy/MM',
  'yyyy/M',
  'yyyy-MM-dd HH:mm:ss',
  'yyyy-MM-dd',
  'yyyy-MM',
  'yyyy-M',
  'yyyyMM',
  'yyyy',
  'epoch_millis',
].join('||');

type FieldMapping = Record<string, unknown>;
export type IndexMapping = {
  dynamic: false;
  properties: Record<string, FieldMapping>;
};

const TEXT_WITH_KEYWORD: FieldMapping = {
  type: 'text',
  fields: { keyword: { type: 'keyword', ignore_above: 256 } },
};
const DATE_FIELD: FieldMapping = {
  type: 'date',
  format: DATE_FORMATS,
  ignore_malformed: true,
};
const SCALAR_MAPPINGS: Record<string, FieldMapping> = {
  Boolean: { type: 'boolean' },
  Int: { type: 'long' },
  Float: { type: 'double' },
  AWSDateTime: { type: 'date' },
  AWSDate: { type: 'date' },
  AWSTimestamp: { type: 'date', format: 'epoch_second' },
  AWSJSON: { type: 'object', enabled: false },
};
const STRING_SCALARS = new Set([
  'String',
  'ID',
  'AWSEmail',
  'AWSURL',
  'AWSPhone',
  'AWSIPAddress',
  'AWSTime',
]);

function namedType(type: TypeNode): string {
  return type.kind === 'NamedType' ? type.name.value : namedType(type.type);
}

/** Mappings keyed by index name (the lowercased model name). */
export function buildOpenSearchMappings(
  schema: string
): Record<string, IndexMapping> {
  const definitions = parse(schema).definitions;
  const typeNames = new Set(
    definitions.flatMap((d) =>
      d.kind === 'ObjectTypeDefinition' || d.kind === 'InterfaceTypeDefinition'
        ? [d.name.value]
        : []
    )
  );

  const mappings: Record<string, IndexMapping> = {};
  for (const def of definitions) {
    if (def.kind !== 'ObjectTypeDefinition') continue;
    if (!def.directives?.some((d) => d.name.value === 'searchable')) continue;
    // @model adds these timestamps to every record
    const properties: Record<string, FieldMapping> = {
      createdAt: SCALAR_MAPPINGS.AWSDateTime,
      updatedAt: SCALAR_MAPPINGS.AWSDateTime,
    };
    for (const field of def.fields ?? []) {
      const name = field.name.value;
      const type = namedType(field.type);
      if (typeNames.has(type)) continue; // relationship, not a stored attribute
      if (DATE_FIELDS.includes(name) && type === 'String') {
        properties[name] = DATE_FIELD;
      } else if (SCALAR_MAPPINGS[type]) {
        properties[name] = SCALAR_MAPPINGS[type];
      } else if (STRING_SCALARS.has(type)) {
        properties[name] = TEXT_WITH_KEYWORD;
      } else {
        throw new Error(`No mapping for ${def.name.value}.${name}: ${type}`);
      }
    }
    mappings[def.name.value.toLowerCase()] = { dynamic: false, properties };
  }
  return mappings;
}
