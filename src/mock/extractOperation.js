/**
 * @fileoverview Parse GraphQL operation field names from query documents.
 */

/**
 * Extract the GraphQL selection-set field name from a query document string.
 *
 * Amplify routes by the root field (e.g. `searchArchives`), not the
 * operation name (`SearchArchives`). This helper returns that field name.
 *
 * @example
 * extractOperationName("query SearchArchives(...) { searchArchives(...) {")
 * // → "searchArchives"
 *
 * @param {string} query - GraphQL document string (query, mutation, or subscription).
 * @returns {string|null} Root field name, or `null` if the document cannot be parsed.
 */
export function extractOperationName(query) {
  if (!query || typeof query !== "string") {
    return null;
  }
  const match = query.match(
    /\b(?:query|mutation|subscription)\s+\w*[^{]*\{\s*(\w+)/
  );
  return match ? match[1] : null;
}
