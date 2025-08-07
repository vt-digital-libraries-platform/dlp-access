import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as FetchTools from "../../../../lib/fetchTools";
import * as FunctionalFileGetter from "../../../../lib/FunctionalFileGetter";
import { CollectionsShowPage } from "../CollectionsShowPage";
import { MemoryRouter } from "react-router-dom";
import { mock_collection } from "src/fixtures/mock_collection";
import { mock_archive } from "src/fixtures/mock_archive";
import { mock_site } from "src/fixtures/mock_site";

describe("CollectionsShowPage component", () => {
  const setup = (collection = mock_collection, site = mock_site) => {
    jest
      .spyOn(FetchTools, "getCollectionFromCustomKey")
      .mockResolvedValue(collection);
    jest
      .spyOn(FetchTools, "getTopLevelParentForCollection")
      .mockResolvedValue(collection);
    jest
      .spyOn(FetchTools, "fetchHeirarchyPathMembers")
      .mockResolvedValue([mock_collection]);
    jest.spyOn(FetchTools, "getCollectionItems").mockResolvedValue({
      items: [mock_archive],
      nextToken: null,
      total: 1
    });
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(
        mock_collection.asset_urls
          ? JSON.parse(mock_collection.asset_urls).thumbnail_url
          : ""
      );
    jest.spyOn(FetchTools, "getCollectionMap").mockResolvedValue(
      JSON.stringify({
        id: "testid123",
        name: "Test Collection",
        custom_key: "xxxxj22hdemo",
        children: [
          {
            id: "testmap123folder",
            name: "Folder",
            custom_key: "xxxxj22hdemo_folder"
          }
        ]
      })
    );
    render(
      <MemoryRouter>
        <CollectionsShowPage site={site} customKey="xxxxj22hdemo" />
      </MemoryRouter>
    );
  };

  it("displays CollectionsShowPage page with collection", async () => {
    setup();
    const heading = await screen.findByRole("heading", {
      name: /Items in Collection \(1\)/i
    });
    expect(heading).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /Test Collection/i })
    ).toHaveLength(2);
    expect(
      screen.getByRole("heading", { name: /Test Collection/i, level: 1 })
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /Description/i })).toBeVisible();
    expect(screen.getByText(/Test collection description/i)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /Share/i, level: 3 })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /facebook/i })).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /Collection Details for Test Collection/i
      })
    ).toBeVisible();
    expect(screen.getByText(/Identifier/i)).toBeVisible();
    expect(screen.getByText(/test123/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /Test Archive/i })).toHaveAttribute(
      "href",
      "/archive/test-archive"
    );
  });

  it("displays NotFound page if collection is not found", async () => {
    setup(null);
    expect(
      await screen.findByRole("heading", { name: /Page Not Found/i })
    ).toBeVisible();
  });

  it("displays CollectionListView if viewOption is 'list'", async () => {
    const listOption = JSON.parse(mock_site.siteOptions);
    listOption.collectionPageSettings.viewOption = "list";
    const listSite = { ...mock_site };
    listSite.siteOptions = JSON.stringify(listOption);
    setup(undefined, listSite);
    const heading = await screen.findByRole("heading", {
      name: /Items in Collection \(1\)/i
    });
    const shareSection = screen.getAllByText("Share");
    expect(shareSection[0]).toHaveClass("active title");
    expect(
      screen.getByRole("region", { name: /Items in Collection/i })
    ).toHaveClass("col-12 col-lg-8");
  });

  it("displays items before metadata if itemsPosition is '0'", async () => {
    const positionOption = JSON.parse(mock_site.siteOptions);
    positionOption.collectionPageSettings.itemsPosition = "0";
    const positionSite = { ...mock_site };
    positionSite.siteOptions = JSON.stringify(positionOption);
    setup(undefined, positionSite);
    const heading = await screen.findByRole("heading", {
      name: /Items in Collection \(1\)/i
    });
    const regions = screen.getAllByRole("region");
    const metadataSection = regions
      .map((region) => region.className)
      .indexOf("col-12 col-lg-8 details-section");
    const itemsSection = regions
      .map((region) => region.className)
      .indexOf("collection-items-list-wrapper no-size");
    expect(itemsSection < metadataSection).toBe(true);
  });
});
