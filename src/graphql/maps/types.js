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

  type Pin {
    id: String!
    name: String
    comment: String
    location: Location
    data: JSON
    templatePin: TemplatePin
  }

  type Map {
    id: String!
    name: String
    comment: String
    initialArea: Location
    pins: [Pin]
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

  input createPinInput {
    name: String!
    coordinates: LocationInput!
    comment: String
    data: JSON
    templatePin: String
  }

  type CreatePinPayload {
    id: String
    name: String
    coordinates: Location
    comment: String
    data: JSON
    template: TemplatePin
  }

  type MutationMap {
    id: String!
    initialArea: Location
    createPin(input: createPinInput): CreatePinPayload
    createTemplatePin(input: createTemplatePinInput): CreateTemplatePinPayload
  }

  extend type Mutation {
    createMap(input: CreateMapInput): CreateMapPayload
    map(id: String!): MutationMap
  }
`;

module.exports = mapTypes;
