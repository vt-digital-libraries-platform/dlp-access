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
import { getTitleTemplateForType, SiteTitle } from "../../components/SiteTitle";
import {
  RenderItemsDetailed,
  addNewlineInDesc
} from "../../lib/MetadataRenderer";
import {
  fetchLanguages,
  getParentCollectionForItem,
  getTopLevelParentForCollection
} from "../../lib/fetchTools";
import { buildRichSchema } from "../../lib/richSchemaTools";
import { searchArchives } from "../../graphql/queries";
import RelatedItems from "../../components/RelatedItems";
import { Thumbnail } from "../../components/Thumbnail";
import MtlElement from "../../components/MtlElement";
import X3DElement from "../../components/X3DElement";
import ReactGA from "react-ga4";
import CollapsibleCard from "../../components/CollapsibleCards";

import "../../css/ArchivePage.scss";
import { NotFound } from "../NotFound";
import BabylonElement from "src/components/Babylon/BabylonElement";
import BabylonController from "src/components/Babylon/BabylonController";

class ArchivePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      topLevelParentCollection: null,
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
    if (this.props.customKey !== prevProps.customKey) {
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
      if (!item) {
        this.setState({
          isError: true
        });
        return;
      }
      const collection = await getParentCollectionForItem(item);
      if (!collection) {
        this.setState({
          isError: true
        });
        return;
      }
      const topLevelParentCollection = await getTopLevelParentForCollection(
        collection
      );
      if (!topLevelParentCollection) {
        this.setState({
          isError: true
        });
        return;
      }

      const collectionCustomKey = topLevelParentCollection.custom_key;
      const archiveSchema = this.buildArchiveSchema(item);
      this.setState({
        item,
        collectionCustomKey,
        topLevelParentCollection,
        info: archiveSchema,
        title_data: { item: { ...item }, collection: { ...collection } },
        title_template: getTitleTemplateForType(item, collection)
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

  parseArchiveOptions(item) {
    try {
      return JSON.parse(item.archiveOptions) || {};
    } catch (error) {
      return {};
    }
  }

  is3D_2DiiifType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      const is3D_2Diiif =
        options.assets.media_type === "3d_2diiif" && !!item.manifest_url;
      const hasX3DandTIFF =
        item.format?.indexOf("model/x3d") !== -1 &&
        item.format?.indexOf("image/tiff") !== -1;
      const hasGLTFandEnv =
        !!options.assets.gltf_config && !!options.assets.env_config;
      return is3D_2Diiif && (hasX3DandTIFF || hasGLTFandEnv);
    } catch (error) {
      return false;
    }
  }

  isX3DType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return (
        options.assets.media_type === "3d-model/x3dom" &&
        !!options.assets.x3d_config &&
        !!options.assets.x3d_src_img
      );
    } catch (error) {
      return false;
    }
  }

  isGLTFType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return (
        options.assets.media_type === "3d-model/gltf" &&
        !!options.assets.gltf_config &&
        !!options.assets.env_config
      );
    } catch (error) {
      return false;
    }
  }

  isIIIFType(item) {
    const has_3d = this.is3D_2DiiifType(item);
    let match = false;
    try {
      match = item.manifest_url.match(/(\/manifest.json)$/) != null;
    } catch (error) {
      return false;
    }
    return !has_3d && match;
  }

  isImgType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "image" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isAudioType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "audio" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isVideoType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "video" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isKalturaType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "kaltura" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isPdfType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "pdf" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isMinervaType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "minerva" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isObjType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "obj" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  isMtlType(item) {
    const options = this.parseArchiveOptions(item);
    try {
      return options.assets.media_type === "mtl" && !!options.assets.url;
    } catch (error) {
      return false;
    }
  }

  buildArchiveSchema(item) {
    let info = {};
    let collectionURL = window.location.href.replace("archive", "collection");
    let collectionNoid = this.state.collectionCustomKey.replace(
      "ark:/53696/",
      ""
    );

    info["collectionURL"] =
      collectionURL.substring(0, collectionURL.length - 8) + collectionNoid;
    info["datePublished"] = item.create_date;
    info["description"] = item.description;
    info["title"] = item.title;
    info["url"] = window.location.href;

    return info;
  }

  mediaDisplay(item) {
    const options = this.parseArchiveOptions(item);
    let display = null;
    let width = Math.min(
      document.getElementById("content-wrapper").offsetWidth - 50,
      720
    );

    if (this.is3D_2DiiifType(item)) {
      display = (
        <ThreeD2DiiifHandler
          item={item}
          frameWidth={width}
          frameHeight={width}
          site={this.props.site}
        />
      );
    } else if (this.isGLTFType(item)) {
      let scaleFactor = 0.25; // default scale factor
      if (typeof options.config?._3d?.scale_factor === "string") {
        scaleFactor = parseFloat(options.config._3d.scale_factor);
      } else if (typeof options.config?._3d?.scale_factor === "number") {
        scaleFactor = options.config._3d.scale_factor;
      }

      let rotation = {
        horizontal: 0,
        vertical: 0
      };
      if (typeof options.config?._3d?.rotation?.horizontal === "string") {
        rotation.horizontal = parseFloat(
          options.config._3d.rotation.horizontal
        );
      } else if (
        typeof options.config?._3d?.rotation?.horizontal === "number"
      ) {
        rotation.horizontal = options.config._3d.rotation.horizontal;
      }
      if (typeof options.config?._3d?.rotation?.vertical === "string") {
        rotation.vertical = parseFloat(options.config._3d.rotation.vertical);
      } else if (typeof options.config?._3d?.rotation?.vertical === "number") {
        rotation.vertical = options.config._3d.rotation.vertical;
      }
      display = (
        <div className="image-wrapper" id="image-wrapper">
          <BabylonElement
            model={options.assets.gltf_config}
            env={options.assets.env_config}
            scaleFactor={scaleFactor}
            rotation={rotation}
            item={item}
            _3dConfig={options?.config?._3d}
          />
        </div>
      );
    } else if (this.isX3DType(item)) {
      display = (
        <div className="obj-wrapper image-wrapper">
          <X3DElement
            url={options.assets?.x3d_config}
            frameSize={width}
            frameHeight={100}
          />
        </div>
      );
    } else if (this.isIIIFType(item)) {
      display = <MiradorViewer item={item} site={this.props.site} />;
    } else if (this.isMinervaType(item)) {
      display = (
        <MinervaPlayer
          item={item}
          url={options.assets.url}
          site={this.props.site}
        />
      );
    } else if (this.isImgType(item)) {
      display = (
        <Thumbnail
          className="item-img"
          item={item}
          imgURL={options.assets.url}
          altText={item.title}
          site={this.props.site}
        />
      );
    } else if (this.isAudioType(item)) {
      display = (
        <MediaElement
          src={options.assets.url}
          mediaType="audio"
          site={this.props.site}
          poster={item.thumbnail_path}
          title={item.title}
          transcript={options.audioTranscript ?? null}
          isPodcast={this.state.item?.type?.find((item) => item === "podcast")}
        />
      );
    } else if (this.isVideoType(item)) {
      display = (
        <MediaElement
          src={options.assets.url}
          mediaType="video"
          site={this.props.site}
          poster={item.thumbnail_path}
        />
      );
    } else if (this.isKalturaType(item)) {
      display = <KalturaPlayer manifest_url={options.assets.url} />;
    } else if (this.isPdfType(item)) {
      display = (
        <PDFViewer manifest_url={options.assets.url} title={item.title} />
      );
    } else if (this.isObjType(item)) {
      const assetUrl = options.assets.url;
      const texPath = assetUrl.substring(0, assetUrl.lastIndexOf("/") + 1);
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <OBJModel src={assetUrl} texPath={texPath} />
        </div>
      );
    } else if (this.isMtlType(item)) {
      display = (
        <div className="obj-wrapper" style={{ width: `${width}px` }}>
          <MtlElement mtl={options.assets.url} />
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
        <>
          <SiteTitle
            data={this.state.title_data}
            site={this.props.site}
            template={this.state.title_template}
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
          <div className="item-page-wrapper">
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
                  <div className="collapsible-cards-container">
                    <CollapsibleCard
                      title="About"
                      marker="about"
                      data={this.state.item}
                      site={this.props.site}
                      defaultExpand={true}
                    />
                    <CollapsibleCard
                      title="Copyright"
                      marker="copyright"
                      data={this.state.item}
                      site={this.props.site}
                      defaultExpand={true}
                    />
                    <CollapsibleCard
                      title="Citation"
                      marker="citation"
                      data={this.state.item}
                      site={this.props.site}
                      defaultExpand={true}
                      parentCollection={this.state.topLevelParentCollection}
                    />
                    <CollapsibleCard
                      title="Location"
                      marker="location"
                      data={this.state.item}
                      defaultExpand={true}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="container">
              <RelatedItems
                collection={this.state.item}
                site={this.props.site}
              />
            </div>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  }
}

export default ArchivePage;
