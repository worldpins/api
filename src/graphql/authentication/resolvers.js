const authenticationService = require('../../services/authenticationService');

const authenticationResolvers = {
  Query: {
    me: (obj, args, context, info) => {
      console.log(context);
    },
  },
  Mutation: {
    login: async (obj, { input }) => {
      const authToken = await authenticationService.login(input);
      return { authToken };
    },
    refreshToken: (obj, args, context) => {
      console.log(context);
    },
    register: async (obj, { input }) => {
      const authToken = await authenticationService.register(input);
      return { authToken };
    },
    updateUser: (obj, { input }) => {
      console.log(input);
    },
  },
};

module.exports = authenticationResolvers;
