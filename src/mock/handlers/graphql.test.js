/**
 * @fileoverview Unit tests for the read-only mock GraphQL router.
 */

import { handleGraphql } from "./graphql";
import { extractOperationName } from "../extractOperation";
import site from "../data/site.json";
import {
  searchArchives,
  siteBySiteId,
  getCollection
} from "../../graphql/queries";

describe("mock GraphQL handlers", () => {
  it("returns the default site", async () => {
    const result = await handleGraphql({
      query: siteBySiteId,
      variables: { siteId: "default", limit: 1 }
    });
    expect(result.data.siteBySiteId.items[0].siteId).toBe("default");
    expect(result.data.siteBySiteId.items[0].homePage).toBe(site.homePage);
    expect(() =>
      JSON.parse(result.data.siteBySiteId.items[0].homePage)
    ).not.toThrow();
  });

  it("finds archives by custom_key eq", async () => {
    const result = await handleGraphql({
      query: searchArchives,
      variables: {
        filter: {
          item_category: { eq: "default" },
          visibility: { eq: true },
          custom_key: { eq: "ark:/53696/m58xyh90" }
        },
        limit: 1
      }
    });
    expect(result.data.searchArchives.items[0].identifier).toBe("imagedemo");
  });

  it("gets collection by id for parent lookups", async () => {
    const result = await handleGraphql({
      query: getCollection,
      variables: { id: "692555a6-c794-11ea-87d0-0242ac130003" }
    });
    expect(result.data.getCollection.title).toBe("Demo collection");
  });

  it("rejects mutations", async () => {
    const mutation = `
      mutation UpdateSite($input: UpdateSiteInput!) {
        updateSite(input: $input) { id }
      }
    `;
    expect(extractOperationName(mutation)).toBe("updateSite");
    await expect(
      handleGraphql({ query: mutation, variables: { input: {} } })
    ).rejects.toThrow(/read-only/);
  });
});
