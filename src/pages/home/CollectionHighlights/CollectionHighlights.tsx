import { FC } from "react";
import { Highlight } from "./Highlight";
import "../../../css/CollectionHighlights.scss";

type Props = {
  collectionHighlights: [
    {
      src: string;
      link: string;
      itemCount: string;
      title: string;
    }
  ];
  site: {
    siteId: string;
  };
};

export const CollectionHighlights: FC<Props> = ({
  collectionHighlights,
  site
}) => {
  if (!collectionHighlights?.length) {
    return null;
  }
  return (
    <div
      className="collection-highlights-wrapper"
      role="region"
      aria-roledescription="Collection highlights"
      aria-label="Collection Highlights"
    >
      <div className="row justify-content-center">
        {collectionHighlights.map((item, index) => (
          <Highlight
            highlight={item}
            index={index}
            siteId={site?.siteId}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};
