import * as BABYLON from "@babylonjs/core";

class Ground {
  private mesh: BABYLON.Mesh;
  private referenceRadius: number;

  constructor(scene: BABYLON.Scene, radius: number) {
    this.referenceRadius = radius;
    this.mesh = BABYLON.MeshBuilder.CreateDisc("ground", { radius }, scene);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position = new BABYLON.Vector3(0, -1, 0);
    const groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      scene
    );
    groundMaterial.diffuseColor = new BABYLON.Color3(3, 3, 3);
    this.mesh.material = groundMaterial;
  }

  // Rescales the ground disc so its apparent on-screen size stays roughly
  // constant as the camera zooms in/out, rather than shrinking/growing
  // with distance like a fixed-size object would. cameraRadius is the
  // orbit camera's current distance from its target; referenceRadius is
  // the distance the ground was originally sized for (scale 1).
  setScale(cameraRadius: number): void {
    const scaleFactor = cameraRadius / this.referenceRadius;
    this.mesh.scaling.setAll(scaleFactor);
  }
}
export default Ground;
