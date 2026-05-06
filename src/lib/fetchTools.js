import { API, graphqlOperation, Storage } from "aws-amplify";
import * as queries from "../graphql/queries";
import { language_codes } from "./language_codes";
import { available_attributes } from "./available_attributes";

export const downloadFile = async (filePath, type = "download") => {
  await getFileContent(filePath, type).then((resp) => {
    const url = URL.createObjectURL(resp);
    const el = document.createElement("a");
    el.id = "download-link";
    el.href = url;
    el.download = filePath.split("/").pop() || "download";
    document.body.appendChild(el);
    el.click();
    const del = document.getElementById("download-link");
    del.remove();
  });
};

export const getFileContent = async (
  copyURL,
  type,
  component,
  attr,
  allowScripts = false
) => {
  const stateObj = {};
  const stateAttr = attr || "copy";
  let prefix;
  if (
    type === "image" ||
    type === "audio" ||
    type === "html" ||
    type === "download"
  ) {
    if (
      copyURL &&
      copyURL.indexOf("http") === 0 &&
      copyURL.indexOf(Storage._config.AWSS3.bucket) === -1
    ) {
      if (component) {
        stateObj[stateAttr] = copyURL;
        component.setState(stateObj, () => {
          console.warn(
            `${
              component.constructor.name || getFileContent.caller || "Component"
            } state set in lib/fetchTools.js getFileContent(). We should refactor this.`
          );
        });
      }
      return copyURL;
    } else if (
      copyURL?.indexOf("http") === -1 &&
      copyURL?.indexOf("https") === -1 &&
      copyURL?.indexOf("amazonaws.com") === -1 &&
      copyURL?.indexOf("www.") === -1
    ) {
      const filename = copyURL.split("/").pop();
      prefix = copyURL.replace(filename, "");
      if (prefix.charAt(0) === "/") {
        prefix = prefix.substring(1);
      }
      if (prefix.charAt(prefix.length - 1) === "/") {
        prefix = prefix.substring(0, prefix.length - 1);
      }
      try {
        const s3Key = `${prefix}/${filename}`;
        let copyLink = await Storage.get(s3Key);
        if (type === "audio") {
          copyLink = copyLink.replace(/%20/g, "+");
        }
        if (type === "html") {
          const copy = await Storage.get(s3Key, { download: true });
          copyLink = await new Response(copy.Body).text();
        }
        if (type === "download") {
          const copy = await Storage.get(s3Key, { download: true });
          return copy.Body;
        }
        if (component) {
          stateObj[stateAttr] = copyLink;
          component.setState(stateObj, () => {
            console.warn(
              `${
                component.constructor.name ||
                getFileContent.caller ||
                "Component"
              } state set in lib/fetchTools.js getFileContent(). We should refactor this.`
            );
          });
        }
        return copyLink;
      } catch (e) {
        console.error(e);
      }
    }
  }
};

export const fetchSignedLink = async (objLink) => {
  let filename = objLink.split("/").pop();
  const bucket = Storage._config.AWSS3.bucket;
  let prefix = objLink
    .replace(`https://${bucket}.s3.amazonaws.com/`, "")
    .replace(filename, "");
  let signedLink = "";

  if (prefix[0] === "/") {
    prefix = prefix.substring(1);
  }

  try {
    const s3Key = `${prefix}${filename}`;
    signedLink = await Storage.get(s3Key);
    console.log(`fetching signedURL for: ${filename}`);
  } catch (error) {
    console.error(`Error fetching signedLink for ${filename}`);
    console.error(error);
  }
  let success = false;
  if (signedLink && signedLink.length) {
    success = true;
  }
  return { success: success, data: signedLink };
};

export const mintNOID = async () => {
  const apiKey = process.env.REACT_APP_MINT_API_KEY;
  const noidLink = process.env.REACT_APP_MINT_LINK;
  const headers = new Headers({
    "X-Api-Key": apiKey
  });
  let response = null;
  try {
    response = await fetch(noidLink, {
      method: "GET",
      mode: "cors",
      headers: headers
    }).then((resp) => {
      return resp.json();
    });
  } catch (error) {
    console.error("Error minting noid -- ", error);
  }
  let retVal = null;
  if (response) {
    try {
      retVal = response.message.match(/^New NOID: ([a-zA-Z0-9]+)/)[1];
    } catch (error) {
      console.error("Error extracting noid from response -- ", error);
    }
  }
  return retVal;
};

export const fetchSubjectValues = async () => {
  let sites = [];
  let subjects = [];
  let nextToken = null;
  let items = null;
  do {
    try {
      const results = await fetchObjects(queries.listSites, {
        nextToken: nextToken
      });
      items = results.data.listSites.items;
      nextToken = results.data.listSites.nextToken;
    } catch (error) {
      console.error(`Error fetching sites: ${error}`);
    }
    if (items) {
      sites = sites.concat(items);
    }
  } while (nextToken);
  for (const idx in sites) {
    try {
      const site = sites[idx];
      const subjectList = JSON.parse(site.searchPage).facets.subject.values;
      for (const i in subjectList) {
        if (subjects.indexOf(subjectList[i]) === -1) {
          subjects.push(subjectList[i]);
        }
      }
    } catch (error) {}
  }
  return subjects.sort();
};

export const fetchAvailableDisplayedAttributes = async () => {
  return available_attributes;
};

export const fetchLanguages = async (component, site, key, callback) => {
  const data = language_codes[key];
  if (data !== null) {
    component.setState(
      { languages: data },
      function () {
        if (typeof component.loadItems === "function") {
          component.loadItems();
        }
      },
      () => {
        console.warn(
          `${
            component.constructor.name || fetchLanguages.caller || "Component"
          } state: languages set in lib/fetchTools.js fetchLanguages(). We should refactor this.`
        );
      }
    );
  }
};

export const fetchSearchResults = async (
  component,
  { filter, sort, limit, nextToken }
) => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE.toLowerCase();
  let archiveFilter = {
    item_category: { eq: REP_TYPE },
    visibility: { eq: true }
  };
  let collectionFilter = {
    collection_category: { eq: REP_TYPE },
    visibility: { eq: true },
    parent_collection: { exists: false }
  };
  let objectFilter = {
    or: [
      {
        collection_category: { eq: REP_TYPE },
        visibility: { eq: true },
        parent_collection: { exists: false }
      },
      {
        item_category: { eq: REP_TYPE },
        visibility: { eq: true }
      }
    ]
  };
  let searchResults = null;
  let category = "";
  let filters = {};
  let andArray = [];
  let allFields = null;
  for (const key of Object.keys(filter)) {
    if (key === "all") {
      allFields = filter["all"];
      delete filter["allFields"];
    } else if (key === "category") {
      category = filter.category;
    } else if (key === "collection") {
      let parent_collection_id = await getCollectionIDByTitle(filter[key]);
      filters["heirarchy_path"] = { eq: parent_collection_id };
    } else if (key === "title" || key === "description") {
      filters[key] = { matchPhrasePrefix: filter[key] };
    } else if (Array.isArray(filter[key])) {
      if (key === "date") {
        filter[key].forEach(function (value) {
          let dates = value.split(" - ");
          andArray.push({
            start_date: {
              gte: `${dates[0]}/01/01`,
              lte: `${dates[1]}/12/31`
            }
          });
        });
      } else {
        filter[key].forEach(function (value) {
          andArray.push({ [key]: { eq: value } });
        });
      }
      filters["and"] = andArray;
    } else {
      filters[key] = { eq: filter[key] };
    }
  }
  let options = {
    filter: filters,
    sort: sort,
    limit: limit,
    nextToken: nextToken
  };
  if (allFields) {
    options["otherArgs"] = { allFields: allFields };
  }
  if (category === "collection") {
    const item_fields = ["format", "medium", "type", "tags"];
    if (
      filters.hasOwnProperty("and") &&
      item_fields.some((e) => Object.keys(filter).indexOf(e) > -1)
    ) {
      searchResults = {
        items: [],
        total: 0,
        nextToken: null
      };
    } else {
      options["filter"] = { ...collectionFilter, ...filters };
      let Collections = null;
      if (allFields) {
        Collections = await fetchObjects(queries.fulltextCollections, options);
        searchResults = Collections.data.fulltextCollections;
      } else {
        Collections = await fetchObjects(queries.fulltextCollections, options);
        searchResults = Collections.data.fulltextCollections;
      }
    }
  } else if (category === "archive") {
    options["filter"] = { ...archiveFilter, ...filters };
    let Archives = null;
    if (allFields) {
      Archives = await fetchObjects(queries.fulltextArchives, options);
      searchResults = Archives.data.fulltextArchives;
    } else {
      Archives = await fetchObjects(queries.searchArchives, options);
      searchResults = Archives.data.searchArchives;
    }
  } else {
    options["filter"] = { ...objectFilter, ...filters };
    const Objects = await fetchObjects(queries.searchObjects, options);
    searchResults = Objects.data.searchObjects;
  }
  return searchResults;
};

export const getAllCollections = async (filter) => {
  let collections = [];
  let nextToken = null;
  let items = null;

  do {
    let myFilter = {};
    myFilter["nextToken"] = nextToken;
    if (filter) {
      for (const entry in filter) {
        if (!myFilter.hasOwnProperty(entry)) {
          myFilter[entry] = filter[entry];
        }
      }
    }
    try {
      const results = await fetchObjects(queries.listCollections, myFilter);
      items = results.data.listCollections.items;
      nextToken = results.data.listCollections.nextToken;
    } catch (error) {
      console.error(`Error fetching all collections: ${error}`);
    }
    if (items) {
      collections = collections.concat(items);
    }
  } while (nextToken);
  return collections;
};

const fetchObjects = async (
  gqlQuery,
  { filter, sort, limit, nextToken, otherArgs }
) => {
  const Objects = await API.graphql(
    graphqlOperation(gqlQuery, {
      filter: filter,
      sort: sort,
      limit: limit,
      nextToken: nextToken,
      ...otherArgs
    })
  );
  return Objects;
};

const getCollectionIDByTitle = async (title) => {
  const Results = await API.graphql(
    graphqlOperation(queries.searchCollections, {
      order: "ASC",
      limit: 1,
      filter: {
        title: {
          eq: title
        }
      }
    })
  );
  let id = null;
  try {
    id = Results.data.searchCollections.items[0].id;
  } catch (error) {
    console.error(`Error getting id for collection title: ${title}`);
  }
  return id;
};

export const getPodcastCollections = async () => {
  let items = null;
  const results = await API.graphql(
    graphqlOperation(queries.searchCollections, {
      order: "ASC",
      filter: {
        collection_category: {
          eq: "podcasts"
        }
      }
    })
  );
  try {
    items = results.data.searchCollections.items;
  } catch (error) {
    console.error(`Error getting podcast collections`);
  }
  return items;
};

export const getParentCollectionForItem = async (item) => {
  let collection = null;
  let response = null;

  try {
    if (item?.parent_collection && item?.parent_collection.length > 0) {
      response = await API.graphql(
        graphqlOperation(queries.getCollection, {
          id: item.parent_collection[0]
        })
      );
    }
  } catch (error) {
    console.error(error);
    console.error(`Error getting collection for item: ${item.id}`);
  }
  if (response) {
    try {
      collection = response.data.getCollection;
    } catch (error) {
      console.error(`Error getting collection for item: ${item.id}`);
    }
  }
  return collection;
};

export const getTopLevelParentForCollection = async (collection) => {
  const topLevelId = collection.heirarchy_path[0];
  let retVal = null;
  let response = null;

  try {
    response = await API.graphql(
      graphqlOperation(queries.getCollection, {
        id: topLevelId
      })
    );
  } catch (error) {
    console.error(`Error fetching top level parent for: ${collection.id}`);
  }
  try {
    retVal = response.data.getCollection;
  } catch (error) {
    console.error(
      `Error parsing response, querying top level parent of: ${collection.id}`
    );
  }

  return retVal;
};

export const fetchHeirarchyPathMembers = async (collection) => {
  let retVal = null;
  const orArray = [];
  for (var idx in collection.heirarchy_path) {
    orArray.push({ id: { eq: collection.heirarchy_path[idx] } });
  }
  const response = await API.graphql(
    graphqlOperation(queries.searchCollections, {
      filter: { or: orArray }
    })
  );
  try {
    retVal = response.data.searchCollections.items;
  } catch (error) {
    console.error(`Error getting heirarchy path for: ${collection.id}`);
  }

  return retVal;
};

export const getSite = async () => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE.toLowerCase();
  const apiData = await API.graphql({
    query: queries.siteBySiteId,
    variables: { siteId: REP_TYPE, limit: 1 }
  });
  const {
    data: {
      siteBySiteId: { items }
    }
  } = apiData;
  const site = items[0];
  return site;
};

export const getPageContentById = async (pageContentId) => {
  let resp = null;
  const data = await API.graphql(
    graphqlOperation(queries.getPageContent, {
      id: pageContentId
    })
  );
  try {
    resp = data.data.getPageContent.content;
  } catch {
    console.error("Error fetching page contents");
  }
  return resp;
};

export const getArchiveByIdentifier = async (identifier) => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE.toLowerCase();
  const apiData = await API.graphql({
    query: queries.archiveByIdentifier,
    variables: {
      identifier: identifier,
      filter: {
        item_category: { eq: REP_TYPE }
      },
      limit: 1
    }
  });
  const {
    data: {
      archiveByIdentifier: { items }
    }
  } = apiData;
  const archive = items[0];
  return archive;
};

export const getCollectionByIdentifier = async (identifier) => {
  const REP_TYPE = process.env.REACT_APP_REP_TYPE.toLowerCase();
  const apiData = await API.graphql({
    query: queries.collectionByIdentifier,
    variables: {
      identifier: identifier,
      filter: {
        collection_category: { eq: REP_TYPE }
      },
      limit: 1
    }
  });
  const {
    data: {
      collectionByIdentifier: { items }
    }
  } = apiData;
  const collection = items[0];
  return collection;
};

export const getCollectionItems = async (
  collectionID,
  sortOpt,
  limit,
  nextToken
) => {
  const queryGetCollectionItems = `query SearchCollectionItems(
      $parent_id: String!
      $limit: Int
      $sort: [SearchableArchiveSortInput]
      $nextToken: String
    ) {
    searchArchives(
      filter: {
        heirarchy_path: { eq: $parent_id },
        visibility: { eq: true }
      },
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        title
        archiveOptions
        description
        start_date
        thumbnail_path
        custom_key
        identifier
        description
        tags
        creator
      }
      total
      nextToken
    }
  }`;
  const items = await API.graphql(
    graphqlOperation(queryGetCollectionItems, {
      parent_id: collectionID,
      limit: limit,
      sort: [{ field: sortOpt.field, direction: sortOpt.direction }],
      nextToken: nextToken
    })
  );
  return items.data.searchArchives;
};

export const getCollectionMap = async (mapIdentifier) => {
  try {
    const response = await API.graphql(
      graphqlOperation(queries.getCollectionmap, {
        id: mapIdentifier
      })
    );
    return response.data.getCollectionmap.map_object;
  } catch (error) {
    console.error("Error fetching collection tree map");
  }
  return null;
};

export const getCollectionFromCustomKey = async (customKey) => {
  const options = {
    order: "ASC",
    limit: 1,
    filter: {
      collection_category: {
        eq: process.env.REACT_APP_REP_TYPE.toLowerCase()
      },
      visibility: { eq: true },
      custom_key: {
        matchPhrase: customKey
      }
    }
  };
  try {
    const response = await API.graphql(
      graphqlOperation(queries.searchCollections, options)
    );
    return response.data.searchCollections.items[0];
  } catch (error) {
    console.error(`Error fetching collection: ${customKey}`);
  }
  return null;
};
