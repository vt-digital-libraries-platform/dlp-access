/**
 * @fileoverview Unit tests for mock GraphQL operation parsing and in-memory search.
 */

import { extractOperationName } from "./extractOperation";
import { applySearch, matchesFilter } from "./filter";

describe("mock extractOperationName", () => {
  it("extracts the selection set field name", () => {
    const query = `
      query SiteBySiteId($siteId: String!) {
        siteBySiteId(siteId: $siteId) {
          items { id }
        }
      }
    `;
    expect(extractOperationName(query)).toBe("siteBySiteId");
  });

  it("handles inline searchArchives queries", () => {
    const query = `
      query SearchCollectionItems($parent_id: String!) {
        searchArchives(
          filter: { heirarchy_path: { eq: $parent_id } }
        ) {
          items { title }
        }
      }
    `;
    expect(extractOperationName(query)).toBe("searchArchives");
  });
});

describe("mock applySearch", () => {
  const items = [
    {
      id: "1",
      title: "Demo collection",
      visibility: true,
      parent_collection: null,
      collection_category: "default",
      custom_key: "ark:/53696/j22hdemo"
    },
    {
      id: "2",
      title: "Hidden",
      visibility: false,
      parent_collection: ["1"],
      collection_category: "default"
    }
  ];

  it("filters with eq and exists", () => {
    const result = applySearch(items, {
      filter: {
        visibility: { eq: true },
        parent_collection: { exists: false }
      }
    });
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe("1");
  });

  it("matchPhrase finds ark suffix", () => {
    expect(
      matchesFilter(items[0], {
        custom_key: { matchPhrase: "j22hdemo" }
      })
    ).toBe(true);
  });

  it("paginates with nextToken", () => {
    const page1 = applySearch(items, { limit: 1 });
    expect(page1.items).toHaveLength(1);
    expect(page1.nextToken).toBe("1");
    const page2 = applySearch(items, { limit: 1, nextToken: "1" });
    expect(page2.items[0].id).toBe("2");
    expect(page2.nextToken).toBeNull();
  });
});
