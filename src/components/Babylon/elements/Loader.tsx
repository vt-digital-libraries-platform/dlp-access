import * as BABYLON from "@babylonjs/core";
import LoadingScreen from "./LoadingScreen";

/*
<div id="loader">
    <p>Loading</p>

    <div id="loadingContainer">
    <div id="loadingBar"></div>
    </div>

    <p id="percentLoaded">25%</p>
</div>
*/
class Loader {
  constructor(
    public engine: BABYLON.Engine,
    public canvasWrapper: HTMLElement
  ) {
    this.canvasWrapper = canvasWrapper;
    this.init(canvasWrapper);
  }

  init(canvasWrapper: HTMLElement | null) {
    const loader = document.createElement("div");
    loader.id = "loader";

    const vtdlpImg = document.createElement("img");
    vtdlpImg.src = "/images/fallback_thumbnail.jpg";
    vtdlpImg.alt = "VT University Libraries Logo";
    loader.appendChild(vtdlpImg);

    const loadingText = document.createElement("p");
    loadingText.innerText = "Loading assets...";
    loader.appendChild(loadingText);

    const loadingContainer = document.createElement("div");
    loadingContainer.id = "loadingContainer";
    const loadingBar = document.createElement("div");
    loadingBar.id = "loadingBar";
    loadingContainer.appendChild(loadingBar);
    loader.appendChild(loadingContainer);

    const percentLoaded = document.createElement("span");
    percentLoaded.id = "percentLoaded";
    loader.appendChild(percentLoaded);

    canvasWrapper && canvasWrapper.appendChild(loader);

    const loadingScreen = new LoadingScreen(
      "",
      loadingBar,
      percentLoaded,
      loader
    );
    this.engine.loadingScreen = loadingScreen;
    this.engine.loadingScreen.displayLoadingUI();
  }
}
export default Loader;
