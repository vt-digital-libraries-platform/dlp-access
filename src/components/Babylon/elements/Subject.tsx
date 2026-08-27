import * as BABYLON from "@babylonjs/core";
import { loadModel } from "../utils/babylon_utils";

// portion of the camera's vertical field of view the model should occupy
const TARGET_HEIGHT_RATIO = 0.6;
// matches the default fov Camera.tsx leaves on its ArcRotateCamera
const DEFAULT_CAMERA_FOV = 0.8;
// fallback distance used if the model has no measurable height
const DEFAULT_CAMERA_DISTANCE = 4;
// buffer beyond the model's bounding radius so the camera can't clip into it
const MIN_RADIUS_MARGIN = 1.2;
// how far past the framing distance the camera is allowed to zoom out
const MAX_RADIUS_MULTIPLIER = 1.5;
// must match Ground.tsx's fixed y position so the model's base always
// rests on the ground plane, regardless of the model's own pivot/scale
const GROUND_Y = -1;

class Subject {
  private model: BABYLON.AbstractMesh | null;
  private modelDimensions: BABYLON.Vector3;
  private modelMaxSize: number;
  private modelHeight: number;
  private modelBoundingRadius: number;
  private scene: BABYLON.Scene;
  private loadingScreen?: BABYLON.ILoadingScreen | null;
  private allowTransparency: boolean;
  private cameraDistanceOverride: number | null;
  readonly ready: Promise<void>;

  constructor(
    model: string,
    scene: BABYLON.Scene,
    cameraDistance: number | null | undefined,
    allowTransparency: boolean,
    loadingScreen?: BABYLON.ILoadingScreen | null
  ) {
    this.model = null;
    this.scene = scene;
    this.loadingScreen = loadingScreen;
    this.allowTransparency = allowTransparency || false;
    this.modelDimensions = new BABYLON.Vector3(0, 0, 0);
    this.modelMaxSize = 0;
    this.modelHeight = 0;
    this.modelBoundingRadius = 0;
    this.cameraDistanceOverride = this.isValidCameraDistance(cameraDistance)
      ? (cameraDistance as number)
      : null;

    this.ready = this.init(model);
  }

  async init(model: string) {
    this.model = await loadModel(
      model,
      this.scene,
      this.loadingScreen,
      this.allowTransparency
    );
    if (!this.model) {
      console.error("Failed to load model:", model);
      return;
    }
    this.modelDimensions = this.model.ellipsoid;
    this.modelMaxSize = Math.max(
      this.modelDimensions._x,
      this.modelDimensions._y,
      this.modelDimensions._z
    );
    const { min, max } = this.model.getHierarchyBoundingVectors(true);
    this.modelHeight = max.y - min.y;
    this.modelBoundingRadius = BABYLON.Vector3.Distance(min, max) / 2;
    this.model.checkCollisions = true;

    // center the model horizontally and rest its base on the ground plane
    this.model.position = new BABYLON.Vector3(0, GROUND_Y - min.y, 0);
  }

  private isValidCameraDistance(value: number | null | undefined): boolean {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  // Distance the camera must sit from the model for the model's height to
  // fill heightRatio of the camera's vertical field of view. An explicit
  // cameraDistance passed to the constructor takes precedence.
  getCameraDistance(
    fov: number = DEFAULT_CAMERA_FOV,
    heightRatio: number = TARGET_HEIGHT_RATIO
  ): number {
    if (this.cameraDistanceOverride !== null) {
      return this.cameraDistanceOverride;
    }
    if (!this.modelHeight) {
      return DEFAULT_CAMERA_DISTANCE;
    }

    const visibleHeight = this.modelHeight / heightRatio;
    return visibleHeight / (2 * Math.tan(fov / 2));
  }

  // How close/far the orbit camera may get: never closer than the model's
  // bounding radius (so it can't clip inside the model), and never farther
  // than a multiple of the framing distance (so the model stays visible).
  getCameraRadiusLimits(
    fov: number = DEFAULT_CAMERA_FOV,
    heightRatio: number = TARGET_HEIGHT_RATIO
  ): { lower: number; upper: number } {
    const distance = this.getCameraDistance(fov, heightRatio);
    const lower = this.modelBoundingRadius
      ? this.modelBoundingRadius * MIN_RADIUS_MARGIN
      : distance / MAX_RADIUS_MULTIPLIER;
    const upper = Math.max(distance * MAX_RADIUS_MULTIPLIER, lower);

    return { lower, upper };
  }

  // The point the orbit camera should look at: the model's vertical
  // center, so framing stays correct even though the model itself is
  // shifted to rest its base on the ground plane.
  getCameraTarget(): BABYLON.Vector3 {
    return new BABYLON.Vector3(0, GROUND_Y + this.modelHeight / 2, 0);
  }

  getModelDimensions(): BABYLON.Vector3 {
    return this.modelDimensions;
  }
}
export default Subject;
