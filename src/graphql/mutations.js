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
export const updateArchive = /* GraphQL */ `
  mutation UpdateArchive(
    $input: UpdateArchiveInput!
    $condition: ModelArchiveConditionInput
  ) {
    updateArchive(input: $input, condition: $condition) {
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
export const deleteArchive = /* GraphQL */ `
  mutation DeleteArchive(
    $input: DeleteArchiveInput!
    $condition: ModelArchiveConditionInput
  ) {
    deleteArchive(input: $input, condition: $condition) {
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
export const createCollection = /* GraphQL */ `
  mutation CreateCollection(
    $input: CreateCollectionInput!
    $condition: ModelCollectionConditionInput
  ) {
    createCollection(input: $input, condition: $condition) {
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
export const updateCollection = /* GraphQL */ `
  mutation UpdateCollection(
    $input: UpdateCollectionInput!
    $condition: ModelCollectionConditionInput
  ) {
    updateCollection(input: $input, condition: $condition) {
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
export const deleteCollection = /* GraphQL */ `
  mutation DeleteCollection(
    $input: DeleteCollectionInput!
    $condition: ModelCollectionConditionInput
  ) {
    deleteCollection(input: $input, condition: $condition) {
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
export const createCollectionmap = /* GraphQL */ `
  mutation CreateCollectionmap(
    $input: CreateCollectionmapInput!
    $condition: ModelCollectionmapConditionInput
  ) {
    createCollectionmap(input: $input, condition: $condition) {
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
export const updateCollectionmap = /* GraphQL */ `
  mutation UpdateCollectionmap(
    $input: UpdateCollectionmapInput!
    $condition: ModelCollectionmapConditionInput
  ) {
    updateCollectionmap(input: $input, condition: $condition) {
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
export const deleteCollectionmap = /* GraphQL */ `
  mutation DeleteCollectionmap(
    $input: DeleteCollectionmapInput!
    $condition: ModelCollectionmapConditionInput
  ) {
    deleteCollectionmap(input: $input, condition: $condition) {
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
export const createPartner = /* GraphQL */ `
  mutation CreatePartner(
    $input: CreatePartnerInput!
    $condition: ModelPartnerConditionInput
  ) {
    createPartner(input: $input, condition: $condition) {
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
export const updatePartner = /* GraphQL */ `
  mutation UpdatePartner(
    $input: UpdatePartnerInput!
    $condition: ModelPartnerConditionInput
  ) {
    updatePartner(input: $input, condition: $condition) {
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
export const deletePartner = /* GraphQL */ `
  mutation DeletePartner(
    $input: DeletePartnerInput!
    $condition: ModelPartnerConditionInput
  ) {
    deletePartner(input: $input, condition: $condition) {
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
export const createMetadataField = /* GraphQL */ `
  mutation CreateMetadataField(
    $input: CreateMetadataFieldInput!
    $condition: ModelMetadataFieldConditionInput
  ) {
    createMetadataField(input: $input, condition: $condition) {
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
export const updateMetadataField = /* GraphQL */ `
  mutation UpdateMetadataField(
    $input: UpdateMetadataFieldInput!
    $condition: ModelMetadataFieldConditionInput
  ) {
    updateMetadataField(input: $input, condition: $condition) {
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
export const deleteMetadataField = /* GraphQL */ `
  mutation DeleteMetadataField(
    $input: DeleteMetadataFieldInput!
    $condition: ModelMetadataFieldConditionInput
  ) {
    deleteMetadataField(input: $input, condition: $condition) {
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
