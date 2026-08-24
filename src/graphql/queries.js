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
        alt_text
        archived
        bibliographic_citation
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
        end_date
        heirarchy_path
        id
        identifier
        is_part_of
        language
        location
        modified_date
        parent_collection
        parent_collection_identifier
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility

        ... on Collection {
          collection_category
          collectionmap_id
          collectionOptions
          explicit_content
          ownerinfo
          createdAt
          updatedAt
          collectionCollectionmapId
          collectionPartnerId
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
          extracted_text
          format
          format_physical
          has_format
          has_part
          has_version
          is_format_of
          is_version_of
          item_category
          license
          manifest_file_characterization
          manifest_url
          medium
          other_identifier
          publisher
          references
          repository
          tags
          taxonomy
          temporal
          type
          visual_description
          createdAt
          updatedAt
          collectionArchivesId
          archiveCollectionId
          archivePartnerId
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
        alt_text
        archived
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
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
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        collectionPartnerId
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
        alt_text
        archived
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
        embargo_end_date
        embargo_note
        embargo_start_date
        end_date
        explicit
        extent
        extracted_text
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
        partner_id
        provenance
        provider
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
        taxonomy
        temporal
        thumbnail_path
        title
        title_template
        type
        visibility
        visual_description
        createdAt
        updatedAt
        collectionArchivesId
        archiveCollectionId
        archivePartnerId
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
      alt_text
      archived
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
      embargo_end_date
      embargo_note
      embargo_start_date
      end_date
      explicit
      extent
      extracted_text
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
      partner_id
      provenance
      provider
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
      taxonomy
      temporal
      thumbnail_path
      title
      title_template
      type
      visibility
      visual_description
      collection {
        alt_text
        archived
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
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
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        collectionPartnerId
        __typename
      }
      partner {
        custom_key
        description
        id
        identifier
        title
        title_template
        thumbnail_path
        visibility
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      collectionArchivesId
      archiveCollectionId
      archivePartnerId
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
        alt_text
        archived
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
        embargo_end_date
        embargo_note
        embargo_start_date
        end_date
        explicit
        extent
        extracted_text
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
        partner_id
        provenance
        provider
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
        taxonomy
        temporal
        thumbnail_path
        title
        title_template
        type
        visibility
        visual_description
        createdAt
        updatedAt
        collectionArchivesId
        archiveCollectionId
        archivePartnerId
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
        alt_text
        archived
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
        embargo_end_date
        embargo_note
        embargo_start_date
        end_date
        explicit
        extent
        extracted_text
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
        partner_id
        provenance
        provider
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
        taxonomy
        temporal
        thumbnail_path
        title
        title_template
        type
        visibility
        visual_description
        createdAt
        updatedAt
        collectionArchivesId
        archiveCollectionId
        archivePartnerId
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
        alt_text
        archived
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
        embargo_end_date
        embargo_note
        embargo_start_date
        end_date
        explicit
        extent
        extracted_text
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
        partner_id
        provenance
        provider
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
        taxonomy
        temporal
        thumbnail_path
        title
        title_template
        type
        visibility
        visual_description
        createdAt
        updatedAt
        collectionArchivesId
        archiveCollectionId
        archivePartnerId
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
      alt_text
      archived
      bibliographic_citation
      collection_category
      collectionmap_id
      collectionOptions
      create_date
      creator
      custom_key
      description
      display_date
      embargo_end_date
      embargo_note
      embargo_start_date
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
      partner_id
      provenance
      provider
      relation
      rights_holder
      rights
      source
      spatial
      start_date
      subject
      thumbnail_path
      title
      title_template
      visibility
      archives {
        nextToken
        __typename
      }
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
      partner {
        custom_key
        description
        id
        identifier
        title
        title_template
        thumbnail_path
        visibility
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      collectionCollectionmapId
      collectionPartnerId
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
        alt_text
        archived
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
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
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        collectionPartnerId
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
        alt_text
        archived
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
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
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        collectionPartnerId
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
        alt_text
        archived
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
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
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        collectionPartnerId
        __typename
      }
      nextToken
      total
      __typename
    }
  }
`;
export const getCollectionmap = /* GraphQL */ `
  query GetCollectionmap($id: ID!) {
    getCollectionmap(id: $id) {
      collectionmap_category
      collection_id
      create_date
      id
      map_object
      modified_date
      collection {
        alt_text
        archived
        bibliographic_citation
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        embargo_end_date
        embargo_note
        embargo_start_date
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
        partner_id
        provenance
        provider
        relation
        rights_holder
        rights
        source
        spatial
        start_date
        subject
        thumbnail_path
        title
        title_template
        visibility
        createdAt
        updatedAt
        collectionCollectionmapId
        collectionPartnerId
        __typename
      }
      createdAt
      updatedAt
      collectionmapCollectionId
      __typename
    }
  }
`;
export const listCollectionmaps = /* GraphQL */ `
  query ListCollectionmaps(
    $filter: ModelCollectionmapFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCollectionmaps(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
export const getMetadataField = /* GraphQL */ `
  query GetMetadataField($id: ID!) {
    getMetadataField(id: $id) {
      id
      columnName
      labelName
      type
      required
      description
      example
      category
      sortOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listMetadataFields = /* GraphQL */ `
  query ListMetadataFields(
    $filter: ModelMetadataFieldFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMetadataFields(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        columnName
        labelName
        type
        required
        description
        example
        category
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
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
export const getPartner = /* GraphQL */ `
  query GetPartner($id: ID!) {
    getPartner(id: $id) {
      custom_key
      description
      id
      identifier
      title
      title_template
      thumbnail_path
      visibility
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPartners = /* GraphQL */ `
  query ListPartners(
    $filter: ModelPartnerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPartners(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        custom_key
        description
        id
        identifier
        title
        title_template
        thumbnail_path
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
export const partnerByIdentifier = /* GraphQL */ `
  query PartnerByIdentifier(
    $identifier: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPartnerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    partnerByIdentifier(
      identifier: $identifier
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        custom_key
        description
        id
        identifier
        title
        title_template
        thumbnail_path
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
export const searchPartners = /* GraphQL */ `
  query SearchPartners(
    $filter: SearchablePartnerFilterInput
    $sort: [SearchablePartnerSortInput]
    $limit: Int
    $nextToken: String
    $from: Int
    $aggregates: [SearchablePartnerAggregationInput]
  ) {
    searchPartners(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
      aggregates: $aggregates
    ) {
      items {
        custom_key
        description
        id
        identifier
        title
        title_template
        thumbnail_path
        visibility
        createdAt
        updatedAt
        __typename
      }
      nextToken
      total
      aggregateItems {
        name
        result {
          ... on SearchableAggregateScalarResult {
            value
          }
          ... on SearchableAggregateBucketResult {
            buckets {
              key
              doc_count
              __typename
            }
          }
        }
        __typename
      }
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
