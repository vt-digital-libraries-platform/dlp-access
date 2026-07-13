import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import {
  faAngleDown,
  faBookOpen,
  faCircleInfo,
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { htmlParsedValue, cleanHTML } from "src/lib/MetadataRenderer";
import Citation from "../components/Citation";
import "../css/CollapsibleCards.scss";
import "../css/Typography.scss";
import { LeafletThumb } from "./LeafletThumb";

const single_value_headers = [
  "bibliographic_citation",
  "circa",
  "end_date",
  "explicit",
  "explicit_content",
  "identifier",
  "start_date",
  "title"
];

const multi_value_headers = [
  "alternative",
  "basis_of_record",
  "belongs_to",
  "contributor",
  "conforms_to",
  "coverage",
  "created",
  "creator",
  "date",
  "description",
  "display_date",
  "download_link",
  "extent",
  "format",
  "format_physical",
  "has_format",
  "has_part",
  "has_version",
  "is_part_of",
  "is_format_of",
  "is_version_of",
  "language",
  "license",
  "location",
  "medium",
  "other_identifier",
  "provenance",
  "publisher",
  "references",
  "related_url",
  "repository",
  "resource_type",
  "rights",
  "rights_holder",
  "source",
  "spatial",
  "subject",
  "tags",
  "temporal",
  "type"
];

const getMarker = (marker) => {
  switch (marker) {
    case "location":
      return (
        <FontAwesomeIcon
          icon={faLocationDot}
          aria-hidden="true"
          className="card-summary-icon"
        />
      );

    case "about":
      return (
        <FontAwesomeIcon
          icon={faCircleInfo}
          aria-hidden="true"
          className="card-summary-icon"
        />
      );

    case "copyright":
      return (
        <FontAwesomeIcon
          icon={faCopyright}
          aria-hidden="true"
          className="card-summary-icon"
        />
      );

    case "citation":
      return (
        <FontAwesomeIcon
          icon={faBookOpen}
          aria-hidden="true"
          className="card-summary-icon"
        />
      );

    default:
      return null;
  }
};

const getLocationData = (data) => {
  return (
    <>
      {data.location ? (
        <div className="map-wrapper section-wrapper">
          <LeafletThumb location={data.location} title={data.title} />
        </div>
      ) : (
        <div className="no-location">Location data not available</div>
      )}
    </>
  );
};

const modifyKey = (key, site) => {
  let newKey = "";
  // If the key is in the site's displayedAttributes, use the label from there
  if (site?.displayedAttributes) {
    try {
      const attrObj = JSON.parse(site?.displayedAttributes);
      newKey =
        attrObj["archive"]?.find((attr) => attr.field === key)?.label || newKey;
    } catch (e) {
      console.log("Error parsing displayedAttributes", e);
    }
  }
  if (key === "display_date") {
    return "Date";
  }
  if (!newKey) {
    newKey = key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return newKey;
};

const getCitationData = (data, site, parentCollection) => {
  return (
    <Citation item={data} site={site} parentCollection={parentCollection} />
  );
};

const getCopyrightData = (data, site) => {
  let key1 = "rights_holder";
  let key2 = "rights";
  return (
    <dl className="data-list">
      {data[key1] && (
        <div className="data-list-item">
          <dt className="data-list-label">{modifyKey(key1, site)}</dt>
          <dd className="data-list-value">{htmlParsedValue(data[key1])}</dd>
        </div>
      )}
      {data[key2] && (
        <div className="data-list-item">
          <dt className="data-list-label">{modifyKey(key2)}</dt>
          {Array.isArray(data[key2]) ? (
            data[key2].map((value, index) => (
              <dd key={index} className="data-list-value">
                {cleanHTML(String(value), "html")}
              </dd>
            ))
          ) : (
            <dd className="data-list-value">
              {cleanHTML(String(data[key2]), "html")}
            </dd>
          )}
        </div>
      )}
    </dl>
  );
};

export default function CollapsibleCard({
  title,
  marker,
  data,
  site,
  defaultExpand,
  parentCollection
}) {
  const facetSearchItems = [
    "format",
    "format_physical",
    "medium",
    "type",
    "tags"
  ];

  const renderContent = (key, value) => {
    if (typeof value === "string" && value.includes("<a href=")) {
      return htmlParsedValue(value);
    } else if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    } else if (facetSearchItems.includes(key)) {
      return (
        <a
          href={`/search?q=&field=all&view=Gallery&${key}=${value}`}
          rel="noopener noreferrer"
        >
          {value}
        </a>
      );
    } else if (key === "language") {
      return (
        <a
          href="https://en.wikipedia.org/wiki/English_language"
          target="_blank"
          rel="noopener noreferrer"
        >
          en
        </a>
      );
    } else {
      return value;
    }
  };

  const getAboutData = (data, site) => {
    const items = [
      "description",
      "date",
      "rights",
      "rights_holder",
      "start_date",
      "end_date",
      "location",
      "visibility"
    ];

    return (
      <dl className="data-list">
        {single_value_headers.map((key) =>
          data[key] && !items.includes(key) ? (
            <div key={key} className="data-list-item">
              <dt className="data-list-label">{modifyKey(key, site)}</dt>
              <dd className="data-list-value">
                {typeof data[key] === "string" &&
                data[key].startsWith("http") ? (
                  <a href={data[key]} target="_blank" rel="noopener noreferrer">
                    {data[key]}
                  </a>
                ) : (
                  data[key]
                )}
              </dd>
            </div>
          ) : null
        )}

        {multi_value_headers.map((key) =>
          data[key] && !items.includes(key) && data[key].length > 0 ? (
            <div key={key} className="data-list-item">
              <dt className="data-list-label">{modifyKey(key, site)}</dt>
              {data[key].map((value, index) => (
                <dd key={index} className="data-list-value">
                  {renderContent(key, value)}
                </dd>
              ))}
            </div>
          ) : null
        )}
      </dl>
    );
  };

  const getContent = (marker, data, site, parentCollection) => {
    switch (marker) {
      case "location":
        return getLocationData(data);

      case "about":
        return getAboutData(data, site);

      case "copyright":
        return getCopyrightData(data, site);

      case "citation":
        return getCitationData(data, site, parentCollection);

      default:
        return null;
    }
  };

  return (
    <details
      className="card-details typography-wrapper"
      open={defaultExpand ?? true}
    >
      <summary className="card-summary">
        {getMarker(marker)}
        {title}
        <FontAwesomeIcon
          className="expand-icon"
          icon={faAngleDown}
          aria-hidden="true"
        />
      </summary>
      <div className="card-content">
        {getContent(marker, data, site, parentCollection)}
      </div>
    </details>
  );
}
