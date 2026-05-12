import { FC } from "react";
import { SubCollectionsTree } from "./SubCollectionsTree";
import { RenderItemsDetailed } from "../../../lib/MetadataRenderer";
import "../../../css/CollectionsShowPage.scss";
import { CollectionDescription } from "./CollectionDescription";
import { language_codes } from "../../../lib/language_codes";
import { useLoadMap } from "./useLoadMap";

const languages = language_codes["abbr"];

type Props = {
  collection: Collection;
  viewOption: string;
  metadataTitle: string;
  hasParentCollection: boolean;
  site: Site;
  collectionCustomKey: string;
};
export const CollectionMetadataSection: FC<Props> = ({
  collection,
  viewOption,
  metadataTitle,
  hasParentCollection,
  site,
  collectionCustomKey
}) => {
  const { collectionMap, expanded, handleToggle } = useLoadMap(collection);
  if (collection) {
    const needsMap = () => {
      return collectionMap && collectionMap.children.length;
    };
    return (
      <>
        <div
          className={`${
            viewOption === "list" || !needsMap()
              ? "col-12 "
              : "col-12 col-lg-8 "
          }
            details-section ${!needsMap() ? "no-map" : ""}`}
          role="region"
          aria-labelledby="collection-details-section-header"
        >
          <h2
            className={
              viewOption === "list" ? "d-none" : "details-section-header"
            }
            id="collection-details-section-header"
          >
            {metadataTitle}
          </h2>
          <div className="details-section-content-grid">
            <div className="collection-detail-description">
              {hasParentCollection && (
                <CollectionDescription
                  description={collection.description}
                  site={site}
                />
              )}
            </div>
            <table aria-label="Collection Metadata">
              <tbody>
                <RenderItemsDetailed
                  keyArray={JSON.parse(site.displayedAttributes)[
                    "collection"
                  ].filter(
                    (item: { field: string }) => item.field !== "description"
                  )}
                  item={collection}
                  collectionCustomKey={collectionCustomKey}
                  type="table"
                  site={site}
                  languages={languages}
                />
              </tbody>
            </table>
          </div>
        </div>
        <div
          className={`${
            viewOption === "list" ? "col-12" : "col-12 col-lg-4"
          } subcollections-section`}
          role="region"
          aria-labelledby="collection-subcollections-section"
        >
          <SubCollectionsTree
            collection={collection}
            collectionMap={collectionMap}
            expanded={expanded}
            handleToggle={handleToggle}
          />
        </div>
      </>
    );
  } else {
    return null;
  }
};
