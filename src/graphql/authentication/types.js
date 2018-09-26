const authenticationTypes = `
  type User {
    email: String!
    firstName: String
    lastName: String
    dateOfBirth: String
    country: String
  }

  type Query {
    me: User
  }

  input RegisterProfileInput {
    firstName: String!
    lastName: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    confirmPassword: String!
    profile: RegisterProfileInput
  }

  type RegisterPayload {
    authToken: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type LoginPayload {
    authToken: String!
  }

  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    dateOfBirth: String
    country: String
    newPassword: String
    confirmNewPassword: String
    oldPassword: String
  }

  type UpdateUserPayload {
    email: String
    firstName: String
    lastName: String
    dateOfBirth: String
    country: String
  }

  type RefreshTokenPayload {
    authToken: String
  }

  type Mutation {
    login(input: LoginInput): LoginPayload
    refreshToken: RefreshTokenPayload
    register(input: RegisterInput): RegisterPayload
    updateUser(input: UpdateUserInput): UpdateUserPayload
  }
`;

module.exports = authenticationTypes;
