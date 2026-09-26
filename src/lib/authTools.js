import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";

export const getCurrentUserInfo = async () => {
  const { tokens } = await fetchAuthSession();
  const { email } = await fetchUserAttributes();
  return {
    groups: tokens?.accessToken?.payload["cognito:groups"],
    email: email
  };
};
