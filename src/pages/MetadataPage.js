import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { SiteTitle } from "../components/SiteTitle";
import { buildHeaderSchema } from "../lib/richSchemaTools";
import { generateMetadataFields } from "../lib/schemaParser";

import "../css/Editor.scss";
import "../css/MetadataPage.scss";

class MetadataPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: ""
    };
  }

  handleSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value });
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
      <div className="container">
        <div className="row metadata-page-wrapper">
          <div className="col-12 metadata-heading">
            <SiteTitle siteTitle={siteTitle} pageTitle="Metadata Guide" />
            <h1 id="metadata-heading">{title}</h1>
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
            >
              <title>
                {title} | {siteTitle}
              </title>
              <meta
                name="description"
                content="Comprehensive metadata field guide for digital collections"
              />
            </Helmet>
          </div>

          <div className="col-12">
            <div className="metadata-content">
              <p className="lead metadata-intro">
                This guide provides detailed information about metadata fields
                used in the digital library platform. Fields marked as
                "Required" are mandatory. This is for basic metadata fields but
                for more complex metadata schemas (e.g., 3D objects) please
                contact digitallibraries@vt.edu.
              </p>

              <div className="metadata-table-header">
                <h2 id="metadata-table-heading">Metadata Field Reference</h2>
                <div className="button-group">
                  <div className="search-box-wrapper">
                    <input
                      type="search"
                      className="field-search-input"
                      placeholder="Search metadata fields"
                      value={this.state.searchQuery}
                      onChange={this.handleSearchChange}
                    />
                  </div>
                  <button
                    className="btn btn-primary download-csv-btn"
                    onClick={() => this.downloadCSV(metadataFields)}
                    aria-label="Download metadata field reference as CSV"
                  >
                    <span aria-hidden="true">⬇</span> Download CSV
                  </button>
                </div>
              </div>

              <div className="table-responsive metadata-table-section">
                <table className="metadata-table" tabIndex="0" role="table">
                  <caption>
                    Comprehensive metadata field reference table with column
                    names, label names, data types, descriptions, and examples
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
                  <tbody>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MetadataPage;
