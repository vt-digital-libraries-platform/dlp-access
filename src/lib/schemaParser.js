/**
 * Utility to parse GraphQL schema and extract metadata field information
 *
 * This parser extracts fields from both Archive and Collection types:
 * - All Archive fields are included
 * - Collection fields that don't exist in Archive are included with "(Collection)" suffix
 * - Duplicate fields (present in both types) are shown only once (Archive version)
 *
 * The schema.graphql file is the single source of truth for what fields appear
 * in the metadata page.
 */

import schemaText from "../schema.js";
import metadataFieldInfo from "../data/metadataFieldInfo.json";

/**
 * Parse the GraphQL schema to extract field information from a specific type
 * @param {string} typeName - The GraphQL type name (e.g., 'Archive', 'Collection')
 * @returns {Object} Map of field names to their GraphQL type definitions
 */
function parseTypeFields(typeName) {
  const fieldMap = {};

  // Find the type definition by locating the opening brace
  const typeIndex = schemaText.indexOf(`type ${typeName}`);
  if (typeIndex === -1) {
    console.warn(`Could not find ${typeName} type in schema`);
    return fieldMap;
  }

  // Find the opening brace of the type definition (skip directive content)
  let searchIndex = typeIndex;
  let parenDepth = 0;
  let openBraceIndex = -1;

  // Scan forward, tracking parentheses to skip directive arguments
  while (searchIndex < schemaText.length) {
    const char = schemaText[searchIndex];

    if (char === "(") {
      parenDepth++;
    } else if (char === ")") {
      parenDepth--;
    } else if (char === "{" && parenDepth === 0) {
      // Found the opening brace outside of any directive arguments
      openBraceIndex = searchIndex;
      break;
    }
    searchIndex++;
  }

  if (openBraceIndex === -1) {
    console.warn(`Could not find opening brace for ${typeName} type`);
    return fieldMap;
  }

  // Find the matching closing brace by counting brace depth
  let braceCount = 1;
  let closeBraceIndex = openBraceIndex + 1;

  while (braceCount > 0 && closeBraceIndex < schemaText.length) {
    if (schemaText[closeBraceIndex] === "{") braceCount++;
    if (schemaText[closeBraceIndex] === "}") braceCount--;
    closeBraceIndex++;
  }

  const typeFields = schemaText.substring(
    openBraceIndex + 1,
    closeBraceIndex - 1
  );

  // Match field definitions: fieldName: Type or fieldName: [Type!] or fieldName: Type!
  const fieldRegex = /(\w+):\s*(\[?\w+!?\]?!?)/g;
  let match;

  while ((match = fieldRegex.exec(typeFields)) !== null) {
    const fieldName = match[1];
    const fieldType = match[2];

    // Skip if it's a directive or special field
    if (
      fieldName === "allow" ||
      fieldName === "operations" ||
      fieldName === "groups" ||
      fieldName === "groupsField"
    ) {
      continue;
    }

    fieldMap[fieldName] = {
      graphqlType: fieldType,
      isRequired: fieldType.endsWith("!") && !fieldType.includes("["),
      isRepeatable: fieldType.includes("[")
    };
  }

  return fieldMap;
}

/**
 * Parse the Archive type from schema
 * @returns {Object} Map of field names to their GraphQL type definitions
 */
function parseArchiveFields() {
  return parseTypeFields("Archive");
}

/**
 * Parse the Collection type from schema
 * @returns {Object} Map of field names to their GraphQL type definitions
 */
function parseCollectionFields() {
  return parseTypeFields("Collection");
}

/**
 * Format GraphQL type into human-readable type string
 */
function formatTypeString(graphqlType, isRepeatable) {
  // Remove array brackets and exclamation marks for base type
  let baseType = graphqlType.replace(/[[\]!]/g, "");

  // Map GraphQL types to display types
  const typeMap = {
    String: "String",
    ID: "String (Persistent ID)",
    Boolean: "Boolean",
    AWSJSON: "JSON",
    Int: "Number",
    Float: "Number"
  };

  let displayType = typeMap[baseType] || baseType;

  // Add qualifiers
  if (isRepeatable) {
    displayType += " (Repeatable)";
  }

  return displayType;
}

/**
 * Get customized type string for specific fields that need special formatting
 */
function getCustomTypeString(fieldName, defaultType) {
  const customTypes = {
    alternative: "String (Text, Repeatable)",
    date: "String (Date)",
    end_date: "String (Date)",
    start_date: "String (Date)",
    identifier: "String (Persistent ID)",
    location: "URI / Identifier (Repeatable)",
    title: "String (Text)"
  };

  return customTypes[fieldName] || defaultType;
}

/**
 * Generate metadata fields array by merging schema data with field info
 * @returns {Array} Array of metadata field objects
 */
export function generateMetadataFields() {
  const archiveFields = parseArchiveFields();
  const collectionFields = parseCollectionFields();
  const metadataFields = [];

  // Using fields from schema - show all Archive fields
  const archiveFieldNames = Object.keys(archiveFields).sort();

  archiveFieldNames.forEach((fieldName) => {
    const schemaInfo = archiveFields[fieldName];
    const displayInfo = metadataFieldInfo[fieldName];

    // Format type from schema
    const defaultType = formatTypeString(
      schemaInfo.graphqlType,
      schemaInfo.isRepeatable
    );
    const type = getCustomTypeString(fieldName, defaultType);

    // Required comes from schema (String! = required); JSON can override with 'Conditional'
    let required = schemaInfo.isRequired;
    if (displayInfo?.required === "Conditional") {
      required = "Conditional";
    }

    // Use display info if available, otherwise use defaults
    const labelName =
      displayInfo?.labelName ||
      fieldName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    const description = displayInfo?.description || `${labelName} field`;
    const example = displayInfo?.example || "";

    metadataFields.push({
      columnName: fieldName,
      labelName: labelName,
      type: type,
      description: description,
      example: example,
      required: required,
      sourceType: "Archive"
    });
  });

  // Add Collection-only fields (fields in Collection but not in Archive)
  const collectionFieldNames = Object.keys(collectionFields).sort();

  collectionFieldNames.forEach((fieldName) => {
    // Skip if this field already exists in Archive
    if (archiveFields[fieldName]) {
      return;
    }

    const schemaInfo = collectionFields[fieldName];
    const displayInfo = metadataFieldInfo[fieldName];

    // Format type from schema
    const defaultType = formatTypeString(
      schemaInfo.graphqlType,
      schemaInfo.isRepeatable
    );
    const type = getCustomTypeString(fieldName, defaultType);

    // Required comes from schema (String! = required); JSON can override with 'Conditional'
    let required = schemaInfo.isRequired;
    if (displayInfo?.required === "Conditional") {
      required = "Conditional";
    }

    // Use display info if available, otherwise use defaults
    const labelName =
      displayInfo?.labelName ||
      fieldName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    const description =
      displayInfo?.description || `${labelName} field (Collection-level only)`;
    const example = displayInfo?.example || "";

    metadataFields.push({
      columnName: fieldName,
      labelName: labelName.endsWith(" (Collection)")
        ? labelName
        : labelName + " (Collection)",
      type: type,
      description: description,
      example: example,
      required: required,
      sourceType: "Collection"
    });
  });

  metadataFields.sort((a, b) => a.columnName.localeCompare(b.columnName));

  return metadataFields;
}
