import * as BABYLON from "@babylonjs/core";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly";

// Transparent ground that only renders the shadows cast onto it.
class Ground {
  mesh: BABYLON.Mesh;
  shadowLight: BABYLON.DirectionalLight;
  shadowGenerator: BABYLON.ShadowGenerator;

  constructor(
    scene: BABYLON.Scene,
    radius: number,
    shadowOpacity: number = 0.35
  ) {
    const ground = BABYLON.MeshBuilder.CreateDisc("ground", { radius }, scene);
    ground.rotation.x = Math.PI / 2;
    ground.position = new BABYLON.Vector3(0, -1, 0);
    ground.receiveShadows = true;
    // the ground is not part of the subject: keep it out of picking/collisions
    ground.isPickable = false;

    // Mostly overhead light, so the shadow pools beneath the subject.
    // It lights only the ground so it doesn't change the subject's brightness;
    // the shadow map still renders every registered caster.
    const shadowLight = new BABYLON.DirectionalLight(
      "groundShadowLight",
      new BABYLON.Vector3(-0.25, -1, -0.15).normalize(),
      scene
    );
    shadowLight.position = new BABYLON.Vector3(0, 10, 0);
    shadowLight.includedOnlyMeshes = [ground];
    // Keep the shadow depth range tight around the scene. Left unset it falls
    // back to the camera's clip range (0.1..10000), and since bias is a
    // fraction of that range, it would push the shadow off small subjects.
    shadowLight.shadowMinZ = 1;
    shadowLight.shadowMaxZ = 30;

    const shadowGenerator = new BABYLON.ShadowGenerator(2048, shadowLight);
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
    shadowGenerator.bias = 0.001;
    shadowGenerator.normalBias = 0.01;

    const material = new ShadowOnlyMaterial("groundMaterial", scene);
    material.activeLight = shadowLight;
    material.alpha = shadowOpacity;
    ground.material = material;

    this.mesh = ground;
    this.shadowLight = shadowLight;
    this.shadowGenerator = shadowGenerator;
  }

  // Register a mesh (and its descendants) as casting shadows onto the ground.
  addShadowCaster(mesh: BABYLON.AbstractMesh) {
    this.shadowGenerator.addShadowCaster(mesh, true);
  }
}
export default Ground;
