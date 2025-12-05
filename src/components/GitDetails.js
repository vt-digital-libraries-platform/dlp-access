import { Link } from "react-router-dom";
import "../css/GitDetails.scss";

const GitDetails = () => {
  const gitCommit = process.env.REACT_APP_GIT_COMMIT;
  if (!gitCommit) {
    return null;
  }
  return (
    <div className="git-detail-section">
      <p>
        This site is running commit{" "}
        <Link
          to={`https://github.com/vt-digital-libraries-platform/dlp-access/commit/${gitCommit}`}
        >
          {gitCommit.length > 8 ? gitCommit.substring(0, 7) : gitCommit}
        </Link>{" "}
        of the{" "}
        <Link
          to={"https://github.com/vt-digital-libraries-platform/dlp-access/"}
        >
          vtdlp-access
        </Link>{" "}
        project
      </p>
    </div>
  );
};

export { GitDetails };
