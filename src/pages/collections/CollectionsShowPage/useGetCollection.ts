import { useState, useEffect } from "react";
import {
  getCollectionFromCustomKey,
  getTopLevelParentForCollection
} from "../../../lib/fetchTools";

export const useGetCollection = (customKey: string) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionCustomKey, setCollectionCustomKey] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string[] | null>(null);
  const [asset_urls, setAsset_urls] = useState("");
  const [creator, setCreator] = useState<string[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [isError, setIsError] = useState(false);

  // Fetches collection data from customKey and retrieves top level parent collection
  useEffect(() => {
    const getCollection = async (customKey: string) => {
      const collection = await getCollectionFromCustomKey(customKey);
      if (collection) {
        const topLevelParentCollection = await getTopLevelParentForCollection(
          collection
        );
        setCollection(collection);
        setCollectionCustomKey(topLevelParentCollection.custom_key);
        setTitle(topLevelParentCollection.title);
        setDescription(topLevelParentCollection?.description);
        setAsset_urls(topLevelParentCollection?.asset_urls);
        setCreator(topLevelParentCollection?.creator);
        setUpdatedAt(topLevelParentCollection?.updatedAt);
      } else {
        setIsError(true);
      }
    };
    getCollection(customKey);
  }, [customKey]);

  return {
    collection,
    collectionCustomKey,
    title,
    description,
    asset_urls,
    creator,
    updatedAt,
    isError
  };
};
