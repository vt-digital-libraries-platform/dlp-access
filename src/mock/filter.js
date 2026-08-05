/**
 * @fileoverview In-memory AppSync/OpenSearch-style filter, sort, and pagination.
 *
 * Implements a subset of operators used by `fetchTools.fetchSearchResults`
 * so browse/search UI works without a real OpenSearch backend.
 */

/**
 * @typedef {Object} SearchCondition
 * @property {*} [eq] - Exact match (arrays match if any element equals).
 * @property {boolean} [exists] - Whether the field is present / non-empty.
 * @property {string} [matchPhrase] - Case-insensitive substring match.
 * @property {string} [matchPhrasePrefix] - Case-insensitive substring match.
 * @property {string|number} [gte] - Greater-than-or-equal (string compare).
 * @property {string|number} [lte] - Less-than-or-equal (string compare).
 */

/**
 * @typedef {Object.<string, SearchCondition|SearchFilter[]>} SearchFilter
 * Nested `and` / `or` arrays are supported for compound filters.
 */

/**
 * @typedef {Object} SortSpec
 * @property {string} field - Item property to sort by.
 * @property {"asc"|"desc"} [direction] - Sort direction; defaults to ascending.
 */

/**
 * @typedef {Object} SearchOptions
 * @property {SearchFilter} [filter] - AppSync-style filter object.
 * @property {SortSpec|SortSpec[]} [sort] - One or more sort specs.
 * @property {number} [limit] - Page size; defaults to all matching items.
 * @property {string} [nextToken] - Offset encoded as a decimal string.
 * @property {string} [allFields] - Free-text needle matched against JSON of each item.
 */

/**
 * @typedef {Object} SearchResult
 * @property {Object[]} items - Current page of results.
 * @property {number} total - Total matches before pagination.
 * @property {string|null} nextToken - Next offset, or `null` on the last page.
 */

/**
 * Read a field value from a seed record.
 *
 * @param {Object} item
 * @param {string} field
 * @returns {*}
 */
function getFieldValue(item, field) {
  return item?.[field];
}

/**
 * Loose equality used for `eq` filters (coerces to string when needed).
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function valuesEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

/**
 * Evaluate a single field condition against an item.
 *
 * Unsupported operators return `true` so the UI still loads.
 *
 * @param {Object} item
 * @param {string} field
 * @param {SearchCondition} condition
 * @returns {boolean}
 */
function matchesCondition(item, field, condition) {
  if (!condition || typeof condition !== "object") {
    return true;
  }

  const value = getFieldValue(item, field);

  if (Object.prototype.hasOwnProperty.call(condition, "eq")) {
    const target = condition.eq;
    if (Array.isArray(value)) {
      return value.some((v) => valuesEqual(v, target));
    }
    return valuesEqual(value, target);
  }

  if (Object.prototype.hasOwnProperty.call(condition, "exists")) {
    const exists =
      value != null && !(Array.isArray(value) && value.length === 0);
    return condition.exists ? exists : !exists;
  }

  if (condition.matchPhrase != null) {
    const needle = String(condition.matchPhrase).toLowerCase();
    const haystack = Array.isArray(value)
      ? value.join(" ").toLowerCase()
      : String(value ?? "").toLowerCase();
    return haystack.includes(needle);
  }

  if (condition.matchPhrasePrefix != null) {
    const needle = String(condition.matchPhrasePrefix).toLowerCase();
    if (Array.isArray(value)) {
      return value.some((v) => String(v).toLowerCase().includes(needle));
    }
    return String(value ?? "")
      .toLowerCase()
      .includes(needle);
  }

  if (condition.gte != null || condition.lte != null) {
    const comparable = String(value ?? "");
    if (condition.gte != null && comparable < String(condition.gte)) {
      return false;
    }
    if (condition.lte != null && comparable > String(condition.lte)) {
      return false;
    }
    return true;
  }

  // Unsupported operators: treat as pass-through so UI still loads
  return true;
}

/**
 * Recursively evaluate an AppSync-style filter against a single item.
 *
 * @param {Object} item
 * @param {SearchFilter} filter
 * @returns {boolean}
 */
function matchesFilter(item, filter) {
  if (!filter || typeof filter !== "object") {
    return true;
  }

  if (filter.and) {
    return filter.and.every((sub) => matchesFilter(item, sub));
  }

  if (filter.or) {
    return filter.or.some((sub) => matchesFilter(item, sub));
  }

  return Object.keys(filter).every((field) => {
    if (field === "and" || field === "or") {
      return true;
    }
    return matchesCondition(item, field, filter[field]);
  });
}

/**
 * Compare two values for sorting.
 *
 * @param {*} a
 * @param {*} b
 * @param {"asc"|"desc"} [direction]
 * @returns {number} Negative if `a` sorts before `b`, positive if after, else 0.
 */
function compareValues(a, b, direction) {
  const av = a ?? "";
  const bv = b ?? "";
  if (av < bv) return direction === "desc" ? 1 : -1;
  if (av > bv) return direction === "desc" ? -1 : 1;
  return 0;
}

/**
 * Filter, sort, and paginate an in-memory collection.
 *
 * Mimics AppSync searchable connection responses (`items`, `total`, `nextToken`).
 *
 * @param {Object[]} items - Source records (collections, archives, or a union).
 * @param {SearchOptions} [options]
 * @returns {SearchResult}
 */
export function applySearch(
  items,
  { filter, sort, limit, nextToken, allFields } = {}
) {
  let results = Array.isArray(items) ? [...items] : [];

  if (allFields) {
    const needle = String(allFields).toLowerCase();
    results = results.filter((item) => {
      const blob = JSON.stringify(item).toLowerCase();
      return blob.includes(needle);
    });
  }

  if (filter) {
    results = results.filter((item) => matchesFilter(item, filter));
  }

  const sortSpecs = Array.isArray(sort) ? sort : sort ? [sort] : [];
  if (sortSpecs.length) {
    results.sort((a, b) => {
      for (const spec of sortSpecs) {
        if (!spec?.field) continue;
        const cmp = compareValues(a[spec.field], b[spec.field], spec.direction);
        if (cmp !== 0) return cmp;
      }
      return 0;
    });
  }

  const start = nextToken ? parseInt(nextToken, 10) || 0 : 0;
  const pageSize = limit != null ? limit : results.length;
  const page = results.slice(start, start + pageSize);
  const end = start + page.length;
  const newNextToken = end < results.length ? String(end) : null;

  return {
    items: page,
    total: results.length,
    nextToken: newNextToken
  };
}

export { matchesFilter };
