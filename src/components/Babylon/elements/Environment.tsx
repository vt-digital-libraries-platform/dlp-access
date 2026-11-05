import * as BABYLON from "@babylonjs/core";

class Environment {
  private scene: BABYLON.Scene;
  private envURL: string;
  constructor(scene: BABYLON.Scene, envURL: string) {
    this.scene = scene;
    this.envURL = envURL;

    this.createEnvironmentLight();
    this.createSkybox();
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
    skyboxMaterial.disableLighting = false;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    const envTexture = new BABYLON.CubeTexture(
      "https://s3.us-east-1.amazonaws.com/ingest-dev.img.cloud.lib.vt.edu/federated/3d/gltf/environments/light/env",
      this.scene
    );

    skyboxMaterial.reflectionTexture = envTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
  }

  createDirectionalLights() {
    // Three lights 2 units high, 120 degrees apart around the Y axis,
    // each angled down 45 degrees toward the scene origin, plus a mirrored
    // set 2 units below angled up 45 degrees
    const LIGHT_HEIGHT = 2;
    const ANGLE_SPACING = (2 * Math.PI) / 3;
    // 45 degree angle means horizontal distance equals height
    const horizontalDistance = LIGHT_HEIGHT / Math.tan(Math.PI / 4);

    const placements = [LIGHT_HEIGHT, -LIGHT_HEIGHT].flatMap((height) =>
      [-1, 0, 1].map((offset) => ({ height, angle: offset * ANGLE_SPACING }))
    );

    const directionalLights = placements.map(({ height, angle }, i) => {
      const position = new BABYLON.Vector3(
        horizontalDistance * Math.cos(angle),
        height,
        horizontalDistance * Math.sin(angle)
      );
      const direction = BABYLON.Vector3.Zero().subtract(position).normalize();
      const light = new BABYLON.DirectionalLight(
        `directionalLight${i}`,
        direction,
        this.scene
      );
      light.position = position;
      light.intensity = 0.5;
      return light;
    });
    return directionalLights;
  }
}
export default Environment;
