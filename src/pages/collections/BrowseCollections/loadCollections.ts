import { EventHandler } from "react";
import { fetchSearchResults } from "../../../lib/fetchTools";

type Args = {
  scrollUp: EventHandler<any>;
  pg: number;
  filtr: any;
  sort: any;
  limt: number;
  tokns: string[];
};

export const loadCollections = async ({
  pg,
  filtr,
  sort,
  limt,
  tokns,
  scrollUp
}: Args) => {
  let page = pg;
  let limit = limt;
  let filter = filtr;
  let nextTokens = tokns;
  let collections: any = null;
  let totalPages: number = 1;
  let total: number = 0;

  const currentToken = nextTokens[page] || null;

  //Loads top level collections based on
  //filter, sort, limit, and nextToken
  const load = async () => {
    let options = {
      filter: {
        category: "collection",
        ...filter
      },
      sort: sort,
      limit: limit,
      nextToken: currentToken
    };
    const searchResults = await fetchSearchResults(this, options);
    const setNextTokens = (cur: any) => {
      const tokens = [...cur];
      tokens[page + 1] = searchResults.nextToken;
      return tokens;
    };
    if (searchResults && "items" in searchResults) {
      collections = searchResults.items;
      total = searchResults.total;
      nextTokens = setNextTokens(nextTokens);
      totalPages = Math.ceil(searchResults.total / limit);
    }

    if (typeof scrollUp === "function") {
      scrollUp(new Event("click"));
    }
  };
  await load();

  return {
    collections,
    total,
    page,
    limit,
    totalPages,
    nextTokens
  };
};
