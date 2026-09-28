import { Amplify } from "aws-amplify";

export const getStorageBucket = () => Amplify.getConfig().Storage?.S3?.bucket;
