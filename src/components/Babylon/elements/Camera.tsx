import * as BABYLON from "@babylonjs/core";

class Camera {
  private scene: BABYLON.Scene;
  private canvas: HTMLCanvasElement;
  private type: string;
  private active: BABYLON.ArcRotateCamera | BABYLON.UniversalCamera;
  private position: BABYLON.Vector3;
  private rotationVector?: BABYLON.Vector3;
  private rotation?: { horizontal: number; vertical: number };
  private radius?: number;
  private modelDimensions?: { _x: number; _y: number; _z: number };

  constructor(
    type: string,
    scene: BABYLON.Scene,
    canvas: HTMLCanvasElement,
    position: BABYLON.Vector3,
    rotationVector?: BABYLON.Vector3,
    rotation?: { horizontal: number; vertical: number },
    radius?: number,
    modelDimensions?: { _x: number; _y: number; _z: number }
  ) {
    this.scene = scene;
    this.canvas = canvas;
    this.type = type;
    this.position = position;
    this.rotationVector = rotationVector;
    this.rotation = rotation;
    this.radius = radius;
    this.modelDimensions = modelDimensions;

    // Create the camera based on the type
    this.active = this.createCamera();
  }

  private createCamera(): BABYLON.ArcRotateCamera | BABYLON.UniversalCamera {
    if (this.type === "universal") {
      return this.createUniversalCamera();
    }
    return this.createArcRotateCamera();
  }

  private createUniversalCamera(): BABYLON.UniversalCamera {
    const camera = new BABYLON.UniversalCamera(
      "UniversalCamera",
      this.position || new BABYLON.Vector3(0, 0.75, 0.5),
      this.scene
    );
    camera.rotation =
      this.rotationVector || new BABYLON.Vector3(Math.PI / 2, 0, 0);

    camera.speed = 0.1;
    // camera.minZ = 0.1;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    camera.keysUp.push(69);
    camera.keysDown.push(81);

    camera.keysRotateUp.push(87);
    camera.keysRotateDown.push(83);

    camera.keysRotateLeft.push(65);
    camera.keysRotateRight.push(68);

    camera.angularSensibility = 5000;

    return camera;
  }

  private createArcRotateCamera() {
    const _y = this.modelDimensions ? this.modelDimensions._y : 1;
    const camera = new BABYLON.ArcRotateCamera(
      "arcCamera",
      this.rotation?.horizontal || Math.PI / 2,
      this.rotation?.vertical || Math.PI / 2,
      this.radius || 3,
      new BABYLON.Vector3(0, _y / 2, 0),
      this.scene
    );
    if (this.position) {
      camera.setPosition(this.position);
    }

    camera.speed = 0.25;
    camera.wheelPrecision = 100;
    // camera.lowerRadiusLimit = 0.5;
    camera.upperRadiusLimit = 3;
    // camera.minZ = 0.1;
    camera.useAutoRotationBehavior = true;
    if (camera.autoRotationBehavior) {
      camera.autoRotationBehavior.zoomStopsAnimation = true;
    }
    // camera.checkCollisions = true;
    // @ts-ignore: pretty sure it does have this property.
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    return camera;
  }
}
export default Camera;
