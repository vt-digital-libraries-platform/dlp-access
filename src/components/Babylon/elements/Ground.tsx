import * as BABYLON from "@babylonjs/core";
import { loadModel } from "../utils/babylon_utils";

class Ground {
  private scene: BABYLON.Scene;
  private scaleFactor: number;
  private meshes: BABYLON.AbstractMesh | null;

  constructor(scene: BABYLON.Scene, scaleFactor: number) {
    this.meshes = null;
    this.scene = scene;
    this.scaleFactor = scaleFactor;

    this.init(this.scaleFactor);
  }

  async init(scaleFactor: number) {
    this.meshes = await loadModel(
      "https://s3.us-east-1.amazonaws.com/ingest-dev.img.cloud.lib.vt.edu/federated/3d/3DPlatform_10cm_web.glb",
      this.scene,
      false
    );
    if (this.meshes) {
      for (const mesh of this.meshes.getChildMeshes()) {
        mesh.scaling.scaleInPlace(scaleFactor || 1);
      }
      this.meshes.position = new BABYLON.Vector3(0, 0, 0);
      this.meshes.checkCollisions = false;
    }
  }
}
export default Ground;
