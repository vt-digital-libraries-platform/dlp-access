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
    <div
      className="top-content-row row"
      role="region"
      aria-labelledby="collection-page-title"
    >
      <div className="collection-img-col col-sm-4">
        {collectionThumbnail && <img src={collectionThumbnail} alt="" />}
      </div>
      <div className="collection-details-col col-md-8">
        <h1 className="collection-title" id="collection-page-title">
          {collectionTitle}
        </h1>
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
        <div className="description full">{description}</div>
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
