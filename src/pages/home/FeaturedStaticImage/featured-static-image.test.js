import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import * as FunctionalFileGetter from "../../../lib/FunctionalFileGetter";
import { FeaturedStaticImage } from "./FeaturedStaticImage";

describe("Featured static image", () => {
  const imgSrc = "http://default/cover_image.jpg";
  const setup = () => {
    jest.spyOn(FunctionalFileGetter, "getFile").mockResolvedValue(imgSrc);
    render(
      <FeaturedStaticImage
        staticImage={{
          src: imgSrc,
          altText: "",
          textStyle: "capitalize",
          titleFont: "Acherus, sans-serif",
          titleSize: "60px"
        }}
        site={{
          siteId: "default",
          siteName: "Demo Site"
        }}
      />
    );
  };

  it("displays static image", async () => {
    setup();
    const image = await screen.findByRole("presentation");
    expect(image).toBeVisible();
    expect(image).toHaveProperty("alt", "");
    await waitFor(() => expect(image).toHaveProperty("src", imgSrc));
  });

  it("does not render the site title (moved out of this component)", async () => {
    setup();
    await screen.findByRole("presentation");
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
