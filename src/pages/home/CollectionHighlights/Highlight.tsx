import { FC } from "react";
import { useSignedLink } from "../../../hooks/useSignedLink";

type Props = {
  highlight: {
    src: string;
    link: string;
    itemCount: string;
    title: string;
  };
  index: number;
  siteId: string;
};

export const Highlight: FC<Props> = ({ highlight, index, siteId }) => {
  const imgSrc = useSignedLink(highlight.src, "image", siteId);

  if (!imgSrc) {
    return null;
  }
  return (
    <li className="col-md-6 col-lg-3">
      <a
        className="focusable category-container"
        href={highlight.link}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
        data-testid={`collectionHighlight_${index}`}
      >
        <p className="category-link">
          Explore
          <i className="fal fa-arrow-right" aria-hidden="true"></i>
        </p>
        <div className="category-details">
          <p className="highlight__count">{highlight.itemCount}</p>
          <p>{highlight.title}</p>
        </div>
      </a>
    </li>
  );
};
