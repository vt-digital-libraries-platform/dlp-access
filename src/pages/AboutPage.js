import { Component } from "react";
import { Helmet } from "react-helmet";
import ContactSection from "../components/ContactSection";
import SiteTitle from "../components/SiteTitle";
import { getFileContent, getPageContentById } from "../lib/fetchTools";
import { cleanHTML } from "../lib/MetadataRenderer";
import { buildHeaderSchema } from "../lib/richSchemaTools";

import "../css/AboutPage.scss";
import "../css/Editor.scss";

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

  getGitCommitHash() {
    const fullGitCommitHash = process.env.REACT_APP_GIT_COMMIT;
    if (!fullGitCommitHash) {
      return null;
    }
    return fullGitCommitHash.length > 8
      ? fullGitCommitHash.substring(0, 7)
      : fullGitCommitHash;
  }

  render() {
    const title = "About ".concat(this.props.site.siteTitle);
    const gitCommitHash = this.getGitCommitHash();

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
              {gitCommitHash && (
                <>
                  <h2>Software Version</h2>
                  <p>
                    This website is running{" "}
                    <a
                      href={`https://github.com/vt-digital-libraries-platform/dlp-access/commit/${gitCommitHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      commit {gitCommitHash} of the vtdlp-access project
                    </a>
                    .
                  </p>
                </>
              )}
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
