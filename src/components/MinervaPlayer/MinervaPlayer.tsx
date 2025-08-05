import {
  faArrowUpRightFromSquare,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MinervaStory from "minerva-browser";
import React, { FC, ReactElement, useState } from "react";
import Modal from "react-modal";
import { Link, useLocation } from "react-router-dom";
import { Thumbnail } from "../Thumbnail";
import "../../css/Viewer.scss";
interface MinervaPlayerProps {
  item: Archive;
  site: Site;
}

declare global {
  interface Window {
    viewer: any;
  }
}

export const MinervaPlayer: FC<MinervaPlayerProps> = ({ item, site }) => {
  let display: ReactElement;
  const location = useLocation();
  const [fullScreenViewer, setFullScreenViewer] = useState(false);

  const setFullScreenView = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    const nav = document.getElementById("vt_nav");
    nav?.classList.add("hidden");
    setFullScreenViewer(true);
  };

  const setDefaultView = (event: React.SyntheticEvent): void => {
    window.viewer.then((v: any) => {
      v.destroy();
    });
    const nav = document.getElementById("vt_nav");
    nav?.classList.remove("hidden");

    setFullScreenViewer(false);
  };

  const defaultView = (): ReactElement => {
    return (
      <div className="minerva-image-wrapper">
        <Link to={location.pathname} onClick={setFullScreenView}>
          <Thumbnail item={item} altText={true} site={site} />
          <span className="visually-hidden">Opens fullscreen viewer</span>
        </Link>
        <div id="minerva-open-dialog">
          <p>This record type requires a full screen image viewer.</p>
          <button onClick={setFullScreenView}>
            Open Viewer
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </button>
        </div>
      </div>
    );
  };

  const fullScreenView = (): ReactElement => {
    const customStyles = {
      content: {
        display: "block",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        zIndex: 10000
      }
    };
    return (
      <Modal
        isOpen={fullScreenViewer}
        onAfterOpen={initializeMinerva}
        style={customStyles}
        contentLabel="Minerva Modal"
        appElement={document.getElementById("fullScreenWrapper") as HTMLElement}
      >
        <>
          <div id="minerva-browser"></div>
          <span id="minerva-browser-closer">
            <button onClick={setDefaultView}>
              Close Viewer
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </span>
        </>
      </Modal>
    );
  };

  const initializeMinerva = () => {
    try {
      window.viewer = MinervaStory.build_page({
        hideWelcome: true,
        exhibit: item.asset_urls.minerva_manifest,
        id: "minerva-browser",
        embedded: true
      });
    } catch (error) {
      console.log("error rendering Minerva");
    }
  };

  if (fullScreenViewer) {
    display = fullScreenView();
  } else {
    display = defaultView();
  }

  return <div>{display}</div>;
};
