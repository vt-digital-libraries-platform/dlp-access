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

const MiradorViewer: FC<Props> = ({ item, site, type, hidden }) => {
  const windowObjects = site?.miradorOptions?.windowObjects;

  useEffect(() => {
    const config: any = {
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
      config.windows[0] = Object.assign(config.windows[0], windowObjects);
    }

    Mirador.viewer(config);
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
