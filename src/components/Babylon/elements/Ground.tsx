import * as BABYLON from "@babylonjs/core";

class Ground {
  mesh: BABYLON.Mesh;

  constructor(
    scene: BABYLON.Scene,
    scaleFactor: number,
    excludedLights: BABYLON.Light[] = []
  ) {
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

    // keep these lights from illuminating the ground
    for (const light of excludedLights) {
      light.excludedMeshes.push(ground);
    }
    this.mesh = ground;
  }
}
export default Ground;
