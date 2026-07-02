import { Component } from "react";
import { Helmet } from "react-helmet";
import ContactSection from "../components/ContactSection";
import { SiteTitle } from "../components/SiteTitle";
import { getFileContent, getPageContentById } from "../lib/fetchTools";
import { cleanHTML } from "../lib/MetadataRenderer";
import { buildHeaderSchema } from "../lib/richSchemaTools";

import "../css/Typography.scss";
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
      <>
        <SiteTitle
          data={{ title: "About" }}
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
                "AboutPage",
                window.location.href,
                title
              )
            }
          ]}
        ></Helmet>
        <div className="container typography-wrapper secondary-page">
          <h1>{title}</h1>
          <div className="row">
            <div className="col-lg-8 mb-5">
              {cleanHTML(this.state.copy, "page")}
            </div>
            <div className="col-lg-4 mb-5 about-contact-section-wrapper">
              <div className="surface-round-gray vertical-flex">
                <ContactSection site={this.props.site} />
                {JSON.parse(this.props.site.sitePages)["terms"] ? (
                  <div>
                    <h2>Permissions</h2>
                    <p>
                      <span>Go to our </span>
                      <a href="/permissions">permissions page</a>
                      <span>.</span>
                    </p>
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

export default AboutPage;
