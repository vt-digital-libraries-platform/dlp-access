import * as BABYLON from "@babylonjs/core";

export const loadModel = async (url, scene, loadingScreen) => {
  const filename = url.split("/").pop();
  const path = url.replace(filename, "");
  let response,
    model = null;
  try {
    response = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      path,
      filename,
      scene,
      (evt) => {
        if (loadingScreen) {
          const loadStatus = ((evt.loaded * 100) / evt.total).toFixed();
          loadingScreen.updateLoadStatus(loadStatus);
        }
      }
    );
  } catch (error) {
    console.error("Error loading model:", error);
  }
  if (response?.meshes?.length > 0) {
    model = response.meshes[0];
    for (const mesh of response.meshes) {
      // mesh.showBoundingBox = true;
      mesh.checkCollisions = true;
      if (mesh.material) {
        mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
      }
    }
  }
  return model;
};
