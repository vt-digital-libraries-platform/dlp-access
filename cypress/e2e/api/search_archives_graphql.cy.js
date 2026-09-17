// This used to hit the live AppSync API directly with cy.request, which
// bypasses cy.intercept (it's a Node-side request, not a browser one), so it
// couldn't be mocked the way the browser-driven specs are. searchArchives is
// also backed by OpenSearch via @searchable, which `amplify mock api` doesn't
// support locally. Instead, this now runs the same sort/pagination contract
// (see localSearchArchives.js: sort by the requested field, tie-break by
// custom_key ascending, items missing the sort field sort last) against a
// bundled snapshot of real archive records, so it no longer depends on any
// network call or the live database's current contents.
import { searchArchivesLocal } from "../../support/localSearchArchives";
import archives from "../../fixtures/graphql/datasets/brouwer_collection_archives.json";

describe("searchArchivesLocal sorting", () => {
  it("sorts by title in asc order by default", () => {
    const { items } = searchArchivesLocal(archives, { sort: { field: "title", direction: "asc" }, limit: 5 });
    expect(items).to.have.lengthOf(5);
    expect(items[0].title).to.eq("A day like any other way");
    expect(items[1].title).to.eq("All I can do…");
    expect(items[2].title).to.eq("And now - at this late date");
    expect(items[3].title).to.eq("As above…so below");
    expect(items[4].title).to.eq("At Home in the Woods");
  });

  it("sorts by title in desc order", () => {
    const { items } = searchArchivesLocal(archives, { sort: { field: "title", direction: "desc" }, limit: 5 });
    expect(items).to.have.lengthOf(5);
    expect(items[0].title).to.eq("sometimes…people die.");
    expect(items[1].title).to.eq("sometimes it is not Here and There…");
    expect(items[2].title).to.eq("Won't somebody tell me");
    expect(items[3].title).to.eq("Why do we do what we do?");
    expect(items[4].title).to.eq("Where are we now?");
  });

  it("sorts by start_date in asc order", () => {
    const { items } = searchArchivesLocal(archives, { sort: { field: "start_date", direction: "asc" }, limit: 5 });
    expect(items).to.have.lengthOf(5);
    expect(items[0].custom_key).to.eq("ark:/53696/0c435c60");
    expect(items[0].start_date).to.eq("1991");
    expect(items[1].custom_key).to.eq("ark:/53696/1c9c7741");
    expect(items[1].start_date).to.eq("1991");
    expect(items[2].custom_key).to.eq("ark:/53696/1d95da8b");
    expect(items[2].start_date).to.eq("1991");
    expect(items[3].custom_key).to.eq("ark:/53696/2c07a15e");
    expect(items[3].start_date).to.eq("1991");
    expect(items[4].custom_key).to.eq("ark:/53696/465fcdb6");
    expect(items[4].start_date).to.eq("1991");
  });

  it("sorts by start_date in desc order, paginating with nextToken, and sorts items missing start_date last", () => {
    const variables = { sort: { field: "start_date", direction: "desc" }, limit: 5 };
    const firstPage = searchArchivesLocal(archives, variables);
    expect(firstPage.items).to.have.lengthOf(5);
    expect(firstPage.items[0].custom_key).to.eq("ark:/53696/041e321a");
    expect(firstPage.items[0].start_date).to.eq("2018");
    expect(firstPage.items[4].custom_key).to.eq("ark:/53696/41b00d4a");
    expect(firstPage.items[4].start_date).to.eq("2018");
    expect(firstPage.nextToken).to.eq("2018::key::ark:/53696/41b00d4a");

    const secondPage = searchArchivesLocal(archives, { ...variables, nextToken: firstPage.nextToken });
    expect(secondPage.items).to.have.lengthOf(5);
    expect(secondPage.items[0].custom_key).to.eq("ark:/53696/4c718e3e");
    expect(secondPage.items[1].custom_key).to.eq("ark:/53696/94b21a6e");
    expect(secondPage.items[2].custom_key).to.eq("ark:/53696/b12e467c");
    expect(secondPage.items[3].custom_key).to.eq("ark:/53696/b83f5f53");
    expect(secondPage.items[4].custom_key).to.eq("ark:/53696/ca37e821");

    const lastPage = searchArchivesLocal(archives, { ...variables, limit: 100 });
    expect(lastPage.items[lastPage.items.length - 1].start_date).to.be.null;
    expect(lastPage.nextToken).to.be.null;
  });

  it("breaks ties on an equal sort field by custom_key ascending", () => {
    // Every item in this collection shares the same creator, so sorting by
    // creator reduces entirely to the custom_key tie-break.
    const { items, total } = searchArchivesLocal(archives, { sort: { field: "creator", direction: "asc" }, limit: 5 });
    expect(total).to.eq(64);
    expect(items).to.have.lengthOf(5);
    expect(items[0].custom_key).to.eq("ark:/53696/041e321a");
    expect(items[1].custom_key).to.eq("ark:/53696/0c435c60");
    expect(items[2].custom_key).to.eq("ark:/53696/108e5f82");
    expect(items[3].custom_key).to.eq("ark:/53696/1b58f403");
    expect(items[4].custom_key).to.eq("ark:/53696/1b87fafe");
  });
});
