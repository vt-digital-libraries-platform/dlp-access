import * as BABYLON from "@babylonjs/core";
import { loadModel } from "../utils/babylon_utils";

class Subject {
  private modelURL: string;
  private rootMesh: BABYLON.AbstractMesh | null;
  private modelDimensions: BABYLON.Vector3;
  private scene: BABYLON.Scene;
  private loadingScreen?: BABYLON.ILoadingScreen | null;
  private objectHoverHeight: number;

  constructor(
    modelURL: string,
    scene: BABYLON.Scene,
    loadingScreen?: BABYLON.ILoadingScreen | null
  ) {
    this.modelURL = modelURL;
    this.rootMesh = null;
    this.scene = scene;
    this.loadingScreen = loadingScreen;
    this.modelDimensions = new BABYLON.Vector3(0, 0, 0);
    this.objectHoverHeight = 0.5; // Default hover height
  }

  async init() {
    this.rootMesh = await loadModel(
      this.modelURL,
      this.scene,
      this.loadingScreen
    );
    if (!this.rootMesh) {
      console.error("Failed to load model:", this.modelURL);
      return;
    }

    let size = this.getAbsoluteSize();
    const scaleFactor = this.getScaleFactor();

    // position model
    this.objectHoverHeight = (size.y * scaleFactor) / 2;
    this.rootMesh.position = new BABYLON.Vector3(0, this.objectHoverHeight, 0);

    // scale model
    this.scaleModel(scaleFactor);

    this.rootMesh.checkCollisions = true;
  }

  getAspectRatio() {
    if (!this.rootMesh) {
      return 1; // Default aspect ratio
    }

    const size = this.getAbsoluteSize();
    const maxSize = Math.max(size.x, size.y, size.z);
    const aspectRatio = Math.max(
      maxSize * size.x,
      maxSize * size.y,
      maxSize * size.z
    );

    return aspectRatio;
  }

  scaleModel(scaleFactor: number) {
    if (this.rootMesh) {
      // Scale the root mesh and all its chern
      this.rootMesh.scaling.scaleInPlace(scaleFactor);
      for (const mesh of this.rootMesh.getChildMeshes()) {
        mesh.scaling.scaleInPlace(scaleFactor);
      }
      // @ts-ignore
      this.rootMesh.bakeCurrentTransformIntoVertices();
    }
  }

  getAbsoluteSize() {
    if (!this.rootMesh) {
      return BABYLON.Vector3.Zero();
    }

    const size = BABYLON.Vector3.Zero();
    for (const mesh of this.rootMesh.getChildMeshes()) {
      const boundingInfo = mesh.getBoundingInfo();
      const boundingBox = boundingInfo.boundingBox;
      size.x = Math.max(
        size.x,
        Math.abs(boundingBox.maximumWorld.x - boundingBox.minimumWorld.x)
      );
      size.y = Math.max(
        size.y,
        Math.abs(boundingBox.maximumWorld.y - boundingBox.minimumWorld.y)
      );
      size.z = Math.max(
        size.z,
        Math.abs(boundingBox.maximumWorld.z - boundingBox.minimumWorld.z)
      );
    }

    return size;
  }

  getScaleFactor() {
    const size = this.getAbsoluteSize();
    const maxSize = Math.max(size.x, size.y, size.z);

    return 1 / maxSize;
  }

  getModelDimensions(): BABYLON.Vector3 {
    return this.modelDimensions;
  }

  getObjectHoverHeight(): number {
    return this.objectHoverHeight;
  }
}
export default Subject;
