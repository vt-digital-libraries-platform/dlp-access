import { getItemCountByFormat } from "../../../lib/fetchTools";

export type FormatCount = {
  value: string;
  count: number | null;
};

/**
 * Fetches the number of items carrying each of the given format values.
 *
 * One query per value: SearchableArchiveConnection exposes only items,
 * nextToken and total, with no aggregateItems field, so the buckets from an
 * $aggregates argument have nowhere to come back through. A single-request
 * version needs an Amplify-side schema change.
 *
 * A value whose query fails resolves to a null count rather than rejecting, so
 * one bad value cannot blank the page.
 */
export const loadFormats = async (values: string[]): Promise<FormatCount[]> => {
  return Promise.all(
    values.map(async (value) => {
      try {
        const total = await getItemCountByFormat(value);
        return { value, count: typeof total === "number" ? total : null };
      } catch (error) {
        console.error(`Error fetching item count for format: ${value}`, error);
        return { value, count: null };
      }
    })
  );
};
