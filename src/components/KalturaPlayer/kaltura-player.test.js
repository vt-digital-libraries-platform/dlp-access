import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { KalturaPlayer } from "./KalturaPlayer";

describe("Kaltura player component", () => {
  it("displays Kaltura player", () => {
    render(
      <KalturaPlayer asset_url={"https://video.vt.edu/media/1_qvxfd4bn"} />
    );
    const player = screen.getByTitle("Kaltura Player");
    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute(
      "src",
      "https://cdnapisec.kaltura.com/p/2375811/sp/237581100/embedIframeJs/uiconf_id/41951101/partner_id/2375811?iframeembed=true&playerId=kaltura_player&entry_id=1_qvxfd4bn&flashvars[streamerType]=auto&amp;flashvars[localizationCode]=en&amp;flashvars[leadWithHTML5]=true&amp;flashvars[sideBarContainer.plugin]=true&amp;flashvars[sideBarContainer.position]=left&amp;flashvars[sideBarContainer.clickToClose]=true&amp;flashvars[chapters.plugin]=true&amp;flashvars[chapters.layout]=vertical&amp;flashvars[chapters.thumbnailRotator]=false&amp;flashvars[streamSelector.plugin]=true&amp;flashvars[EmbedPlayer.SpinnerTarget]=videoHolder&amp;flashvars[dualScreen.plugin]=true&amp;flashvars[Kaltura.addCrossoriginToIframe]=true&amp;&wid=1_x2fmman0"
    );
  });
});
