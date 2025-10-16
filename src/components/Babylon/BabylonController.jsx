import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import LoadingScreen from "./LoadingScreen";

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

  scaleModel(model, scaleFactor = null) {
    for (const mesh of model.getChildMeshes()) {
      mesh.scaling.scaleInPlace(scaleFactor || 1);
    }
  }

  async createScene() {
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

    this.loadingScreen = this.createLoadingScreen();
    this.engine.loadingScreen = this.loadingScreen;
    this.engine.loadingScreen.displayLoadingUI();
    const GROUND_DIAMETER = 100;
    this.scene = new BABYLON.Scene(this.engine);

    // Create the environment around the subject
    this.addEnvironment();

    // load and position ground
    const groundModel = this.createGround(GROUND_DIAMETER);
    groundModel.position = new BABYLON.Vector3(0, 0, 0);

    // load the subject model
    this.model = await this.loadModel(this.options.model);
    if (!this.model) {
      console.error("Failed to load model:", this.options.model);
      return;
    }
    this.modelDimensions = this.model.ellipsoid;
    this.modelMaxSize = Math.max(
      this.modelDimensions._x,
      this.modelDimensions._y,
      this.modelDimensions._z
    );
    this.scaleModel(this.model, this.options.scaleFactor);

    // position model
    const objectHoverHeight = this.modelDimensions._y / 3;
    this.model.position = new BABYLON.Vector3(0, objectHoverHeight, 0);

    // cameras
    this.ArcRotateCamera = this.createArcRotateCamera();
    this.UniversalCamera = this.createUniversalCamera();

    this.attachControl(this.ArcRotateCamera);
    this.scene.activeCamera = this.ArcRotateCamera;

    console.log(this.options);
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

    const card = GUI.Button.CreateSimpleButton("flash_card", cardData.front);
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

  flipCard(card, cardData) {
    if (card.textBlock.text === cardData.front) {
      card.textBlock.text = cardData.back;
      window.setTimeout(() => {
        card.textBlock.text = cardData.front;
      }, 5000);
    } else {
      card.text = cardData.front;
    }
  }

  createUniversalCamera(position, rotation) {
    const camera = new BABYLON.UniversalCamera(
      "UniversalCamera",
      position || new BABYLON.Vector3(0, 0.75, 0.5),
      this.scene
    );
    camera.rotation = rotation || new BABYLON.Vector3(Math.PI / 2, 0, 0);

    camera.speed = 0.1;
    camera.wheelPrecision = 100;
    // camera.minZ = 0.1;
    // camera.checkCollisions = true;
    // camera.ellipsoid = new BABYLON.Vector3(1,1,1);

    camera.keysUp.push(69);
    camera.keysDown.push(81);

    camera.keysRotateUp.push(87);
    camera.keysRotateDown.push(83);

    camera.keysRotateLeft.push(65);
    camera.keysRotateRight.push(68);

    camera.angularSensibility = 5000;

    return camera;
  }

  createArcRotateCamera(position, rotation, radius) {
    const camera = new BABYLON.ArcRotateCamera(
      "arcCamera",
      rotation?.horizontal || this.options.rotation?.horizontal || Math.PI / 2,
      rotation?.vertical || this.options.rotation?.vertical || Math.PI / 2,
      radius || 3,
      new BABYLON.Vector3(0, this.modelDimensions._y / 2, 0),
      this.scene
    );
    if (position) {
      camera.setPosition(position);
    }

    camera.speed = 0.25;
    camera.wheelPrecision = 100;
    camera.lowerRadiusLimit = 0.5;
    camera.upperRadiusLimit = 3;
    camera.minZ = 0.1;
    camera.useAutoRotationBehavior = true;
    camera.autoRotationBehavior.zoomStopsAnimation = true;
    // camera.checkCollisions = true;
    // camera.ellipsoid = new BABYLON.Vector3(1,1,1);

    return camera;
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

  addEnvironment() {
    this.createEnvironmentLight(this.scene);
    this.createSkybox(this.scene);
  }

  createEnvironmentLight() {
    this.scene.environmentTexture =
      BABYLON.CubeTexture.CreateFromPrefilteredData(
        this.options.env,
        this.scene
      );
  }

  createSkybox() {
    const skybox = BABYLON.MeshBuilder.CreateBox(
      "skyBox",
      { size: 100.0 },
      this.scene
    );
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    const envTexture = new BABYLON.CubeTexture(
      "https://s3.us-east-1.amazonaws.com/ingest-dev.img.cloud.lib.vt.edu/federated/3d/gltf/environments/dark/env",
      this.scene
    );

    skyboxMaterial.reflectionTexture = envTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
  }

  createGround(diameter) {
    return this.createGroundObject(diameter);
  }

  async createGroundObject(scaleFactor) {
    const groundModel = await this.loadModel(
      "https://d21nnzi4oh5qvs.cloudfront.net/federated/3d/gltf/environments/dark/3DPlatform.glb",
      false
    );
    if (groundModel) {
      for (const mesh of groundModel.getChildMeshes()) {
        mesh.scaling.scaleInPlace(scaleFactor || 1);
      }
    }
    return groundModel;
  }

  lightGroundObject(height) {
    const groundLight = new BABYLON.HemisphericLight(
      "groundLight",
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    groundLight.position = new BABYLON.Vector3(0, height, 0);
    groundLight.intensity = 1;
    groundLight.diffuse = new BABYLON.Color3(1, 1, 1);
  }

  createCanvas(canvasWrapper) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "three-d-canvas";
    canvas.setAttribute("aria-label", this.options?.title || "3d model");
    canvas.setAttribute("aria-roleDescription", "3d model");
    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(canvas);

    return canvas;
  }

  async loadModel(url, updateLoadingStatus = true) {
    const filename = url.split("/").pop();
    const path = url.replace(filename, "");
    let response,
      model = null;
    try {
      response = await BABYLON.SceneLoader.ImportMeshAsync(
        null,
        path,
        filename,
        this.scene,
        (evt) => {
          if (updateLoadingStatus && this.loadingScreen) {
            const loadStatus = ((evt.loaded * 100) / evt.total).toFixed();
            this.loadingScreen.updateLoadStatus(loadStatus);
          }
        }
      );
    } catch (error) {
      console.error("Error loading model:", error);
    }
    if (response?.meshes?.length > 0) {
      model = response.meshes[0];
      for (const mesh of response.meshes) {
        // mesh.showBoundingBox = true;
        mesh.checkCollisions = true;
        if (mesh.material) {
          mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
      }
    }
    return model;
  }

  createLoadingScreen() {
    // <div id="loader">
    //   <p>Loading</p>

    //   <div id="loadingContainer">
    //     <div id="loadingBar"></div>
    //   </div>

    //   <p id="percentLoaded">25%</p>
    // </div>

    this.loader = document.createElement("div");
    this.loader.id = "loader";

    const vtdlpImg = document.createElement("img");
    vtdlpImg.src = "/images/fallback_thumbnail.jpg";
    vtdlpImg.alt = "VT University Libraries Logo";
    this.loader.appendChild(vtdlpImg);

    const loadingText = document.createElement("p");
    loadingText.innerText = "Loading assets...";
    this.loader.appendChild(loadingText);

    const loadingContainer = document.createElement("div");
    loadingContainer.id = "loadingContainer";
    this.loadingBar = document.createElement("div");
    this.loadingBar.id = "loadingBar";
    loadingContainer.appendChild(this.loadingBar);
    this.loader.appendChild(loadingContainer);

    this.percentLoaded = document.createElement("span");
    this.percentLoaded.id = "percentLoaded";
    this.loader.appendChild(this.percentLoaded);

    this.canvasWrapper.appendChild(this.loader);

    const loadingScreen = new LoadingScreen(
      "",
      this.loadingBar,
      this.percentLoaded,
      this.loader
    );
    return loadingScreen;
  }
}

export default BabylonController;
