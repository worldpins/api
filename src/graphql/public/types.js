const mapParams = `
  search: String
  searchField: String
  from: Int
  limit: Int
  sortField: String
  sortDirection: String
`;

module.exports = `
  extend type Query {
    publicMaps(${mapParams}): MapResult
    publicMap(id: String!): Map
  }
`;
