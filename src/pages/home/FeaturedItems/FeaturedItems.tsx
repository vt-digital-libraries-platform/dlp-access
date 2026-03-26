import { FC, useState, useEffect } from "react";
import { FeaturedItem } from "./FeaturedItem";
import { Controls } from "./Controls";
import { v4 as uuid } from "uuid";

import "../../../css/FeaturedItems.scss";

type Props = {
  featuredItems: [
    {
      altText: string;
      cardTitle: string;
      cardDetails: string;
      link: string;
      src: string;
    }
  ];
  site: {
    siteId: string;
  };
};

export const FeaturedItems: FC<Props> = ({ featuredItems, site }) => {
  const [multiplier, setMultiplier] = useState(4);
  const heading = site.siteId === "federated" ? "Browse" : "Our Featured Items";
  const [showMore, setShowMore] = useState(false);

  if (!featuredItems?.length) {
    return null;
  }

  return (
    <div className="featured-items-wrapper">
      <h2>{heading}</h2>
      <ul className="row" id="featured-items">
        {featuredItems.map((item, index) => {
          return (
            <FeaturedItem
              key={item.link}
              item={item}
              site={site}
              style={
                index < multiplier || showMore === true
                  ? { display: "flex" }
                  : { display: "none" }
              }
            />
          );
        })}
      </ul>
      {featuredItems.length > multiplier && (
        <button
          className="button-link--secondary"
          aria-expanded={showMore}
          aria-controls="featured-items"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? (
            <span>
              Show Fewer<span aria-hidden="true"> ⬆</span>
            </span>
          ) : (
            <span>
              Show More<span aria-hidden="true"> ⬇</span>
            </span>
          )}
          <span className="sr-only"> featured items</span>
        </button>
      )}
    </div>
  );
};
