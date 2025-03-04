import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import "../css/Citation.scss";

interface Props {
  item: Archive;
  site: Site;
  collectionTitle: string;
  parentCollection: Collection;
}

const Citation = ({ item, site, parentCollection }: Props) => {
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedBibTeX, setCopiedBibTeX] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const copyCooldown = 1000;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
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
      title: `${item.title || "Untitled"}. `,
      dlpInstance: getDLPInstance() + ", ",
      sponsor:
        "Virginia Polytechnic Institute and State University, University Libraries. ",
      permalink: getPermalink(),
      accessDate: getAccessDate() + "."
    };
  };

  const generateCitationText = () => {
    const citation = getCitation();
    return `${citation.creator || ""}.${citation.title}${citation.dlpInstance}${
      citation.sponsor
    }${citation.permalink} accessed ${citation.accessDate}`;
  };

  const onCopyCitation = () => {
    if (!copiedCitation) {
      navigator.clipboard.writeText(generateCitationText()).then(
        () => {
          setCopiedCitation(true);
          timerRef.current = setTimeout(
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
          timerRef.current = setTimeout(
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

  return (
    <div aria-label="Item Citation" className="citation-section">
      <div className="citation">
        <div aria-label="Citation Suggest Text" className="suggest-text">
          Paste this entry into your <code> .bib </code> file to cite it in
          LaTeX using <code> \cite{"{...}"}</code>:
        </div>
        <div aria-label="Citation Text" className="citation-text">
          <pre>
            <code>{bibTeXCitation}</code>
          </pre>
        </div>
        <div className="copy-button-container">
          <Tooltip
            title="Copied!"
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
              aria-label="Copy citation to clipboard"
              type="button"
              className="btn btn-secondary citation-copy-button"
              onClick={onCopyBibTeXCitation}
              disabled={copiedBibTeX}
            >
              <FontAwesomeIcon icon={faCopy} size="1x" className="mr-1" />
              <span>Copy BibTeX</span>
            </button>
          </Tooltip>

          <Tooltip
            title="Copied!"
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
              aria-label="Copy citation to clipboard"
              type="button"
              className="btn btn-secondary citation-copy-button"
              onClick={onCopyCitation}
              disabled={copiedCitation}
            >
              <FontAwesomeIcon icon={faCopy} size="1x" className="mr-1" />
              <span>Copy Citation</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Citation;
