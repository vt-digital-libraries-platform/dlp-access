import { Component } from "react";
import { SiteTitle } from "../components/SiteTitle";

import "../css/AccessibilityPage.scss";

class AccessibilityPage extends Component {
  render() {
    const { siteName } = this.props.site;

    // Get contact email from siteOptions, fallback to default
    let siteEmail = "digitallibraries@vt.edu";
    try {
      const siteOptions = JSON.parse(this.props.site.siteOptions);
      if (siteOptions && siteOptions.feedbackEmail) {
        siteEmail = siteOptions.feedbackEmail;
      }
    } catch (error) {
      console.log("Error parsing siteOptions, using default contact email");
    }

    return (
      <>
        <SiteTitle
          data={{ title: "Accessibility" }}
          site={this.props.site}
          template="{{title}}"
        />
        <div className="container accessibility-page-wrapper">
          <h1>Accessibility</h1>
          <div className="accessibility-content">
            <p>
              We do our best to ensure the {siteName} site is fully accessible
              and we are continually improving our processes to provide these
              digitized historical collections in more accessible formats.
            </p>
            <p>
              If you've encountered an issue please{" "}
              <a href="/feedback">report an accessibility barrier here</a>.
            </p>
            <h2>Our Accessibility Strategy</h2>
            <p>
              We are finalizing our continuing accessibility strategy and will
              post it here. If you have questions in the meantime, please{" "}
              <a href={`mailto:${siteEmail}`}>contact us</a>.
            </p>
          </div>
        </div>
      </>
    );
  }
}

export default AccessibilityPage;
