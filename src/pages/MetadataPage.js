import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { SiteTitle } from "../components/SiteTitle";
import { buildHeaderSchema } from "../lib/richSchemaTools";
import { generateMetadataFields } from "../lib/schemaParser";

import "../css/Editor.scss";
import "../css/MetadataPage.scss";
import "../css/Typography.scss";

class MetadataPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      resultsMessage: ""
    };
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
      field.required ? `${field.labelName} (Required)` : field.labelName
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

    // Metadata field definitions dynamically generated from GraphQL schema
    const metadataFields = generateMetadataFields();

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
          <div>
            <div className="metadata-intro">
              <p className="lead">
                This guide provides detailed information about metadata fields
                used in the digital library platform. Fields marked as
                "Required" are mandatory. This is for basic metadata fields but
                for more complex metadata schemas (e.g., 3D objects) please
                contact{" "}
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
                          (field.required && "required".includes(query)) ||
                          field.description.toLowerCase().includes(query) ||
                          field.example.toLowerCase().includes(query)
                        );
                      })
                      .map((field, index) => (
                        <tr key={index}>
                          <th scope="row" className="column-name">
                            {field.columnName}
                          </th>
                          <td className="label-name">
                            {field.required ? (
                              <>
                                {field.labelName}
                                <br />
                                <span className="required-indicator">
                                  (Required)
                                </span>
                              </>
                            ) : (
                              field.labelName
                            )}
                          </td>
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
        </div>
      </>
    );
  }
}

export default MetadataPage;
