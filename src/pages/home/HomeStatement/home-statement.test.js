import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { HomeStatement } from "./HomeStatement";

describe("Home statement component", () => {
  const setup = (homeStatement) => {
    render(<HomeStatement homeStatement={homeStatement} />);
  };
  it("displays Home Statement component", () => {
    const homeStatement = {
      heading: "Welcome",
      statement: "A test statement and <a href='https://lib.vt.edu'>link</a>."
    };
    setup(homeStatement);
    expect(screen.getByText(/A test statement/i)).toBeVisible();
    expect(screen.getByRole("link")).toBeVisible();
  });

  it("does not render the heading", () => {
    const homeStatement = {
      heading: "Welcome",
      statement: "A test statement and <a href='https://lib.vt.edu'>link</a>."
    };
    setup(homeStatement);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("does not display Home Statement component if prop is null", () => {
    setup(null);
    expect(document.querySelector(".home-statement")).toBeNull();
  });

  it("does not display Home Statement component if statement is null", () => {
    setup({ heading: "Welcome", statement: null });
    expect(document.querySelector(".home-statement")).toBeNull();
  });

  it("does not display Home Statement component if statement is empty string", () => {
    setup({ heading: "Welcome", statement: "" });
    expect(document.querySelector(".home-statement")).toBeNull();
  });
});
