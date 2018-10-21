const mapParams = `
  search: String
  searchField: String
  from: String
  limit: String
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

  type Pin {
    id: String!
    name: String
    comment: String
    location: LocationInput
    data: JSON
    templatePin: TemplatePin
  }

  type Map {
    id: String!
    name: String
    comment: String
    pins: [Pin]
  }

  type MapResult {
    maps: [Map]
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
    initial_area: LocationInput
  }

  type CreateMapPayload {
    id: String!
    name: String
    comment: String
    createdBy: User
    initial_area: Location
    updatedBy: User
    pins: [Pin]
  }

  extend type Mutation {
    createMap(input: CreateMapInput): CreateMapPayload
  }
`;

module.exports = mapTypes;
