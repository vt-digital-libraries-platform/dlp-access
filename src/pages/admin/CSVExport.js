import React, { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import { csv_metadataFields } from "../../lib/available_attributes";
import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../../graphql/queries.js";
import { Checkbox, Button, Form } from "semantic-ui-react";

const REP_TYPE = process.env.REACT_APP_REP_TYPE.toLowerCase();

const GetCollections = `query searchCollections(
  $filter: String
  $nextToken: String
) {
  searchCollections(
    filter: {
      project: {
        eq: $filter
      }
    },
    sort: {
      direction: asc,
      field: identifier
    },
    nextToken: $nextToken
  ) {
    items {
      ${csv_metadataFields.collection}
    }
    nextToken
  }
}`;

const GetArchives = `query searchArchives(
  $filter: SearchableArchiveFilterInput
  $nextToken: String
) {
  searchArchives(
    filter: $filter,
    sort: {
      direction: asc,
      field: identifier
    },
    nextToken: $nextToken
  ) {
    items {
      ${csv_metadataFields.archive}
    }
    nextToken
  }
}`;

function CSVExport() {
  const [allCollections, setAllCollections] = useState(null);
  const [searches, setSearches] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [visibleLink, setVisibleLink] = useState(false);

  const getCollections = async () => {
    let nextToken = "";
    let results = [];
    do {
      const collections = await API.graphql(
        graphqlOperation(GetCollections, {
          filter: REP_TYPE,
          nextToken: nextToken
        })
      );
      results.push(...collections.data.searchCollections.items);
      nextToken = collections.data.searchCollections.nextToken;
    } while (nextToken);
    return results;
  };

  const getItems = async (filter) => {
    let searchResults = [];
    let nextToken = null;
    do {
      const archives = await API.graphql(
        graphqlOperation(GetArchives, {
          filter: filter,
          nextToken: nextToken
        })
      );
      searchResults.push(...archives.data.searchArchives.items);
      nextToken = archives.data.searchArchives.nextToken;
    } while (nextToken);
    return searchResults;
  };

  useEffect(() => {
    async function load() {
      let nextToken = "";
      let results = [];
      do {
        const collections = await API.graphql(
          graphqlOperation(queries.searchCollections, {
            filter: {
              project: {
                eq: REP_TYPE
              }
            },
            nextToken: nextToken
          })
        );
        results.push(...collections.data.searchCollections.items);
        nextToken = collections.data.searchCollections.nextToken;
      } while (nextToken);
      setAllCollections(results);
    }
    load();
  }, []);

  const handleCheck = (id) => {
    let arr = [];
    if (searches.length > 0 && searches.includes(id)) {
      arr = searches.filter((el) => el !== id);
      setSearches(arr);
    } else {
      if (id === "allItems" || id === "allCollections") {
        setSearches([id]);
      } else {
        arr = searches.filter(
          (el) => el !== "allItems" && el !== "allCollections"
        );
        arr.push(id);
        setSearches(arr);
      }
    }
  };

  const getLinks = () => {
    const links = allCollections.map((col) => {
      if (col.parent_collection_identifier === null) {
        return (
          <div key={col.identifier}>
            <Checkbox
              label={`Download CSV for all items in ${col.title}`}
              onChange={() => handleCheck(col.id)}
              checked={searches.includes(col.id)}
              value={col.id}
            ></Checkbox>
          </div>
        );
      } else {
        return <React.Fragment key={col.identifier}></React.Fragment>;
      }
    });
    return links;
  };

  const getCSV = () => {
    let filter = null;
    if (searches.includes("allCollections")) {
      getCollections().then((resp) => {
        setCsvData(resp);
        setVisibleLink(true);
      });
    } else if (searches.includes("allItems")) {
      filter = {
        project: { eq: REP_TYPE }
      };
      getItems(filter).then((resp) => {
        setCsvData(resp);
        setVisibleLink(true);
      });
    } else {
      let searchIds = searches.map((id) => {
        let obj = {};
        obj.heirarchy_path = { eq: id };
        return obj;
      });
      filter = {
        or: searchIds
      };
      getItems(filter).then((resp) => {
        setCsvData(resp);
        setVisibleLink(true);
      });
    }
  };

  return (
    <div className="col-lg-9 col-sm-12 admin-content">
      {allCollections ? (
        <Form id="csv_export">
          <h2>Items</h2>
          <div key="AllItems">
            <Checkbox
              label="All items"
              onChange={() => handleCheck("allItems")}
              checked={searches.includes("allItems")}
              value="allItems"
            ></Checkbox>
          </div>
          {getLinks()}
          <br />
          <h2>Collections</h2>
          <div key="AllCollections">
            <Checkbox
              label="Download CSV for all collection records"
              onChange={() => handleCheck("allCollections")}
              checked={searches.includes("allCollections")}
              value="allCollections"
            ></Checkbox>
          </div>
          <br />
          <Button
            onClick={() => {
              getCSV();
            }}
          >
            Generate CSV
          </Button>
          <br />
          <br />
          <div className={visibleLink ? "d-block" : "d-none"}>
            <CSVLink
              data={csvData}
              filename={"download.csv"}
              onClick={() => {
                setVisibleLink(false);
              }}
            >
              Download CSV file
            </CSVLink>
          </div>
        </Form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default CSVExport;
