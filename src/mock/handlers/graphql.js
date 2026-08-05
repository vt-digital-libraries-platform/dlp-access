/**
 * @fileoverview Read-only in-memory GraphQL router for local mock mode.
 *
 * Intercepts Amplify `API.graphql` calls and answers browse/search operations
 * from seed JSON under `src/mock/data/`. Mutations throw a clear read-only error.
 */

import site from "../data/site.json";
import collections from "../data/collections.json";
import archives from "../data/archives.json";
import collectionmaps from "../data/collectionmaps.json";
import pageContents from "../data/pageContents.json";
import { applySearch } from "../filter";
import { extractOperationName } from "../extractOperation";

/** @type {Set<string>} GraphQL mutation field names that are intentionally unsupported. */
const MUTATION_OPS = new Set([
  "createArchive",
  "updateArchive",
  "deleteArchive",
  "createCollection",
  "updateCollection",
  "deleteCollection",
  "createCollectionmap",
  "updateCollectionmap",
  "deleteCollectionmap",
  "createHistory",
  "updateHistory",
  "deleteHistory",
  "createMetadataField",
  "updateMetadataField",
  "deleteMetadataField",
  "createPageContent",
  "updatePageContent",
  "deletePageContent",
  "createPartner",
  "updatePartner",
  "deletePartner",
  "createSite",
  "updateSite",
  "deleteSite"
]);

/**
 * Wrap a connection or payload in the AppSync `{ data: { [opName]: ... } }` shape.
 *
 * @param {string} opName - Root GraphQL field name.
 * @param {*} result - Connection object or single record.
 * @returns {{data: Object}}
 */
function connection(opName, result) {
  return { data: { [opName]: result } };
}

/**
 * Resolve `*ByIdentifier` queries against an in-memory list.
 *
 * @param {Object[]} items
 * @param {{identifier?: string, filter?: Object, limit?: number}} variables
 * @returns {{items: Object[], nextToken: null}}
 */
function byIdentifier(items, variables) {
  const identifier = variables?.identifier;
  let filtered = items.filter((item) => item.identifier === identifier);
  if (variables?.filter) {
    filtered = applySearch(filtered, { filter: variables.filter }).items;
  }
  return {
    items: filtered.slice(0, variables?.limit ?? filtered.length),
    nextToken: null
  };
}

/**
 * Build a searchable connection response for list/search/fulltext operations.
 *
 * @param {string} opName
 * @param {Object[]} items
 * @param {Object} [variables]
 * @returns {{data: Object}}
 */
function handleSearch(opName, items, variables) {
  return connection(
    opName,
    applySearch(items, {
      filter: variables?.filter,
      sort: variables?.sort,
      limit: variables?.limit,
      nextToken: variables?.nextToken,
      allFields: variables?.allFields
    })
  );
}

/**
 * Union of seed collections and archives for `searchObjects`.
 *
 * @returns {Object[]}
 */
function objectUnion() {
  // Top-level collections + all archives (mirrors searchObjects filter intent)
  return [...collections, ...archives];
}

/**
 * Handle an Amplify `API.graphql` request against mock seed data.
 *
 * @param {string|{query?: string, variables?: Object}} input - GraphQL document
 *   string or `{ query, variables }` (as produced by `graphqlOperation`).
 * @returns {Promise<{data: Object}>} AppSync-shaped response.
 * @throws {Error} When the operation cannot be parsed, is a mutation, or is unsupported.
 */
export async function handleGraphql(input) {
  const query = typeof input === "string" ? input : input?.query;
  const variables = input?.variables || {};
  const opName = extractOperationName(query);

  if (!opName) {
    throw new Error("Mock mode: could not determine GraphQL operation name");
  }

  if (MUTATION_OPS.has(opName)) {
    throw new Error(`Mock mode: read-only (unsupported mutation ${opName})`);
  }

  switch (opName) {
    case "siteBySiteId": {
      const siteId = variables.siteId;
      const items = site.siteId === siteId ? [site] : [];
      return connection(opName, {
        items: items.slice(0, variables.limit ?? 1),
        nextToken: null
      });
    }

    case "listCollections":
      return handleSearch(opName, collections, variables);

    case "searchCollections":
    case "fulltextCollections":
      return handleSearch(opName, collections, variables);

    case "getCollection": {
      const item = collections.find((c) => c.id === variables.id) || null;
      return { data: { getCollection: item } };
    }

    case "collectionByIdentifier":
      return connection(opName, byIdentifier(collections, variables));

    case "searchArchives":
    case "fulltextArchives":
      return handleSearch(opName, archives, variables);

    case "archiveByIdentifier":
      return connection(opName, byIdentifier(archives, variables));

    case "getArchive": {
      const item = archives.find((a) => a.id === variables.id) || null;
      return { data: { getArchive: item } };
    }

    case "searchObjects":
      return handleSearch(opName, objectUnion(), variables);

    case "getCollectionmap": {
      const item = collectionmaps.find((m) => m.id === variables.id) || null;
      return { data: { getCollectionmap: item } };
    }

    case "getPageContent": {
      const item = pageContents.find((p) => p.id === variables.id) || null;
      return { data: { getPageContent: item } };
    }

    case "listMetadataFields":
      return connection(opName, {
        items: [],
        nextToken: null
      });

    case "listSites":
      return connection(opName, {
        items: [site],
        nextToken: null
      });

    case "getSite": {
      const item = site.id === variables.id ? site : null;
      return { data: { getSite: item } };
    }

    default:
      throw new Error(`Mock mode: unsupported operation ${opName}`);
  }
}
