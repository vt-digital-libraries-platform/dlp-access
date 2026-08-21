import React, { Component } from "react";
import ReactDOM from "react-dom";
import "../css/imports/x3domStyles.css";

// The <x3d>/<scene>/<viewpoint>/<navigationinfo>/<inline> subtree is built
// with plain DOM APIs instead of JSX. These aren't real HTML elements or
// registered custom elements (x3dom scans for these exact, non-hyphenated
// tag names itself), so letting React's reconciler own them triggers dev
// warnings about unrecognized/incorrectly-cased tags. Building them
// imperatively avoids that without changing what x3dom actually sees.
class X3DElement extends Component {
  constructor(props) {
    super(props);
    this.x3dLoaded = this.x3dLoaded.bind(this);
    this.poller = null;
    this.timer = null;
    this.containerRef = React.createRef();
    this.x3dElement = null;
    this.inlineElement = null;
    this.viewpointElement = null;
    this.state = { controlsHost: null };
  }

  componentDidMount() {
    if (!document.getElementById("x3domScript")) {
      const script = document.createElement("script");
      script.id = "x3domScript";
      script.src = "https://img.cloud.lib.vt.edu/scripts/x3dom_1.8.4-dev.js";
      script.async = true;
      document.head.appendChild(script);
    }

    this.buildX3DScene();
    this.x3dLoaded();
    this.zoomFactor = 1.0;
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  buildX3DScene = () => {
    const x3d = document.createElement("x3d");
    x3d.setAttribute("id", "x3dElement");
    x3d.setAttribute("is", "x3d");
    x3d.setAttribute("width", "100%");
    x3d.setAttribute("height", "100%");

    const scene = document.createElement("scene");
    scene.setAttribute("is", "x3d");

    const viewpoint = document.createElement("viewpoint");
    viewpoint.setAttribute("position", "0 0 4");

    const navigationInfo = document.createElement("navigationinfo");
    navigationInfo.setAttribute("type", "examine");
    navigationInfo.setAttribute("id", "navType");

    const inline = document.createElement("inline");
    inline.setAttribute("id", "x3dInline");
    inline.setAttribute("DEF", "x3dInline");
    inline.setAttribute("nameSpaceName", "tanatloc");
    inline.setAttribute("is", "x3d");
    inline.setAttribute("mapDEFToID", "true");
    inline.setAttribute("url", this.props.url);
    inline.addEventListener("load", this.x3dLoaded);

    scene.appendChild(viewpoint);
    scene.appendChild(navigationInfo);
    scene.appendChild(inline);
    x3d.appendChild(scene);

    this.containerRef.current.appendChild(x3d);

    this.x3dElement = x3d;
    this.inlineElement = inline;
    this.viewpointElement = viewpoint;

    // controls are still React-rendered (via portal below), so they stay
    // interactive/click-handled the normal React way
    this.setState({ controlsHost: x3d });
  };

  zoomIn = () => {
    this.zoomFactor -= 0.1; // Decrease zoom factor to zoom in
    this.updateViewpointPosition();
  };

  zoomOut = () => {
    this.zoomFactor += 0.1; // Increase zoom factor to zoom out
    this.updateViewpointPosition();
  };

  updateViewpointPosition = () => {
    if (this.viewpointElement) {
      const initialPosition = [0, 0, 10]; // The initial viewpoint position
      const newPosition = initialPosition.map(
        (coord) => coord * this.zoomFactor
      );
      this.viewpointElement.setAttribute("position", newPosition.join(" "));
    }
  };

  x3dLoaded = () => {
    const poller = () => {
      this.timer = setTimeout(() => {
        const loaded = this.inlineElement?.getAttribute("load");
        if (loaded) {
          window.setTimeout(() => {
            this.x3dElement?.runtime?.showAll();
          }, 1000);
        } else {
          poller();
        }
      }, 250);
    };
    poller();
  };

  render() {
    return (
      <section style={{ width: "100%", height: "100%" }}>
        <div
          ref={this.containerRef}
          style={{ width: "100%", height: "100%", alignItems: "center" }}
        >
          {this.state.controlsHost &&
            ReactDOM.createPortal(
              <div className="controls">
                <div className="tooltip-wrapper">
                  <button onClick={this.zoomIn}>
                    <i className="far fa-plus-circle"></i>
                    <span className="sr-only">Zoom in</span>
                  </button>
                  <span className="viewer-tooltip">Zoom In</span>
                </div>
                <div className="tooltip-wrapper">
                  <button onClick={this.zoomOut}>
                    <i className="far fa-minus-circle"></i>
                    <span className="sr-only">Zoom out</span>
                  </button>
                  <span className="viewer-tooltip">Zoom Out</span>
                </div>
              </div>,
              this.state.controlsHost
            )}
        </div>
      </section>
    );
  }
}
export default X3DElement;
