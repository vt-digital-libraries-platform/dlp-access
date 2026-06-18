import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import MiradorViewer from "src/components/MiradorViewer";
import X3DElement from "src/components/X3DElement";
import "../../css/3D2Diiif.scss";
import dragToRotateIcon from "../../images/drag_to_rotate.jpg";
import BabylonElement from "../Babylon/BabylonElement";

type Props = {
  item: {
    archiveOptions: string;
    format: string;
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
    options?.assets?.media_type === "3d_2diiif" ? "primary" : "secondary"
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
    return (
      options?.assets?.thumbnail ||
      options?.assets?.morpho_thumb ||
      item.thumbnail_path
    );
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
    let primaryContent = <></>;
    let width = document.getElementById("image-wrapper")?.offsetWidth;
    let height = document.getElementById("image-wrapper")?.offsetHeight;
    const _3dFormat =
      options.assets.media_type === "3d_2diiif" && options.assets.gltf_config
        ? "gltf"
        : "x3d";

    if (_3dFormat === "gltf") {
      try {
        primaryContent = gltfContent();
      } catch (e) {
        console.error(e);
      }
    } else if (_3dFormat === "x3d") {
      try {
        primaryContent = x3dContent(width, height);
      } catch (e) {
        console.error(e);
      }
    }
    return primaryContent;
  };

  const x3dContent = (
    width: number | undefined,
    height: number | undefined
  ) => {
    return (
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
        {item.manifest_url && (
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
  };

  const gltfContent = () => {
    return (
      <>
        <div
          className={`gltf-vis ${threeD === "primary" ? "primary" : "hidden"}`}
          id="gltf-element-wrapper"
        >
          <div className="image-wrapper" id="image-wrapper">
            <BabylonElement
              model={options.assets.gltf_config}
              env={options.assets.env_config}
              scaleFactor={
                options.config?._3d?.scale_factor || options.assets.scale_factor
              }
              rotation={
                options.config?._3d?.rotation || options.assets.rotation
              }
              item={item}
              _3dConfig={options?.config?._3d}
            />
          </div>
        </div>
        {item.manifest_url && (
          <MiradorViewer
            item={item}
            site={site}
            type="3d_2diiif"
            hidden={threeD === "primary"}
          />
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
