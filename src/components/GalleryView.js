import React from "react";
import { NavLink } from "react-router-dom";
import { arkLinkFormatted } from "../lib/MetadataRenderer";
import { Thumbnail } from "./Thumbnail";
import { cleanHTML } from "../lib/MetadataRenderer";
import "../css/SearchResult.scss";

const GalleryView = (props) => {
  const formatsForItems = (item) => {
    let formats = [];
    if (item?.format) {
      item.format.forEach((format) => {
        formats.push(
          <NavLink
            to={`/search?q=&field=all&view=Gallery&format=${format}`}
            key={format}
            className="card-text"
          >
            {format}
          </NavLink>
        );
      });
    }
    // if(!formats.length) {
    //   formats = formatsByManifestURL(item.manifest_url)
    // }
    return formats;
  };

  const formatsByManifestURL = (manifestURL) => {
    let format = null;
    if (manifestURL) {
      if (manifestURL.endsWith("manifest.json")) {
        format = <p className="card-text">2D Image (tiled)</p>;
      } else if (manifestURL.endsWith(".pdf")) {
        format = <p className="card-text">document/pdf</p>;
      }
    }
    return format;
  };

  const getPageCount = () => {
    if (props.item?.archiveOptions) {
      const { page_count } = JSON.parse(props.item.archiveOptions);
      return parseInt(page_count) || 0;
    }
    return 0;
  };

  const itemPageCnt = getPageCount();
  return (
    <div className="col-md-6 col-lg-4 gallery-item">
      <div className="card">
        <NavLink
          to={`/${props.category}/${arkLinkFormatted(props.item.custom_key)}`}
        >
          <Thumbnail
            item={props.item}
            category={props.category}
            className="card-img-top"
            site={props.site}
          />
        </NavLink>
        <div className="card-body">
          <NavLink
            to={`/${props.category}/${arkLinkFormatted(props.item.custom_key)}`}
          >
            <h3 className="card-title crop-text-3">{props.item.title}</h3>
          </NavLink>
          <p className={`card-text crop-text-${itemPageCnt > 0 ? "2" : "3"}`}>
            {cleanHTML(
              props.item?.description?.length ? props.item.description[0] : "",
              "html"
            )}
          </p>
          {props.item.site_category !== "iawa" &&
            props.item?.format?.length && (
              <div className="format-section right-half">
                <span className="label-left">{`Format${
                  props.item.format?.length > 1 ? "s" : ""
                }:`}</span>
                <span className="value-right">
                  {formatsForItems(props.item)}
                </span>
              </div>
            )}
          {itemPageCnt > 0 && (
            <div className="badge badge-secondary page-count-badge">
              {itemPageCnt} page(s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
