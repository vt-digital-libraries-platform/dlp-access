import React, { Component } from "react";
import {
  fetchSignedLink,
  getFileContent,
  getPageContentById
} from "../lib/fetchTools";
import { cleanHTML } from "../lib/MetadataRenderer";
import { SiteTitle } from "../components/SiteTitle";

import "../css/AdditionalPages.scss";
import "../css/Editor.scss";
import "../css/Typography.scss";

class AdditionalPages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: "",
      allowScripts: false,
      scriptAssetsLoaded: false,
      main: null
    };
  }

  loadContent = async () => {
    let copyObj = JSON.parse(this.props.site.sitePages)[this.props.parentKey];
    if (copyObj.children && this.props.childKey) {
      copyObj = copyObj.children[this.props.childKey];
    }
    const { allowScripts, data_url, useDataUrl, pageContentId, scriptAssets } =
      copyObj;
    let resp = null;
    if (data_url && useDataUrl) {
      resp = await getFileContent(data_url, "html");
    } else if (pageContentId) {
      resp = await getPageContentById(pageContentId);
    }
    this.setState(
      {
        allowScripts: !!allowScripts,
        copy: resp
      },
      () => {
        if (this.state.allowScripts && scriptAssets) {
          this.loadAssets(scriptAssets);
        }
      }
    );
  };

  loadAssets = async (assets) => {
    for (const link in assets.links) {
      const linkText = assets.links[link];
      const linkTag = document.createElement("link");
      linkTag.rel = "stylesheet";
      linkTag.href = linkText;
      linkTag.id = `link-${link}`;
      document.head.appendChild(linkTag);
    }
    for (const script in assets.scripts) {
      const scriptText = assets.scripts[script];
      const scriptTag = document.createElement("script");
      scriptTag.type = "text/javascript";
      scriptTag.src = scriptText;
      scriptTag.id = `script-${script}`;
      document.head.appendChild(scriptTag);
    }
    const mainScript = document.createElement("script");
    mainScript.type = "text/javascript";
    const mainSrc = await fetchSignedLink(assets.mainScript);
    mainScript.src = mainSrc.data;
    mainScript.id = `script-main`;
    // ensure that script assets are present before loading main script
    this.setState({ scriptAssetsLoaded: true, main: mainScript }, () => {
      this.loadMainScript();
    });
  };

  loadMainScript = () => {
    if (this.state.allowScripts && this.state.main) {
      document.body.appendChild(this.state.main);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.parentKey !== prevProps.parentKey) {
      this.loadContent();
    }
  }

  componentDidMount() {
    this.loadContent();
  }

  getPageCopy() {
    if (this.state.allowScripts) {
      if (this.state.scriptAssetsLoaded) {
        return <div dangerouslySetInnerHTML={{ __html: this.state.copy }} />;
      }
    } else {
      return cleanHTML(this.state.copy, "page");
    }
    return null;
  }

  render() {
    return (
      <>
        <SiteTitle
          data={{ title: this.props.title || "Additional Pages" }}
          site={this.props.site}
          template="{{title}}"
        />
        <div className="container quill-styles typography-wrapper secondary-page">
          {this.getPageCopy()}
        </div>
      </>
    );
  }
}

export default AdditionalPages;
