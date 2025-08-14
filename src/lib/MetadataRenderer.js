import React from "react";
import queryString from "query-string";
import "../css/ListPages.scss";
import parse from "html-react-parser";
import sanitizeHtml from "sanitize-html";

export function cleanHTML(content, type) {
  let options;
  if (type === "transcript") {
    options = {
      allowedTags: [
        "a",
        "abbr",
        "b",
        "br",
        "blockquote",
        "cite",
        "code",
        "data",
        "dd",
        "div",
        "dl",
        "dt",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "i",
        "li",
        "ol",
        "p",
        "pre",
        "q",
        "small",
        "span",
        "strong",
        "sub",
        "sup",
        "time",
        "u",
        "ul"
      ],
      allowedAttributes: {
        "*": ["id", "style", "class"],
        a: ["href", "name", "target", "rel", "title"]
      }
    };
  } else if (type === "page") {
    options = {
      allowedTags: [
        "a",
        "abbr",
        "address",
        "article",
        "aside",
        "audio",
        "b",
        "br",
        "blockquote",
        "caption",
        "cite",
        "code",
        "col",
        "colgroup",
        "data",
        "dd",
        "div",
        "dl",
        "dt",
        "em",
        "figcaption",
        "figure",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "i",
        "img",
        "li",
        "nav",
        "ol",
        "p",
        "pre",
        "q",
        "section",
        "small",
        "source",
        "span",
        "strong",
        "sub",
        "sup",
        "time",
        "u",
        "ul",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr",
        "video"
      ],
      allowedAttributes: {
        "*": ["id", "style", "class"],
        a: ["href", "name", "target", "rel", "title"],
        audio: ["autoplay", "controls", "loop", "muted", "preload", "src"],
        img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
        source: ["src", "type"],
        table: ["cellpadding"],
        video: [
          "autoplay",
          "controls",
          "height",
          "loop",
          "muted",
          "poster",
          "preload",
          "src",
          "width"
        ]
      }
    };
  } else if (type === "html") {
    options = {
      allowedTags: ["b", "em", "strong", "u", "a"],
      allowedAttributes: {
        a: ["href", "target", "rel"]
      }
    };
  } else if (type === "media") {
    options = {
      allowedTags: ["iframe"],
      allowedAttributes: {
        iframe: [
          "src",
          "frameborder",
          "title",
          "allow",
          "allowfullscreen",
          "loading"
        ]
      }
    };
  } else {
    options = null;
  }
  let cleaned = options
    ? parse(sanitizeHtml(content, options))
    : parse(sanitizeHtml(content));
  return cleaned;
}

export function labelAttr(attr, filter, languages) {
  if (attr === "archive") return "Item";
  else if (filter === "language") return (attr = languages[attr]);
  else return (attr.charAt(0).toUpperCase() + attr.slice(1)).replace("_", " ");
}

export function breadcrumbTitle(title) {
  const titleArray = title.split(",");
  return titleArray[0];
}

export function getCategory(item) {
  console.log(item);
  return item.__typename.toLowerCase();
}

export function arkLinkFormatted(customKey) {
  return customKey?.split("/")?.pop();
}

export function htmlParsedValue(value) {
  return value.includes("<a href=") ? parse(value) : value;
}

export function titleFormatted(item, category) {
  return (
    <h3>
      <a href={`/${category}/${arkLinkFormatted(item.custom_key)}`}>
        {item.title}
      </a>
    </h3>
  );
}

export function addNewlineInDesc(content, headings) {
  if (!Array.isArray(headings)) {
    headings = [headings];
  }
  if (content) {
    content = content.map((item, index) => (
      <React.Fragment key={`section${index}`}>
        {headings[index] !== undefined &&
        headings[index].length > 0 &&
        headings[index] !== " " ? (
          <h2 className="introduction">{headings[index]}</h2>
        ) : (
          <></>
        )}
        {item.split("\n").map((value, index) => {
          return <p key={`content_${index}`}>{cleanHTML(value, "html")}</p>;
        })}
      </React.Fragment>
    ));
  }
  return <span>{content}</span>;
}

function listValue(category, attr, value, languages) {
  const LinkedFields = [
    "creator",
    "format",
    "is_part_of",
    "language",
    "medium",
    "type",
    "tags"
  ];
  if (LinkedFields.indexOf(attr) > -1) {
    let attrValue = [value];
    if (["creator", "language"].includes(attr)) {
      attrValue = value;
    }
    let parsedObject = {
      category: category,
      [attr]: attrValue,
      field: "title",
      q: "",
      view: "Gallery"
    };

    if (attr === "language" && languages !== undefined) {
      value = languages[value];
    }
    return (
      <a href={`/search/?${queryString.stringify(parsedObject)}`}>{value}</a>
    );
  } else if (["source", "relation", "repository", "rights"].includes(attr)) {
    return cleanHTML(value);
  } else {
    return value;
  }
}

function textFormat(item, attr, languages, collectionCustomKey, site) {
  if (item[attr] === null) {
    return null;
  }
  let category = item.__typename.toLowerCase();
  if (Array.isArray(item[attr]) && attr !== "description") {
    return (
      <div className="archive-item-tags multi">
        {item[attr].map((value, i) => (
          <div className="list-unstyled" key={i} data-cy="multi-field-span">
            {attr === "is_part_of" && i === 0 ? (
              <a href={`/collection/${arkLinkFormatted(collectionCustomKey)}`}>
                {value}
              </a>
            ) : (
              listValue(category, attr, value, languages)
            )}
          </div>
        ))}
      </div>
    );
  } else if (attr === "identifier") {
    return (
      <a href={`/${category}/${arkLinkFormatted(item.custom_key)}`}>
        {item[attr]}
      </a>
    );
  } else if (attr === "custom_key") {
    let redirect = "";
    try {
      const options = JSON.parse(site.siteOptions);
      if (options.redirectURL) {
        redirect = options.redirectURL;
      }
    } catch (error) {
      console.log("Redirect url not defined in site config.");
    }
    return parse(
      `<a href="${redirect}/${item.custom_key}">${redirect}/${item.custom_key}</a>`
    );
  } else if (attr === "description") {
    if (item["description"][0].length <= 120) {
      return cleanHTML(item["description"][0], "html");
    } else {
      return <MoreLink category={category} item={item} />;
    }
  } else if (attr === "page_count") {
    if (!item["archiveOptions"]) return;
    const { page_count } = JSON.parse(item["archiveOptions"]);
    return parseInt(page_count) || 0;
  } else {
    return item[attr];
  }
}

const MoreLink = ({ category, item }) => {
  return (
    <span>
      <span>{cleanHTML(item["description"][0].substring(0, 120), "html")}</span>
      <a
        className="more-link"
        href={`/${category}/${arkLinkFormatted(item.custom_key)}`}
      >
        . . .[more]
      </a>
    </span>
  );
};

const RenderAttribute = ({ item, attribute, languages, site }) => {
  const item_value = textFormat(item, attribute.field, languages, null, site);
  if (item_value) {
    let value_style = attribute.field === "identifier" ? "identifier" : "";
    return (
      <div className="collection-detail">
        <table aria-label="Item Metadata">
          <tbody>
            <tr>
              <th className="collection-detail-key" scope="row">
                {attribute.label}:
              </th>
              <td className={`collection-detail-value ${value_style}`}>
                {item_value}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else {
    return <></>;
  }
};

const RenderAttrDetailed = ({
  item,
  attribute,
  languages,
  collectionCustomKey,
  type,
  site
}) => {
  const item_value = item[attribute.field];
  const item_label = attribute.label;
  if (textFormat(item, attribute.field, languages, collectionCustomKey, site)) {
    let value_style = attribute.field === "identifier" ? "identifier" : "";
    if (type === "table") {
      if (
        Array.isArray(item_label) &&
        Array.isArray(item_value) &&
        item_label.length >= item_value.length
      ) {
        return item_value.map((i_value, idx) => {
          return (
            <tr
              key={`${item_label}_${idx}`}
              className={item_label[idx].toLowerCase().replace(" ", "_")}
            >
              <th className="collection-detail-key" scope="row">
                {item_label[idx]}
              </th>
              <td className={`collection-detail-value ${value_style}`}>
                {i_value}
              </td>
            </tr>
          );
        });
      } else {
        return (
          <tr key={attribute.field} className={attribute.field}>
            <th className="collection-detail-key" scope="row">
              {item_label}
            </th>
            <td className={`collection-detail-value ${value_style}`}>
              {textFormat(
                item,
                attribute.field,
                languages,
                collectionCustomKey,
                site
              )}
            </td>
          </tr>
        );
      }
    } else if (type === "grid") {
      return (
        <div
          className={`collection-detail-entry ${item_label
            .toLowerCase()
            .replace(" ", "_")}`}
        >
          <div className="collection-detail-key">{item_label}</div>
          <div className={`collection-detail-value ${value_style}`}>
            {textFormat(
              item,
              attribute.field,
              languages,
              collectionCustomKey,
              site
            )}
          </div>
        </div>
      );
    }
  } else {
    return <></>;
  }
};
export const RenderItems = ({ keyArray, item, languages, site }) => {
  let render_items = [];
  keyArray.forEach((value, index) => {
    render_items.push(
      <RenderAttribute
        item={item}
        attribute={value}
        key={index}
        languages={languages}
        site={site}
      />
    );
  });
  return <>{render_items}</>;
};

export const RenderItemsDetailed = ({
  keyArray,
  item,
  languages,
  collectionCustomKey,
  type = "table",
  site
}) => {
  let render_items_detailed = [];
  keyArray.forEach((value, index) => {
    render_items_detailed.push(
      <RenderAttrDetailed
        item={item}
        attribute={value}
        key={index}
        languages={languages}
        collectionCustomKey={collectionCustomKey}
        type={type}
        site={site}
      />
    );
  });
  return <>{render_items_detailed}</>;
};
