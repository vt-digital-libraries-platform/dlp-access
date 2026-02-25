export {};

declare global {
  interface Window {
    viewer: any;
  }

  interface Archive {
    alternative: string[] | null;
    alt_text: string | null;
    archived: boolean | null;
    archiveOptions: string | null;
    basis_of_record: string[] | null;
    bibliographic_citation: string[] | null;
    conforms_to: string[] | null;
    contributor: string[] | null;
    coverage: string[] | null;
    create_date: string | null;
    created: string[] | null;
    creator: string[] | null;
    custom_key: string | null;
    date: string[] | null;
    description: string[] | null;
    display_date: string[] | null;
    end_date: string | null;
    explicit: boolean | null;
    extent: string[] | null;
    extracted_text: string | null;
    format: string[] | null;
    format_physical: string[] | null;
    has_format: string[] | null;
    has_part: string[] | null;
    has_version: string[] | null;
    heirarchy_path: string[] | null;
    id: string;
    identifier: string;
    is_format_of: string[] | null;
    is_part_of: string[] | null;
    is_version_of: string[] | null;
    item_category: string;
    language: string[] | null;
    license: string[] | null;
    manifest_file_characterization: string | null;
    manifest_url: string;
    medium: string[] | null;
    modified_date: string | null;
    other_identifier: string[] | null;
    parent_collection: string[] | null;
    partner_id: string[] | null;
    provenance: string[] | null;
    publisher: string[] | null;
    references: string[] | null;
    relation: string[] | null;
    repository: string[] | null;
    rights_holder: string[] | null;
    rights: string[] | null;
    source: string[] | null;
    spatial: string[] | null;
    start_date: string | null;
    subject: string[] | null;
    tags: string[] | null;
    taxonomy: string[] | null;
    temporal: string[] | null;
    thumbnail_path: string | null;
    title: string;
    title_template: string | null;
    type: string[] | null;
    visibility: boolean;
    visual_description: string | null;
    collection: string | null;
  }

  interface Collectionmap {
    collectionmap_category: string;
    collection_id: string;
    create_date: string | null;
    id: string;
    map_object: string;
    modified_date: string | null;
    collection: string | null;
  }

  interface MapObject {
    id: string;
    name: string;
    custom_key: string;
    children: MapObject[];
  }
  interface Collection {
    alt_text: string | null;
    archived: boolean | null;
    bibliographic_citation: string[] | null;
    collection_category: string;
    collectionmap_id: string | null;
    collectionOptions: string | null;
    create_date: string | null;
    creator: string[] | null;
    custom_key: string | null;
    description: string[] | null;
    display_date: string[] | null;
    end_date: string | null;
    explicit_content: boolean | null;
    heirarchy_path: string[] | null;
    id: string;
    identifier: string;
    is_part_of: string[] | null;
    language: string[] | null;
    modified_date: string | null;
    ownerinfo: string;
    parent_collection: string[] | null;
    partner_id: string[] | null;
    provenance: string[] | null;
    relation: string[] | null;
    rights_holder: string[] | null;
    rights: string[] | null;
    source: string[] | null;
    spatial: string[] | null;
    start_date: string | null;
    subject: string[] | null;
    thumbnail_path: string | null;
    title: string;
    title_template: string | null;
    visibility: boolean;
    collectionmap: Collectionmap | null;
    archives: Archive[] | null;
  }
  interface CollectionOptions {
    podcast_links?: string[];
    webFeed?: string;
  }
  interface PageContent {
    page_content_category: string;
    id: string;
    content: string;
    pageContentSiteId: string;
  }
  interface Site {
    analyticsID: string | null;
    assetBasePath: string | null;
    browseCollections: string;
    contact: string[];
    displayedAttributes: string;
    groups: string[];
    homePage: string;
    id: string;
    lang: string | null;
    miradorOptions: string | null;
    searchPage: string;
    siteColor: string | null;
    siteId: string;
    siteName: string;
    siteOptions: string | null;
    sitePages: string | null;
    siteTitle: string;
  }
}
