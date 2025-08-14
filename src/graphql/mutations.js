/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createArchive = /* GraphQL */ `
  mutation CreateArchive(
    $input: CreateArchiveInput!
    $condition: ModelArchiveConditionInput
  ) {
    createArchive(input: $input, condition: $condition) {
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
export const updateArchive = /* GraphQL */ `
  mutation UpdateArchive(
    $input: UpdateArchiveInput!
    $condition: ModelArchiveConditionInput
  ) {
    updateArchive(input: $input, condition: $condition) {
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
export const deleteArchive = /* GraphQL */ `
  mutation DeleteArchive(
    $input: DeleteArchiveInput!
    $condition: ModelArchiveConditionInput
  ) {
    deleteArchive(input: $input, condition: $condition) {
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
export const createCollection = /* GraphQL */ `
  mutation CreateCollection(
    $input: CreateCollectionInput!
    $condition: ModelCollectionConditionInput
  ) {
    createCollection(input: $input, condition: $condition) {
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
export const updateCollection = /* GraphQL */ `
  mutation UpdateCollection(
    $input: UpdateCollectionInput!
    $condition: ModelCollectionConditionInput
  ) {
    updateCollection(input: $input, condition: $condition) {
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
export const deleteCollection = /* GraphQL */ `
  mutation DeleteCollection(
    $input: DeleteCollectionInput!
    $condition: ModelCollectionConditionInput
  ) {
    deleteCollection(input: $input, condition: $condition) {
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
export const createPageContent = /* GraphQL */ `
  mutation CreatePageContent(
    $input: CreatePageContentInput!
    $condition: ModelPageContentConditionInput
  ) {
    createPageContent(input: $input, condition: $condition) {
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
export const updatePageContent = /* GraphQL */ `
  mutation UpdatePageContent(
    $input: UpdatePageContentInput!
    $condition: ModelPageContentConditionInput
  ) {
    updatePageContent(input: $input, condition: $condition) {
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
export const deletePageContent = /* GraphQL */ `
  mutation DeletePageContent(
    $input: DeletePageContentInput!
    $condition: ModelPageContentConditionInput
  ) {
    deletePageContent(input: $input, condition: $condition) {
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
export const createSite = /* GraphQL */ `
  mutation CreateSite(
    $input: CreateSiteInput!
    $condition: ModelSiteConditionInput
  ) {
    createSite(input: $input, condition: $condition) {
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
export const updateSite = /* GraphQL */ `
  mutation UpdateSite(
    $input: UpdateSiteInput!
    $condition: ModelSiteConditionInput
  ) {
    updateSite(input: $input, condition: $condition) {
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
export const deleteSite = /* GraphQL */ `
  mutation DeleteSite(
    $input: DeleteSiteInput!
    $condition: ModelSiteConditionInput
  ) {
    deleteSite(input: $input, condition: $condition) {
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
export const createHistory = /* GraphQL */ `
  mutation CreateHistory(
    $input: CreateHistoryInput!
    $condition: ModelHistoryConditionInput
  ) {
    createHistory(input: $input, condition: $condition) {
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
export const updateHistory = /* GraphQL */ `
  mutation UpdateHistory(
    $input: UpdateHistoryInput!
    $condition: ModelHistoryConditionInput
  ) {
    updateHistory(input: $input, condition: $condition) {
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
export const deleteHistory = /* GraphQL */ `
  mutation DeleteHistory(
    $input: DeleteHistoryInput!
    $condition: ModelHistoryConditionInput
  ) {
    deleteHistory(input: $input, condition: $condition) {
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
