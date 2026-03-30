import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import MiradorViewer from "src/components/MiradorViewer";
import X3DElement from "src/components/X3DElement";
import "../../css/3D2Diiif.scss";
import dragToRotateIcon from "../../images/drag_to_rotate.jpg";

type Props = {
  item: {
    archiveOptions: string;
    location: [number, number];
    manifest_url: string;
    thumbnail_path: string;
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
  const [optionsWrapperHeight, setOptWrapperHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const imageWrapperHeight = 900;

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

  useLayoutEffect(() => {
    const updateHeight = () => {
      const newOptWrapperHeight = optionsRef.current?.offsetHeight ?? 0;
      setOptWrapperHeight((prev) =>
        prev === newOptWrapperHeight ? prev : newOptWrapperHeight
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [threeD, fullScreen, item.title]);

  const getThreeDThumb = () => {
    return options?.assets?.morpho_thumb || item.thumbnail_path;
  };

  const getIIIFThumb = () => {
    return item.thumbnail_path;
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
    return (
      <>
        <div
          style={{ height: imageWrapperHeight }}
          hidden={threeD !== "primary"}
        >
          <div
            className="options-wrapper"
            id="options-wrapper"
            ref={optionsRef}
          >
            <h4 style={{ marginBottom: 0 }}>{item.title}</h4>
            <Tooltip
              title={fullScreen ? "Exit full screen" : "Enter full screen"}
              arrow
              slotProps={{
                popper: {
                  disablePortal: true,
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
              <button onClick={handleFullscreen} className="fullscreen-toggle">
                {fullScreen ? (
                  <>
                    <FontAwesomeIcon
                      icon={faCompress}
                      className="toggle-icon"
                    />
                    <span className="sr-only">Exit full screen</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faExpand} className="toggle-icon" />
                    <span className="sr-only">Enter full screen</span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>
          <div
            id="x3d-element-wrapper"
            style={{ height: imageWrapperHeight - optionsWrapperHeight }}
          >
            <X3DElement url={options.assets.x3d_config} />
          </div>
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
        {item.manifest_url && (
          <div
            style={{ height: imageWrapperHeight, width: "100%" }}
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
  };

  const secondarySectionContent = () => {
    return (
      <ul className="thumbnail-overlay" aria-label="Viewer mode">
        <li>
          <button
            className="thumbnail-button"
            onClick={twoDThumbClickHandler}
            aria-current={threeD === "secondary"}
          >
            <img src={getIIIFThumb()} alt="" className="thumbnail-image" />
            <span className="thumbnail-label">2D view</span>
          </button>
        </li>
        <li>
          <button
            className="thumbnail-button"
            onClick={threeDThumbClickHandler}
            aria-current={threeD === "primary"}
          >
            <img src={getThreeDThumb()} alt="" className="thumbnail-image" />
            <span className="thumbnail-label">3D view</span>
          </button>
        </li>
      </ul>
    );
  };

  return (
    <div
      className="multimedia-section"
      id="multimedia-section"
      ref={containerRef}
    >
      <div
        className="image-wrapper"
        id="image-wrapper"
        style={{ height: imageWrapperHeight }}
      >
        {primarySectionContent()}
      </div>
      {item.manifest_url && (
        <div className="thumbnail-wrapper" id="thumbnail-wrapper">
          {secondarySectionContent()}
        </div>
      )}
    </div>
  );
};
