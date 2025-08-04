/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const searchObjects = /* GraphQL */ `
  query SearchObjects(
    $allFields: String
    $sort: SearchableObjectSortInput
    $filter: SearchableObjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    searchObjects(
      allFields: $allFields
      sort: $sort
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        bibliographic_citation
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        heirarchy_path
        id
        identifier
        is_part_of
        language
        location
        modified_date
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility

        ... on Collection {
          collectionOptions
          explicit_content
          ownerinfo
          createdAt
          updatedAt
        }
        ... on Archive {
          age
          alternative
          archiveOptions
          basis_of_record
          conforms_to
          contributor
          coverage
          created
          date
          download_link
          explicit
          extent
          format
          format_physical
          has_format
          has_part
          has_version
          is_format_of
          is_version_of
          license
          manifest_file_characterization
          manifest_url
          medium
          other_identifier
          publisher
          references
          repository
          tags
          temporal
          type
          createdAt
          updatedAt
          collectionArchivesId
        }
      }
      nextToken
      total
      __typename
    }
  }
`;
export const fulltextCollections = /* GraphQL */ `
  query FulltextCollections(
    $allFields: String
    $filter: SearchableCollectionFilterInput
    $sort: SearchableCollectionSortInput
    $limit: Int
    $nextToken: String
  ) {
    fulltextCollections(
      allFields: $allFields
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        bibliographic_citation
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
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        __typename
      }
      nextToken
      total
      __typename
    }
  }
`;
export const fulltextArchives = /* GraphQL */ `
  query FulltextArchives(
    $allFields: String
    $filter: SearchableArchiveFilterInput
    $sort: SearchableArchiveSortInput
    $limit: Int
    $nextToken: String
  ) {
    fulltextArchives(
      allFields: $allFields
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        language
        license
        location
        manifest_file_characterization
        manifest_url
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
        thumbnail_path
        title
        type
        visibility
        createdAt
        updatedAt
        collectionArchivesId
        __typename
      }
      nextToken
      total
      __typename
    }
  }
`;
export const getArchive = /* GraphQL */ `
  query GetArchive($id: ID!) {
    getArchive(id: $id) {
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
      language
      license
      location
      manifest_file_characterization
      manifest_url
      medium
      modified_date
      other_identifier
      parent_collection {
        bibliographic_citation
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
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        __typename
      }
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
      thumbnail_path
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
export const listArchives = /* GraphQL */ `
  query ListArchives(
    $filter: ModelArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArchives(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        language
        license
        location
        manifest_file_characterization
        manifest_url
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
        thumbnail_path
        title
        type
        visibility
        createdAt
        updatedAt
        collectionArchivesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const archiveByIdentifier = /* GraphQL */ `
  query ArchiveByIdentifier(
    $identifier: String!
    $sortDirection: ModelSortDirection
    $filter: ModelArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    archiveByIdentifier(
      identifier: $identifier
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        language
        license
        location
        manifest_file_characterization
        manifest_url
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
        thumbnail_path
        title
        type
        visibility
        createdAt
        updatedAt
        collectionArchivesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const searchArchives = /* GraphQL */ `
  query SearchArchives(
    $filter: SearchableArchiveFilterInput
    $sort: [SearchableArchiveSortInput]
    $limit: Int
    $nextToken: String
    $from: Int
    $aggregates: [SearchableArchiveAggregationInput]
  ) {
    searchArchives(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
      aggregates: $aggregates
    ) {
      items {
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
        language
        license
        location
        manifest_file_characterization
        manifest_url
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
        thumbnail_path
        title
        type
        visibility
        createdAt
        updatedAt
        collectionArchivesId
        __typename
      }
      nextToken
      total
      __typename
    }
  }
`;
export const getCollection = /* GraphQL */ `
  query GetCollection($id: ID!) {
    getCollection(id: $id) {
      archives {
        nextToken
        __typename
      }
      bibliographic_citation
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
      parent_collection {
        bibliographic_citation
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
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        __typename
      }
      parent_collection_identifier
      provenance
      relation
      rights_holder
      rights
      site_category
      source
      spatial
      start_date
      subject
      thumbnail_path
      title
      visibility
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCollections = /* GraphQL */ `
  query ListCollections(
    $filter: ModelCollectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCollections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        bibliographic_citation
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
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const collectionByIdentifier = /* GraphQL */ `
  query CollectionByIdentifier(
    $identifier: String!
    $sortDirection: ModelSortDirection
    $filter: ModelCollectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    collectionByIdentifier(
      identifier: $identifier
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        bibliographic_citation
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
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const searchCollections = /* GraphQL */ `
  query SearchCollections(
    $filter: SearchableCollectionFilterInput
    $sort: [SearchableCollectionSortInput]
    $limit: Int
    $nextToken: String
    $from: Int
    $aggregates: [SearchableCollectionAggregationInput]
  ) {
    searchCollections(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
      aggregates: $aggregates
    ) {
      items {
        bibliographic_citation
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
        parent_collection_identifier
        provenance
        relation
        rights_holder
        rights
        site_category
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        __typename
      }
      nextToken
      total
      __typename
    }
  }
`;
export const getPageContent = /* GraphQL */ `
  query GetPageContent($id: ID!) {
    getPageContent(id: $id) {
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
export const listPageContents = /* GraphQL */ `
  query ListPageContents(
    $filter: ModelPageContentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPageContents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        page_content_category
        id
        content
        createdAt
        updatedAt
        pageContentPageContentSiteIdId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSite = /* GraphQL */ `
  query GetSite($id: ID!) {
    getSite(id: $id) {
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
export const listSites = /* GraphQL */ `
  query ListSites(
    $filter: ModelSiteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSites(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const siteBySiteId = /* GraphQL */ `
  query SiteBySiteId(
    $siteId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSiteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    siteBySiteId(
      siteId: $siteId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getHistory = /* GraphQL */ `
  query GetHistory($id: ID!) {
    getHistory(id: $id) {
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
export const listHistories = /* GraphQL */ `
  query ListHistories(
    $filter: ModelHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listHistories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        event
        groups
        id
        siteID
        userEmail
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
