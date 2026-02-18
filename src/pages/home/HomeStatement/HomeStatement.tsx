import { FC } from "react";
import { cleanHTML } from "../../../lib/MetadataRenderer";

type Props = {
  homeStatement: {
    heading: string | null;
    statement: string | null;
  };
};

export const HomeStatement: FC<Props> = ({ homeStatement }) => {
  if (homeStatement) {
    return (
      <div
        className="home-statement-wrapper"
        role="region"
        aria-label="Introduction"
      >
        {homeStatement.statement && (
          <div className="home-statement">
            <p>{cleanHTML(homeStatement.statement, "html")}</p>
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
};
