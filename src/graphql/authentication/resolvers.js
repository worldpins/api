const authenticationService = require('../../services/authenticationService');

const authenticationResolvers = {
  Query: {
    me: async (obj, args, { token }) => authenticationService.getMe(token),
  },
  Mutation: {
    changePassword: async (obj, { input }, { token }) => authenticationService.changePassword(input, token),
    login: async (obj, { input }) => {
      const authToken = await authenticationService.login(input);
      return { authToken };
    },
    refreshToken: () => {
      throw new Error('Not implemented');
    },
    register: async (obj, { input }) => {
      const authToken = await authenticationService.register(input);
      return { authToken };
    },
    updateUser: (obj, { input }, { token }) => authenticationService.updateUser(input, token),
  },
};

module.exports = authenticationResolvers;
