import { FC } from "react";
import { Sponsor } from "./Sponsor";
import "../../../css/SiteSponsors.scss";

type Props = {
  sponsors: [
    {
      src: string;
      link: string;
      alt: string;
    }
  ];
  site: {
    siteId: string;
  };
  sponsorsStyle: string;
};

export const SiteSponsors: FC<Props> = ({ sponsors, site, sponsorsStyle }) => {
  if (sponsors?.length) {
    return (
      <div
        className={
          sponsorsStyle
            ? `container home-sponsors-section sponsors-${sponsorsStyle}`
            : "container home-sponsors-section"
        }
      >
        <div className="row home-sponsors-wrapper">
          {sponsors.map((sponsor, index) => (
            <Sponsor sponsor={sponsor} siteId={site?.siteId} key={index} />
          ))}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
