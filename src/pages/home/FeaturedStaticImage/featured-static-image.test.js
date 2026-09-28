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

  it("displays site title", async () => {
    setup();
    await screen.findByRole("presentation");
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeVisible();
    expect(title).toHaveTextContent("Demo Site");
    expect(title).toHaveStyle("text-transform: capitalize");
    expect(title).toHaveStyle("font-family: Acherus, sans-serif");
    expect(title).toHaveStyle("font-size: 60px");
  });
});
