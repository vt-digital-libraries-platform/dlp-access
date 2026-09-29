import { defineData } from '@aws-amplify/backend';
import type { Backend } from '../backend';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, readFileSync } from 'fs';
import { Stack } from 'aws-cdk-lib';
import { CfnResolver } from 'aws-cdk-lib/aws-appsync';
import * as assets from 'aws-cdk-lib/aws-s3-assets';

const schema = `interface Object {
  alt_text: AWSJSON
  archived: Boolean!
  bibliographic_citation: [String!]
  create_date: String
  creator: [String!]
  custom_key: String
  description: [String!]
  display_date: [String!]
  embargo_end_date: String
  embargo_note: String
  embargo_start_date: String
  end_date: String
  heirarchy_path: [String!]
  id: ID!
  identifier: String!
  is_part_of: [String!]
  language: [String!]
  location: [String!]
  modified_date: String
  parent_collection: [String!]
  parent_collection_identifier: [String!]
  partner_id: String
  provenance: [String!]
  provider: [String!]
  relation: [String!]
  rights_holder: [String!]
  rights: [String!]
  source: [String!]
  spatial: [String!]
  start_date: String
  subject: [String!]
  thumbnail_path: String
  title: String!
  title_template: [String!]
  visibility: Boolean!
}

type Archive implements Object
  @model
  @searchable
  @auth(
    rules: [
      { allow: public, operations: [read] }
      { allow: groups, groups: ["admin", "editor"] }
      { allow: groups, groupsField: "item_category" }
    ]
  ) {
  age: [String!]
  alternative: [String!]
  alt_text: AWSJSON
  archived: Boolean!
  archiveOptions: AWSJSON
  basis_of_record: [String!]
  bibliographic_citation: [String!]
  conforms_to: [String!]
  contributor: [String!]
  coverage: [String!]
  create_date: String
  created: [String!]
  creator: [String!]
  custom_key: String
  date: [String!]
  description: [String!]
  display_date: [String!]
  download_link:[String!]
  embargo_end_date: String
  embargo_note: String
  embargo_start_date: String
  end_date: String
  explicit: Boolean
  extent: [String!]
  extracted_text: AWSJSON
  format: [String!]
  format_physical: [String!]
  has_format: [String!]
  has_part: [String!]
  has_version: [String!]
  heirarchy_path: [String!]
  id: ID!
  identifier: String!
    @index(name: "Identifier", queryField: "archiveByIdentifier")
  is_format_of: [String!]
  is_part_of: [String!]
  is_version_of: [String!]
  item_category: String!
  language: [String!]
  license: [String!]
  location: [String!]
  manifest_file_characterization: AWSJSON
  manifest_url: String
  medium: [String!]
  modified_date: String
  other_identifier: [String!]
  parent_collection: [String!]
  parent_collection_identifier: [String!]
  partner_id: String
  provenance: [String!]
  provider: [String!]
  publisher: [String!]
  references: [String!]
  relation: [String!]
  repository: [String!]
  rights_holder: [String!]
  rights: [String!]
  source: [String!]
  spatial: [String!]
  start_date: String
  subject: [String!]
  tags: [String!]
  taxonomy: [String!]
  temporal: [String!]
  thumbnail_path: String
  title: String!
  title_template: [String!]
  type: [String!]
  visibility: Boolean!
  visual_description: AWSJSON
  collection: Collection @hasOne
  partner: Partner @hasOne
}

type Collection implements Object
  @model
  @searchable
  @auth(
    rules: [
      { allow: public, operations: [read] }
      { allow: groups, groups: ["admin", "editor"] }
      { allow: groups, groupsField: "collection_category" }
    ]
  ) {
  alt_text: AWSJSON
  archived: Boolean!
  bibliographic_citation: [String!]
  collection_category: String!
  collectionmap_id: String
  collectionOptions: AWSJSON
  create_date: String
  creator: [String!]
  custom_key: String
  description: [String!]
  display_date: [String!]
  embargo_end_date: String
  embargo_note: String
  embargo_start_date: String
  end_date: String
  explicit_content: Boolean
  heirarchy_path: [String!]
  id: ID!
  identifier: String!
    @index(name: "Identifier", queryField: "collectionByIdentifier")
  is_part_of: [String!]
  language: [String!]
  location: [String!]
  modified_date: String
  ownerinfo: AWSJSON
  parent_collection: [String!]
  parent_collection_identifier: [String!]
  partner_id: String
  provenance: [String!]
  provider: [String!]
  relation: [String!]
  rights_holder: [String!]
  rights: [String!]
  source: [String!]
  spatial: [String!]
  start_date: String
  subject: [String!]
  thumbnail_path: String
  title: String!
  title_template: [String!]
  visibility: Boolean!
  archives: [Archive] @hasMany
  collectionmap: Collectionmap @hasOne
  partner: Partner @hasOne
}

type Collectionmap
  @model
  @auth(
    rules: [
      { allow: public, operations: [read] }
      { allow: groups, groups: ["admin", "editor"] }
      { allow: groups, groupsField: "collectionmap_category" }
    ]
  ) {
  collectionmap_category: String!
  collection_id: String!
  create_date: String
  id: ID!
  map_object: String!
  modified_date: String
  collection: Collection @hasOne
}

type History
  @model
  @auth(
    rules: [
      { allow: groups, groups: ["admin"] }
      { allow: groups, groupsField: "groups", operations: [read, create] }
    ]
  ) {
  event: AWSJSON!
  groups: [String]!
  id: ID!
  siteID: ID!
  userEmail: AWSEmail!
}

type MetadataField
  @model
  @auth(rules: [
    { allow: public, operations: [read] }
    { allow: groups, groups: ["admin", "editor"] }
  ]) {
  id: ID!
  columnName: String!
  labelName: String!
  type: String!
  required: String!
  description: String!
  example: String!
  category: String!
  sortOrder: Int
}

type PageContent
  @model
  @auth(
    rules: [
      { allow: public, operations: [read] }
      { allow: groups, groups: ["admin", "editor"] }
      { allow: groups, groupsField: "page_content_category" }
    ]
  ) {
  page_content_category: String!
  id: ID!
  content: String!
  pageContentSiteId: Site @hasOne
}


type Partner
  @model
  @searchable
  @auth(
    rules: [
      { allow: public, operations: [read] }
      { allow: groups, groups: ["admin", "editor"] }
    ]
  ) {
  custom_key: String
  description: [String!]
  id: ID!
  identifier: String!
    @index(name: "Identifier", queryField: "partnerByIdentifier")
  title: String!
  title_template: [String!]
  thumbnail_path: String
  visibility: Boolean!
}


type Site
  @model
  @auth(
    rules: [
      { allow: public, operations: [read] }
      { allow: groups, groupsField: "groups" }
    ]
  ) {
  analyticsID: String
  assetBasePath: String
  browseCollections: AWSJSON!
  contact: [AWSJSON!]!
  displayedAttributes: AWSJSON!
  groups: [String]!
  homePage: AWSJSON!
  id: ID!
  lang: String
  miradorOptions: AWSJSON
  searchPage: AWSJSON!
  siteColor: String
  siteId: String! @index(name: "SiteId", queryField: "siteBySiteId")
  siteName: String!
  siteOptions: AWSJSON
  sitePages: AWSJSON
  siteTitle: String!
}

type Query {
  searchObjects(
    allFields: String
    sort: SearchableObjectSortInput
    filter: SearchableObjectFilterInput
    limit: Int
    nextToken: String
  ): SearchableObjectConnection
    @aws_api_key @aws_cognito_user_pools @aws_iam
  fulltextCollections(
    allFields: String
    filter: SearchableCollectionFilterInput
    sort: SearchableCollectionSortInput
    limit: Int
    nextToken: String
  ): SearchableCollectionConnection
    @aws_api_key @aws_cognito_user_pools @aws_iam
  fulltextArchives(
    allFields: String
    filter: SearchableArchiveFilterInput
    sort: SearchableArchiveSortInput
    limit: Int
    nextToken: String
  ): SearchableArchiveConnection
    @aws_api_key @aws_cognito_user_pools @aws_iam
}

type SearchableObjectConnection
  @aws_api_key @aws_cognito_user_pools @aws_iam {
  items: [Object]
  nextToken: String
  total: Int
}

input SearchableObjectFilterInput {
  id: SearchableIDFilterInput
  title: SearchableStringFilterInput
  identifier: SearchableStringFilterInput
  description: SearchableStringFilterInput
  tags: SearchableStringFilterInput
  creator: SearchableStringFilterInput
  source: SearchableStringFilterInput
  start_date: SearchableStringFilterInput
  end_date: SearchableStringFilterInput
  subject: SearchableStringFilterInput
  is_part_of: SearchableStringFilterInput
  spatial: SearchableStringFilterInput
  medium: SearchableStringFilterInput
  rights: SearchableStringFilterInput
  language: SearchableStringFilterInput
  type: SearchableStringFilterInput
  bibliographic_citation: SearchableStringFilterInput
  rights_holder: SearchableStringFilterInput
  format: SearchableStringFilterInput
  format_physical: SearchableStringFilterInput
  custom_key: SearchableStringFilterInput
  visibility: SearchableBooleanFilterInput
  heirarchy_path: SearchableStringFilterInput
  thumbnail_path: SearchableStringFilterInput
  parent_collection: SearchableStringFilterInput
  create_date: SearchableStringFilterInput
  modified_date: SearchableStringFilterInput
  collection_category: SearchableStringFilterInput
  item_category: SearchableStringFilterInput
  and: [SearchableObjectFilterInput]
  or: [SearchableObjectFilterInput]
  not: SearchableObjectFilterInput
}

input SearchableBooleanFilterInput {
  eq: Boolean
  ne: Boolean
}

input SearchableObjectSortInput {
  field: SearchableObjectSortableFields
  direction: SearchableSortDirection
}

enum SearchableObjectSortableFields {
  id
  title
  identifier
  description
  creator
  source
  start_date
  end_date
  subject
  spatial
  language
  custom_key
}

type SearchableCollectionConnection
  @aws_api_key @aws_cognito_user_pools @aws_iam {
  items: [Collection]
  nextToken: String
  total: Int
}

input SearchableCollectionFilterInput {
  id: SearchableIDFilterInput
  title: SearchableStringFilterInput
  identifier: SearchableStringFilterInput
  description: SearchableStringFilterInput
  creator: SearchableStringFilterInput
  source: SearchableStringFilterInput
  start_date: SearchableStringFilterInput
  end_date: SearchableStringFilterInput
  subject: SearchableStringFilterInput
  spatial: SearchableStringFilterInput
  rights: SearchableStringFilterInput
  language: SearchableStringFilterInput
  relation: SearchableStringFilterInput
  provenance: SearchableStringFilterInput
  is_part_of: SearchableStringFilterInput
  bibliographic_citation: SearchableStringFilterInput
  rights_holder: SearchableStringFilterInput
  custom_key: SearchableStringFilterInput
  collection_category: SearchableStringFilterInput
  visibility: SearchableBooleanFilterInput
  thumbnail_path: SearchableStringFilterInput
  parent_collection: SearchableStringFilterInput
  heirarchy_path: SearchableStringFilterInput
  create_date: SearchableStringFilterInput
  modified_date: SearchableStringFilterInput
  and: [SearchableCollectionFilterInput]
  or: [SearchableCollectionFilterInput]
  not: SearchableCollectionFilterInput
}

input SearchableCollectionSortInput {
  field: SearchableCollectionSortableFields
  direction: SearchableSortDirection
}

enum SearchableCollectionSortableFields {
  id
  title
  identifier
  description
  creator
  source
  start_date
  end_date
  subject
  spatial
  rights
  language
  relation
  provenance
  is_part_of
  bibliographic_citation
  rights_holder
  custom_key
  collection_category
  visibility
  heirarchy_path
  thumbnail_path
  parent_collection
  create_date
  modified_date
}

type SearchableArchiveConnection
  @aws_api_key @aws_cognito_user_pools @aws_iam {
  items: [Archive]
  nextToken: String
  total: Int
}

input SearchableArchiveFilterInput {
  id: SearchableIDFilterInput
  title: SearchableStringFilterInput
  identifier: SearchableStringFilterInput
  description: SearchableStringFilterInput
  tags: SearchableStringFilterInput
  creator: SearchableStringFilterInput
  source: SearchableStringFilterInput
  start_date: SearchableStringFilterInput
  end_date: SearchableStringFilterInput
  subject: SearchableStringFilterInput
  rights: SearchableStringFilterInput
  language: SearchableStringFilterInput
  type: SearchableStringFilterInput
  is_part_of: SearchableStringFilterInput
  spatial: SearchableStringFilterInput
  medium: SearchableStringFilterInput
  bibliographic_citation: SearchableStringFilterInput
  rights_holder: SearchableStringFilterInput
  format: SearchableStringFilterInput
  relation: SearchableStringFilterInput
  provenance: SearchableStringFilterInput
  repository: SearchableStringFilterInput
  references: SearchableStringFilterInput
  contributor: SearchableStringFilterInput
  custom_key: SearchableStringFilterInput
  parent_collection: SearchableStringFilterInput
  item_category: SearchableStringFilterInput
  visibility: SearchableBooleanFilterInput
  thumbnail_path: SearchableStringFilterInput
  manifest_url: SearchableStringFilterInput
  create_date: SearchableStringFilterInput
  modified_date: SearchableStringFilterInput
  heirarchy_path: SearchableStringFilterInput
  and: [SearchableArchiveFilterInput]
  or: [SearchableArchiveFilterInput]
  not: SearchableArchiveFilterInput
}

input SearchableArchiveSortInput {
  field: SearchableArchiveSortableFields
  direction: SearchableSortDirection
}

enum SearchableArchiveSortableFields {
  id
  title
  identifier
  description
  tags
  creator
  source
  start_date
  end_date
  subject
  rights
  language
  type
  is_part_of
  spatial
  medium
  bibliographic_citation
  rights_holder
  format
  relation
  provenance
  repository
  references
  contributor
  custom_key
  parent_collection
  item_category
  visibility
  heirarchy_path
  thumbnail_path
  manifest_url
  create_date
  modified_date
}

input SearchableIDFilterInput {
  ne: ID
  gt: ID
  lt: ID
  gte: ID
  lte: ID
  eq: ID
  match: ID
  matchPhrase: ID
  matchPhrasePrefix: ID
  multiMatch: ID
  exists: Boolean
  wildcard: ID
  regexp: ID
}

enum SearchableSortDirection {
  asc
  desc
}

input SearchableStringFilterInput {
  ne: String
  gt: String
  lt: String
  gte: String
  lte: String
  eq: String
  match: String
  matchPhrase: String
  matchPhrasePrefix: String
  multiMatch: String
  exists: Boolean
  wildcard: String
  regexp: String
}
`;

export const data = defineData({
  migratedAmplifyGen1DynamoDbTableMappings: [
    {
      //The "branchName" variable needs to be the same as your deployment branch if you want to reuse your Gen1 app tables
      branchName: 'gen2-main',
      modelNameToTableNameMapping: {
        Archive: 'Archive-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        Collection: 'Collection-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        Collectionmap: 'Collectionmap-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        History: 'History-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        MetadataField: 'MetadataField-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        PageContent: 'PageContent-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        Partner: 'Partner-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
        Site: 'Site-b7anxcwcargyxfsgq4vtrtdbem-gentwo',
      },
    },
  ],
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 90 },
  },
  schema,
});

export function applyEscapeHatches(backend: Backend) {
  const cfnGraphqlApi = backend.data.resources.cfnResources.cfnGraphqlApi;
  cfnGraphqlApi.additionalAuthenticationProviders = [
    {
      authenticationType: 'AMAZON_COGNITO_USER_POOLS',
      userPoolConfig: {
        userPoolId: backend.auth.resources.userPool.userPoolId,
        awsRegion: backend.auth.stack.region,
      },
    },
  ];
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const resolversDir = join(__dirname, 'resolvers');
  const overiddenResolverFiles = readdirSync(resolversDir).filter(
    (f) =>
      (f.endsWith('.req.vtl') || f.endsWith('.res.vtl')) &&
      f.split('.').length === 4
  );
  const { cfnFunctionConfigurations, cfnDataSources } =
    backend.data.resources.cfnResources;
  const customResolverTemplates: Record<string, { req?: string; res?: string }> =
    {};
  for (const file of overiddenResolverFiles) {
    const [typeName, fieldName, templateType] = file.split('.');
    const capitalizedFieldName =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const functionId = `${typeName}${capitalizedFieldName}DataResolverFn`;
    const fn = cfnFunctionConfigurations[functionId];
    if (!fn) {
      // Custom query with no generated resolver (Gen 1 used a custom resolver
      // against the OpenSearch data source); collect templates and create it below.
      const key = `${typeName}.${fieldName}`;
      customResolverTemplates[key] ??= {};
      customResolverTemplates[key][templateType as 'req' | 'res'] =
        readFileSync(join(resolversDir, file), 'utf8');
      continue;
    }
    const vtlTemplate = new assets.Asset(backend.data, `VTLTemplate-${file}`, {
      path: join(resolversDir, file),
    });
    if (templateType === 'req') {
      fn.requestMappingTemplateS3Location = vtlTemplate.s3ObjectUrl;
    } else {
      fn.responseMappingTemplateS3Location = vtlTemplate.s3ObjectUrl;
    }
  }
  const openSearchDataSource = cfnDataSources['OpenSearchDataSource'];
  if (!openSearchDataSource) {
    throw new Error(
      'OpenSearchDataSource not found; custom search resolvers require @searchable'
    );
  }
  for (const [key, templates] of Object.entries(customResolverTemplates)) {
    const [typeName, fieldName] = key.split('.');
    const resolver = new CfnResolver(
      Stack.of(openSearchDataSource),
      `${typeName}${fieldName}CustomResolver`,
      {
        apiId: backend.data.resources.graphqlApi.apiId,
        typeName,
        fieldName,
        kind: 'UNIT',
        dataSourceName: openSearchDataSource.attrName,
        requestMappingTemplate: templates.req,
        responseMappingTemplate: templates.res,
      }
    );
    resolver.addDependency(openSearchDataSource);
  }
}
