import { resolveMediaKind, ArchiveItem } from "./mediaKind";

function item(overrides: Partial<ArchiveItem> = {}): ArchiveItem {
  return {
    archiveOptions: null,
    manifest_url: null,
    thumbnail_path: null,
    title: "An item",
    type: [],
    format: [],
    ...overrides
  };
}

function options(obj: unknown): string {
  return JSON.stringify(obj);
}

describe("resolveMediaKind", () => {
  it("resolves a 3d_2diiif gltf item", () => {
    const result = resolveMediaKind(
      item({
        manifest_url: "https://example.org/x/manifest.json",
        archiveOptions: options({
          assets: {
            media_type: "3d_2diiif",
            gltf_config: "model.gltf",
            env_config: "env.hdr",
            thumbnail: "thumb.png"
          },
          config: {
            _3d: {
              scale_factor: "0.5",
              rotation: { horizontal: "10", vertical: "20" }
            }
          }
        })
      })
    );
    expect(result).toEqual({
      kind: "3d-2diiif-gltf",
      thumb: "thumb.png",
      gltfConfig: "model.gltf",
      envConfig: "env.hdr",
      scaleFactor: 0.5,
      rotation: { horizontal: 10, vertical: 20 },
      threeDConfig: {
        scale_factor: "0.5",
        rotation: { horizontal: "10", vertical: "20" }
      }
    });
  });

  it("resolves a 3d_2diiif x3d item via format signal", () => {
    const result = resolveMediaKind(
      item({
        manifest_url: "https://example.org/x/manifest.json",
        format: ["model/x3d", "image/tiff"],
        archiveOptions: options({
          assets: { media_type: "3d_2diiif", x3d_config: "scene.x3d" }
        })
      })
    );
    expect(result).toEqual({
      kind: "3d-2diiif-x3d",
      thumb: undefined,
      x3dConfig: "scene.x3d"
    });
  });

  it("resolves a standalone gltf item", () => {
    const result = resolveMediaKind(
      item({
        archiveOptions: options({
          assets: {
            media_type: "3d-model/gltf",
            gltf_config: "model.gltf",
            env_config: "env.hdr"
          }
        })
      })
    );
    expect(result.kind).toBe("gltf");
    if (result.kind === "gltf") {
      expect(result.scaleFactor).toBe(0.25);
      expect(result.rotation).toEqual({ horizontal: 0, vertical: 0 });
    }
  });

  it("resolves a standalone x3d item", () => {
    const result = resolveMediaKind(
      item({
        archiveOptions: options({
          assets: {
            media_type: "3d-model/x3dom",
            x3d_config: "scene.x3d",
            x3d_src_img: "preview.png"
          }
        })
      })
    );
    expect(result).toEqual({ kind: "x3d", x3dConfig: "scene.x3d" });
  });

  it("resolves a mirador manifest", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/manifest.json" })
    );
    expect(result).toEqual({ kind: "mirador" });
  });

  it("does not misclassify a 3D item's manifest as plain mirador (precedence)", () => {
    const result = resolveMediaKind(
      item({
        manifest_url: "https://example.org/x/manifest.json",
        archiveOptions: options({
          assets: {
            media_type: "3d_2diiif",
            gltf_config: "model.gltf",
            env_config: "env.hdr"
          }
        })
      })
    );
    expect(result.kind).toBe("3d-2diiif-gltf");
  });

  it("resolves a minerva exhibit", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/exhibit.json" })
    );
    expect(result).toEqual({ kind: "minerva" });
  });

  it("resolves an image", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/photo.jpg" })
    );
    expect(result).toEqual({
      kind: "image",
      url: "https://example.org/x/photo.jpg"
    });
  });

  it("resolves audio with a transcript", () => {
    const result = resolveMediaKind(
      item({
        manifest_url: "https://example.org/x/clip.mp3",
        archiveOptions: options({ audioTranscript: "hello world" })
      })
    );
    expect(result).toEqual({
      kind: "audio",
      url: "https://example.org/x/clip.mp3",
      transcript: "hello world"
    });
  });

  it("resolves video", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/clip.mp4" })
    );
    expect(result).toEqual({
      kind: "video",
      url: "https://example.org/x/clip.mp4"
    });
  });

  it("resolves a kaltura URL", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://video.vt.edu/media/12345" })
    );
    expect(result).toEqual({
      kind: "kaltura",
      url: "https://video.vt.edu/media/12345"
    });
  });

  it("resolves a pdf", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/doc.pdf" })
    );
    expect(result).toEqual({
      kind: "pdf",
      url: "https://example.org/x/doc.pdf"
    });
  });

  it("resolves an obj model and derives its texture path", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/model.obj" })
    );
    expect(result).toEqual({
      kind: "obj",
      url: "https://example.org/x/model.obj",
      texPath: "https://example.org/x/"
    });
  });

  it("resolves an mtl file", () => {
    const result = resolveMediaKind(
      item({ manifest_url: "https://example.org/x/model.mtl" })
    );
    expect(result).toEqual({
      kind: "mtl",
      url: "https://example.org/x/model.mtl"
    });
  });

  it("resolves unknown when nothing matches", () => {
    const result = resolveMediaKind(item());
    expect(result).toEqual({ kind: "unknown" });
  });

  it("falls through to URL-based resolution on malformed archiveOptions JSON, never throws", () => {
    const result = resolveMediaKind(
      item({
        archiveOptions: "{not valid json",
        manifest_url: "https://example.org/x/photo.jpg"
      })
    );
    expect(result).toEqual({
      kind: "image",
      url: "https://example.org/x/photo.jpg"
    });
  });

  it("falls through to unknown on malformed archiveOptions JSON with no manifest_url", () => {
    const result = resolveMediaKind(
      item({ archiveOptions: "{not valid json" })
    );
    expect(result).toEqual({ kind: "unknown" });
  });

  it("falls through when archiveOptions is missing required fields for its declared media_type", () => {
    const result = resolveMediaKind(
      item({
        manifest_url: "https://example.org/x/manifest.json",
        archiveOptions: options({ assets: { media_type: "3d-model/gltf" } })
      })
    );
    expect(result).toEqual({ kind: "mirador" });
  });

  it("regression: unifies scale_factor/rotation resolution on config._3d only, ignoring the old assets-level fallback", () => {
    const result = resolveMediaKind(
      item({
        archiveOptions: options({
          assets: {
            media_type: "3d-model/gltf",
            gltf_config: "model.gltf",
            env_config: "env.hdr",
            scale_factor: 0.9,
            rotation: { horizontal: 99, vertical: 99 }
          }
        })
      })
    );
    expect(result.kind).toBe("gltf");
    if (result.kind === "gltf") {
      expect(result.scaleFactor).toBe(0.25);
      expect(result.rotation).toEqual({ horizontal: 0, vertical: 0 });
    }
  });
});
