import React, { Component } from "react";
import { API } from "aws-amplify";
import { SiteTitle } from "../components/SiteTitle";

import "../css/FeedbackPage.scss";

class FeedbackPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedbackType: "",
      feedbackMessage: "",
      submittedBy: "",
      isSubmitting: false,
      submitSuccess: false,
      submitError: null
    };
  }

  handleFeedbackTypeChange = (event) => {
    this.setState({ feedbackType: event.target.value });
  };

  handleMessageChange = (event) => {
    this.setState({ feedbackMessage: event.target.value });
  };

  handleSubmittedByChange = (event) => {
    this.setState({ submittedBy: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { siteName } = this.props.site;
    const { feedbackType, feedbackMessage, submittedBy } = this.state;

    // Get feedbackEmail from siteOptions, fallback to default
    let feedbackEmail = "digitallibraries@vt.edu"; // default fallback
    try {
      const siteOptions = JSON.parse(this.props.site.siteOptions);
      if (siteOptions && siteOptions.feedbackEmail) {
        feedbackEmail = siteOptions.feedbackEmail;
      }
    } catch (error) {
      console.log("Error parsing siteOptions, using default feedback email");
    }

    // Validate feedback type selected
    if (!feedbackType) {
      this.setState({
        submitError: "Please select a feedback type."
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate email required for Accessibility Barrier
    if (feedbackType === "Accessibility Barrier" && !submittedBy.trim()) {
      this.setState({
        submitError:
          "Email is required when reporting an accessibility barrier."
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Show loading state
    this.setState({
      isSubmitting: true,
      submitError: null,
      submitSuccess: false
    });

    try {
      // Call Lambda function
      const response = await API.post("feedbackapi", "/submit", {
        body: {
          feedbackType,
          message: feedbackMessage,
          siteName,
          emailTo: feedbackEmail,
          submittedBy: submittedBy || "Anonymous"
        }
      });

      if (response.success) {
        // Show success message and clear form
        this.setState({
          isSubmitting: false,
          submitSuccess: true,
          feedbackType: "",
          feedbackMessage: "",
          submittedBy: ""
        });

        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.setState({ submitSuccess: false });
        }, 5000);
      } else {
        throw new Error(response.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      this.setState({
        isSubmitting: false,
        submitError:
          error.message ||
          "Failed to submit feedback. Please try again or email us directly."
      });

      // Scroll to top to see error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  render() {
    const { siteName } = this.props.site;

    // Get feedbackEmail from siteOptions
    let feedbackEmail = "digitallibraries@vt.edu"; // default fallback
    try {
      const siteOptions = JSON.parse(this.props.site.siteOptions);
      if (siteOptions && siteOptions.feedbackEmail) {
        feedbackEmail = siteOptions.feedbackEmail;
      }
    } catch (error) {
      console.log("Error parsing siteOptions, using default feedback email");
    }

    return (
      <>
        <SiteTitle
          data={{ title: "Feedback" }}
          site={this.props.site}
          template="{{title}}"
        />
        <div className="container feedback-page-wrapper">
          <div className="row">
            <div className="col-12">
              <h1 id="feedback-heading">Feedback Form</h1>
            </div>
            <div
              className="col-md-9"
              role="region"
              aria-labelledby="feedback-heading"
            >
              <div className="feedback-content">
                {this.state.submitSuccess && (
                  <div className="alert alert-success" role="alert">
                    <strong>Success!</strong> Your feedback has been submitted.
                    We'll review it shortly.
                  </div>
                )}

                {this.state.submitError && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {this.state.submitError}
                  </div>
                )}

                <p className="feedback-instructions">
                  Use this form to report accessibility barriers, issues, or
                  provide general feedback about {siteName}. Your submission
                  will be logged and emailed to our team at{" "}
                  <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>.
                  <br />
                  Please include the URL of the page where you encountered the
                  issue and a brief description of what happened. We will do our
                  best to respond as soon as possible.
                </p>

                <form onSubmit={this.handleSubmit} className="feedback-form">
                  <fieldset className="feedback-type-fieldset">
                    <legend>
                      Feedback Type
                      <span className="feedback-type-hint">
                        Please select a feedback type
                      </span>
                    </legend>
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="accessibility-barrier"
                          name="feedbackType"
                          value="Accessibility Barrier"
                          checked={
                            this.state.feedbackType === "Accessibility Barrier"
                          }
                          onChange={this.handleFeedbackTypeChange}
                        />
                        <label htmlFor="accessibility-barrier">
                          Accessibility Barrier
                        </label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="issue"
                          name="feedbackType"
                          value="Issue"
                          checked={this.state.feedbackType === "Issue"}
                          onChange={this.handleFeedbackTypeChange}
                        />
                        <label htmlFor="issue">Issue</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="general-feedback"
                          name="feedbackType"
                          value="General Feedback"
                          checked={
                            this.state.feedbackType === "General Feedback"
                          }
                          onChange={this.handleFeedbackTypeChange}
                        />
                        <label htmlFor="general-feedback">
                          General Feedback
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <div className="form-control">
                    <label htmlFor="feedback-message">
                      Your Message (Required)
                    </label>
                    <textarea
                      id="feedback-message"
                      name="feedbackMessage"
                      value={this.state.feedbackMessage}
                      onChange={this.handleMessageChange}
                      required
                      rows="8"
                      placeholder="Please describe your feedback in detail..."
                      aria-describedby="message-help"
                      disabled={this.state.isSubmitting}
                    />
                    <small id="message-help" className="form-text">
                      Please provide as much detail as possible to help us
                      address your feedback.
                    </small>
                  </div>

                  <div className="form-control">
                    <label htmlFor="submitted-by">
                      Your Email
                      {this.state.feedbackType === "Accessibility Barrier"
                        ? " (Required)"
                        : " (Optional)"}
                    </label>
                    <input
                      type="email"
                      id="submitted-by"
                      name="submittedBy"
                      value={this.state.submittedBy}
                      onChange={this.handleSubmittedByChange}
                      placeholder="your.email@example.com"
                      aria-describedby="email-help"
                      disabled={this.state.isSubmitting}
                      required={
                        this.state.feedbackType === "Accessibility Barrier"
                      }
                    />
                    <small id="email-help" className="form-text">
                      {this.state.feedbackType === "Accessibility Barrier"
                        ? "Email is required for accessibility barriers so we can follow up with you."
                        : "Provide your email if you'd like us to follow up with you."}
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={this.state.isSubmitting}
                  >
                    {this.state.isSubmitting
                      ? "Submitting..."
                      : "Submit Feedback"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default FeedbackPage;
