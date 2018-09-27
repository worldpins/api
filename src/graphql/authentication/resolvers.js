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
    refreshToken: async (obj, args, { undecodedToken: oldToken }) => {
      const authToken = await authenticationService.refreshToken(oldToken);
      return { authToken };
    },
    register: async (obj, { input }) => {
      const authToken = await authenticationService.register(input);
      return { authToken };
    },
    updateUser: async (obj, { input }, { token }) => authenticationService.updateUser(input, token),
  },
};

module.exports = authenticationResolvers;
