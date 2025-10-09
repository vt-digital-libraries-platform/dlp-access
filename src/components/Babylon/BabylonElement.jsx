import { useEffect, useRef } from "react";
import "../../css/_3dViewer.scss";
import BabylonController from "./BabylonController";

const BabylonElement = (props) => {
  const controller = useRef(null);

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
        <div>
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
          <label for="arcRotate">ArcRotate Camera</label>
        </div>

        <div>
          <input
            type="radio"
            id="universal"
            name="camera"
            value="universal"
            onChange={(e) => {
              handleCameraChange(e);
            }}
          />
          <label for="universal">Universal Camera</label>
        </div>
      </div>
    </section>
  );
};

export default BabylonElement;
