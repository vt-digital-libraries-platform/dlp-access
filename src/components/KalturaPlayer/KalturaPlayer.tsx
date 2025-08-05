import { FC } from "react";
import "../../css/Viewer.scss";

type Props = {
  asset_url: string;
};

export const KalturaPlayer: FC<Props> = ({ asset_url }) => {
  const entry_id = asset_url.replace("https://video.vt.edu/media/", "");

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "71.25%"
      }}
    >
      <iframe
        id="kaltura_player"
        className="kaltura-player"
        src={`https://cdnapisec.kaltura.com/p/2375811/sp/237581100/embedIframeJs/uiconf_id/41951101/partner_id/2375811?iframeembed=true&playerId=kaltura_player&entry_id=${entry_id}&flashvars[streamerType]=auto&amp;flashvars[localizationCode]=en&amp;flashvars[leadWithHTML5]=true&amp;flashvars[sideBarContainer.plugin]=true&amp;flashvars[sideBarContainer.position]=left&amp;flashvars[sideBarContainer.clickToClose]=true&amp;flashvars[chapters.plugin]=true&amp;flashvars[chapters.layout]=vertical&amp;flashvars[chapters.thumbnailRotator]=false&amp;flashvars[streamSelector.plugin]=true&amp;flashvars[EmbedPlayer.SpinnerTarget]=videoHolder&amp;flashvars[dualScreen.plugin]=true&amp;flashvars[Kaltura.addCrossoriginToIframe]=true&amp;&wid=1_x2fmman0`}
        allowFullScreen={true}
        //@ts-ignore
        webkitallowfullscreen="true"
        //@ts-ignore
        mozallowfullscreen="true"
        allow="autoplay *; fullscreen *; encrypted-media *"
        sandbox="allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
        frameBorder="0"
        title="Kaltura Player"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      ></iframe>
    </div>
  );
};
