import { fetchSearchResults } from "../../../lib/fetchTools";

export type FormatCount = {
  value: string;
  count: number | null;
};

/**
 * Fetches the number of items carrying each of the given format values.
 *
 * One query per value: the generated searchArchives query does not select
 * aggregation buckets, so there is no single-request way to get these counts.
 * Facet value lists are small, and a value whose query fails resolves to a null
 * count rather than rejecting, so one bad value cannot blank the page.
 *
 * category "archive" is required. The collection branch of fetchSearchResults
 * short-circuits to an empty result whenever an item-only field like format is
 * combined with `and` clauses, and collections carry no format.
 */
export const loadFormats = async (values: string[]): Promise<FormatCount[]> => {
  return Promise.all(
    values.map(async (value) => {
      try {
        const searchResults = await fetchSearchResults(null, {
          filter: { category: "archive", format: [value] },
          sort: undefined,
          limit: 1,
          nextToken: undefined
        });
        const total = searchResults?.total;
        return { value, count: typeof total === "number" ? total : null };
      } catch (error) {
        console.error(`Error fetching item count for format: ${value}`, error);
        return { value, count: null };
      }
    })
  );
};
