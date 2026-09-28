import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { SubCollectionsTree } from "../SubCollectionsTree";
import * as FetchTools from "../../../../lib/fetchTools";
import { MemoryRouter } from "react-router-dom";
import { mock_collection } from "../../../../fixtures/mock_collection";

describe("SubCollectionsTree component", () => {
  it("displays SubCollectionsTree component", async () => {
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
        <SubCollectionsTree collection={mock_collection} />
      </MemoryRouter>
    );
    expect(
      await screen.findByRole("heading", { name: /Collection Organization/i })
    ).toBeVisible();
    await screen.findByRole("link", { name: /Folder/i });
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Test Collection");
    expect(links[1]).toHaveTextContent("Folder");
  });
});
