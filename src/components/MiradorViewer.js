import { Component } from "react";
import Mirador from "mirador";
import "../css/Viewer.scss";

class MiradorViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      annotationTooltipVisible: false,
      viewTypeControlVisible: false
    };
  }

  miradorConfig() {
    let config = {
      language: "en",
      id: "mirador_viewer",
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
          manifestId: this.props.item.asset_urls
            ? JSON.parse(this.props.item.asset_urls).iiif_manifest
            : null
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
    if (
      this.props.site.miradorOptions &&
      this.props.site.miradorOptions.windowObjects
    ) {
      config.windows[0] = Object.assign(
        config.windows[0],
        this.props.site.miradorOptions.windowObjects
      );
    }
    return config;
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.item.asset_urls !== prevProps.item.asset_urls ||
      this.props.hidden !== prevProps.hidden
    ) {
      Mirador.viewer(this.miradorConfig());
    }
  }

  componentDidMount() {
    Mirador.viewer(this.miradorConfig());
  }

  wrapIf3D2D(miradorElement) {
    const hidden = this.props.hidden ? "hidden" : "";
    if (this.props.type === "3d_2diiif") {
      return (
        <div id="mirador-vis" className={hidden}>
          {miradorElement}
        </div>
      );
    } else {
      return miradorElement;
    }
  }

  render() {
    return this.wrapIf3D2D(<div id={this.miradorConfig().id}></div>);
  }
}

export default MiradorViewer;
