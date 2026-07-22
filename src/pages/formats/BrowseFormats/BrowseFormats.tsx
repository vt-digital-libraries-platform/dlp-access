import { FC, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import qs from "query-string";
import { SiteTitle } from "../../../components/SiteTitle";
import { loadFormats, FormatCount } from "./loadFormats";

import "../../../css/Typography.scss";
import "../../../css/CollectionsListPage.scss";
import "../../../css/BrowseFormats.scss";

type Props = {
  site: Site;
  title?: string;
};

type FormatFacet = {
  label?: string;
  values?: string[];
};

const searchLink = (value: string) =>
  `/search/?${qs.stringify({
    field: "all",
    q: "",
    view: "Gallery",
    format: value
  })}`;

const getFormatFacet = (site: Site): FormatFacet | null => {
  if (!site?.searchPage) {
    return null;
  }
  try {
    return JSON.parse(site.searchPage)?.facets?.format || null;
  } catch (error) {
    console.error("Error parsing searchPage config", error);
    return null;
  }
};

export const BrowseFormats: FC<Props> = ({ site, title }) => {
  const facet = getFormatFacet(site);
  const values = [...(facet?.values || [])].sort((a, b) => a.localeCompare(b));
  const valueKey = values.join("|");
  const heading = title || facet?.label || "Browse by Format";

  const [counts, setCounts] = useState<FormatCount[] | null>(null);

  useEffect(() => {
    let current = true;
    setCounts(null);
    if (valueKey) {
      loadFormats(valueKey.split("|")).then((formatCounts) => {
        if (current) {
          setCounts(formatCounts);
        }
      });
    }
    return () => {
      current = false;
    };
  }, [valueKey]);

  if (!site) {
    return null;
  }

  const countFor = (value: string) =>
    counts?.find((formatCount) => formatCount.value === value)?.count ?? null;

  // The count is exposed through the link's accessible name rather than read as
  // a bare number after the label, so the visible count is hidden from AT.
  const linkLabel = (value: string) => {
    const count = countFor(value);
    if (count === null) {
      return value;
    }
    return `${value}, ${count.toLocaleString()} ${
      count === 1 ? "item" : "items"
    }`;
  };

  return (
    <>
      <SiteTitle data={{ title: heading }} site={site} template="{{title}}" />
      <div className="collection-browse-wrapper">
        <div className="container typography-wrapper">
          <h1>{heading}</h1>
          {values.length ? (
            <>
              <p className="format-browse-intro">
                Choose a format to search the collections for items of that
                type.
              </p>
              <div className="visually-hidden" role="status">
                {counts === null ? "Loading item counts" : "Item counts loaded"}
              </div>
              <ul className="format-list" aria-busy={counts === null}>
                {values.map((value) => (
                  <li className="format-list-item" key={value}>
                    <NavLink
                      to={searchLink(value)}
                      aria-label={linkLabel(value)}
                    >
                      <span className="format-value">{value}</span>
                      <span className="format-count" aria-hidden="true">
                        {counts === null
                          ? "…"
                          : countFor(value)?.toLocaleString() ?? ""}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="format-browse-empty">
              No formats have been configured for this site.
            </p>
          )}
        </div>
      </div>
    </>
  );
};
