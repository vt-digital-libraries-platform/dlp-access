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
class Loading {
  private loadingScreen: LoadingScreen | null;
  private canvasWrapper: HTMLElement;
  private engine: BABYLON.Engine;
  constructor(engine: BABYLON.Engine, canvasWrapper: HTMLElement) {
    this.loadingScreen = null;
    this.canvasWrapper = canvasWrapper;
    this.engine = engine;
    this.init();
  }

  init() {
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

    this.canvasWrapper && this.canvasWrapper.appendChild(loader);

    this.loadingScreen = new LoadingScreen(
      "",
      loadingBar,
      percentLoaded,
      loader
    );
    this.engine.loadingScreen = this.loadingScreen;
    this.engine.displayLoadingUI();
  }

  getLoadingScreen(): LoadingScreen | null {
    return this.loadingScreen;
  }
}
export default Loading;
