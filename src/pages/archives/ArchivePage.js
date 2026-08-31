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
import { resolveMediaKind } from "../../lib/mediaKind";
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
    const media = resolveMediaKind(item);
    let width = Math.min(
      document.getElementById("content-wrapper").offsetWidth - 50,
      720
    );

    switch (media.kind) {
      case "3d-2diiif-gltf":
      case "3d-2diiif-x3d":
        return (
          <ThreeD2DiiifHandler
            item={item}
            media={media}
            frameWidth={width}
            frameHeight={width}
            site={this.props.site}
          />
        );
      case "gltf":
        return (
          <div className="image-wrapper" id="image-wrapper">
            <BabylonElement
              model={media.gltfConfig}
              env={media.envConfig}
              scaleFactor={media.scaleFactor}
              rotation={media.rotation}
              item={item}
              _3dConfig={media.threeDConfig}
            />
          </div>
        );
      case "x3d":
        return (
          <div className="obj-wrapper image-wrapper">
            <X3DElement
              url={media.x3dConfig}
              frameSize={width}
              frameHeight={100}
            />
          </div>
        );
      case "mirador":
        return <MiradorViewer item={item} site={this.props.site} />;
      case "minerva":
        return <MinervaPlayer item={item} site={this.props.site} />;
      case "image":
        return (
          <Thumbnail
            className="item-img"
            item={item}
            imgURL={media.url}
            altText={item.title}
            site={this.props.site}
          />
        );
      case "audio":
        return (
          <MediaElement
            src={media.url}
            mediaType="audio"
            site={this.props.site}
            poster={item.thumbnail_path}
            title={item.title}
            transcript={media.transcript}
            isPodcast={this.state.item?.type?.find(
              (item) => item === "podcast"
            )}
          />
        );
      case "video":
        return (
          <MediaElement
            src={media.url}
            mediaType="video"
            site={this.props.site}
            poster={item.thumbnail_path}
          />
        );
      case "kaltura":
        return <KalturaPlayer manifest_url={media.url} />;
      case "pdf":
        return <PDFViewer manifest_url={media.url} title={item.title} />;
      case "obj":
        return (
          <div className="obj-wrapper" style={{ width: `${width}px` }}>
            <OBJModel src={media.url} texPath={media.texPath} />
          </div>
        );
      case "mtl":
        return (
          <div className="obj-wrapper" style={{ width: `${width}px` }}>
            <MtlElement mtl={media.url} />
          </div>
        );
      case "unknown":
      default:
        return <></>;
    }
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
