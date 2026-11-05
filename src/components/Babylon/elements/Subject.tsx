import * as BABYLON from "@babylonjs/core";
import { loadModel } from "../utils/babylon_utils";

class Subject {
  private model: BABYLON.AbstractMesh | null;
  private modelDimensions: BABYLON.Vector3;
  private modelMaxSize: number;
  private scene: BABYLON.Scene;
  private loadingScreen?: BABYLON.ILoadingScreen | null;
  private allowTransparency: boolean;
  // resolves with the loaded model once it is scaled and positioned
  ready: Promise<BABYLON.AbstractMesh | null>;
  constructor(
    model: string,
    scene: BABYLON.Scene,
    scaleFactor: number,
    allowTransparency: boolean,
    loadingScreen?: BABYLON.ILoadingScreen | null
  ) {
    this.model = null;
    this.scene = scene;
    this.loadingScreen = loadingScreen;
    this.allowTransparency = allowTransparency || false;
    this.modelDimensions = new BABYLON.Vector3(0, 0, 0);
    this.modelMaxSize = 0;

    this.ready = this.init(model, scaleFactor);
  }

  async init(
    model: string,
    scaleFactor: number
  ): Promise<BABYLON.AbstractMesh | null> {
    this.model = await loadModel(
      model,
      this.scene,
      this.loadingScreen,
      this.allowTransparency
    );
    if (!this.model) {
      console.error("Failed to load model:", model);
      return null;
    }
    this.modelDimensions = this.model.ellipsoid;
    this.modelMaxSize = Math.max(
      this.modelDimensions._x,
      this.modelDimensions._y,
      this.modelDimensions._z
    );
    this.scaleModel(this.model, scaleFactor);
    this.model.checkCollisions = true;
    await this.disableEmptyOcclusion(this.model);

    // position model at origin
    this.model.position = new BABYLON.Vector3(0, 0, 0);
    return this.model;
  }

  scaleModel(model: BABYLON.AbstractMesh, scaleFactor: number | null) {
    for (const mesh of model.getChildMeshes()) {
      mesh.scaling.scaleInPlace(scaleFactor || 150);
      // for debugging: show bounding box
      // mesh.showBoundingBox = true;
    }
  }

  // Some exports (e.g. Substance Painter without a baked AO map) write an
  // all-black occlusion channel, which blocks all environment lighting and
  // renders the model nearly black. Ignore occlusion maps that are empty.
  async disableEmptyOcclusion(model: BABYLON.AbstractMesh) {
    const materials = new Set<BABYLON.PBRMaterial>();
    for (const mesh of [model, ...model.getChildMeshes()]) {
      if (mesh.material instanceof BABYLON.PBRMaterial) {
        materials.add(mesh.material);
      }
    }

    for (const material of Array.from(materials)) {
      const texture = material.ambientTexture;
      if (!texture) continue;
      try {
        if (await this.isOcclusionEmpty(texture)) {
          material.ambientTextureStrength = 0;
        }
      } catch (error) {
        // if the texture can't be read back, keep the occlusion as authored
        console.warn("Could not inspect occlusion texture:", error);
      }
    }
  }

  // True when the occlusion (red) channel is black, or nearly, everywhere.
  async isOcclusionEmpty(texture: BABYLON.BaseTexture): Promise<boolean> {
    const EMPTY_THRESHOLD = 8; // out of 255
    const SAMPLE_SIZE = 64;

    await new Promise<void>((resolve) =>
      BABYLON.Texture.WhenAllReady([texture], resolve)
    );

    // read a small mip level instead of the full-resolution texture
    const { width, height } = texture.getSize();
    const level = Math.max(
      0,
      Math.floor(Math.log2(Math.max(width, height) / SAMPLE_SIZE))
    );
    const pixels = await texture.readPixels(0, level);
    // only 8-bit RGBA is expected from glTF images; skip anything else
    if (!(pixels instanceof Uint8Array)) return false;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > EMPTY_THRESHOLD) return false;
    }
    return true;
  }

  getModelDimensions(): BABYLON.Vector3 {
    return this.modelDimensions;
  }
}
export default Subject;
