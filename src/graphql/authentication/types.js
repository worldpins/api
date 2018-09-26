const authenticationTypes = `
  type UserProfile {
    firstName: String
    lastName: String
    dateOfBirth: String
  }

  type User {
    id: String!
    email: String!
    profile: UserProfile
    roles: [String]
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

  input UpdateUserProfileInput {
    id: String!
    firstName: String
    lastName: String
    dateOfBirth: String
  }

  input UpdateUserInput {
    id: String!
    email: String
    profile: UpdateUserProfileInput!
  }

  type UpdateUserProfilePayload {
    firstName: String
    lastName: String
    dateOfBirth: String
  }

  type UpdateUserPayload {
    email: String
    profile: UpdateUserProfilePayload
    roles: [String]
  }

  type RefreshTokenPayload {
    authToken: String
  }

  input ChangePasswordInput {
    id: String!
    newPassword: String!
    confirmNewPassword: String!
    oldPassword: String!
  }

  type ChangePasswordPayload {
    success: Boolean!
  }

  type Mutation {
    changePassword(input: ChangePasswordInput): ChangePasswordPayload
    login(input: LoginInput): LoginPayload
    refreshToken: RefreshTokenPayload
    register(input: RegisterInput): RegisterPayload
    updateUser(input: UpdateUserInput): UpdateUserPayload
  }
`;

module.exports = authenticationTypes;
