import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { API, graphqlOperation } from "aws-amplify";
import PDFViewer from "../../components/PDFViewer";
import { KalturaPlayer } from "../../components/KalturaPlayer";
import { MinervaPlayer } from "../../components/MinervaPlayer";
import MiradorViewer from "../../components/MiradorViewer";
import { OBJModel } from "react-3d-viewer";
import { ThreeD2DiiifHandler } from "../../components/ThreeD2DiiifHandler";
import { MediaElement } from "../../components/MediaElement";
import SearchBar from "../../components/SearchBar";
import Breadcrumbs from "../../components/Breadcrumbs.js";
import SiteTitle from "../../components/SiteTitle";
import {
  RenderItemsDetailed,
  addNewlineInDesc
} from "../../lib/MetadataRenderer";
import {
  fetchLanguages,
  getTopLevelParentForCollection
} from "../../lib/fetchTools";
import { buildRichSchema } from "../../lib/richSchemaTools";
import { searchArchives } from "../../graphql/queries";
import RelatedItems from "../../components/RelatedItems";
import { Thumbnail } from "../../components/Thumbnail";
import MtlElement from "../../components/MtlElement";
import X3DElement from "../../components/X3DElement";
import SocialButtons from "../../components/SocialButtons";
import ReactGA from "react-ga4";
import CollapsibleCard from "../../components/CollapsibleCards";

import "../../css/ArchivePage.scss";
import { NotFound } from "../NotFound";
import BabylonElement from "src/components/BabylonElement";

class ArchivePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      parentCollection: null,
      collectionCustomKey: "",
      page: 0,
      category: "archive",
      searchField: "all",
      view: "Gallery",
      info: {},
      languages: null,
      isError: false
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.getArchive(this.props.customKey);
    }
  }

  componentDidMount() {
    fetchLanguages(this, this.props.site, "abbr");
    this.getArchive(this.props.customKey);
  }

  async getArchive(customKey) {
    const options = {
      order: "ASC",
      limit: 1,
      filter: {
        item_category: { eq: process.env.REACT_APP_REP_TYPE.toLowerCase() },
        visibility: { eq: true },
        custom_key: {
          eq: `ark:/53696/${this.props.customKey}`
        }
      }
    };
    const response = await API.graphql(
      graphqlOperation(searchArchives, options)
    );
    try {
      const item = response.data.searchArchives.items[0];
      const topLevelParentCollection = await getTopLevelParentForCollection(
        item
      );

      const collectionCustomKey = topLevelParentCollection.custom_key;
      const archiveSchema = this.buildArchiveSchema(item);
      this.setState({
        item: item,
        collectionCustomKey: collectionCustomKey,
        parentCollection: topLevelParentCollection,
        info: archiveSchema
      });
    } catch (error) {
      console.error(`Error fetching item: ${customKey}`);
      this.setState({
        isError: true
      });
    }
  }

  updateFormState = (name, val) => {
    this.setState({
      [name]: val
    });
  };

  setPage = (page) => {
    this.setState({ page: page });
  };

  isImgURL(url) {
    let match = false;
    try {
      match = url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    } catch (error) {
      console.log("probs not an img");
    }
    return match;
  }

  isAudioURL(url) {
    return url.match(/\.(mp3|ogg|wav)$/) != null;
  }

  isVideoURL(url) {
    return url.match(/\.(mp4|mov)$/) != null;
  }

  isKalturaURL(url) {
    return url.match(/(video.vt.edu\/media)/) != null;
  }

  isPdfURL(url) {
    return url.match(/\.(pdf)$/) != null;
  }

  isMiradorURL(url, item = null) {
    let has_3d = false;
    if (item) {
      has_3d = this.is3D_2DiiifType(item);
    }
    let match = false;
    try {
      match = url.match(/(\/manifest.json)$/) != null;
    } catch (error) {
      return false;
    }
    return !has_3d && match;
  }

  isMinervaURL(url) {
    let match = false;
    try {
      match = url.match(/(\/exhibit.json)$/) != null;
    } catch (error) {
      return false;
    }
    return match;
  }

  isObjURL(url) {
    return url.match(/\.(obj|OBJ)$/) != null;
  }

  isMtlUrl(url) {
    return url.match(/\.(mtl)$/) != null;
  }

  isX3DUrl(url) {
    return url.match(/\.(x3d|X3D)$/) != null;
  }
  isGLTFUrl(url) {
    return url.match(/\.(gltf|GLTF|glb|GLB)$/) != null;
  }

  is3D_2DiiifType(item) {
    try {
      const options = JSON.parse(item.archiveOptions);
      return (
        item.format.indexOf("model/x3d") !== -1 &&
        !!options.assets.x3d_config &&
        !!options.assets.x3d_src_img
      );
    } catch (error) {
      return false;
    }
  }

  isGLTFType(item) {
    let match = false;
    try {
      const options = JSON.parse(item.archiveOptions);
      const type = options.assets.media_type;
      match =
        type === "3d-model/gltf" &&
        !!options.assets.gltf_config &&
        !!options.assets.env_config;
    } catch (error) {
      return false;
    }
    return match;
  }

  buildArchiveSchema(item) {
    let info = {};
    info["audio"] = item.manifest_url;
    let collectionURL = window.location.href.replace("archive", "collection");
    let collectionNoid = this.state.collectionCustomKey.replace(
      "ark:/53696/",
      ""
    );

    info["collectionURL"] =
      collectionURL.substring(0, collectionURL.length - 8) + collectionNoid;
    info["datePublished"] = item.create_date;
    info["description"] = item.description;
    if (item.manifest_file_characterization) {
      const characterization = JSON.parse(item.manifest_file_characterization);
      info["duration"] = characterization.duration;
    }
    info["title"] = item.title;
    info["url"] = window.location.href;

    return info;
  }

  mediaDisplay(item) {
    let display = null;
    let width = Math.min(
      document.getElementById("content-wrapper").offsetWidth - 50,
      720
    );

    if (this.isGLTFType(item)) {
      let options = {};
      try {
        options = JSON.parse(item.archiveOptions);
      } catch (error) {
        display = null;
      }
      // options.assets.env_config
      display = (
        <div className="image-wrapper" id="image-wrapper">
          <BabylonElement
            model={options.assets.gltf_config}
            env={options.assets.env_config}
          />
        </div>
      );
    } else if (this.is3D_2DiiifType(item)) {
      display = (
        <ThreeD2DiiifHandler
          item={item}
          frameWidth={width}
          frameHeight={width}
          site={this.props.site}
        />
      );
    } else if (this.isMiradorURL(item.manifest_url, item)) {
      display = <MiradorViewer item={item} site={this.props.site} />;
    } else if (this.isMinervaURL(item.manifest_url)) {
      display = <MinervaPlayer item={item} site={this.props.site} />;
    } else if (this.isImgURL(item.manifest_url)) {
      display = (
        <Thumbnail
          className="item-img"
          item={item}
          imgURL={item.manifest_url}
          altText={item.title}
          site={this.props.site}
        />
      );
    } else if (this.isAudioURL(item.manifest_url)) {
      const transcript = item.archiveOptions
        ? JSON.parse(item.archiveOptions)
        : null;
      display = (
        <MediaElement
          src={item.manifest_url}
          mediaType="audio"
          site={this.props.site}
          poster={item.thumbnail_path}
          title={item.title}
          transcript={transcript ? transcript?.audioTranscript : null}
          isPodcast={this.state.item?.type?.find((item) => item === "podcast")}
        />
      );
    } else if (this.isVideoURL(item.manifest_url)) {
      display = (
        <MediaElement
          src={item.manifest_url}
          mediaType="video"
          site={this.props.site}
          poster={item.thumbnail_path}
        />
      );
    } else if (this.isKalturaURL(item.manifest_url)) {
      display = <KalturaPlayer manifest_url={item.manifest_url} />;
    } else if (this.isPdfURL(item.manifest_url)) {
      display = (
        <PDFViewer manifest_url={item.manifest_url} title={item.title} />
      );
    } else if (this.isObjURL(item.manifest_url)) {
      const texPath = item.manifest_url.substring(
        0,
        item.manifest_url.lastIndexOf("/") + 1
      );
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <OBJModel src={item.manifest_url} texPath={texPath} />
        </div>
      );
    } else if (this.isMtlUrl(item.manifest_url)) {
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <MtlElement mtl={item.manifest_url} />
        </div>
      );
    } else if (this.isX3DUrl(item.manifest_url)) {
      display = (
        <div
          className="obj-wrapper"
          style={{ width: `${width}px`, height: "100px" }}
        >
          <X3DElement
            url={item.manifest_url}
            frameSize={width}
            frameHeight={100}
          />
        </div>
      );
    } else {
      display = <></>;
    }
    return display;
  }

  fileExtensionFromFileName(filename) {
    return filename.split(".")[1];
  }

  findResourceType() {
    if (
      this.state.item.type &&
      this.state.item.type.find((item) => item === "podcast")
    ) {
      return "PodcastEpisode";
    } else {
      return "Unknown";
    }
  }

  render() {
    if (this.state.isError) {
      return <NotFound />;
    }
    if (
      this.state.languages &&
      this.state.item &&
      this.state.collectionCustomKey
    ) {
      // log archive identifier in ga
      ReactGA.send({
        hitType: "pageview",
        page: window.location.href,
        title: this.state.item.identifier
      });
      return (
        <div className="item-page-wrapper">
          <SiteTitle
            siteTitle={this.props.site.siteTitle}
            pageTitle={this.state.item.title}
          />
          <Helmet
            script={[
              { type: "text/javascript" },
              {
                type: "application/ld+json",
                innerHTML: buildRichSchema(
                  this.findResourceType(),
                  this.state.info
                )
              }
            ]}
          ></Helmet>
          <SearchBar
            category={this.state.category}
            view={this.state.view}
            field={this.state.searchField}
            setPage={this.setPage}
            updateFormState={this.updateFormState}
          />

          <div className="item-image-section">
            <div className="breadcrumbs-wrapper">
              <nav aria-label="Collection breadcrumbs">
                <Breadcrumbs category={"Archives"} record={this.state.item} />
              </nav>
            </div>
            <div id="dataContainer" className="row">
              <div
                id="item-media-col"
                className="item-media-section col-sm-12 col-md-12 col-lg-8"
                role="region"
                aria-label="Item media"
              >
                {this.mediaDisplay(this.state.item)}
              </div>

              <div
                id="metaDataView"
                className="item-details-section col-sm-12 col-md-12 col-lg-4"
              >
                <div>
                  <h2>{this.state.item.title}</h2>
                  <div className="item-metadata description">
                    {addNewlineInDesc(
                      this?.state?.item?.description,
                      "Description"
                    )}
                  </div>
                </div>
                <div>
                  <CollapsibleCard
                    title="About"
                    marker="about"
                    data={this.state.item}
                    defaultExpand={true}
                  />
                  <CollapsibleCard
                    title="Copyright"
                    marker="copyright"
                    data={this.state.item}
                    defaultExpand={false}
                  />
                  <CollapsibleCard
                    title="Citation"
                    marker="citation"
                    data={this.state.item}
                    site={this.props.site}
                    defaultExpand={false}
                    parentCollection={this.state.parentCollection}
                  />
                  <CollapsibleCard
                    title="Location"
                    marker="location"
                    data={this.state.item}
                    defaultExpand={false}
                  />
                </div>
              </div>
            </div>
          </div>
          <RelatedItems collection={this.state.item} site={this.props.site} />
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default ArchivePage;
