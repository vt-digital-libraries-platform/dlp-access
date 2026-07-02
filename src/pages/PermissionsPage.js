import React, { Component } from "react";
import { SiteTitle } from "../components/SiteTitle";
import ContactSection from "../components/ContactSection";
import { getFileContent, getPageContentById } from "../lib/fetchTools";
import { cleanHTML } from "../lib/MetadataRenderer";

import "../css/Typography.scss";
import "../css/AboutPage.scss";
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
      <>
        <SiteTitle
          data={{ title: "Permissions" }}
          site={this.props.site}
          template="{{title}}"
        />
        <div className="container typography-wrapper secondary-page">
          <h1>Permissions</h1>
          <div className="row">
            <div className="col-lg-8 mb-5">
              {cleanHTML(this.state.copy, "page")}
            </div>
            <div className="col-lg-4 mb-5 about-contact-section-wrapper">
              <div className="surface-round-gray vertical-flex">
                <ContactSection
                  siteDetails={this.props.site}
                  site={this.props.site}
                />
                {download ? (
                  <div>
                    <h2>Downloadable forms</h2>
                    <a href={download}>
                      Permission form for image reproductions
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default PermissionsPage;
