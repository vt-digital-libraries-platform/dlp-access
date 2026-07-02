import { Component } from "react";
import { SiteTitle } from "../components/SiteTitle";
import { getFileContent, getPageContentById } from "../lib/fetchTools";
import { cleanHTML } from "../lib/MetadataRenderer";

import "../css/Editor.scss";
import "../css/Typography.scss";

class AccessibilityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: ""
    };
  }

  componentDidMount() {
    const sitePages = JSON.parse(this.props.site.sitePages);
    const page = sitePages[this.props.parentKey];
    if (!page) return;
    const { data_url, useDataUrl, pageContentId } = page;
    if (data_url && useDataUrl) {
      getFileContent(data_url, "html", this);
    } else if (pageContentId) {
      getPageContentById(pageContentId).then((resp) => {
        this.setState({ copy: resp });
      });
    }
  }

  render() {
    return (
      <>
        <SiteTitle
          data={{ title: "Accessibility" }}
          site={this.props.site}
          template="{{title}}"
        />
        <div className="container typography-wrapper secondary-page">
          <h1 id="accessibility-heading">Accessibility</h1>
          {cleanHTML(this.state.copy, "page")}
        </div>
      </>
    );
  }
}

export default AccessibilityPage;