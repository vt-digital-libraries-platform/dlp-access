import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import * as BABYLON from "@babylonjs/core";

class BabylonController {
  constructor(options) {
    registerBuiltInLoaders();
    this.options = options;
    const canvasWrapper = document.getElementById("canvas-wrapper");
    this.canvas = this.createCanvas(canvasWrapper);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.model = null;
    this.scene = null;
    this.modelDimensions = null;
    this.modelMaxSize = null;
    this.ArcRotateCamera = null;
    this.UniversalCamera = null;
    this.currentCamera = null;

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
    const GROUND_DIAMETER = 100;
    this.scene = new BABYLON.Scene(this.engine);

    // Create the environment around the subject
    this.addEnvironment();

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

    // load and position ground
    const groundModel = this.createGround(GROUND_DIAMETER, objectHoverHeight);
    groundModel.position = new BABYLON.Vector3(0, 0, 0);

    this.ArcRotateCamera = this.createArcRotateCamera();
    this.UniversalCamera = this.createUniversalCamera();

    this.attachControl(this.ArcRotateCamera);
    this.scene.activeCamera = this.ArcRotateCamera;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  createUniversalCamera(position, rotation) {
    const camera = new BABYLON.UniversalCamera(
      "UniversalCamera",
      new BABYLON.Vector3(0, 0.75, 0.5),
      this.scene
    );
    camera.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

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

  createArcRotateCamera(position, rotation) {
    const camera = new BABYLON.ArcRotateCamera(
      "arcCamera",
      this.options.rotation?.horizontal || Math.PI / 2,
      this.options.rotation?.vertical || Math.PI / 2,
      3,
      new BABYLON.Vector3(0, this.modelDimensions._y / 2, 0),
      this.scene
    );

    camera.speed = 0.25;
    camera.wheelPrecision = 100;
    camera.lowerRadiusLimit = 0.25;
    camera.upperRadiusLimit = 3;
    camera.minZ = 0.1;
    camera.useAutoRotationBehavior = true;
    camera.autoRotationBehavior.zoomStopsAnimation = true;
    // camera.checkCollisions = true;
    // camera.ellipsoid = new BABYLON.Vector3(1,1,1);

    return camera;
  }

  switchCameraByName(cameraName) {
    if (cameraName === "arcRotate") {
      this.switchCamera(this.ArcRotateCamera, this.currentCamera);
    } else if (cameraName === "universal") {
      this.switchCamera(this.UniversalCamera, this.currentCamera);
    }
  }

  switchCamera(newCamera, currentCamera) {
    console.clear();
    console.log(this.scene.activeCamera.position);
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
      "https://d21nnzi4oh5qvs.cloudfront.net/federated/3d/gltf/environments/dark/3DPlatform.glb"
    );

    for (const mesh of groundModel.getChildMeshes()) {
      mesh.scaling.scaleInPlace(scaleFactor || 1);
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
    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(canvas);

    return canvas;
  }

  async loadModel(url) {
    const filename = url.split("/").pop();
    const path = url.replace(filename, "");
    let response,
      model = null;
    try {
      response = await BABYLON.SceneLoader.ImportMeshAsync(
        null,
        path,
        filename,
        this.scene
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
}

export default BabylonController;
