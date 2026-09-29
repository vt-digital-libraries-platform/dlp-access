import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as FunctionalFileGetter from "../../../lib/FunctionalFileGetter";
import { SiteSponsors } from "./SiteSponsors";
import { Sponsor } from "./Sponsor";

const sponsors = [
  {
    alt: "CLIR",
    link: "https://clir.org/",
    src: "sponsors/sponsor1.png"
  },
  {
    alt: "IAWA",
    link: "https://spec.lib.vt.edu/iawa/",
    src: "sponsors/sponsors2.png"
  }
];

describe("SiteSponsors component", () => {
  it("displays Site Sponsors section", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(sponsors[0].src);
    render(
      <SiteSponsors
        sponsors={sponsors}
        site={{
          siteId: "default"
        }}
        sponsorsStyle="divider"
      />
    );
    const section = document.querySelector(".home-sponsors-section");
    expect(section).toBeVisible();
    expect(section).toHaveClass("sponsors-divider");
    expect(await screen.findAllByRole("img")).toHaveLength(sponsors.length);
  });

  it("does not display section if sponsors prop is null", () => {
    render(
      <SiteSponsors
        sponsors={null}
        site={{
          siteId: "default"
        }}
        sponsorsStyle="divider"
      />
    );
    expect(document.querySelector(".home-sponsors-section")).toBeNull();
  });

  it("does not display section if sponsors prop is an empty array", () => {
    render(
      <SiteSponsors
        sponsors={[]}
        site={{
          siteId: "default"
        }}
        sponsorsStyle="divider"
      />
    );
    expect(document.querySelector(".home-sponsors-section")).toBeNull();
  });
});

describe("Sponsor image component", () => {
  it("displays sponsor image and attributes", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(sponsors[0].src);
    render(<Sponsor sponsor={sponsors[0]} siteId="default" key="0" />);
    const image = await screen.findByRole("img");
    expect(image).toBeVisible();
    expect(image).toHaveAttribute("src", sponsors[0].src);
    expect(image).toHaveAttribute("alt", sponsors[0].alt);
    expect(screen.getByRole("link")).toHaveAttribute("href", sponsors[0].link);
  });
});
