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
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    
    const envTexture = new BABYLON.CubeTexture(
      "/assets/3d/environments/light/env",
      this.scene
    );
    skyboxMaterial.reflectionTexture = envTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
  }

  // cameraAlpha is the initial ArcRotateCamera alpha: its angle around the
  // Y axis, using the same x = cos, z = sin convention as the placements below.
  createDirectionalLights(cameraAlpha: number = 0) {
    // One light 2 units above, 60 degrees counter-clockwise (seen from above)
    // of the initial camera position, angled down 45 degrees toward the
    // origin; and one light 2 units below, 60 degrees clockwise, angled up 45.
    const LIGHT_HEIGHT = 2;
    const OFFSET = Math.PI / 3;
    // 45 degree angle means horizontal distance equals height
    const horizontalDistance = LIGHT_HEIGHT / Math.tan(Math.PI / 4);

    // increasing alpha is counter-clockwise when viewed from above
    const placements = [
      { height: LIGHT_HEIGHT, angle: cameraAlpha + OFFSET },
      { height: -LIGHT_HEIGHT, angle: cameraAlpha - OFFSET }
    ];

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
      light.intensity = 0.75;
      return light;
    });
    return directionalLights;
  }
}
export default Environment;
