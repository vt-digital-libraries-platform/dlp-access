import * as BABYLON from "@babylonjs/core";

class Environment {
  private scene: BABYLON.Scene;
  private envURL: string;
  constructor(scene: BABYLON.Scene, envURL: string) {
    this.scene = scene;
    this.envURL = envURL;

    this.createHemisphericLight();
    this.createEnvironmentLight();
    this.createSkybox();
  }

  createHemisphericLight() {
    const hemisphericLight = new BABYLON.HemisphericLight(
      "hemisphericLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemisphericLight.intensity = 0.065;
  }

  createEnvironmentLight() {
    this.scene.environmentTexture =
      BABYLON.CubeTexture.CreateFromPrefilteredData(this.envURL, this.scene);
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
}
export default Environment;
