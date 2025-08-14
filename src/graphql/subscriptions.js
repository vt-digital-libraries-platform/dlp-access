/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateArchive = /* GraphQL */ `
  subscription OnCreateArchive($filter: ModelSubscriptionArchiveFilterInput) {
    onCreateArchive(filter: $filter) {
      age
      alternative
      archiveOptions
      asset_urls
      basis_of_record
      bibliographic_citation
      conforms_to
      contributor
      coverage
      create_date
      created
      creator
      custom_key
      date
      description
      display_date
      download_link
      embargo_start_date
      embargo_end_date
      embargo_note
      end_date
      explicit
      extent
      format
      format_physical
      has_format
      has_part
      has_version
      heirarchy_path
      id
      identifier
      is_format_of
      is_part_of
      is_version_of
      language
      license
      location
      medium
      modified_date
      other_identifier
      parent_collection_identifier
      provenance
      publisher
      references
      relation
      repository
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      subject
      tags
      temporal
      title
      type
      visibility
      createdAt
      updatedAt
      collectionArchivesId
      __typename
    }
  }
`;
export const onUpdateArchive = /* GraphQL */ `
  subscription OnUpdateArchive($filter: ModelSubscriptionArchiveFilterInput) {
    onUpdateArchive(filter: $filter) {
      age
      alternative
      archiveOptions
      asset_urls
      basis_of_record
      bibliographic_citation
      conforms_to
      contributor
      coverage
      create_date
      created
      creator
      custom_key
      date
      description
      display_date
      download_link
      embargo_start_date
      embargo_end_date
      embargo_note
      end_date
      explicit
      extent
      format
      format_physical
      has_format
      has_part
      has_version
      heirarchy_path
      id
      identifier
      is_format_of
      is_part_of
      is_version_of
      language
      license
      location
      medium
      modified_date
      other_identifier
      parent_collection_identifier
      provenance
      publisher
      references
      relation
      repository
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      subject
      tags
      temporal
      title
      type
      visibility
      createdAt
      updatedAt
      collectionArchivesId
      __typename
    }
  }
`;
export const onDeleteArchive = /* GraphQL */ `
  subscription OnDeleteArchive($filter: ModelSubscriptionArchiveFilterInput) {
    onDeleteArchive(filter: $filter) {
      age
      alternative
      archiveOptions
      asset_urls
      basis_of_record
      bibliographic_citation
      conforms_to
      contributor
      coverage
      create_date
      created
      creator
      custom_key
      date
      description
      display_date
      download_link
      embargo_start_date
      embargo_end_date
      embargo_note
      end_date
      explicit
      extent
      format
      format_physical
      has_format
      has_part
      has_version
      heirarchy_path
      id
      identifier
      is_format_of
      is_part_of
      is_version_of
      language
      license
      location
      medium
      modified_date
      other_identifier
      parent_collection_identifier
      provenance
      publisher
      references
      relation
      repository
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      subject
      tags
      temporal
      title
      type
      visibility
      createdAt
      updatedAt
      collectionArchivesId
      __typename
    }
  }
`;
export const onCreateCollection = /* GraphQL */ `
  subscription OnCreateCollection(
    $filter: ModelSubscriptionCollectionFilterInput
  ) {
    onCreateCollection(filter: $filter) {
      archives {
        nextToken
        __typename
      }
      asset_urls
      bibliographic_citation
      collectionOptions
      collection_map
      create_date
      creator
      custom_key
      description
      display_date
      embargo_start_date
      embargo_end_date
      embargo_note
      end_date
      explicit_content
      heirarchy_path
      id
      identifier
      is_part_of
      language
      location
      modified_date
      ownerinfo
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      sub_collections {
        nextToken
        __typename
      }
      subject
      title
      visibility
      createdAt
      updatedAt
      collectionSub_collectionsId
      __typename
    }
  }
`;
export const onUpdateCollection = /* GraphQL */ `
  subscription OnUpdateCollection(
    $filter: ModelSubscriptionCollectionFilterInput
  ) {
    onUpdateCollection(filter: $filter) {
      archives {
        nextToken
        __typename
      }
      asset_urls
      bibliographic_citation
      collectionOptions
      collection_map
      create_date
      creator
      custom_key
      description
      display_date
      embargo_start_date
      embargo_end_date
      embargo_note
      end_date
      explicit_content
      heirarchy_path
      id
      identifier
      is_part_of
      language
      location
      modified_date
      ownerinfo
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      sub_collections {
        nextToken
        __typename
      }
      subject
      title
      visibility
      createdAt
      updatedAt
      collectionSub_collectionsId
      __typename
    }
  }
`;
export const onDeleteCollection = /* GraphQL */ `
  subscription OnDeleteCollection(
    $filter: ModelSubscriptionCollectionFilterInput
  ) {
    onDeleteCollection(filter: $filter) {
      archives {
        nextToken
        __typename
      }
      asset_urls
      bibliographic_citation
      collectionOptions
      collection_map
      create_date
      creator
      custom_key
      description
      display_date
      embargo_start_date
      embargo_end_date
      embargo_note
      end_date
      explicit_content
      heirarchy_path
      id
      identifier
      is_part_of
      language
      location
      modified_date
      ownerinfo
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      sub_collections {
        nextToken
        __typename
      }
      subject
      title
      visibility
      createdAt
      updatedAt
      collectionSub_collectionsId
      __typename
    }
  }
`;
export const onCreatePageContent = /* GraphQL */ `
  subscription OnCreatePageContent(
    $filter: ModelSubscriptionPageContentFilterInput
  ) {
    onCreatePageContent(filter: $filter) {
      page_content_category
      id
      content
      pageContentSiteId {
        analyticsID
        assetBasePath
        browseCollections
        contact
        displayedAttributes
        groups
        homePage
        id
        lang
        miradorOptions
        searchPage
        siteColor
        siteId
        siteName
        siteOptions
        sitePages
        siteTitle
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      pageContentPageContentSiteIdId
      __typename
    }
  }
`;
export const onUpdatePageContent = /* GraphQL */ `
  subscription OnUpdatePageContent(
    $filter: ModelSubscriptionPageContentFilterInput
  ) {
    onUpdatePageContent(filter: $filter) {
      page_content_category
      id
      content
      pageContentSiteId {
        analyticsID
        assetBasePath
        browseCollections
        contact
        displayedAttributes
        groups
        homePage
        id
        lang
        miradorOptions
        searchPage
        siteColor
        siteId
        siteName
        siteOptions
        sitePages
        siteTitle
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      pageContentPageContentSiteIdId
      __typename
    }
  }
`;
export const onDeletePageContent = /* GraphQL */ `
  subscription OnDeletePageContent(
    $filter: ModelSubscriptionPageContentFilterInput
  ) {
    onDeletePageContent(filter: $filter) {
      page_content_category
      id
      content
      pageContentSiteId {
        analyticsID
        assetBasePath
        browseCollections
        contact
        displayedAttributes
        groups
        homePage
        id
        lang
        miradorOptions
        searchPage
        siteColor
        siteId
        siteName
        siteOptions
        sitePages
        siteTitle
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      pageContentPageContentSiteIdId
      __typename
    }
  }
`;
export const onCreateSite = /* GraphQL */ `
  subscription OnCreateSite($filter: ModelSubscriptionSiteFilterInput) {
    onCreateSite(filter: $filter) {
      analyticsID
      assetBasePath
      browseCollections
      contact
      displayedAttributes
      groups
      homePage
      id
      lang
      miradorOptions
      searchPage
      siteColor
      siteId
      siteName
      siteOptions
      sitePages
      siteTitle
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateSite = /* GraphQL */ `
  subscription OnUpdateSite($filter: ModelSubscriptionSiteFilterInput) {
    onUpdateSite(filter: $filter) {
      analyticsID
      assetBasePath
      browseCollections
      contact
      displayedAttributes
      groups
      homePage
      id
      lang
      miradorOptions
      searchPage
      siteColor
      siteId
      siteName
      siteOptions
      sitePages
      siteTitle
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteSite = /* GraphQL */ `
  subscription OnDeleteSite($filter: ModelSubscriptionSiteFilterInput) {
    onDeleteSite(filter: $filter) {
      analyticsID
      assetBasePath
      browseCollections
      contact
      displayedAttributes
      groups
      homePage
      id
      lang
      miradorOptions
      searchPage
      siteColor
      siteId
      siteName
      siteOptions
      sitePages
      siteTitle
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateHistory = /* GraphQL */ `
  subscription OnCreateHistory($filter: ModelSubscriptionHistoryFilterInput) {
    onCreateHistory(filter: $filter) {
      event
      groups
      id
      siteID
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateHistory = /* GraphQL */ `
  subscription OnUpdateHistory($filter: ModelSubscriptionHistoryFilterInput) {
    onUpdateHistory(filter: $filter) {
      event
      groups
      id
      siteID
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteHistory = /* GraphQL */ `
  subscription OnDeleteHistory($filter: ModelSubscriptionHistoryFilterInput) {
    onDeleteHistory(filter: $filter) {
      event
      groups
      id
      siteID
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
