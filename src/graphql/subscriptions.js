/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateArchive = /* GraphQL */ `
  subscription OnCreateArchive($filter: ModelSubscriptionArchiveFilterInput) {
    onCreateArchive(filter: $filter) {
      age
      alternative
      archiveOptions
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
      item_category
      language
      license
      location
      manifest_file_characterization
      manifest_url
      medium
      modified_date
      other_identifier
      parent_collection
      parent_collection_identifier
      provenance
      publisher
      references
      relation
      repository
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      tags
      temporal
      thumbnail_path
      title
      type
      visibility
      collection {
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
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
        parent_collection
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        __typename
      }
      createdAt
      updatedAt
      collectionArchivesId
      archiveCollectionId
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
      item_category
      language
      license
      location
      manifest_file_characterization
      manifest_url
      medium
      modified_date
      other_identifier
      parent_collection
      parent_collection_identifier
      provenance
      publisher
      references
      relation
      repository
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      tags
      temporal
      thumbnail_path
      title
      type
      visibility
      collection {
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
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
        parent_collection
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        __typename
      }
      createdAt
      updatedAt
      collectionArchivesId
      archiveCollectionId
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
      item_category
      language
      license
      location
      manifest_file_characterization
      manifest_url
      medium
      modified_date
      other_identifier
      parent_collection
      parent_collection_identifier
      provenance
      publisher
      references
      relation
      repository
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      tags
      temporal
      thumbnail_path
      title
      type
      visibility
      collection {
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
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
        parent_collection
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        __typename
      }
      createdAt
      updatedAt
      collectionArchivesId
      archiveCollectionId
      __typename
    }
  }
`;
export const onCreateCollection = /* GraphQL */ `
  subscription OnCreateCollection(
    $filter: ModelSubscriptionCollectionFilterInput
  ) {
    onCreateCollection(filter: $filter) {
      bibliographic_citation
      collection_category
      collectionmap_id
      collectionOptions
      create_date
      creator
      custom_key
      description
      display_date
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
      parent_collection
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      thumbnail_path
      title
      visibility
      collectionmap {
        collectionmap_category
        collection_id
        create_date
        id
        map_object
        modified_date
        createdAt
        updatedAt
        collectionmapCollectionId
        __typename
      }
      archives {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      collectionCollectionmapId
      __typename
    }
  }
`;
export const onUpdateCollection = /* GraphQL */ `
  subscription OnUpdateCollection(
    $filter: ModelSubscriptionCollectionFilterInput
  ) {
    onUpdateCollection(filter: $filter) {
      bibliographic_citation
      collection_category
      collectionmap_id
      collectionOptions
      create_date
      creator
      custom_key
      description
      display_date
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
      parent_collection
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      thumbnail_path
      title
      visibility
      collectionmap {
        collectionmap_category
        collection_id
        create_date
        id
        map_object
        modified_date
        createdAt
        updatedAt
        collectionmapCollectionId
        __typename
      }
      archives {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      collectionCollectionmapId
      __typename
    }
  }
`;
export const onDeleteCollection = /* GraphQL */ `
  subscription OnDeleteCollection(
    $filter: ModelSubscriptionCollectionFilterInput
  ) {
    onDeleteCollection(filter: $filter) {
      bibliographic_citation
      collection_category
      collectionmap_id
      collectionOptions
      create_date
      creator
      custom_key
      description
      display_date
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
      parent_collection
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      thumbnail_path
      title
      visibility
      collectionmap {
        collectionmap_category
        collection_id
        create_date
        id
        map_object
        modified_date
        createdAt
        updatedAt
        collectionmapCollectionId
        __typename
      }
      archives {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      collectionCollectionmapId
      __typename
    }
  }
`;
export const onCreateCollectionmap = /* GraphQL */ `
  subscription OnCreateCollectionmap(
    $filter: ModelSubscriptionCollectionmapFilterInput
  ) {
    onCreateCollectionmap(filter: $filter) {
      collectionmap_category
      collection_id
      create_date
      id
      map_object
      modified_date
      collection {
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
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
        parent_collection
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        __typename
      }
      createdAt
      updatedAt
      collectionmapCollectionId
      __typename
    }
  }
`;
export const onUpdateCollectionmap = /* GraphQL */ `
  subscription OnUpdateCollectionmap(
    $filter: ModelSubscriptionCollectionmapFilterInput
  ) {
    onUpdateCollectionmap(filter: $filter) {
      collectionmap_category
      collection_id
      create_date
      id
      map_object
      modified_date
      collection {
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
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
        parent_collection
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        __typename
      }
      createdAt
      updatedAt
      collectionmapCollectionId
      __typename
    }
  }
`;
export const onDeleteCollectionmap = /* GraphQL */ `
  subscription OnDeleteCollectionmap(
    $filter: ModelSubscriptionCollectionmapFilterInput
  ) {
    onDeleteCollectionmap(filter: $filter) {
      collectionmap_category
      collection_id
      create_date
      id
      map_object
      modified_date
      collection {
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
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
        parent_collection
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        __typename
      }
      createdAt
      updatedAt
      collectionmapCollectionId
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
export const onCreateEmbargo = /* GraphQL */ `
  subscription OnCreateEmbargo($filter: ModelSubscriptionEmbargoFilterInput) {
    onCreateEmbargo(filter: $filter) {
      id
      identifier
      start_date
      end_date
      note
      record_type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateEmbargo = /* GraphQL */ `
  subscription OnUpdateEmbargo($filter: ModelSubscriptionEmbargoFilterInput) {
    onUpdateEmbargo(filter: $filter) {
      id
      identifier
      start_date
      end_date
      note
      record_type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteEmbargo = /* GraphQL */ `
  subscription OnDeleteEmbargo($filter: ModelSubscriptionEmbargoFilterInput) {
    onDeleteEmbargo(filter: $filter) {
      id
      identifier
      start_date
      end_date
      note
      record_type
      createdAt
      updatedAt
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
