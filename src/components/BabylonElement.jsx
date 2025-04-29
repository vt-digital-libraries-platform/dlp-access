import React, { useEffect } from "react";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import * as BABYLON from "@babylonjs/core";
import "../css/_3dViewer.scss";

const BabylonElement = (props) => {
  const disableScroll = () => {
    [document.body, document.html].forEach((el) => {
      el?.classList.add("no-scroll");
    });
  };

  const enableScroll = () => {
    [document.body, document.html].forEach((el) => {
      el?.classList.remove("no-scroll");
    });
  };

  const addListeners = (canvas, engine) => {
    canvas.addEventListener("mouseover", disableScroll);
    canvas.addEventListener("mouseout", enableScroll);

    window.addEventListener("resize", () => {
      engine.resize();
    });
  };

  const removeListeners = (canvas, engine) => {
    canvas.removeEventListener("mouseover", disableScroll);
    canvas.removeEventListener("mouseout", enableScroll);

    window.removeEventListener("resize", () => {
      engine.resize();
    });
  };

  const createScene = async (canvas, engine, modelURL) => {
    const GROUND_DIAMETER = 40;
    const scene = new BABYLON.Scene(engine);

    const model = await loadModel(scene, modelURL);
    const modelDimensions = model.ellipsoid;
    const modelMaxSize = Math.max(
      modelDimensions._x,
      modelDimensions._y,
      modelDimensions._z
    );
    model.position = new BABYLON.Vector3(0, modelDimensions._y, 0);

    // Create the environment around the subject
    initEnvironment(scene, GROUND_DIAMETER, modelDimensions._y / 2);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      modelDimensions._y,
      modelMaxSize * 2,
      new BABYLON.Vector3(0, modelDimensions._y, 0),
      scene
    );
    camera.setPosition(
      new BABYLON.Vector3(0, modelDimensions._y, modelMaxSize * 2)
    );
    camera.setTarget(
      new BABYLON.Vector3(0, modelDimensions._y, modelMaxSize * 2)
    );
    camera.speed = 0.25;
    camera.wheelPrecision = 100;
    camera.lowerRadiusLimit = modelMaxSize;
    camera.upperRadiusLimit = modelMaxSize * 10;
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;

    engine.runRenderLoop(function () {
      camera.setTarget(model.position);
      scene.render();
    });
  };

  const initEnvironment = (scene, groundScaleFactor, lightY) => {
    createEnvironmentLight(scene);
    createSkybox(scene);
    createGroundObject(scene, groundScaleFactor);
    lightGroundObject(scene, lightY);
  };

  const createEnvironmentLight = (scene) => {
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
      props.env,
      scene
    );
  };

  const createSkybox = (scene) => {
    const skybox = BABYLON.MeshBuilder.CreateBox(
      "skyBox",
      { size: 100.0 },
      scene
    );
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    const envTexture = new BABYLON.CubeTexture(
      "https://s3.us-east-1.amazonaws.com/ingest-dev.img.cloud.lib.vt.edu/federated/3d/gltf/environments/dark/env",
      scene
    );

    skyboxMaterial.reflectionTexture = envTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
  };

  const createGroundObject = async (scene, scaleFactor) => {
    const groundModel = await loadModel(
      scene,
      "https://d21nnzi4oh5qvs.cloudfront.net/federated/3d/gltf/environments/dark/groundTexturePBR.glb"
    );

    groundModel.scaling = new BABYLON.Vector3(
      scaleFactor,
      scaleFactor,
      scaleFactor
    );
  };

  const lightGroundObject = (scene, height) => {
    const groundLight = new BABYLON.HemisphericLight(
      "groundLight",
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    groundLight.position = new BABYLON.Vector3(0, height, 0);
    groundLight.intensity = 0.5;
    groundLight.diffuse = new BABYLON.Color3(1, 1, 1);
  };

  const createCanvas = (canvasWrapper) => {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "three-d-canvas";
    canvasWrapper.innerHTML = "";
    canvasWrapper.appendChild(canvas);

    return canvas;
  };

  const loadModel = async (scene, url) => {
    const filename = url.split("/").pop();
    const path = url.replace(filename, "");
    const response = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      path,
      filename,
      scene
    );
    const model = response.meshes[0];

    return model;
  };

  useEffect(() => {
    registerBuiltInLoaders();
    const canvasWrapper = document.getElementById("canvas-wrapper");
    const canvas = createCanvas(canvasWrapper);
    const engine = new BABYLON.Engine(canvas, true);

    createScene(canvas, engine, props.model);

    addListeners(canvas, engine);

    return () => {
      removeListeners(canvas, engine);
      enableScroll();
      engine.dispose();
    };
  }, [props.model]);

  return (
    <section style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "100%", alignItems: "center" }}>
        <div id="canvas-wrapper"></div>
      </div>
    </section>
  );
};

export default BabylonElement;
