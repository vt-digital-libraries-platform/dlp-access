import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import * as BABYLON from "@babylonjs/core";
import Loading from "./elements/Loading";
import Environment from "./elements/Environment";
import Subject from "./elements/Subject";
import Ground from "./elements/Ground";
import Camera from "./elements/Camera";
import FlashCard from "./elements/addOns/FlashCard";

class BabylonController {
  constructor(props) {
    registerBuiltInLoaders();
    this.props = props;
    this.canvasWrapper = document.getElementById("canvas-wrapper");
    this.canvas = this.createCanvas(this.canvasWrapper);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.model = null;
    this.scene = null;
    this.modelDimensions = null;
    this.modelMaxSize = null;
    this.ArcRotateCamera = null;
    this.UniversalCamera = null;
    this.currentCamera = null;
    this.loadingScreen = null;
    this.loader = null;
    this.loadingBar = null;
    this.percentLoaded = null;

    // camera distance is now computed automatically from the loaded
    // model's height (see Subject#getCameraDistance); scaleFactor from
    // content config is not wired into that yet.
    this.initialPosition = new BABYLON.Vector3(0, 0.5, 10);

    this.initialRotationVector = new BABYLON.Vector3(
      this.toFloat(this.props?.rotation?.horizontal),
      this.toFloat(this.props?.rotation?.vertical) || Math.PI / 2,
      0
    );
    this.initialRotation = this.props.rotation || {
      horizontal: 0,
      vertical: Math.PI / 2
    };

    this.createScene();
    this.addListeners();
  }

  addListeners() {
    window.addEventListener("resize", () => {
      if (this.engine) {
        this.engine.resize();
      }
    });
  }

  removeListeners() {
    window.removeEventListener("resize", () => {
      if (this.engine) {
        this.engine.resize();
      }
    });
  }

  engineDispose() {
    if (this.engine) {
      this.engine.stopRenderLoop();
      this.engine.dispose();
    }
  }

  async createScene() {
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
    this.scene = new BABYLON.Scene(this.engine);

    this.loadingScreen = new Loading(
      this.engine,
      this.canvasWrapper
    ).getLoadingScreen();

    // Create the environment around the subject
    const environment = new Environment(this.scene, this.props.env);

    // for debugging
    // this.axesViewer = new BABYLON.AxesViewer(this.scene, 0.5);

    // load the subject model
    this.model = new Subject(
      this.props.model,
      this.scene,
      null,
      this.props._3dConfig?.allowTransparency || false,
      this.loadingScreen
    );
    await this.model.ready;

    // load and position ground, sized to the model's initial framing
    // distance; rescaled every frame below to keep its apparent size
    // roughly constant as the camera zooms
    this.ground = new Ground(this.scene, this.model.getCameraDistance());

    // cameras
    const { lower: lowerRadiusLimit, upper: upperRadiusLimit } =
      this.model.getCameraRadiusLimits();
    this.ArcRotateCamera = new Camera(
      "arcRotate",
      this.scene,
      this.canvas,
      this.initialPosition,
      null,
      this.initialRotation,
      this.model.getCameraDistance(),
      this.model.ellipsoid,
      lowerRadiusLimit,
      upperRadiusLimit,
      this.model.getCameraTarget()
    );

    // this.UniversalCamera = new Camera(
    //   "universal",
    //   this.scene,
    //   this.canvas,
    //   this.initialPosition,
    //   this.initialRotationVector,
    //   null,
    //   this.initialRadius,
    //   this.model.ellipsoid
    // );

    this.attachControl(this.ArcRotateCamera.active);
    this.scene.activeCamera = this.ArcRotateCamera.active;

    // keep the ground's apparent size roughly constant as the camera zooms
    this.scene.onBeforeRenderObservable.add(() => {
      this.ground.setScale(this.ArcRotateCamera.active.radius);
    });

    // addOns from config
    if (this.props?._3dConfig?.addOns?.length > 0) {
      this.handleAddOns(this.props._3dConfig.addOns);
    }

    // this.engine.hideLoadingUI();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  toFloat(floatVal) {
    if (parseFloat(floatVal) === 0 || !parseFloat(floatVal)) {
      return 0.0;
    }
    return parseFloat(floatVal);
  }

  handleAddOns(addOns) {
    for (const addOn of addOns) {
      this.handleAddOn(addOn);
    }
  }

  handleAddOn(addOn) {
    switch (addOn.type) {
      case "flash_card":
        const flashCard = new FlashCard(this.scene, this.props, addOn);
        break;
      default:
        console.warn(`Unknown add-on type: ${addOn.type}`);
    }
  }

  toggleAutoRotate() {
    if (this.scene.activeCamera.useAutoRotationBehavior) {
      this.scene.activeCamera.useAutoRotationBehavior = false;
    } else {
      this.scene.activeCamera.useAutoRotationBehavior = true;
    }
  }

  getActiveCamera() {
    return this.scene.activeCamera;
  }

  getAutoRotate() {
    return this.scene.activeCamera.useAutoRotationBehavior;
  }

  resetView() {
    console.log("Resetting view");
  }

  switchCameraByName(cameraName) {
    if (cameraName === "arcRotate") {
      this.switchCamera(this.ArcRotateCamera.active, this.currentCamera.active);
    } else if (cameraName === "universal") {
      this.switchCamera(this.UniversalCamera.active, this.currentCamera.active);
    }
  }

  switchCamera(newCamera, currentCamera) {
    if (currentCamera) {
      this.scene.activeCamera.detachControl(this.canvas);
      newCamera.position = this.scene.activeCamera.position;
      newCamera.rotation = this.scene.activeCamera.rotation;
    }
    this.scene.activeCamera = newCamera;
    this.attachControl(newCamera);
  }

  attachControl(camera) {
    // false in 2nd arg tells Babylon TO call preventDefault() on events.
    // Just trust me, it's backwards
    camera.attachControl(this.canvas, false);
  }

  createCanvas(canvasWrapper) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "three-d-canvas";
    canvas.setAttribute("aria-label", this.props?.item?.title || "3d model");
    canvas.setAttribute("aria-roleDescription", "3d model");
    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(canvas);

    return canvas;
  }
}

export default BabylonController;
