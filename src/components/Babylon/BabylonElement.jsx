import { useEffect, useRef, useState } from "react";
import "../../css/_3dViewer.scss";
import BabylonController from "./BabylonController";

const BabylonElement = (props) => {
  const controller = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleCameraChange = (event) => {
    const selectedCamera = event.target.value;
    controller.current.switchCameraByName(selectedCamera);
  };

  useEffect(() => {
    controller.current = new BabylonController(props);

    return () => {
      controller.current.removeListeners();
      controller.current.engineDispose();
    };
  }, [props]);

  return (
    <section>
      <div>
        <div id="canvas-wrapper"></div>
      </div>
      <div id="controls">
        <div id="controls-top-row">
          <span className="camera-radio">
            <input
              type="radio"
              id="arcRotate"
              name="camera"
              value="arcRotate"
              defaultChecked
              onChange={(e) => {
                handleCameraChange(e);
              }}
            />
            <label htmlFor="arcRotate">ArcRotate Camera</label>
          </span>

          <span className="camera-radio">
            <input
              type="radio"
              id="universal"
              name="camera"
              value="universal"
              onChange={(e) => {
                handleCameraChange(e);
              }}
            />
            <label htmlFor="universal">Universal Camera</label>
          </span>

          <button
            id="reset"
            className="btn hokie-maroon align-right"
            onClick={() => {
              controller.current.resetView();
            }}
          >
            Reset 3D View
          </button>
        </div>
        <div id="controls-bottom-row">
          <span>
            <input
              type="checkbox"
              id="auto-rotate"
              name="auto-rotate"
              onChange={(e) => {
                controller.current.toggleAutoRotate(e.target.checked);
                setAutoRotate(e.target.checked);
              }}
              checked={autoRotate}
            />
            <label htmlFor="auto-rotate">Auto Rotate</label>
          </span>
        </div>
      </div>
    </section>
  );
};

export default BabylonElement;
