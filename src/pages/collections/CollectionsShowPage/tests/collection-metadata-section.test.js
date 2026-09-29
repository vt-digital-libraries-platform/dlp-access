import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { CollectionMetadataSection } from "../CollectionMetadataSection";
import * as FetchTools from "../../../../lib/fetchTools";
import { MemoryRouter } from "react-router-dom";
import { mock_collection } from "../../../../fixtures/mock_collection";
import { mock_site } from "../../../../fixtures/mock_site";

describe("CollectionMetadataSection component", () => {
  const setup = (hasParent = false, view = "grid") => {
    jest.spyOn(FetchTools, "getCollectionMap").mockResolvedValue(
      JSON.stringify({
        id: "testmap123",
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
        <CollectionMetadataSection
          collection={mock_collection}
          viewOption={view}
          metadataTitle={`Collection Details for ${mock_collection.title}`}
          hasParentCollection={hasParent}
          collectionCustomKey={mock_collection.custom_key}
          site={mock_site}
        />
      </MemoryRouter>
    );
  };
  it("displays CollectionMetadataSection component", async () => {
    setup();
    expect(
      await screen.findByRole("heading", { name: /Collection Organization/i })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /Collection Details for Test Collection/i
      })
    ).toBeVisible();
    expect(
      screen.getByRole("table", { name: /Collection Metadata/i })
    ).toBeVisible();
    expect(screen.getByText(/Identifier/i)).toBeVisible();
    expect(screen.getByText(/test123/i)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /Collection Organization/i })
    ).toBeVisible();
  });

  it("displays collection description if parent collection exists", async () => {
    setup(true);
    expect(
      await screen.findByRole("heading", { name: /Collection Organization/i })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /Description/i
      })
    ).toBeVisible();
    expect(screen.getByText(/Test collection description/i)).toBeVisible();
  });

  it("displays in list view", async () => {
    setup(undefined, "list");
    expect(
      await screen.findByRole("heading", { name: /Collection Organization/i })
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: /Collection Details/i })
    ).not.toHaveClass("col-lg-8");
    expect(
      screen.getByRole("heading", { name: /Collection Details/i })
    ).toHaveClass("d-none");
  });
});
