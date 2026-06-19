import * as BABYLON from "@babylonjs/core";

class Ground {
  constructor(scene: BABYLON.Scene, scaleFactor: number) {
    const ground = BABYLON.MeshBuilder.CreateDisc(
      "ground",
      { radius: scaleFactor },
      scene
    );
    ground.rotation.x = Math.PI / 2;
    ground.position = new BABYLON.Vector3(0, -1, 0);
    const groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      scene
    );
    groundMaterial.diffuseColor = new BABYLON.Color3(3, 3, 3);
    ground.material = groundMaterial;
  }
}
export default Ground;
