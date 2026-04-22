import { FC } from "react";

import "../../css/Typography.scss";

export const NotFound: FC = () => {
  return (
    <div className="container not-found-page typography-wrapper">
      <h1>Page Not Found</h1>
      <p className="statement">Oops! That page couldn't be found.</p>
      <p className="statement">
        Return to the <a href="/">homepage</a>.
      </p>
    </div>
  );
};
