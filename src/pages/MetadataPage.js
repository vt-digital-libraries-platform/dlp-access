import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { API, graphqlOperation } from "aws-amplify";
import { SiteTitle } from "../components/SiteTitle";
import { buildHeaderSchema } from "../lib/richSchemaTools";
import { listMetadataFields } from "../graphql/queries";
import metadataFieldInfo from "../data/metadataFieldInfo.json";

import "../css/Editor.scss";
import "../css/MetadataPage.scss";
import "../css/Typography.scss";

class MetadataPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      resultsMessage: "",
      metadataFields: [],
      loading: true,
      error: null
    };
  }

  async componentDidMount() {
    try {
      let allItems = [];
      let nextToken = null;
      do {
        const result = await API.graphql(
          graphqlOperation(listMetadataFields, {
            limit: 500,
            nextToken
          })
        );
        const { items, nextToken: newToken } = result.data.listMetadataFields;
        allItems = allItems.concat(items);
        nextToken = newToken;
      } while (nextToken);

      // Sort by sortOrder if present, then alphabetically by columnName
      allItems.sort((a, b) => {
        if (a.sortOrder != null && b.sortOrder != null)
          return a.sortOrder - b.sortOrder;
        if (a.sortOrder != null) return -1;
        if (b.sortOrder != null) return 1;
        return a.columnName.localeCompare(b.columnName);
      });

      this.setState({ metadataFields: allItems, loading: false });
    } catch (err) {
      console.error(
        "Error fetching metadata fields, falling back to static data:",
        err
      );
      const staticFields = this.buildStaticFields();
      this.setState({ metadataFields: staticFields, loading: false });
    }
  }

  buildStaticFields() {
    const bothFields = new Set([
      "alt_text",
      "archived",
      "bibliographic_citation",
      "collection",
      "create_date",
      "creator",
      "custom_key",
      "description",
      "display_date",
      "embargo_end_date",
      "embargo_note",
      "embargo_start_date",
      "end_date",
      "heirarchy_path",
      "id",
      "identifier",
      "is_part_of",
      "language",
      "location",
      "modified_date",
      "parent_collection",
      "parent_collection_identifier",
      "partner_id",
      "provenance",
      "relation",
      "rights_holder",
      "rights",
      "source",
      "spatial",
      "start_date",
      "subject",
      "thumbnail_path",
      "title",
      "title_template",
      "visibility",
      "visual_description"
    ]);
    return Object.entries(metadataFieldInfo).map(([columnName, info], idx) => ({
      id: columnName,
      columnName,
      labelName: info.labelName,
      type: info.type,
      required: info.required,
      description: info.description,
      example: info.example,
      category: info.labelName.includes("(Collection)")
        ? "Collection"
        : bothFields.has(columnName)
        ? "Both"
        : "Archive",
      sortOrder: idx + 1
    }));
  }

  handleSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value }, () => {
      this.setState({
        resultsMessage:
          document.getElementById("metadata-table-body").childElementCount <= 0
            ? "No metadata fields match your search criteria."
            : ""
      });
    });
  };

  downloadCSV = (metadataFields) => {
    // Create CSV where each field is a column instead of a row
    const columnNames = metadataFields.map((field) => field.columnName);
    const labelNames = metadataFields.map((field) =>
      field.required === "Yes"
        ? `${field.labelName} (Required)`
        : field.required === "Conditional"
        ? `${field.labelName} (Conditional)`
        : field.labelName
    );
    const types = metadataFields.map((field) => field.type);
    const descriptions = metadataFields.map((field) => field.description);
    const examples = metadataFields.map((field) => field.example);

    // Create rows with property name as first column, then all field values
    const rows = [
      ["Metadata Column Name", ...columnNames],
      ["Label Name", ...labelNames],
      ["Type", ...types],
      ["Description", ...descriptions],
      ["Example", ...examples]
    ];

    // Combine rows into CSV content
    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "metadata_field_reference.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  render() {
    const title = "Metadata Guide";
    const siteTitle = this.props.site
      ? this.props.site.siteTitle
      : "Digital Library";

    const { metadataFields, loading, error } = this.state;

    return (
      <>
        <SiteTitle
          data={{ title: "Metadata Guide" }}
          site={this.props.site}
          template="{{title}}"
        />
        <Helmet
          script={[
            { type: "text/javascript" },
            {
              type: "application/ld+json",
              innerHTML: buildHeaderSchema(
                "Article",
                "MetadataPage",
                window.location.href,
                siteTitle
              )
            }
          ]}
        ></Helmet>
        <meta
          name="description"
          content="Comprehensive metadata field guide for digital collections"
        />
        <div className="container metadata-page-wrapper typography-wrapper">
          <h1>{title}</h1>
          {loading && <p>Loading metadata fields...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
            <div>
              <div className="metadata-intro">
                <p className="lead">
                  This guide provides detailed information about metadata fields
                  used in the digital library platform. Fields marked as
                  "Required" are mandatory. This is for basic metadata fields
                  but for more complex metadata schemas (e.g., 3D objects)
                  please contact{" "}
                  <a href="mailto:digitallibraries@vt.edu">
                    digitallibraries@vt.edu
                  </a>
                  .
                </p>
                <button
                  className="button-link--primary download-csv-btn focusable"
                  role="link"
                  onClick={() => this.downloadCSV(metadataFields)}
                >
                  <span className="sr-only">
                    Download metadata field reference as CSV
                  </span>
                  <span aria-hidden="true">⬇ Download CSV</span>
                </button>
              </div>
              <h2 id="metadata-table-heading">Metadata Field Reference</h2>
              <search>
                <h3>Search Metadata Fields</h3>
                <input
                  type="search"
                  className="field-search-input"
                  aria-labelledby="metadata-search-input-label"
                  value={this.state.searchQuery}
                  onChange={this.handleSearchChange}
                />
                <p id="metadata-search-input-label">
                  Search by name, label, type, or description. Results will be
                  filtered as you type.
                </p>
                <h3>Results</h3>
                <section className="table-responsive metadata-table-section">
                  <table className="metadata-table" tabIndex="0" role="table">
                    <caption className="sr-only">
                      Metadata field reference table with column names, label
                      names, data types, descriptions, and examples
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Metadata Column Name</th>
                        <th scope="col">Label Name</th>
                        <th scope="col">Type</th>
                        <th scope="col">Description</th>
                        <th scope="col">Example</th>
                      </tr>
                    </thead>
                    <tbody id="metadata-table-body">
                      {metadataFields
                        .filter((field) => {
                          const query = this.state.searchQuery.toLowerCase();
                          return (
                            query === "" ||
                            field.columnName.toLowerCase().includes(query) ||
                            field.labelName.toLowerCase().includes(query) ||
                            field.type.toLowerCase().includes(query) ||
                            (field.required === "Yes" &&
                              "required".includes(query)) ||
                            (field.required === "Conditional" &&
                              "conditional".includes(query)) ||
                            field.description.toLowerCase().includes(query) ||
                            field.example.toLowerCase().includes(query)
                          );
                        })
                        .map((field, index) => (
                          <tr key={index}>
                            <th scope="row" className="column-name">
                              {field.columnName}
                              {field.required === "Yes" ? (
                                <>
                                  <br />
                                  <span className="required-indicator">
                                    (Required)
                                  </span>
                                </>
                              ) : field.required === "Conditional" ? (
                                <>
                                  <br />
                                  <span className="required-indicator conditional-indicator">
                                    (Conditional)
                                  </span>
                                </>
                              ) : null}
                            </th>
                            <td className="label-name">{field.labelName}</td>
                            <td className="type">{field.type}</td>
                            <td className="description">{field.description}</td>
                            <td className="example">
                              <code>{field.example}</code>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div
                    aria-live="assertive"
                    aria-atomic="true"
                    id="no-results-live-region"
                  >
                    {this.state.resultsMessage}
                  </div>
                </section>
              </search>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default MetadataPage;
