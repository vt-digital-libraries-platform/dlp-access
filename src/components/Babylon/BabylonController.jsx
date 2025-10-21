import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import Loader from "./elements/Loader";
import Environment from "./elements/Environment";
import Subject from "./elements/Subject";
import Ground from "./elements/Ground";
import Camera from "./elements/Camera";

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

    this.initialPosition = new BABYLON.Vector3(0, 0, -10);
    this.initialRotationVector = new BABYLON.Vector3(
      Math.PI / 2,
      Math.PI / 2,
      0
    );
    this.initialRotation = { horizontal: Math.PI / 2, vertical: Math.PI / 2 };
    this.initialRadius = 3;

    this.createScene(
      this.options.model,
      this.options.scaleFactor,
      this.options.rotation
    );
    this.addListeners();
  }

  addListeners() {
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  removeListeners() {
    window.removeEventListener("resize", () => {
      this.engine.resize();
    });
  }

  engineDispose() {
    this.engine.stopRenderLoop();
    this.engine.dispose();
  }

  async createScene() {
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

    this.loadingScreen = new Loader(this.engine, this.canvasWrapper);

    this.scene = new BABYLON.Scene(this.engine);

    // Create the environment around the subject
    const environment = new Environment(this.options.env, this.scene);

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

    this.attachControl(this.ArcRotateCamera);
    this.scene.activeCamera = this.ArcRotateCamera;

    // addOns from config
    if (this.options?._3dConfig?.addOns?.length > 0) {
      this.handleAddOns(this.options._3dConfig.addOns);
    }
    this.engine.hideLoadingUI();
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
        this.createFlashCard(addOn);
        break;
      default:
        console.warn(`Unknown add-on type: ${addOn.type}`);
    }
  }

  createFlashCard(cardData) {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      this.scene
    );

    const cardFront = this.getTextValue(
      cardData.front.type,
      cardData.front.value
    );
    const card = GUI.Button.CreateSimpleButton("flash_card", cardFront);
    card.width = "400px";
    card.height = "125px";
    card.paddingTopInPixels = 20;
    card.paddingBottomInPixels = 20;
    card.paddingLeftInPixels = 20;
    card.paddingRightInPixels = 20;
    card.fontSize = "30px";
    card.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    card.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    card.color = "white";
    card.background = "#861f41";

    card.onPointerUpObservable.add(() => {
      this.flipCard(card, cardData);
    });
    advancedTexture.addControl(card);
  }

  getTextValue(type, value) {
    let text = null;
    if (type === "string") {
      text = value;
    } else if (type === "metadata") {
      text = this.options.item[value];
    }
    return text;
  }

  flipCard(card, cardData) {
    const cardFront = this.getTextValue(
      cardData.front.type,
      cardData.front.value
    );
    const cardBack = this.getTextValue(cardData.back.type, cardData.back.value);

    if (card.textBlock.text === cardFront) {
      card.textBlock.text = cardBack;
      window.setTimeout(() => {
        card.textBlock.text = cardFront;
      }, 5000);
    } else {
      card.textBlock.text = cardFront;
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
      this.switchCamera(this.ArcRotateCamera, this.currentCamera);
    } else if (cameraName === "universal") {
      this.switchCamera(this.UniversalCamera, this.currentCamera);
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
