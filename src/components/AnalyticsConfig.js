import { useEffect } from "react";
import ReactGA from "react-ga4";

const AnalyticsConfig = ({ analyticsID }) => {
  useEffect(() => {
    if (analyticsID) {
      ReactGA.initialize(analyticsID);
    }
  }, [analyticsID]);
  return <></>;
};

export default AnalyticsConfig;
