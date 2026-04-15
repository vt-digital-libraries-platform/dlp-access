import { useState, FC } from "react";
import { addNewlineInDesc } from "../../../lib/MetadataRenderer";
import { getDescriptionLabel } from "src/lib/getDescriptionLabel";

type Props = {
  description: string[] | null;
  site: Site;
};

export const CollectionDescription: FC<Props> = ({ description, site }) => {
  const [descriptionTruncated, setDescriptionTruncated] = useState(true);
  const TRUNCATION_LENGTH = 600;

  if (!description || !description.length) {
    return null;
  }
  return (
    <div className="description full" id="collection-description">
      <div>
        {addNewlineInDesc(
          description,
          getDescriptionLabel(
            JSON.parse(site.displayedAttributes),
            "collection"
          )
        )}
      </div>
    </div>
  );
};
