// A small local stand-in for the searchArchives resolver's sort/pagination
// contract, used by cypress/e2e/api/search_archives_graphql.cy.js against a
// bundled fixture dataset instead of the live AppSync/OpenSearch-backed API
// (custom_key ties are broken by custom_key ascending, and items missing the
// sort field sort last regardless of direction -- both observed from the
// live API's nextToken format and result ordering).
export function searchArchivesLocal(items, { sort, limit, nextToken } = {}) {
  const field = sort?.field ?? "identifier";
  const direction = sort?.direction ?? "asc";

  const present = items.filter((item) => item[field] !== null && item[field] !== undefined);
  const missing = items.filter((item) => item[field] === null || item[field] === undefined);

  present.sort((a, b) => {
    if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
    if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
    return a.custom_key < b.custom_key ? -1 : a.custom_key > b.custom_key ? 1 : 0;
  });
  missing.sort((a, b) => (a.custom_key < b.custom_key ? -1 : a.custom_key > b.custom_key ? 1 : 0));

  const sorted = [...present, ...missing];

  const startIndex = nextToken
    ? sorted.findIndex((item) => `${item[field]}::key::${item.custom_key}` === nextToken) + 1
    : 0;
  const page = sorted.slice(startIndex, startIndex + limit);
  const last = page[page.length - 1];
  const hasMore = startIndex + limit < sorted.length;

  return {
    items: page,
    total: sorted.length,
    nextToken: hasMore ? `${last[field]}::key::${last.custom_key}` : null
  };
}
