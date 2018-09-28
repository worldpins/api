const mapParams = `
  search: String
  searchField: String
  from: String
  limit: String
  sortField: String
  sortDirection: String
`;

const mapTypes = `
  type Map {
    id: String!
    name: String
    comment: String
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
`;

module.exports = mapTypes;
