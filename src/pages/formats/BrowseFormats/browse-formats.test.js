import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as FetchTools from "../../../lib/fetchTools";
import { BrowseFormats } from "./BrowseFormats";
import { mock_site } from "src/fixtures/mock_site";

describe("BrowseFormats component", () => {
  const setup = (site = mock_site, total = 42) => {
    jest
      .spyOn(FetchTools, "fetchSearchResults")
      .mockResolvedValue({ items: [], nextToken: null, total: total });
    render(
      <MemoryRouter>
        <BrowseFormats site={site} />
      </MemoryRouter>
    );
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lists every configured format value", async () => {
    setup();
    expect(
      await screen.findByRole("heading", { name: "Format", level: 1 })
    ).toBeInTheDocument();
    for (const value of ["Audio", "Manuscript", "Photograph"]) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("sorts format values alphabetically", async () => {
    setup();
    const values = (await screen.findAllByRole("listitem")).map(
      (item) => item.textContent
    );
    expect(values[0]).toContain("Audio");
    expect(values[1]).toContain("Manuscript");
    expect(values[2]).toContain("Photograph");
  });

  it("queries item counts once per format value", async () => {
    setup();
    expect(
      await screen.findByRole("link", { name: "Photograph, 42 items" })
    ).toBeInTheDocument();
    expect(FetchTools.fetchSearchResults).toHaveBeenCalledTimes(3);
    expect(FetchTools.fetchSearchResults).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        filter: { category: "archive", format: ["Photograph"] },
        limit: 1
      })
    );
  });

  it("exposes the count in the link's accessible name and hides the visible copy", async () => {
    setup(mock_site, 1);
    expect(
      await screen.findByRole("link", { name: "Audio, 1 item" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).toHaveTextContent(
      "Item counts loaded"
    );
  });

  it("links each format into a pre-filtered search", async () => {
    setup();
    const link = await screen.findByRole("link", {
      name: "Manuscript, 42 items"
    });
    expect(link).toHaveAttribute(
      "href",
      "/search/?field=all&format=Manuscript&q=&view=Gallery"
    );
  });

  it("renders a message when the site has no format facet", () => {
    const site = {
      ...mock_site,
      searchPage: JSON.stringify({ facets: { subject: { values: ["Art"] } } })
    };
    setup(site);
    expect(
      screen.getByText("No formats have been configured for this site.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(FetchTools.fetchSearchResults).not.toHaveBeenCalled();
  });

  it("still renders the format when its count cannot be fetched", async () => {
    jest
      .spyOn(FetchTools, "fetchSearchResults")
      .mockRejectedValue(new Error("network"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(
      <MemoryRouter>
        <BrowseFormats site={mock_site} />
      </MemoryRouter>
    );
    expect(await screen.findByText("Item counts loaded")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Photograph" });
    expect(link).toHaveTextContent("Photograph");
  });
});
