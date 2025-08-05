import { FC, useEffect, useState, useRef } from "react";
import X3DElement from "src/components/X3DElement";
import MiradorViewer from "src/components/MiradorViewer";
import "../../css/3D2Diiif.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import dragToRotateIcon from "../../images/drag_to_rotate.jpg";
import { LeafletThumb } from "../LeafletThumb";

type Props = {
  item: {
    archiveOptions: string;
    location: [number, number];
    asset_urls: {
      iiif_manifest?: string;
      thumbnail?: string;
      morpho_thumb?: string;
    };
    title: string;
  };
  frameWidth: number;
  frameHeight: number;
  site: {};
};

export const ThreeD2DiiifHandler: FC<Props> = ({ item, site }) => {
  const options = JSON.parse(item.archiveOptions);
  const [threeD, setThreeD] = useState(
    options.assets.media_type === "3d_2diiif" ? "primary" : "secondary"
  );
  const [fullScreen, setFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        setFullScreen(false);
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
        setFullScreen(true);
      }
    }
  };

  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      setShowImage(false);
    };

    const x3dElement = document.getElementById("x3d-element-wrapper");

    if (x3dElement) {
      x3dElement.addEventListener("mousedown", handleMouseDown);
      x3dElement.addEventListener("touchstart", handleMouseDown);
    } else {
      console.log("x3dElement not found");
    }

    return () => {
      if (x3dElement) {
        x3dElement.removeEventListener("mousedown", handleMouseDown);
        x3dElement.removeEventListener("touchstart", handleMouseDown);
      }
    };
  }, [item, threeD]);

  useEffect(() => {
    const w = window as any;
    const x3dom = w.x3dom;
    if (x3dom) {
      x3dom.reload();
    }
  }, [item, threeD]);

  const getThreeDThumb = () => {
    return options?.assets?.morpho_thumb || item.asset_urls?.thumbnail;
  };

  const getIIIFThumb = () => {
    return item.asset_urls?.thumbnail;
  };

  const twoDThumbClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setThreeD("secondary");
  };

  const threeDThumbClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setThreeD("primary");
  };

  const primarySectionContent = () => {
    let primaryContent = <></>;
    let width = document.getElementById("image-wrapper")?.offsetWidth;
    let height = document.getElementById("image-wrapper")?.offsetHeight;
    try {
      primaryContent = (
        <>
          <div
            className={`x3d-vis ${threeD === "primary" ? "primary" : "hidden"}`}
            id="x3d-element-wrapper"
          >
            <X3DElement
              url={options.assets.x3d_config}
              frameWidth={width}
              frameHeight={width}
            />
            {showImage && (
              <div className="drag-to-rotate-container">
                <img
                  src={dragToRotateIcon}
                  alt="drag_image"
                  className="drag-to-rotate-icon"
                />
                <span className="drag-to-rotate-label">Drag to rotate</span>
              </div>
            )}
          </div>
          {item.asset_urls?.iiif_manifest && (
            <div
              style={{ height: height, width: width }}
              hidden={threeD === "primary"}
            >
              <MiradorViewer
                item={item}
                site={site}
                type="3d_2diiif"
                hidden={threeD === "primary"}
              />
            </div>
          )}
        </>
      );
    } catch (e) {
      console.error(e);
    }
    return primaryContent;
  };

  const secondarySectionContent = () => {
    return (
      <div className="thumbnail-overlay">
        <button className="thumbnail-button" onClick={twoDThumbClickHandler}>
          <img
            src={getIIIFThumb()}
            alt={"2D Thumbnail"}
            className="thumbnail-image"
          />
          <div className="thumbnail-text">2D</div>
        </button>
        <button className="thumbnail-button" onClick={threeDThumbClickHandler}>
          <img
            src={getThreeDThumb()}
            alt={"3D Thumbnail"}
            className="thumbnail-image"
          />
          <div className="thumbnail-text">3D</div>
        </button>
      </div>
    );
  };

  return (
    <div
      className="multimedia-section"
      id="multimedia-section"
      ref={containerRef}
    >
      <div
        className="options-wrapper"
        id="options-wrapper"
        hidden={threeD !== "primary"}
      >
        <h4 style={{ marginBottom: 0 }}>{item.title}</h4>
        {fullScreen ? (
          <div className="icon-wrapper">
            <FontAwesomeIcon
              onClick={handleFullscreen}
              icon={faCompress}
              id="minimize-icon"
            />
            <span className="tooltip">Exit full screen</span>{" "}
            {/* Tooltip text */}
          </div>
        ) : (
          <div className="icon-wrapper">
            <FontAwesomeIcon
              onClick={handleFullscreen}
              icon={faExpand}
              id="expand-icon"
            />
            <span className="tooltip">Full screen</span> {/* Tooltip text */}
          </div>
        )}
      </div>
      <div className="image-wrapper" id="image-wrapper">
        {primarySectionContent()}
      </div>
      {item.asset_urls?.iiif_manifest && (
        <div className="thumbnail-wrapper" id="thumbnail-wrapper">
          {secondarySectionContent()}
        </div>
      )}
    </div>
  );
};
