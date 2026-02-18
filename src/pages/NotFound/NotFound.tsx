import { FC } from "react";
import "../../css/NotFound.scss";

export const NotFound: FC = () => {
  return (
    <div className="container not-found-page">
      <h1>Page Not Found</h1>
      <p>Oops! That page couldn't be found.</p>
      <p>
        Return to the <a href="/">homepage</a>.
      </p>
    </div>
  );
};
