import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { CollectionsListView } from "../CollectionsListView";
import * as FunctionalFileGetter from "../../../../lib/FunctionalFileGetter";
import * as FetchTools from "../../../../lib/fetchTools";
import { MemoryRouter } from "react-router-dom";
import { mock_archive } from "src/fixtures/mock_archive";
import { mock_collection } from "src/fixtures/mock_collection";
import { mock_site } from "src/fixtures/mock_site";

describe("CollectionsListView component", () => {
  const singleItem = mock_archive;
  const collection = mock_collection;
  const socialButtons = JSON.parse(mock_site.siteOptions).socialMedia;
  const setup = (buttons = socialButtons) => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue("https://img.cloud.lib.vt.edu/test1");
    jest.spyOn(FetchTools, "getCollectionItems").mockResolvedValue({
      items: [singleItem],
      nextToken: null,
      total: 1
    });
    jest.spyOn(FetchTools, "getCollectionMap").mockResolvedValue(
      JSON.stringify({
        id: "testmap123",
        name: "Test Collection",
        custom_key: "xxxxj22hdemo"
      })
    );
    render(
      <MemoryRouter>
        <CollectionsListView
          site={mock_site}
          collection={collection}
          viewOption="list"
          socialButtons={buttons}
          metadataTitle={`Collection Details for ${collection.title}`}
          hasParentCollection={false}
          collectionCustomKey={collection.custom_key}
        />
      </MemoryRouter>
    );
  };
  it("displays CollectionsListView page with collections", async () => {
    setup();
    const images = await screen.findAllByRole("presentation");
    expect(images).toHaveLength(1);
    const shareSection = screen.getAllByText("Share");
    expect(shareSection[0]).toHaveClass("active title");
    const collectionDetails = screen.getAllByText(
      "Collection Details for Test Collection"
    );
    expect(collectionDetails[0]).toHaveClass("active title");
    expect(
      screen.getByRole("table", { name: /Collection metadata/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /Items in Collection/i })
    ).toHaveClass("col-12 col-lg-8");
    expect(
      screen.getByRole("heading", { name: /Test Archive/i })
    ).toBeVisible();
    expect(screen.getByText(/Test archive description/i)).toBeVisible();
  });

  it("Doesn't display Sharing section if socialButtons is empty array", async () => {
    setup([]);
    const images = await screen.findAllByRole("presentation");
    expect(images).toHaveLength(1);
    expect(screen.queryByText("Share")).toBeNull();
  });
});
