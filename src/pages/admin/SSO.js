import { useAuth } from "react-oidc-context";

const SSO = () => {
  const auth = useAuth();
  if (auth.isAuthenticated) {
    return (
      <div>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>

        <button onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  } else {
    return (
      <div>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    );
  }
};
export default SSO;
