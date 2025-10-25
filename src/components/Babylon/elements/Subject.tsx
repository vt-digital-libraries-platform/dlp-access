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

    const size = this.getAbsoluteSize();
    const scaleFactor = this.getScaleFactor();
    console.log("size", [
      size.x / scaleFactor,
      size.y / scaleFactor,
      size.z / scaleFactor
    ]);
    this.scaleModel(scaleFactor);
    this.rootMesh.checkCollisions = true;

    // position model
    const aspectRatio = this.getAspectRatio();
    this.objectHoverHeight = 0.5 - (5 * aspectRatio) / 100;
    this.rootMesh.position = new BABYLON.Vector3(0, this.objectHoverHeight, 0);
    console.log("model position", this.rootMesh.position);
  }

  getAspectRatio() {
    if (!this.rootMesh) {
      return 1; // Default aspect ratio
    }

    const size = this.getAbsoluteSize();
    const maxSize = Math.max(size.x, size.y, size.z);
    const aspectRatio = Math.max(
      maxSize / size.x,
      maxSize / size.y,
      maxSize / size.z
    );

    return aspectRatio;
  }

  scaleModel(scaleFactor: number) {
    if (this.rootMesh) {
      for (const mesh of this.rootMesh.getChildMeshes()) {
        mesh.scaling.scaleInPlace(1 / scaleFactor || 1);
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

    return maxSize;
  }

  getModelDimensions(): BABYLON.Vector3 {
    return this.modelDimensions;
  }

  getObjectHoverHeight(): number {
    return this.objectHoverHeight;
  }
}
export default Subject;
