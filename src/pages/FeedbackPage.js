import React, { Component } from "react";
import { API } from "aws-amplify";
import DOMPurify from "dompurify";
import { SiteTitle } from "../components/SiteTitle";

import "../css/FeedbackPage.scss";
import "../css/Typography.scss";

// sanitizeMessage: strips \r and invisible control characters from the message field.
// Keeps \n so the user's line breaks and paragraphs are preserved.
// \r is stripped because email parsers use \r\n as a header separator.
const sanitizeMessage = (value) => {
  // eslint-disable-next-line no-control-regex
  return DOMPurify.sanitize(value).replace(
    /[\r\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
    ""
  );
};

// sanitizeEmail: strips everything including \n from the email field.
// Email addresses should never contain line breaks — any \r or \n in an email
// field is either a mistake or a header injection attempt.
const sanitizeEmail = (value) => {
  // eslint-disable-next-line no-control-regex
  return DOMPurify.sanitize(value).replace(
    /[\r\n\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
    ""
  );
};

// validateEmail: stricter than the browser's built-in type="email" check.
// The browser accepts "a@b" (no TLD). This regex requires:
// [one or more non-space/non-@ chars] @ [domain] . [2+ char TLD]
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

// How long (in seconds) to lock the submit button after a successful submission.
// Prevents accidental double-submits and slows down manual spam attempts.
const COOLDOWN_SECONDS = 30;

class FeedbackPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedbackType: "",
      feedbackMessage: "",
      submittedBy: "",
      // honeypot: a hidden field only bots fill in. Real users never see it
      // (visually hidden + aria-hidden). If it has a value at submit time we
      // silently discard the submission without alerting the bot.
      honeypot: "",
      isSubmitting: false,
      submitSuccess: false,
      submitError: null,
      // cooldownSecondsLeft: counts down from COOLDOWN_SECONDS after a successful
      // submit. While > 0 the submit button is disabled and shows the countdown.
      cooldownSecondsLeft: 0
    };
    // Stored on the instance (not in state) — updating it doesn't trigger a re-render.
    // null means no timer is currently running.
    this._cooldownInterval = null;
  }

  // React calls this when the user navigates away from the page.
  // Without this cleanup the setInterval keeps firing on a dead component,
  // causing a React memory leak warning.
  componentWillUnmount() {
    if (this._cooldownInterval) {
      clearInterval(this._cooldownInterval);
    }
  }

  // Starts the 30-second countdown after a successful submission.
  // Uses the functional setState form (prev => ...) so the interval callback
  // always sees the latest state value rather than a stale closure copy.
  startCooldown = () => {
    this.setState({ cooldownSecondsLeft: COOLDOWN_SECONDS });
    this._cooldownInterval = setInterval(() => {
      this.setState((prev) => {
        const next = prev.cooldownSecondsLeft - 1;
        if (next <= 0) {
          clearInterval(this._cooldownInterval);
          this._cooldownInterval = null;
          return { cooldownSecondsLeft: 0 };
        }
        return { cooldownSecondsLeft: next };
      });
    }, 1000);
  };

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
    const { feedbackType, feedbackMessage, submittedBy, honeypot } = this.state;

    // Bot check — if the hidden honeypot field has any value, this is a bot.
    // Return silently with no error so the bot doesn't know it was caught.
    if (honeypot) return;

    // Reject malformed emails before the Lambda is called.
    // Only runs if the user typed something — email is optional.
    if (submittedBy && !validateEmail(submittedBy)) {
      this.setState({
        submitError:
          "Please enter a valid email address (e.g. name@domain.com)."
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
      // Call Lambda function with sanitized values
      const response = await API.post("feedbackapi", "/submit", {
        body: {
          feedbackType,
          message: sanitizeMessage(feedbackMessage),
          siteName,
          emailTo: feedbackEmail,
          // Send empty string when no email provided — the Lambda handles
          // the "Anonymous" fallback so we don't send a non-email string
          // that would fail the Lambda's email format validation
          submittedBy: sanitizeEmail(submittedBy)
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

        // Start 30-second cooldown to prevent rapid resubmission
        this.startCooldown();

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
      // For Amplify/Axios errors, the Lambda's specific message lives in
      // error.response.data.message — error.message is just the generic
      // Axios wrapper "Request failed with status code 400"
      const lambdaMessage = error?.response?.data?.message;
      this.setState({
        isSubmitting: false,
        submitError:
          lambdaMessage ||
          error.message ||
          "Failed to submit feedback. Please try again or email us directly."
      });

      // Scroll to top to see error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  render() {
    const { siteName } = this.props.site;
    const { cooldownSecondsLeft } = this.state;

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
        <div className="container typography-wrapper">
          <h1>Feedback Form</h1>
          <h2 className="sr-only">Submit Feedback</h2>
          <div className="feedback-content">
            <p>
              Use this form to report accessibility barriers, issues, or provide
              general feedback about {siteName}. Your submission will be logged
              and emailed to our team at{" "}
              <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>.
            </p>

            <form onSubmit={this.handleSubmit} className="feedback-form">
              {/* Honeypot: Invisible to humans, bots fill it in. If filled on submit, the submission is silently dropped. */}
              <input
                type="text"
                name="website"
                value={this.state.honeypot}
                onChange={(e) => this.setState({ honeypot: e.target.value })}
                style={{ display: "none" }}
                aria-hidden="true"
                tabIndex="-1"
                autoComplete="off"
              />

              {/* Feedback Form Fields */}
              <fieldset className="feedback-type-fieldset">
                <legend>Feedback Type (Required)</legend>
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
                      checked={this.state.feedbackType === "General Feedback"}
                      onChange={this.handleFeedbackTypeChange}
                    />
                    <label htmlFor="general-feedback">
                      Feedback or Suggestion
                    </label>
                  </div>
                </div>
              </fieldset>

              <div className="form-control">
                <label htmlFor="feedback-message">Details (Required)</label>
                <p id="detailsHelp" className="feedback-instructions">
                  To help us better understand your feedback or issue, please
                  include your device type, operating system, web browser, and
                  the name or URL of the page your feedback is about.
                  <em>
                    {" "}
                    Example: "I encountered an issue on the homepage while using
                    Safari on an iPhone running iOS 26.5."
                  </em>
                </p>
                <textarea
                  id="feedback-message"
                  name="feedbackMessage"
                  value={this.state.feedbackMessage}
                  onChange={this.handleMessageChange}
                  required
                  rows="8"
                  maxLength={5000}
                  aria-describedby="detailsHelp"
                  disabled={this.state.isSubmitting}
                />
              </div>

              <div className="form-control">
                <label htmlFor="submitted-by">
                  Your Email
                  {this.state.feedbackType === "Accessibility Barrier"
                    ? " (Required)"
                    : " (Optional)"}
                </label>
                <p id="emailHelp" className="feedback-instructions">
                  Please provide your email address
                  {this.state.feedbackType === "Accessibility Barrier"
                    ? " so we can contact you about your barrier report and resolve any access issues."
                    : " if you'd like for us to follow up with you."}
                </p>
                <input
                  type="email"
                  autocomplete="email"
                  id="submitted-by"
                  name="submittedBy"
                  value={this.state.submittedBy}
                  onChange={this.handleSubmittedByChange}
                  aria-describedby="emailHelp"
                  disabled={this.state.isSubmitting}
                  maxLength={254}
                  required={this.state.feedbackType === "Accessibility Barrier"}
                />
              </div>

              {this.state.submitSuccess && (
                <div className="alert alert-success" role="alert">
                  <strong>Success!</strong> Your feedback has been submitted.
                </div>
              )}

              {this.state.submitError && (
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {this.state.submitError}
                  <p>
                    If you encounter this issue again, please email us at&nbsp;
                    <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={this.state.isSubmitting || cooldownSecondsLeft > 0}
              >
                {this.state.isSubmitting
                  ? "Submitting..."
                  : cooldownSecondsLeft > 0
                  ? `Please wait ${cooldownSecondsLeft}s...`
                  : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default FeedbackPage;