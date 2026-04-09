import { FC } from "react";
import { cleanHTML } from "../../../lib/MetadataRenderer";

type Props = {
  homeStatement: {
    heading: string | null;
    statement: string | null;
  };
};

export const HomeStatement: FC<Props> = ({ homeStatement }) => {
  return (
    <>
      {homeStatement && homeStatement.statement && (
        <div className="home-statement">
          <p className="statement">
            {cleanHTML(homeStatement.statement, "html")}
          </p>
        </div>
      )}
    </>
  );
};
