const searchArchivesQuery = `
  query SearchCollectionItems(
      $parent_id: String!
      $limit: Int
      $sort: [SearchableArchiveSortInput]
      $nextToken: String
  ) {
      searchArchives(
          filter: { heirarchy_path: { eq: $parent_id }, visibility: { eq: true } }
          sort: $sort
          limit: $limit
          nextToken: $nextToken
      ) {
          items {
              id
              title
              description
              start_date
              custom_key
              identifier
              description
              tags
              creator
              create_date
          }
          total
          nextToken
      }
  }

`;

// Taubman Museum of Art collection, which currently holds ~1,655 archive
// items in this environment - large enough to exercise pagination.
const parent_id = "eab14157-2c87-4a1b-ad2a-eab17954d11f";

describe("searchArchives query default sorting", () => {
  it("Archives sorted by title in asc order by default", () => {
    const variables = {
      limit: 5,
      parent_id
    };
    cy.graphqlRequest(searchArchivesQuery, variables).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data.searchArchives.items;
      expect(items).to.exist;
      expect(items).to.have.lengthOf(5);
      expect(items[0].title).to.eq("\"'TAKE MY LEG O LORD, BUT SAVE MY LIFE'\"");
      expect(items[1].title).to.eq("\"2-PAGE SCENE: WOMAN AND MAN, WITH ANOTHER WOMAN BEHIND SCREEN\"");
      expect(items[2].title).to.eq("\"A MAN IN A PHONE BOOTH, WILLIS PARK, BAINBRIDGE, DECATUR COUNTY, GEORGIA\"");
      expect(items[3].title).to.eq("\"ACTS AND MONUMENTS OF THE CHRISTIAN MARTYRS, PAGE I\"");
      expect(items[4].title).to.eq("\"ACTS AND MONUMENTS OF THE CHRISTIAN MARTYRS, PAGE I\"");
    });
  });
});

describe("searchArchives query sort by title by desc order", () => {
  it("Archives sorted by title in desc order", () => {
    const variables = {
      limit: 5,
      parent_id,
      sort: [
        {
          field: "title",
          direction: "desc"
        }
      ]
    };
    cy.graphqlRequest(searchArchivesQuery, variables).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data.searchArchives.items;
      expect(items).to.exist;
      expect(items).to.have.lengthOf(5);
      expect(items[0].title).to.eq("[Stencil]");
      expect(items[1].title).to.eq("[MacDowell Eakins Archive West End Art Emporium]");
      expect(items[2].title).to.eq("[MARKET]");
      expect(items[3].title).to.eq("[HANK WILLIAMS] GRACE AND VIOLENCE...");
      expect(items[4].title).to.eq("[FRONTISPIECE] ALBUM OF VIRGINIA/ILLUSTRATED/BY/ED. BEYER/1858");
    });
  });
});

describe("searchArchives query sort by start_date by asc order", () => {
  it("Archives sorted by start_date in asc order", () => {
    const variables = {
      limit: 5,
      parent_id,
      sort: [
        {
          field: "start_date",
          direction: "asc"
        }
      ]
    };
    cy.graphqlRequest(searchArchivesQuery, variables).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data.searchArchives.items;
      expect(items).to.exist;
      expect(items).to.have.lengthOf(5);
      expect(items[0].id).to.eq("4d69a7ca-cf33-4b73-9909-74d9b5221f85");
      expect(items[0].start_date).to.eq("1475/01/09");

      expect(items[1].id).to.eq("da11e58d-d956-4464-a0c8-eb1652508404");
      expect(items[1].start_date).to.eq("1500/01/09");

      expect(items[2].id).to.eq("d169e875-906c-4560-b9d7-57310aba7b9e");
      expect(items[2].start_date).to.eq("1647/01/09");

      expect(items[3].id).to.eq("d3f41cf5-6939-441e-8933-d170c4c22165");
      expect(items[3].start_date).to.eq("1647/01/09");

      expect(items[4].id).to.eq("dc1d3626-2371-4617-a749-43d651cd2a24");
      expect(items[4].start_date).to.eq("1700/01/09");
    });
  });
});

describe("searchArchives query sort by start_date by desc order", () => {
  let nextToken = null;
  const variables = {
    limit: 5,
    parent_id,
    sort: [
      {
        field: "start_date",
        direction: "desc"
      }
    ]
  };
  it("Archives sorted by start_date in desc order", () => {
    cy.graphqlRequest(searchArchivesQuery, variables).then((res) => {
      expect(res.status).to.eq(200);
      let items = res.body.data.searchArchives.items;
      expect(items).to.exist;
      expect(items).to.have.lengthOf(5);

      expect(items[0].id).to.eq("0032ef45-3e59-4ec9-a42b-5d031180c6c1");
      expect(items[0].start_date).to.eq("2011/01/09");

      expect(items[1].id).to.eq("89ae9990-bfbf-45b1-a4a4-6a045705acd5");
      expect(items[1].start_date).to.eq("2011/01/09");

      expect(items[2].id).to.eq("498980c9-764e-4a82-8126-17331391001a");
      expect(items[2].start_date).to.eq("2011/01/09");

      expect(items[3].id).to.eq("f911a7ca-8fda-4d4a-878c-1b2ac97980e7");
      expect(items[3].start_date).to.eq("2011/01/09");

      expect(items[4].id).to.eq("6862413f-59d0-459f-9226-f974961e1e6b");
      expect(items[4].start_date).to.eq("2011/01/09");

      nextToken = res.body.data.searchArchives.nextToken;
      expect(nextToken).to.exist.to.eq(
        "1294531200000::key::ark:/53696/j482048s"
      );
    });
  });
  it("Paginate results with nextToken", () => {
    variables["nextToken"] = nextToken;
    cy.graphqlRequest(searchArchivesQuery, variables).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data.searchArchives.items;
      expect(items).to.exist;
      expect(items).to.have.lengthOf(5);

      expect(items[0].id).to.eq("0d00dd04-df93-4d8f-ac03-78bb46a7f1cb");
      expect(items[0].start_date).to.eq("2010/01/09");

      expect(items[1].id).to.eq("19cfb7d5-74a2-4763-9083-0f1c3d671513");
      expect(items[1].start_date).to.eq("2010/01/09");

      expect(items[2].id).to.eq("0a27ba24-d2cd-41f4-900c-50f8bf907c74");
      expect(items[2].start_date).to.eq("2010/01/09");

      expect(items[3].id).to.eq("5e083710-45a3-4b99-be7c-50e88cf693b1");
      expect(items[3].start_date).to.eq("2010/01/09");

      expect(items[4].id).to.eq("21d4de66-9cd6-4206-9d7d-5f3ac4c2ab77");
      expect(items[4].start_date).to.eq("2010/01/09");
    });
  });
});

describe("searchArchives query sort by creator by asc order", () => {
  const variables = {
    limit: 5,
    parent_id,
    sort: [
      {
        field: "creator",
        direction: "asc"
      }
    ],
    nextToken: null
  };
  it("Archives sorted by custom key in asc order", () => {
    cy.graphqlRequest(searchArchivesQuery, variables).then((res) => {
      expect(res.status).to.eq(200);
      const items = res.body.data.searchArchives.items;
      expect(items).to.exist;
      expect(items).to.have.lengthOf(5);

      expect(items[0].id).to.eq("e8beb6a1-0868-45cc-bf77-c022455badae");
      expect(items[0].custom_key).to.eq("ark:/53696/0d051p15");

      expect(items[1].id).to.eq("d569543e-82b5-4a70-a4d3-8a713f1a5831");
      expect(items[1].custom_key).to.eq("ark:/53696/0g14ng0w");

      expect(items[2].id).to.eq("6d264938-232f-4bce-8a7c-3fa722e81aaf");
      expect(items[2].custom_key).to.eq("ark:/53696/0m53bk2d");

      expect(items[3].id).to.eq("45f867d3-cb5d-4da3-87c9-2f2c9e5daddf");
      expect(items[3].custom_key).to.eq("ark:/53696/1m34c86t");

      expect(items[4].id).to.eq("6778cd3c-a1d1-4955-9eb7-3a598b0c0e55");
      expect(items[4].custom_key).to.eq("ark:/53696/1m63hn2m");

      const nextToken = res.body.data.searchArchives.nextToken;
      expect(nextToken).to.exist.to.eq(
        '("Japanese, dates unknown")::key::ark:/53696/1m63hn2m'
      );
    });
  });
});
