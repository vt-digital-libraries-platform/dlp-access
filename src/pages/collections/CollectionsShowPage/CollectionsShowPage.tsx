import { useState, FC } from "react";
import { Helmet } from "react-helmet";
import {
  getTitleTemplateForType,
  SiteTitle
} from "../../../components/SiteTitle";
import { CollectionMetadataSection } from "./CollectionMetadataSection";
import { CollectionItems } from "./CollectionItems";
import { CollectionsListView } from "./CollectionsListView";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { CollectionTopContent } from "./CollectionTopContent";
import {
  findCollectionType,
  buildCollectionSchema,
  buildRichSchema
} from "../../../lib/richSchemaTools";
import SocialButtons from "../../../components/SocialButtons";
import "../../../css/CollectionsShowPage.scss";
import { NotFound } from "../../NotFound";
import { useGetCollection } from "./useGetCollection";

import "../../../css/Typography.scss";

type Props = {
  site: Site;
  customKey: string;
};
export const CollectionsShowPage: FC<Props> = ({ site, customKey }) => {
  const [titleList, setTitleList] = useState([]);
  const options = site?.siteOptions && JSON.parse(site.siteOptions);
  const viewOption = options?.collectionPageSettings?.viewOption;
  const socialButtons = options?.socialMedia;

  const {
    collection,
    collectionCustomKey,
    title,
    description,
    thumbnail_path,
    creator,
    updatedAt,
    isError
  } = useGetCollection(customKey);

  const metadataTitle = () => {
    let title = "";
    if (titleList.length) {
      title +=
        "Collection Details for " +
        titleList.map((elem: { title: string }) => elem.title).join(", ");
    }
    return title;
  };

  if (isError) {
    return <NotFound />;
  }

  if (collection) {
    const items = (
      <CollectionItems
        key="collection-items-section"
        collection={collection}
        site={site}
        viewOption={viewOption}
      />
    );
    const metadata = (
      <div className="mid-content-row row" key="collection-metadata-row">
        <CollectionMetadataSection
          key="collection-metadata-section"
          site={site}
          collection={collection}
          metadataTitle={metadataTitle()}
          collectionCustomKey={collectionCustomKey}
          hasParentCollection={!!collection.parent_collection}
          viewOption={viewOption}
        />
      </div>
    );
    return (
      <>
        <SiteTitle
          data={{ collection: collection }}
          site={site}
          template={getTitleTemplateForType(null, collection)}
        />
        <Helmet
          script={[
            { type: "text/javascript" },
            {
              type: "application/ld+json",
              innerHTML: buildRichSchema(
                findCollectionType(site.siteId),
                buildCollectionSchema(collection)
              )
            }
          ]}
        ></Helmet>
        <div className="container typography-wrapper">
          <div className="breadcrumbs-wrapper">
            <nav aria-label="Collection breadcrumbs">
              <Breadcrumbs
                category="Collections"
                record={collection}
                setTitleList={setTitleList}
              />
            </nav>
          </div>
          <CollectionTopContent
            collectionImg={thumbnail_path}
            collectionTitle={title}
            updatedAt={updatedAt}
            description={description}
            creator={creator}
            customKey={customKey}
            collectionOptions={
              collection.collectionOptions
                ? JSON.parse(collection.collectionOptions)
                : null
            }
            site={site}
          />
          {viewOption === "list" ? (
            <CollectionsListView
              site={site}
              collection={collection}
              metadataTitle={metadataTitle()}
              collectionCustomKey={collectionCustomKey}
              viewOption={viewOption}
              socialButtons={socialButtons}
              title={title}
              media={thumbnail_path}
              hasParentCollection={!!collection.parent_collection}
            />
          ) : (
            <>
              <div className="row justify-content-end">
                <div className="social-buttons-wrapper-line col-12 col-md-8">
                  <SocialButtons
                    buttons={socialButtons}
                    url={window.location.href}
                    title={title}
                    media={thumbnail_path}
                  />
                </div>
              </div>
              {options?.collectionPageSettings?.itemsPosition &&
              parseInt(options.collectionPageSettings.itemsPosition) === 0
                ? [items, metadata]
                : [metadata, items]}
            </>
          )}
        </div>
      </>
    );
  } else {
    return <></>;
  }
};
