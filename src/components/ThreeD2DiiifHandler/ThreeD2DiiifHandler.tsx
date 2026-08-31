import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import MiradorViewer from "src/components/MiradorViewer";
import X3DElement from "src/components/X3DElement";
import "../../css/3D2Diiif.scss";
import dragToRotateIcon from "../../images/drag_to_rotate.jpg";
import BabylonElement from "../Babylon/BabylonElement";
import { MediaKind } from "src/lib/mediaKind";

type Props = {
  item: {
    archiveOptions: string;
    format: string;
    location: [number, number];
    manifest_url: string;
    thumbnail_path: string;
    title: string;
  };
  // ArchivePage has already run resolveMediaKind(item) to decide to render
  // this component; the resolved value is passed down rather than
  // re-parsed here, so it's always one of the "3d-2diiif-*" kinds.
  media: Extract<MediaKind, { kind: "3d-2diiif-gltf" | "3d-2diiif-x3d" }>;
  frameWidth: number;
  frameHeight: number;
  site: {};
};

export const ThreeD2DiiifHandler: FC<Props> = ({ item, media, site }) => {
  const [threeD, setThreeD] = useState<"primary" | "secondary">("primary");
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
    return media.thumb;
  };

  const getIIIFThumb = () => {
    return item.thumbnail_path;
  };

  const twoDThumbClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setThreeD("secondary");
    document
      .getElementById("image-wrapper")
      ?.style.setProperty("height", `${imageWrapperHeight}px`);
  };

  const threeDThumbClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setThreeD("primary");
    document
      .getElementById("image-wrapper")
      ?.style.setProperty("height", `${imageWrapperHeight - 100}px`);
  };

  const primarySectionContent = () => {
    let width = document.getElementById("image-wrapper")?.offsetWidth;
    let height = document.getElementById("image-wrapper")?.offsetHeight;

    try {
      return media.kind === "3d-2diiif-gltf"
        ? gltfContent(media)
        : x3dContent(media, width, height);
    } catch (e) {
      console.error(e);
      return <></>;
    }
  };

  const x3dContent = (
    media: Extract<MediaKind, { kind: "3d-2diiif-x3d" }>,
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
            url={media.x3dConfig}
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

  const gltfContent = (
    media: Extract<MediaKind, { kind: "3d-2diiif-gltf" }>
  ) => {
    return (
      <>
        <div
          className={`gltf-vis ${threeD === "primary" ? "primary" : "hidden"}`}
          id="gltf-element-wrapper"
        >
          <div className="image-wrapper" id="image-wrapper">
            <BabylonElement
              model={media.gltfConfig}
              env={media.envConfig}
              scaleFactor={media.scaleFactor}
              rotation={media.rotation}
              item={item}
              _3dConfig={media.threeDConfig}
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
        style={{ height: imageWrapperHeight - 100 }}
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
