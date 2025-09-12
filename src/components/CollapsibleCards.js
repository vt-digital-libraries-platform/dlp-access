import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoIcon from "@mui/icons-material/Info";
import CopyrightIcon from "@mui/icons-material/Copyright";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import { LeafletThumb } from "./LeafletThumb";
import Citation from "../components/Citation";

import "../css/CollapsibleCards.scss";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest
  })
}));

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
  "age",
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
      return <LocationOnIcon style={{ color: "#ffffff", fontSize: "0.8em" }} />;

    case "about":
      return <InfoIcon style={{ color: "#ffffff", fontSize: "0.8em" }} />;

    case "copyright":
      return <CopyrightIcon style={{ color: "#ffffff", fontSize: "0.8em" }} />;

    case "citation":
      return (
        <LocalLibraryIcon style={{ color: "#ffffff", fontSize: "0.8em" }} />
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
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {data[key1] && (
          <tr>
            <td
              style={{ padding: "4px 2px", verticalAlign: "top", width: "30%" }}
            >
              <h6 key={key1}>{`${modifyKey(key1)}`}</h6>
            </td>
            <td style={{ padding: "2px", verticalAlign: "top" }}>
              <div dangerouslySetInnerHTML={{ __html: data[key1] }} />
            </td>
          </tr>
        )}
        {data[key2] && (
          <tr>
            <td
              style={{ padding: "4px 2px", verticalAlign: "top", width: "30%" }}
            >
              <h6 key={key2}>{`${modifyKey(key2)}`}</h6>
            </td>
            <td style={{ padding: "2px", verticalAlign: "top" }}>
              <div dangerouslySetInnerHTML={{ __html: data[key2] }} />
            </td>
          </tr>
        )}
      </tbody>
    </table>
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
  const [expanded, setExpanded] = React.useState(defaultExpand);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  let facetSearchItems = [
    "format",
    "format_physical",
    "medium",
    "type",
    "tags"
  ];

  const renderContent = (key, value, index) => {
    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <div key={index}>
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        </div>
      );
    } else if (facetSearchItems.includes(key)) {
      return (
        <div key={index}>
          <a
            href={`/search?q=&field=all&view=Gallery&${key}=${value}`}
            rel="noopener noreferrer"
          >
            {value}
          </a>
        </div>
      );
    } else if (key === "language") {
      return (
        <div key={index}>
          <a
            href="https://en.wikipedia.org/wiki/English_language"
            target="_blank"
            rel="noopener noreferrer"
          >
            en
          </a>
        </div>
      );
    } else {
      return <div key={index}>{value}</div>;
    }
  };

  const getAboutData = (data) => {
    let items = [
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
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {single_value_headers.map((key) =>
            data[key] && !items.includes(key) ? (
              <tr key={key} style={{ padding: "4px 2px" }}>
                <td
                  style={{ padding: "2px", verticalAlign: "top", width: "30%" }}
                >
                  <h6>{modifyKey(key)}</h6>
                </td>
                <td style={{ padding: "2px", verticalAlign: "top" }}>
                  {data[key] === "string" && data[key].startsWith("http") ? (
                    <a
                      href={data[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data[key]}
                    </a>
                  ) : (
                    data[key]
                  )}
                </td>
              </tr>
            ) : null
          )}
          {multi_value_headers.map((key) =>
            data[key] && !items.includes(key) && data[key].length > 0 ? (
              <tr key={key} style={{ padding: "4px 2px" }}>
                <td
                  style={{ padding: "2px", verticalAlign: "top", width: "30%" }}
                >
                  <h6>{modifyKey(key)}</h6>
                </td>
                <td style={{ padding: "2px", verticalAlign: "top" }}>
                  {/* {Array.isArray(data[key]) ? (
                    data[key].map((value, index) =>
                      typeof value === "string" && value.startsWith("http") ? (
                        <div key={index}>
                          <a href={value} target="_blank" rel="noopener noreferrer">
                            {value}
                          </a>
                        </div>
                      ) : (
                        <div key={index}>{value}</div>
                      )
                    )
                  ) : (
                    data[key]
                  )} */}
                  {Array.isArray(data[key])
                    ? data[key].map((value, index) =>
                        renderContent(key, value, index)
                      )
                    : renderContent(data[key], 0)}
                </td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>
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

  return (
    <Card sx={{ width: "100%", marginBottom: "1vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#861f41",
          color: "white",
          fontSize: "2rem"
        }}
      >
        <CardHeader
          avatar={getMarker(marker)}
          title={title}
          titleTypographyProps={{ style: { fontSize: "0.55em" } }}
          style={{ padding: "0.2em" }}
        />
        <CardActions disableSpacing>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            style={{ padding: "2px" }}
          >
            <ExpandMoreIcon
              style={{ padding: "2px", color: "white", fontSize: "2rem" }}
            />
          </ExpandMore>
        </CardActions>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent className="card-content">
          {getContent(marker, data, site, parentCollection)}
        </CardContent>
      </Collapse>
    </Card>
  );
}
