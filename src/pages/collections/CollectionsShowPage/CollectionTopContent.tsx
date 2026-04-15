import { FC } from "react";
import "../../../css/CollectionsShowPage.scss";
import { CollectionDescription } from "./CollectionDescription";
import { RSSFeeds } from "./RSSFeeds";
import { useSignedLink } from "../../../hooks/useSignedLink";

type Props = {
  collectionImg: string;
  site: Site;
  collectionTitle: string;
  creator: string[] | null;
  updatedAt: string;
  description: string[] | null;
  customKey: string;
  collectionOptions: CollectionOptions | null;
};
export const CollectionTopContent: FC<Props> = ({
  collectionImg,
  site,
  collectionTitle,
  creator,
  updatedAt,
  description,
  customKey,
  collectionOptions
}) => {
  const collectionThumbnail = useSignedLink(
    collectionImg,
    "image",
    site.siteId
  );

  return (
    <div className="top-content-row row">
      <div className="collection-img-col col-12 col-lg-3">
        {collectionThumbnail && <img src={collectionThumbnail} alt="" />}
      </div>
      <div className="collection-details-col col-12 col-lg-9">
        <h1 className="collection-title">{collectionTitle}</h1>
        <div className="post-heading">
          {creator && (
            <span className="creator">Created by: {creator.join(", ")}</span>
          )}
          {updatedAt && (
            <span className="last-updated">
              Last updated: {new Date(updatedAt).toString()}
            </span>
          )}
        </div>
        <CollectionDescription description={description} site={site} />
        {site.siteId === "podcasts" && (
          <RSSFeeds
            customKey={customKey}
            site={site}
            podcast_links={
              collectionOptions ? collectionOptions?.podcast_links : undefined
            }
          />
        )}
      </div>
    </div>
  );
};
