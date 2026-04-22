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
    <div className="collection-highlights-wrapper">
      <ul className="row gx-4 gy-4 justify-content-center list-unstyled">
        {collectionHighlights.map((item, index) => (
          <Highlight
            highlight={item}
            index={index}
            siteId={site?.siteId}
            key={index}
          />
        ))}
      </ul>
    </div>
  );
};
