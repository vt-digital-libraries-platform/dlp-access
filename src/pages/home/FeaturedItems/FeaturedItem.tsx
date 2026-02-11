import { FC } from "react";
import { useSignedLink } from "../../../hooks/useSignedLink";

type Props = {
  item: {
    altText: string;
    cardTitle: string;
    cardDetails: string;
    link: string;
    src: string;
  };
  position: number;
  length: number;
  site: {
    siteId: string;
  };
  style: React.CSSProperties;
};

export const FeaturedItem: FC<Props> = ({
  item,
  position,
  length,
  site,
  style
}) => {
  const imgSrc = useSignedLink(item.src, "image", site.siteId);

  if (!imgSrc) {
    return null;
  }
  return (
    <li
      className="col-12 col-sm-6 col-md-3 list-unstyled card-padding"
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${length}`}
      style={style}
      key={item.src}
    >
      <a href={item.link} className="card h-100 text-decoration-none">
        <img
          className="card-img-top img-fluid"
          src={imgSrc}
          alt={item.altText || ""}
        />
        <div className="card-body">
          <h3 className="card-title">{item.cardTitle}</h3>
          <p className="card-details">{item.cardDetails || ""}</p>
        </div>
      </a>
    </li>
  );
};
