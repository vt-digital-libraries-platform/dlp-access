import { ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";

class LoadingScreen implements ILoadingScreen {
  //optional, but needed due to interface definitions
  public loadingUIBackgroundColor: string;
  constructor(
    public loadingUIText: string,
    private loadingBar: HTMLElement,
    private percentLoaded: HTMLElement,
    private loader: HTMLElement
  ) {
    this.loadingUIBackgroundColor = "white";
  }
  public displayLoadingUI() {
    this.loadingBar.style.width = "0%";
    this.percentLoaded.innerText = "0%";
  }

  public hideLoadingUI() {
    this.loader.id = "loaded";
    window.setTimeout(() => {
      this.loader.style.display = "none";
    }, 1000);
  }

  public updateLoadStatus(status: string) {
    this.loadingBar.style.width = `${status}%`;
    this.percentLoaded.innerText = `${status}%`;
    if (status === "100") {
      window.setTimeout(() => {
        this.hideLoadingUI();
      }, 1000);
    }
  }
}
export default LoadingScreen;
