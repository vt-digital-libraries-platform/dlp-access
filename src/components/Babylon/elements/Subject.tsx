import * as BABYLON from "@babylonjs/core";
import { loadModel } from "../utils/babylon_utils";

class Subject {
  private model: BABYLON.AbstractMesh | null;
  private modelDimensions: BABYLON.Vector3;
  private modelMaxSize: number;
  private scene: BABYLON.Scene;
  private loadingScreen?: BABYLON.ILoadingScreen | null;
  private allowTransparency: boolean;
  // resolves with the loaded model once it is scaled and positioned
  ready: Promise<BABYLON.AbstractMesh | null>;
  constructor(
    model: string,
    scene: BABYLON.Scene,
    scaleFactor: number,
    allowTransparency: boolean,
    loadingScreen?: BABYLON.ILoadingScreen | null
  ) {
    this.model = null;
    this.scene = scene;
    this.loadingScreen = loadingScreen;
    this.allowTransparency = allowTransparency || false;
    this.modelDimensions = new BABYLON.Vector3(0, 0, 0);
    this.modelMaxSize = 0;

    this.ready = this.init(model, scaleFactor);
  }

  async init(
    model: string,
    scaleFactor: number
  ): Promise<BABYLON.AbstractMesh | null> {
    this.model = await loadModel(
      model,
      this.scene,
      this.loadingScreen,
      this.allowTransparency
    );
    if (!this.model) {
      console.error("Failed to load model:", model);
      return null;
    }
    this.modelDimensions = this.model.ellipsoid;
    this.modelMaxSize = Math.max(
      this.modelDimensions._x,
      this.modelDimensions._y,
      this.modelDimensions._z
    );
    this.scaleModel(this.model, scaleFactor);
    this.model.checkCollisions = true;

    // position model at origin
    this.model.position = new BABYLON.Vector3(0, 0, 0);
    return this.model;
  }

  scaleModel(model: BABYLON.AbstractMesh, scaleFactor: number | null) {
    for (const mesh of model.getChildMeshes()) {
      mesh.scaling.scaleInPlace(scaleFactor || 150);
      // for debugging: show bounding box
      // mesh.showBoundingBox = true;
    }
  }

  getModelDimensions(): BABYLON.Vector3 {
    return this.modelDimensions;
  }
}
export default Subject;
