const mapParams = `
  search: String
  searchField: String
  from: Int
  limit: Int
  sortField: String
  sortDirection: String
`;

const mapTypes = `
  type TemplatePin {
    id: String!
    name: String
    comment: String
    fields: JSON
  }

  type CreateTemplatePinPayload {
    id: String!
    name: String
    comment: String
    fields: JSON
  }

  type UpdateTemplatePinPayload {
    id: String!
    name: String
    comment: String
    fields: JSON
  }

  type Pin {
    id: String!
    name: String
    comment: String
    location: Location
    data: JSON
    templatePin: TemplatePin
    orderedFields: JSON
  }

  type Map {
    id: String!
    name: String
    comment: String
    initialArea: Location
    published: Boolean
    pins: [Pin]
    filters: JSON
    templatePins: [TemplatePin]
  }

  type MapResult {
    items: [Map]
    totalCount: Int
    filteredCount: Int
  }

  extend type Query {
    maps(${mapParams}): MapResult
    map(id: String!): Map
    pin(id: String!): Pin
  }

  input LocationInput {
    longitude: Float
    latitude: Float
  }

  type Location {
    longitude: Float
    latitude: Float
  }

  input CreateMapInput {
    name: String!
    comment: String
    initialArea: LocationInput
  }

  type CreateMapPayload {
    id: String!
    name: String
    comment: String
    createdBy: User
    initialArea: Location
    updatedBy: User
    pins: [Pin]
  }

  input TemplatePinInput {
    name: String!
    comment: String
    fields: JSON
  }

  input createTemplatePinInput {
    name: String!
    comment: String
    fields: JSON
  }

  input updateTemplatePinInput {
    id: String!
    name: String!
    comment: String
    fields: JSON
  }

  input createPinInput {
    name: String!
    coordinates: LocationInput!
    comment: String
    data: JSON
    templatePinId: String
  }

  input updatePinInput {
    id: String!
    name: String!
    coordinates: LocationInput!
    comment: String
    data: JSON
    templatePinId: String
  }

  type CreatePinPayload {
    id: String
    name: String
    coordinates: Location
    comment: String
    data: JSON
    template: TemplatePin
  }

  type UpdatePinPayload {
    id: String
    name: String
    coordinates: Location
    comment: String
    data: JSON
    template: TemplatePin
  }

  type UploadMapPayload {
    id: String
  }

  input updateMapInput {
    published: Boolean
  }

  type UpdateMapPayload {
    id: String
    published: Boolean
  }

  type MutationMap {
    id: String!
    delete: Boolean
    initialArea: Location
    updateMap(input: updateMapInput): UpdateMapPayload
    createPin(input: createPinInput): CreatePinPayload
    updatePin(input: updatePinInput): UpdatePinPayload
    createTemplatePin(input: createTemplatePinInput): CreateTemplatePinPayload
    updateTemplatePin(input: updateTemplatePinInput): UpdateTemplatePinPayload
  }

  extend type Mutation {
    createMap(input: CreateMapInput): CreateMapPayload
    map(id: String!): MutationMap
    uploadMap(map: JSON!): UploadMapPayload
  }
`;

module.exports = mapTypes;
