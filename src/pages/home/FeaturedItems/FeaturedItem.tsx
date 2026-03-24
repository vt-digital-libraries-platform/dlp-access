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
  site: {
    siteId: string;
  };
  style: React.CSSProperties;
};

export const FeaturedItem: FC<Props> = ({ item, site, style }) => {
  const imgSrc = useSignedLink(item.src, "image", site.siteId);

  if (!imgSrc) {
    return null;
  }
  return (
    <li
      className="col-12 col-sm-6 col-md-3 list-unstyled"
      style={style}
      key={item.src}
    >
      <div className="featured-items__card card--img-zoom">
        <div className="card__img-wrapper">
          <img
            className={`img-fluid${
              site.siteId === "federated" ? " round-img" : ""
            }`}
            src={imgSrc}
            alt="" // Decorative b/c this functions as a thumbnail and descriptive text is provided in the card body
          />
        </div>
        <div className="card__body">
          <h3 className="card__title">
            <a href={item.cardTitle === "Items" ? "/search" : item.link}>
              {item.cardTitle}
            </a>
          </h3>
          <p className="card__details">{item.cardDetails || ""}</p>
        </div>
      </div>
    </li>
  );
};
