import { Component } from "react";

class ResultsNumberDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLimit: "10"
    };
  }

  handleChange = (event) => {
    this.setState({
      selectedLimit: event.target.value
    });
    this.props.setLimit(event, { value: event.target.value });
  };

  formatActiveDisplayText = () => {
    return `${this.state.selectedLimit} per page`;
  };

  render() {
    const numberOptions = [
      {
        key: "10",
        text: "10",
        value: "10"
      },
      {
        key: "50",
        text: "50",
        value: "50"
      },
      {
        key: "100",
        text: "100",
        value: "100"
      }
    ];
    return (
      <>
        <div className={`${this.props.className || ""}`.trim()}>
          <label htmlFor="results-number-dropdown">Results per page:</label>
          <select
            id="results-number-dropdown"
            defaultValue="10"
            onChange={this.handleChange}
          >
            {numberOptions.map((option) => (
              <option key={option.key} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }
}

export default ResultsNumberDropdown;
