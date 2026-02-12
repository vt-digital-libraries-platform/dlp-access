import React, { Component } from "react";
import SiteTitle from "../components/SiteTitle";
import ContactSection from "../components/ContactSection";
import { getFileContent, getPageContentById } from "../lib/fetchTools";
import { cleanHTML } from "../lib/MetadataRenderer";

import "../css/TermsPage.scss";
import "../css/Editor.scss";
class PermissionsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: ""
    };
  }

  componentDidMount() {
    const page = JSON.parse(this.props.site.sitePages)[this.props.parentKey];
    const { data_url, useDataUrl, pageContentId } = page;
    if (data_url && useDataUrl) {
      getFileContent(data_url, "html", this);
    } else if (pageContentId) {
      getPageContentById(pageContentId).then((resp) => {
        this.setState({
          copy: resp
        });
      });
    }
  }

  render() {
    let download = "";
    try {
      download = JSON.parse(this.props.site.sitePages)[this.props.parentKey]
        .assets.download;
    } catch (error) {
      console.log("no download link specified");
    }
    return (
      <div className="container">
        <div className="row terms-page-wrapper">
          <div className="col-12 terms-heading">
            <SiteTitle
              siteTitle={this.props.site.siteTitle}
              pageTitle="Permissions"
            />
            <h1 id="permissions-heading">Permissions</h1>
          </div>
          <div
            className="col-md-8"
            role="region"
            aria-labelledby="permissions-heading"
          >
            <div className="terms-details quill-styles">
              {cleanHTML(this.state.copy, "page")}
            </div>
          </div>
          <div className="col-md-4 contact-section-wrapper">
            <ContactSection
              siteDetails={this.props.site}
              site={this.props.site}
            />
            {download ? (
              <div role="region" aria-labelledby="terms-downloads-section">
                <h2
                  className="terms-downloads-heading"
                  id="terms-downloads-section"
                >
                  Downloadable forms
                </h2>
                <a href={download}>Permission form for image reproductions</a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default PermissionsPage;
