import { Amplify } from "aws-amplify";

export const getStorageBucket = () => Amplify.getConfig().Storage?.S3?.bucket;

export const getStorageRegion = () => Amplify.getConfig().Storage?.S3?.region;
