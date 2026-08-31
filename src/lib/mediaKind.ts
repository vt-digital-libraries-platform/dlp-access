/**
 * Resolves an Archive item to the single media kind it should render as,
 * along with every field that kind's viewer needs. Replaces the 15
 * predicate methods that used to live in ArchivePage and the independent
 * archiveOptions parsing that used to live in ThreeD2DiiifHandler.
 *
 * Precedence (first match wins, mirrors ArchivePage.mediaDisplay's former
 * if/else order exactly):
 *   3d-2diiif (gltf sub-format, else x3d) > gltf > x3d > mirador > minerva
 *   > image > audio > video > kaltura > pdf > obj > mtl > unknown
 *
 * Malformed or missing archiveOptions never throws: it is treated as "no
 * kind-specific asset config," letting the chain fall through toward the
 * manifest_url-sniffing kinds, ending at "unknown" if nothing matches.
 */

export type ArchiveItem = {
  archiveOptions?: string | null;
  manifest_url?: string | null;
  thumbnail_path?: string | null;
  title?: string | null;
  type?: string[] | null;
  format?: string[] | null;
};

export type Rotation = { horizontal: number; vertical: number };

export type GltfFields = {
  gltfConfig: string;
  envConfig: string;
  scaleFactor: number;
  rotation: Rotation;
  threeDConfig: unknown;
};

export type X3dFields = {
  x3dConfig: string;
};

export type MediaKind =
  | ({ kind: "3d-2diiif-gltf"; thumb: string | undefined } & GltfFields)
  | ({ kind: "3d-2diiif-x3d"; thumb: string | undefined } & X3dFields)
  | ({ kind: "gltf" } & GltfFields)
  | ({ kind: "x3d" } & X3dFields)
  | { kind: "mirador" }
  | { kind: "minerva" }
  | { kind: "image"; url: string }
  | { kind: "audio"; url: string; transcript: string | null }
  | { kind: "video"; url: string }
  | { kind: "kaltura"; url: string }
  | { kind: "pdf"; url: string }
  | { kind: "obj"; url: string; texPath: string }
  | { kind: "mtl"; url: string }
  | { kind: "unknown" };

type ParsedOptions = {
  assets?: {
    media_type?: string;
    x3d_config?: string;
    x3d_src_img?: string;
    gltf_config?: string;
    env_config?: string;
    thumbnail?: string;
    morpho_thumb?: string;
  };
  config?: {
    _3d?: {
      scale_factor?: string | number;
      rotation?: {
        horizontal?: string | number;
        vertical?: string | number;
      };
    };
  };
  audioTranscript?: string | null;
};

function parseOptions(archiveOptions?: string | null): ParsedOptions {
  if (!archiveOptions) return {};
  try {
    return JSON.parse(archiveOptions) ?? {};
  } catch {
    return {};
  }
}

function resolveNumber(
  value: string | number | undefined,
  fallback: number
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

type RawRotation = {
  horizontal?: string | number;
  vertical?: string | number;
};

function resolveRotation(rotation: RawRotation | undefined): Rotation {
  return {
    horizontal: resolveNumber(rotation?.horizontal, 0),
    vertical: resolveNumber(rotation?.vertical, 0)
  };
}

function resolveGltfFields(options: ParsedOptions): GltfFields {
  const _3d = options.config?._3d;
  return {
    gltfConfig: options.assets?.gltf_config ?? "",
    envConfig: options.assets?.env_config ?? "",
    scaleFactor: resolveNumber(_3d?.scale_factor, 0.25),
    rotation: resolveRotation(_3d?.rotation),
    threeDConfig: _3d
  };
}

function resolveThumbnail(
  options: ParsedOptions,
  item: ArchiveItem
): string | undefined {
  return (
    options.assets?.thumbnail ||
    options.assets?.morpho_thumb ||
    item.thumbnail_path ||
    undefined
  );
}

function is3D2DiiifType(item: ArchiveItem, options: ParsedOptions): boolean {
  const is3D2Diiif =
    options.assets?.media_type === "3d_2diiif" && !!item.manifest_url;
  const hasX3DandTIFF =
    item.format?.indexOf("model/x3d") !== -1 &&
    item.format?.indexOf("image/tiff") !== -1;
  const hasGLTFandEnv =
    !!options.assets?.gltf_config && !!options.assets?.env_config;
  return is3D2Diiif && (hasX3DandTIFF || hasGLTFandEnv);
}

function isX3DType(options: ParsedOptions): boolean {
  return (
    options.assets?.media_type === "3d-model/x3dom" &&
    !!options.assets?.x3d_config &&
    !!options.assets?.x3d_src_img
  );
}

function isGLTFType(options: ParsedOptions): boolean {
  return (
    options.assets?.media_type === "3d-model/gltf" &&
    !!options.assets?.gltf_config &&
    !!options.assets?.env_config
  );
}

function isMiradorURL(url: string | null | undefined, has3D: boolean): boolean {
  if (!url) return false;
  try {
    return !has3D && /\/manifest\.json$/.test(url);
  } catch {
    return false;
  }
}

function isMinervaURL(url: string | null | undefined): boolean {
  return !!url && /\/exhibit\.json$/.test(url);
}

function isImgURL(url: string | null | undefined): boolean {
  return !!url && /\.(jpeg|jpg|gif|png)$/.test(url);
}

function isAudioURL(url: string | null | undefined): boolean {
  return !!url && /\.(mp3|ogg|wav)$/.test(url);
}

function isVideoURL(url: string | null | undefined): boolean {
  return !!url && /\.(mp4|mov)$/.test(url);
}

function isKalturaURL(url: string | null | undefined): boolean {
  return !!url && /video\.vt\.edu\/media/.test(url);
}

function isPdfURL(url: string | null | undefined): boolean {
  return !!url && /\.(pdf)$/.test(url);
}

function isObjURL(url: string | null | undefined): boolean {
  return !!url && /\.(obj|OBJ)$/.test(url);
}

function isMtlURL(url: string | null | undefined): boolean {
  return !!url && /\.(mtl)$/.test(url);
}

function objTexPath(url: string): string {
  return url.substring(0, url.lastIndexOf("/") + 1);
}

export function resolveMediaKind(item: ArchiveItem): MediaKind {
  const options = parseOptions(item.archiveOptions);
  const url = item.manifest_url ?? undefined;

  if (is3D2DiiifType(item, options)) {
    const thumb = resolveThumbnail(options, item);
    if (options.assets?.gltf_config) {
      return { kind: "3d-2diiif-gltf", thumb, ...resolveGltfFields(options) };
    }
    return {
      kind: "3d-2diiif-x3d",
      thumb,
      x3dConfig: options.assets?.x3d_config ?? ""
    };
  }

  if (isGLTFType(options)) {
    return { kind: "gltf", ...resolveGltfFields(options) };
  }

  if (isX3DType(options)) {
    return { kind: "x3d", x3dConfig: options.assets?.x3d_config ?? "" };
  }

  if (isMiradorURL(url, is3D2DiiifType(item, options))) {
    return { kind: "mirador" };
  }

  if (isMinervaURL(url)) {
    return { kind: "minerva" };
  }

  if (isImgURL(url)) {
    return { kind: "image", url: url as string };
  }

  if (isAudioURL(url)) {
    return {
      kind: "audio",
      url: url as string,
      transcript: options.audioTranscript ?? null
    };
  }

  if (isVideoURL(url)) {
    return { kind: "video", url: url as string };
  }

  if (isKalturaURL(url)) {
    return { kind: "kaltura", url: url as string };
  }

  if (isPdfURL(url)) {
    return { kind: "pdf", url: url as string };
  }

  if (isObjURL(url)) {
    return {
      kind: "obj",
      url: url as string,
      texPath: objTexPath(url as string)
    };
  }

  if (isMtlURL(url)) {
    return { kind: "mtl", url: url as string };
  }

  return { kind: "unknown" };
}
