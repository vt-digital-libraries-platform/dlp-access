import { FC, useEffect } from "react";
import Mirador from "mirador";
import "../css/Viewer.scss";

const VIEWER_ID = "mirador_viewer";

type Item = {
  manifest_url: string;
};

type Site = {
  miradorOptions?: {
    windowObjects?: Record<string, unknown>;
  } | null;
};

type Props = {
  item: Item;
  site: Site;
  type?: string;
  hidden?: boolean;
};

type MiradorWindow = {
  manifestId: string;
  [key: string]: unknown;
};

type MiradorViewerConfig = {
  language: string;
  id: string;
  window: Record<string, unknown>;
  views: Array<Record<string, unknown>>;
  windows: MiradorWindow[];
  thumbnailNavigation: Record<string, unknown>;
  workspace: Record<string, unknown>;
  workspaceControlPanel: Record<string, unknown>;
};

const MiradorViewer: FC<Props> = ({ item, site, type, hidden }) => {
  const windowObjects = site?.miradorOptions?.windowObjects;

  useEffect(() => {
    const config: MiradorViewerConfig = {
      language: "en",
      id: VIEWER_ID,
      window: {
        allowClose: false,
        allowFullscreen: true,
        allowMaximize: false,
        allowWindowSideBar: false,
        defaultView: "single",
        panels: {
          canvas: false,
          search: false
        }
      },
      views: [{ key: "single", behaviors: ["individuals"] }],
      windows: [
        {
          manifestId: item.manifest_url
        }
      ],
      thumbnailNavigation: {
        defaultPosition: "far-bottom"
      },
      workspace: {
        draggingEnabled: false,
        allowNewWindows: false,
        isWorkspaceAddVisible: false,
        showZoomControls: true,
        type: "mosaic"
      },
      workspaceControlPanel: {
        enabled: false
      }
    };

    if (windowObjects) {
      config.windows[0] = Object.assign({}, config.windows[0], windowObjects);
    }

    const miradorInstance = Mirador.viewer(config);

    return () => {
      if (
        miradorInstance &&
        typeof miradorInstance === "object" &&
        "unmount" in miradorInstance &&
        typeof miradorInstance.unmount === "function"
      ) {
        miradorInstance.unmount();
      }
    };
  }, [item.manifest_url, windowObjects]);

  const miradorElement = <div id={VIEWER_ID}></div>;

  if (type === "3d_2diiif") {
    return (
      <div id="mirador-vis" className={hidden ? "hidden" : ""}>
        {miradorElement}
      </div>
    );
  }

  return miradorElement;
};

export default MiradorViewer;
