import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import "../css/Citation.scss";
import "../css/Typography.scss";

type Props = {
  item: Archive;
  site: Site;
  parentCollection: Collection;
};

const Citation = ({ item, site, parentCollection }: Props) => {
  const [tabValue, setTabValue] = useState("citation");
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedBibTeX, setCopiedBibTeX] = useState(false);
  const citationTabRef = useRef<HTMLButtonElement | null>(null);
  const bibTeXTabRef = useRef<HTMLButtonElement | null>(null);
  const citationCopyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bibTeXCopyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const copyCooldown = 1000;

  useEffect(() => {
    return () => {
      if (citationCopyTimerRef.current) {
        clearTimeout(citationCopyTimerRef.current);
      }
      if (bibTeXCopyTimerRef.current) {
        clearTimeout(bibTeXCopyTimerRef.current);
      }
    };
  }, []);

  const getCreator = () => {
    const creator = item.creator || parentCollection.creator;
    if (!creator) {
      return null;
    }
    return creator.join(", ");
  };

  const getYear = () => {
    const start_date = item.start_date || parentCollection.start_date;
    if (!start_date) {
      return "n.d.";
    }
    const match = start_date.match(/^(\d{4})/);
    return match ? match[1] : "n.d.";
  };

  const getDLPInstance = () => {
    const { siteName } = site;
    if (siteName === "Virginia Tech Digital Libraries") {
      return "";
    }
    return siteName
      ? `Virginia Tech Digital Library, ${siteName}`
      : "Virginia Tech Digital Library";
  };

  const getPermalink = () => {
    if (!site.siteOptions) {
      console.error(
        "Site Options missing in site config. Permalink not available."
      );
      return null;
    }
    const options = JSON.parse(site.siteOptions);
    if (options.redirectURL) {
      return options.redirectURL + "/" + item.custom_key;
    } else {
      console.error("Redirect url not defined in site config.");
      return null;
    }
  };

  const getAccessDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const bibTeXIdCleanUp = (input: string) => {
    return input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const getBibTeXId = () => {
    return bibTeXIdCleanUp(`${parentCollection.title}_${item.title}`);
  };

  const bibTeXCitation = `@misc{${getBibTeXId()},
    author = {${getCreator() ? getCreator() : "n.d."}},
    title  = {${item.title}},
    year = {${getYear()}},
    url = {${getPermalink() || "n.d."}},
    provenance = {${item.provenance || "n.d."}},
    publisher = {${
      item.publisher?.join(", ") || "Virginia Tech Digital Library"
    }},
    keywords = {${item.tags?.join(", ") || "n.d."}},
    identifier = {${item.custom_key || "n.d."}}, \n}`;

  const getCitation = () => {
    return {
      creator: getCreator(),
      title: `${item.title || "Untitled"}`,
      dlpInstance: getDLPInstance() + ", ",
      sponsor:
        "Virginia Polytechnic Institute and State University, University Libraries. ",
      permalink: getPermalink(),
      accessDate: getAccessDate() + "."
    };
  };

  const generateCitationText = () => {
    const citation = getCitation();
    return `${citation.creator ? citation.creator + "." : ""}${citation.title}${
      citation.dlpInstance
    }${citation.sponsor}${citation.permalink} accessed ${citation.accessDate}`;
  };

  const onCopyCitation = () => {
    if (!copiedCitation) {
      navigator.clipboard.writeText(generateCitationText()).then(
        () => {
          setCopiedCitation(true);
          citationCopyTimerRef.current = setTimeout(
            () => setCopiedCitation(false),
            copyCooldown
          );
        },
        (err) => {
          console.error("Failed to copy citation: ", err);
        }
      );
    }
  };

  const onCopyBibTeXCitation = () => {
    if (!copiedBibTeX) {
      navigator.clipboard.writeText(bibTeXCitation).then(
        () => {
          setCopiedBibTeX(true);
          bibTeXCopyTimerRef.current = setTimeout(
            () => setCopiedBibTeX(false),
            copyCooldown
          );
        },
        (err) => {
          console.error("Failed to copy BibTeX citation: ", err);
        }
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const nextTab = tabValue === "citation" ? "bibtex" : "citation";
      setTabValue(nextTab);
      if (nextTab === "citation") {
        citationTabRef.current?.focus();
      } else {
        bibTeXTabRef.current?.focus();
      }
    }
  };

  const citationObj = getCitation();
  return (
    <div className="citation">
      <div
        className="citation-tab-list"
        role="tablist"
        aria-label="Citation formats"
      >
        <button
          id="citation-tab"
          ref={citationTabRef}
          type="button"
          role="tab"
          aria-selected={tabValue === "citation"}
          aria-controls="citation-panel"
          tabIndex={tabValue === "citation" ? 0 : -1}
          className={`citation-tab${
            tabValue === "citation" ? " is-active" : ""
          }`}
          onClick={() => setTabValue("citation")}
          onKeyDown={handleKeyDown}
        >
          Citation
        </button>
        <button
          id="bibtex-tab"
          ref={bibTeXTabRef}
          type="button"
          role="tab"
          aria-selected={tabValue === "bibtex"}
          aria-controls="bibtex-panel"
          tabIndex={tabValue === "bibtex" ? 0 : -1}
          onKeyDown={handleKeyDown}
          className={`citation-tab${tabValue === "bibtex" ? " is-active" : ""}`}
          onClick={() => setTabValue("bibtex")}
        >
          BibTeX
        </button>
      </div>

      <div
        id="citation-panel"
        role="tabpanel"
        aria-labelledby="citation-tab"
        className="citation-tab-content"
        hidden={tabValue !== "citation"}
      >
        <div className="copy-button-container">
          <h3 id="citation-preview-heading" className="heading">
            Citation Preview
          </h3>

          <Tooltip
            title={copiedCitation ? "Copied!" : ""}
            arrow
            open={copiedCitation === true}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -6]
                    }
                  }
                ]
              }
            }}
          >
            <button
              type="button"
              className="btn btn-secondary citation-copy-button"
              onClick={onCopyCitation}
              disabled={copiedCitation}
            >
              <FontAwesomeIcon
                icon={faCopy}
                className="mr-1"
                aria-hidden={true}
              />
              <span>Copy Citation</span>
            </button>
          </Tooltip>
        </div>

        <p className="citation-text" aria-labelledby="citation-preview-heading">
          {citationObj.creator && <span>{citationObj.creator}</span>}
          <span className="title">{citationObj.title}</span>
          <span>{citationObj.dlpInstance}</span>
          <span>{citationObj.sponsor}</span>
          <span>
            <a href={citationObj.permalink || "#"} className="mr-1">
              {citationObj.permalink || "N/A"}
            </a>
          </span>
          <span>{`accessed ${citationObj.accessDate}`}</span>
        </p>
      </div>

      <div
        id="bibtex-panel"
        role="tabpanel"
        aria-labelledby="bibtex-tab"
        className="citation-tab-content"
        hidden={tabValue !== "bibtex"}
      >
        <div className="copy-button-container">
          <h3 id="bibtex-preview-heading" className="heading">
            BibTeX Preview
          </h3>

          <Tooltip
            title={copiedBibTeX ? "Copied!" : ""}
            arrow
            open={copiedBibTeX === true}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -6]
                    }
                  }
                ]
              }
            }}
          >
            <button
              type="button"
              className="btn btn-secondary citation-copy-button"
              onClick={onCopyBibTeXCitation}
              disabled={copiedBibTeX}
            >
              <FontAwesomeIcon
                icon={faCopy}
                className="mr-1"
                aria-hidden={true}
              />
              <span>Copy Citation</span>
            </button>
          </Tooltip>
        </div>

        <pre>
          <code aria-labelledby="bibtex-preview-heading">{bibTeXCitation}</code>
        </pre>
      </div>
    </div>
  );
};

export default Citation;
