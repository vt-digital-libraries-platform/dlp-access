import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { CollectionItems } from "../CollectionItems";
import * as FunctionalFileGetter from "../../../../lib/FunctionalFileGetter";
import * as FetchTools from "../../../../lib/fetchTools";
import { MemoryRouter } from "react-router-dom";
import { mock_archive } from "src/fixtures/mock_archive";
import { mock_site } from "src/fixtures/mock_site";
import { mock_collection } from "src/fixtures/mock_collection";
import { mock } from "node:test";

describe("CollectionItems component", () => {
  const singleItem = mock_archive;
  const asset_urls = JSON.parse(mock_archive.asset_urls);
  const setup = (
    items = [singleItem],
    total = 1,
    view = "grid",
    site = mock_site
  ) => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(asset_urls.thumbnail_url);
    jest.spyOn(FetchTools, "getCollectionItems").mockResolvedValue({
      items: items,
      nextToken: null,
      total: total
    });
    render(
      <MemoryRouter>
        <CollectionItems
          collection={mock_collection}
          viewOption={view}
          site={site}
        />
      </MemoryRouter>
    );
  };

  it("displays CollectionItems component", async () => {
    setup();
    const images = await screen.findAllByRole("img");
    expect(images).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: /Items in Collection/i })
    ).toHaveClass("no-size");
    expect(
      screen.getByRole("listbox", { name: /Results per page/ })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Items in Collection \(1\)/i
      })
    ).toBeVisible();
    expect(screen.getByRole("group")).toHaveClass("collection-items-grid");
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/archive/test-archive");
  });

  it("displays CollectionItems component with list view option", async () => {
    setup(undefined, undefined, "list");
    const images = await screen.findAllByRole("img");
    expect(images).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: /Items in Collection/i })
    ).toHaveClass("col-12 col-lg-8");
    expect(screen.getByRole("group")).toHaveClass("collection-items-list");
    expect(
      screen.getByRole("heading", { name: /Test Archive/i })
    ).toBeVisible();
    expect(screen.getByText(/Test archive description/i)).toBeVisible();
  });

  it("displays sorting options for podcasts site", async () => {
    const podcasts_site = mock_site;
    podcasts_site.siteId = "podcasts";
    setup(undefined, undefined, "list", podcasts_site);
    const images = await screen.findAllByRole("img");
    expect(images).toHaveLength(1);
    const sort = screen.getByRole("listbox", { name: /Sort/ });
    expect(sort).toBeVisible();
  });

  it("displays CollectionItem component with no items", async () => {
    setup([], 0);
    const text = await screen.findByRole("heading", {
      level: 2,
      name: /Items in Collection \(0\)/i
    });
    expect(text).toBeVisible();
  });

  it("displays 'loading' message when items are null", async () => {
    setup(null, 0);
    const text = await screen.findByText(/Loading/i);
    expect(text).toBeVisible();
  });
});
