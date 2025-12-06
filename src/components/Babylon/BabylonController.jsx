import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import * as BABYLON from "@babylonjs/core";
import Loading from "./elements/Loading";
import Environment from "./elements/Environment";
import Subject from "./elements/Subject";
import Ground from "./elements/Ground";
import Camera from "./elements/Camera";
import FlashCard from "./elements/addOns/FlashCard";

class BabylonController {
  constructor(options) {
    registerBuiltInLoaders();
    this.options = options;
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

    this.initialPosition = new BABYLON.Vector3(0, 0.5, 10);
    this.initialRotationVector = new BABYLON.Vector3(
      this.options?.rotation?.horizontal || Math.PI / 2,
      this.options?.rotation?.vertical || Math.PI / 2,
      0
    );
    // -Math.PI / 2
    this.initialRotation = this.options.rotation || {
      horizontal: Math.PI / 2,
      vertical: Math.PI / 2
    };
    this.initialRadius = 3;

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
    // this.engine.loadingScreen = this.loadingScreen;
    // this.engine.loadingScreen.displayLoadingUI();

    // Create the environment around the subject
    const environment = new Environment(this.scene, this.options.env);

    // load and position ground
    const GROUND_DIAMETER = 100;
    const groundModel = new Ground(this.scene, GROUND_DIAMETER);

    // load the subject model
    this.model = new Subject(
      this.options.model,
      this.scene,
      this.options.scaleFactor,
      this.loadingScreen
    );

    // cameras
    this.ArcRotateCamera = new Camera(
      "arcRotate",
      this.scene,
      this.canvas,
      this.initialPosition,
      null,
      this.initialRotation,
      this.initialRadius,
      this.model.ellipsoid
    );

    this.UniversalCamera = new Camera(
      "universal",
      this.scene,
      this.canvas,
      this.initialPosition,
      this.initialRotationVector,
      null,
      this.initialRadius,
      this.model.ellipsoid
    );

    this.attachControl(this.ArcRotateCamera.active);
    this.scene.activeCamera = this.ArcRotateCamera.active;

    // addOns from config
    if (this.options?._3dConfig?.addOns?.length > 0) {
      this.handleAddOns(this.options._3dConfig.addOns);
    }

    // this.engine.hideLoadingUI();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  handleAddOns(addOns) {
    for (const addOn of addOns) {
      this.handleAddOn(addOn);
    }
  }

  handleAddOn(addOn) {
    switch (addOn.type) {
      case "flash_card":
        const flashCard = new FlashCard(this.scene, this.options, addOn);
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
    canvas.setAttribute("aria-label", this.options?.item?.title || "3d model");
    canvas.setAttribute("aria-roleDescription", "3d model");
    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(canvas);

    return canvas;
  }
}

export default BabylonController;
