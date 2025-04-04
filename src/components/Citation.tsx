import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { useEffect, useRef, useState } from "react";

import "../css/Citation.scss";

interface Props {
  item: Archive;
  site: Site;
  parentCollection: Collection;
}

const Citation = ({ item, site, parentCollection }: Props) => {
  const [tabValue, setTabValue] = useState("citation");
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedBibTeX, setCopiedBibTeX] = useState(false);
  const citationCopyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bibTeXCopyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const copyCooldown = 1000;

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

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
  const citationObj = getCitation();
  return (
    <div className="citation">
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleTabChange} aria-label="citation tabs">
            <Tab label="Citation" value="citation" className="citation-tab" />
            <Tab label="BibTeX" value="bibtex" className="citation-tab" />
          </TabList>
        </Box>

        <TabPanel value="citation" className="citation-tab-content">
          <div className="copy-button-container">
            <p className="heading">Citation Preview</p>

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
                type="button"
                className="btn btn-secondary citation-copy-button"
                onClick={onCopyCitation}
                disabled={copiedCitation}
              >
                <FontAwesomeIcon icon={faCopy} className="mr-1" />
                <span>Copy Citation</span>
              </button>
            </Tooltip>
          </div>

          <div className="citation-text">
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
          </div>
        </TabPanel>

        <TabPanel value="bibtex" className="citation-tab-content">
          <div className="copy-button-container">
            <p className="heading">BibTeX Preview</p>

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
                type="button"
                className="btn btn-secondary citation-copy-button"
                onClick={onCopyBibTeXCitation}
                disabled={copiedBibTeX}
              >
                <FontAwesomeIcon icon={faCopy} className="mr-1" />
                <span>Copy Citation</span>
              </button>
            </Tooltip>
          </div>

          <pre>
            <code>{bibTeXCitation}</code>
          </pre>
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default Citation;
