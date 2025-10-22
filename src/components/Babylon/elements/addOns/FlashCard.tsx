import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

class FlashCard {
  private card: GUI.Button | null;
  private scene: BABYLON.Scene;
  private options: any;
  private cardData: {
    front: { type: string; value: string };
    back: { type: string; value: string };
  };

  constructor(
    scene: BABYLON.Scene,
    options: any,
    cardData: {
      front: { type: string; value: string };
      back: { type: string; value: string };
    }
  ) {
    this.card = null;
    this.options = options;
    this.scene = scene;
    this.cardData = cardData;

    this.init();
  }

  async init() {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      this.scene
    );
    if (!this.cardData) {
      console.warn("No card data provided");
      return;
    }
    const cardFront = this.getTextValue(
      this.cardData.front.type,
      this.cardData.front.value
    );
    this.card = GUI.Button.CreateSimpleButton("flash_card", cardFront);
    this.card.width = "400px";
    this.card.height = "125px";
    this.card.paddingTopInPixels = 20;
    this.card.paddingBottomInPixels = 20;
    this.card.paddingLeftInPixels = 20;
    this.card.paddingRightInPixels = 20;
    this.card.fontSize = "30px";
    this.card.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.card.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.card.color = "white";
    this.card.background = "#861f41";

    this.card.onPointerUpObservable.add(() => {
      this.flipCard();
    });
    advancedTexture.addControl(this.card);
  }

  getTextValue(type: string, value: string): string {
    let text = null;
    if (type === "string") {
      text = value;
    } else if (type === "metadata") {
      text = this.options.item[value];
    }
    return text;
  }

  flipCard() {
    const cardFront = this.getTextValue(
      this.cardData.front.type,
      this.cardData.front.value
    );

    const cardBack = this.getTextValue(
      this.cardData.back.type,
      this.cardData.back.value
    );

    if (this.card?.textBlock) {
      const textBlock = this.card.textBlock;
      if (textBlock.text === cardFront) {
        textBlock.text = cardBack;
        window.setTimeout(() => {
          textBlock.text = cardFront;
        }, 5000);
      } else {
        textBlock.text = cardFront;
      }
    }
  }
}
export default FlashCard;
