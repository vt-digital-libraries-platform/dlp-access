import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import * as FunctionalFileGetter from "../../lib/FunctionalFileGetter";
import { Thumbnail } from "./Thumbnail";

describe("Thumbnail component", () => {
  const setup = (
    category = "archive",
    imgUrl = "https://img.cloud.lib.vt.edu/iawa/Ms1990_025_Rudoff/Ms1990_025_Box1/Ms1990_025_Box1_Folder1/tiles/Ms1990_025_Per_Ms_B001_F001_002-1/full/193,/0/default.jpg",
    altText = false
  ) => {
    jest.spyOn(FunctionalFileGetter, "getFile").mockResolvedValue(imgUrl);
    render(
      <Thumbnail
        category={category}
        className="card-img-top"
        item={{
          thumbnail_url: imgUrl,
          title: "Title"
        }}
        site={{
          siteId: "default"
        }}
        altText={altText}
      />
    );
    return imgUrl;
  };

  it("displays archive label", async () => {
    setup();
    expect(await screen.findByText(/Item/)).toBeVisible();
  });

  it("displays collection label", async () => {
    setup("collection");
    expect(await screen.findByText(/Collection/)).toBeVisible();
  });

  it("displays no label", async () => {
    setup(null);
    const label = await waitFor(() => screen.queryByRole("paragraph"));
    expect(label).toBeNull();
  });

  it("populates alternative text", async () => {
    setup(undefined, undefined, true);
    expect(await screen.findByAltText("Title")).toBeInTheDocument();
  });

  it("displays image with attributes", async () => {
    const url = setup();
    const img = await screen.findByRole("img");
    expect(img).toBeVisible();
    expect(img).toHaveProperty("alt", "");
    expect(img).toHaveProperty("src", url);
  });
});
