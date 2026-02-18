import React, { Component } from "react";
import { Helmet } from "react-helmet";
import SiteTitle from "../components/SiteTitle";
import ContactSection from "../components/ContactSection";
import { getFileContent, getPageContentById } from "../lib/fetchTools";
import { buildHeaderSchema } from "../lib/richSchemaTools";
import { cleanHTML } from "../lib/MetadataRenderer";

import "../css/Editor.scss";
import "../css/AboutPage.scss";

class AboutPage extends Component {
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
    const title = "About ".concat(this.props.site.siteTitle);

    return (
      <div className="container">
        <div className="row about-page-wrapper">
          <div className="col-12 about-heading">
            <SiteTitle
              siteTitle={this.props.site.siteTitle}
              pageTitle="About"
            />
            <h1 id="about-heading">{title}</h1>
            <Helmet
              script={[
                { type: "text/javascript" },
                {
                  type: "application/ld+json",
                  innerHTML: buildHeaderSchema(
                    "Article",
                    "AboutPage",
                    window.location.href,
                    title
                  )
                }
              ]}
            ></Helmet>
          </div>
          <div
            className="col-md-8"
            role="region"
            aria-labelledby="about-heading"
          >
            <div className="about-details quill-styles">
              {cleanHTML(this.state.copy, "page")}
            </div>
          </div>
          <div className="col-md-4 contact-section-wrapper">
            <ContactSection site={this.props.site} />
            {JSON.parse(this.props.site.sitePages)["terms"] ? (
              <a href="/permissions" className="about-terms-link">
                Permissions
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default AboutPage;
