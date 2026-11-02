import React from "react";
import { NavLink } from "react-router-dom";
import { arkLinkFormatted } from "../lib/MetadataRenderer";
import { Thumbnail } from "./Thumbnail";
import { cleanHTML, getCategory } from "../lib/MetadataRenderer";
import "../css/SearchResult.scss";

const GalleryView = (props) => {
  const getPageCount = () => {
    if (props.item?.archiveOptions) {
      const { page_count } = JSON.parse(props.item.archiveOptions);
      return parseInt(page_count) || 0;
    }
    return 0;
  };

  const getItemTypes = () => {
    if (props.item && getCategory(props.item) === "collection")
      return [true, ["collection"]];

    let formats = new Set();

    // Pull format from item metadata
    if (props.item?.format?.length > 0) {
      props.item.format.forEach((format) => {
        if (format.startsWith("image")) {
          formats.add("Image");
        } else if (format.startsWith("pdf") || format.endsWith("pdf")) {
          formats.add("PDF");
        } else if (format.startsWith("model")) {
          formats.add("3D Model");
        } else {
          formats.add(format.split("/")[0]);
        }
      });
    }

    // Infer format from manifest
    if (props.item?.manifest_url?.endsWith("manifest.json")) {
      formats.add("Image");
    } else if (props.item?.manifest_url?.endsWith(".pdf")) {
      formats.add("PDF");
    } else if (props.item?.manifest_url?.endsWith("exhibit.json")) {
      formats.add("Exhibit");
    }

    if (formats.size === 0) formats.add("Item");

    // No identifiable format (is not a collection)
    return [false, [...formats]];
  };

  const itemPageCount = getPageCount();
  const [isCollection, itemFormats] = getItemTypes();
  return (
    <li className={`card${isCollection ? " card--collection" : ""}`}>
      <Thumbnail className="card__img" item={props.item} site={props.site} />
      <div className="card__body">
        <NavLink
          className="card__primary-link"
          to={`/${getCategory(props.item)}/${arkLinkFormatted(
            props.item.custom_key
          )}`}
        >
          <p className="card__title">
            <span className="sr-only">
              {isCollection ? " Collection" : "Item"}.{" "}
            </span>
            {props.item.title}
          </p>
          <div className="card__tags">
            <span className="sr-only">. Format: </span>
            {itemFormats.map((format) => {
              return (
                <span key={format} className="card__tag card__tag--type">
                  {format}
                </span>
              );
            })}
            {itemPageCount && (
              // <span className="sr-only">. Pages: </span>
              <span className="card__tag card__tag--count">
                {itemPageCount === 1 ? "1 page" : `${itemPageCount} pages`}
              </span>
            )}
          </div>
        </NavLink>
      </div>
    </li>
  );
};

export default GalleryView;
