import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import {
  faAngleDown,
  faAngleRight,
  faBookOpen,
  faCircleInfo,
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { htmlParsedValue } from "src/lib/MetadataRenderer";
import Citation from "../components/Citation";
import "../css/CollapsibleCards.scss";
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

const modifyKey = (key) => {
  if (key === "display_date") {
    return "Date";
  }
  const newKey = key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return newKey;
};

const getCitationData = (data, site, parentCollection) => {
  return (
    <Citation item={data} site={site} parentCollection={parentCollection} />
  );
};

const getCopyrightData = (data) => {
  let key1 = "rights_holder";
  let key2 = "rights";
  return (
    <ul className="data-list">
      {data[key1] && (
        <li className="data-list-item">
          <h3 className="data-list-label">{modifyKey(key1)}</h3>
          <div className="data-list-value">
            <p className="data-list-value-text">
              {htmlParsedValue(data[key1])}
            </p>
          </div>
        </li>
      )}
      {data[key2] && (
        <li className="data-list-item">
          <h3 className="data-list-label">{modifyKey(key2)}</h3>
          <div className="data-list-value">
            <p className="data-list-value-text">
              {htmlParsedValue(data[key2])}
            </p>
          </div>
        </li>
      )}
    </ul>
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
  const [expanded, setExpanded] = useState(true);

  const handleExpandClick = (e) => {
    e.preventDefault();
    setExpanded((prev) => !prev);
  };

  let facetSearchItems = [
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

  const getAboutData = (data) => {
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
      <ul className="data-list">
        {single_value_headers.map((key) =>
          data[key] && !items.includes(key) ? (
            <li key={key} className="data-list-item">
              <h3 className="data-list-label">{modifyKey(key)}</h3>
              <p className="data-list-value">
                {typeof data[key] === "string" &&
                data[key].startsWith("http") ? (
                  <a href={data[key]} target="_blank" rel="noopener noreferrer">
                    {data[key]}
                  </a>
                ) : (
                  data[key]
                )}
              </p>
            </li>
          ) : null
        )}

        {multi_value_headers.map((key) =>
          data[key] && !items.includes(key) && data[key].length > 0 ? (
            <li key={key} className="data-list-item">
              <h3 className="data-list-label">{modifyKey(key)}</h3>
              <div className="data-list-value">
                {Array.isArray(data[key]) ? (
                  data[key].map((value, index) => (
                    <p key={index} className="data-list-value-text">
                      {renderContent(key, value)}
                    </p>
                  ))
                ) : (
                  <p className="data-list-value-text">
                    {renderContent(key, data[key])}
                  </p>
                )}
              </div>
            </li>
          ) : null
        )}
      </ul>
    );
  };

  const getContent = (marker, data, site, parentCollection) => {
    switch (marker) {
      case "location":
        return getLocationData(data);

      case "about":
        return getAboutData(data);

      case "copyright":
        return getCopyrightData(data);

      case "citation":
        return getCitationData(data, site, parentCollection);

      default:
        return null;
    }
  };

  const getCollapsibleArrow = () => {
    return expanded ? (
      <FontAwesomeIcon
        className="expand-icon"
        icon={faAngleDown}
        aria-hidden="true"
      />
    ) : (
      <FontAwesomeIcon
        className="expand-icon"
        icon={faAngleRight}
        aria-hidden="true"
      />
    );
  };

  return (
    <details className="card-details" open={expanded}>
      <summary className="card-summary" onClick={handleExpandClick}>
        {getMarker(marker)}
        {title}
        {getCollapsibleArrow()}
      </summary>
      <div className="card-content">
        {getContent(marker, data, site, parentCollection)}
      </div>
    </details>
  );
}
