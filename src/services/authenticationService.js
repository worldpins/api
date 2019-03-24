const uuid = require('uuid/v4');
const { ApolloError, AuthenticationError, UserInputError } = require('apollo-server-koa');

const dataController = require('../data');
const { checkPw, hash } = require('../utils/pwHasher');
const { makeAuthToken, verifyAuthToken } = require('../utils/tokenizer');
const { makeLogger } = require('../utils/logger');
const {
  USER_NOT_FOUND, USER_ALREADY_EXISTS, TOKEN_ID_MISSMATCH, USER_LOCKED,
} = require('../constants/authentication');

const logger = makeLogger('authenticationService');

class AuthenticationService {
  constructor() {
    this.dataController = dataController.knex;
  }

  async refreshToken(oldToken) {
    if (!oldToken) {
      throw new AuthenticationError('Must authenticate.');
    }

    let decodedToken;
    try {
      decodedToken = await verifyAuthToken(oldToken, { forRefresh: true });
    } catch (err) {
      throw new AuthenticationError('Must authenticate.');
    }
    // Fetch user data of the user stored in given token to refresh.
    const user = this.dataController('users').select('email', 'locked', 'id', 'roles');
    if (!user) {
      throw new ApolloError(`User with "${decodedToken.userId}" can't be found.`, USER_NOT_FOUND);
    }

    // If the user is locked, we forbid refreshing the token.
    if (user.locked) {
      throw new ApolloError(`User with email "${user.email}" has been locked.`, USER_LOCKED);
    }

    // Build and return the new token.
    return makeAuthToken(user.id, user.roles);
  }

  async getMe(decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must be authenticated.');
    }

    logger.info(`Getting user and profile for ${decodedToken.userId}`);
    const user = await this.dataController('users')
      .select('users.id as id', 'users.email as email', 'profiles.id as profileId', 'profiles.first_name as firstName', 'profiles.last_name as lastName', 'profiles.date_of_birth as dateOfBirth', 'users.roles as roles')
      .innerJoin('profiles', 'users.id', 'profiles.user_id')
      .where('users.id', decodedToken.userId)
      .first();

    if (!user) {
      throw new ApolloError(`User with "${decodedToken.userId}" can't be found.`, USER_NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      profile: {
        id: user.profileId,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
      },
    };
  }

  async changePassword({
    id, oldPassword, newPassword, confirmNewPassword,
  }, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must be authenticated.');
    }

    if (id !== decodedToken.userId) {
      throw new ApolloError("You are trying to modify someone else's password.", TOKEN_ID_MISSMATCH);
    }

    const user = await this.dataController('users')
      .select('id', 'password_hash as passwordHash', 'roles', 'locked', 'failed_login_attempts as failedLoginAttempts')
      .where('id', id)
      .first();

    if (!user) {
      throw new ApolloError(`User with "${decodedToken.userId}" can't be found.`, USER_NOT_FOUND);
    }

    if (!await checkPw(oldPassword, user.passwordHash)) {
      throw new UserInputError('Incorrect password.');
    }

    if (newPassword !== confirmNewPassword) {
      throw new UserInputError("Passwords don't match.");
    }

    const newPasswordHash = await hash(newPassword);

    await this.dataController('users').update({
      password_hash: newPasswordHash,
    });

    return { success: true };
  }

  async login({ email, password }) {
    const user = await this.dataController('users')
      .select('id', 'password_hash as passwordHash', 'roles', 'locked', 'failed_login_attempts as failedLoginAttempts')
      .where('email', email)
      .first();

    if (!user) {
      throw new ApolloError(`User with email "${email}" can't be found.`, USER_NOT_FOUND);
    }

    if (user.locked) {
      throw new ApolloError(`User with email "${email}" has been locked.`, USER_LOCKED);
    }

    if (!await checkPw(password, user.passwordHash)) {
      await this.dataController('users').update({
        failed_login_attempts: user.failedLoginAttempts + 1,
        last_failed_login: new Date(),
      }).where('id', user.id);
      throw new UserInputError('Invalid password.');
    }

    await this.dataController('users').update({
      last_login: new Date(),
      failed_login_attempts: 0,
    });

    logger.info(`Successfull login for ${user.id}`);
    return makeAuthToken(user.id, user.roles);
  }

  async updateUser({
    id, email, profile: {
      id: profileId, firstName, lastName, dateOfBirth,
    },
  }, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must be authenticated.');
    }

    if (id !== decodedToken.userId) {
      throw new ApolloError("You are trying to modify someone else's profile.", TOKEN_ID_MISSMATCH);
    }

    // TODO: check if valid email

    await this.dataController('users').update({
      email,
    }).where('id', id);

    await this.dataController('profiles').update({
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
    }).update('id', profileId);

    const user = await this.dataController('users')
      .select('users.id as id', 'users.email as email', 'profiles.id as profileId', 'profiles.first_name as firstName', 'profiles.last_name as lastName', 'profiles.date_of_birth as dateOfBirth', 'users.roles as roles')
      .innerJoin('profiles', 'users.id', 'profiles.user_id')
      .where('users.id', decodedToken.userId)
      .first();

    return user;
  }

  async register({
    email, password, confirmPassword, profile,
  }) {
    throw new ApolloError('Registrations  are closed!');
    if (password !== confirmPassword) {
      throw new UserInputError("password and confirmPassword don't match.");
    }

    // TODO: check if email is valid

    const dbUser = await this.dataController('users').select('id').where('email', email).first();
    if (dbUser) {
      throw new ApolloError(`A user with email "${email}" already exists.`, USER_ALREADY_EXISTS);
    }

    const passwordHash = await hash(password);
    const userId = uuid();
    const roles = ['ADMIN']; // TODO: TEMP
    await this.dataController('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      last_login: new Date(),
      failed_login_attempts: 0,
      locked: false,
      activated: true, // TODO: activation mail thingie
      roles,
      created_on: new Date(),
    });

    const { firstName, lastName } = profile;
    await this.dataController('profiles').insert({
      id: uuid(),
      first_name: firstName,
      last_name: lastName,
      user_id: userId,
    });
    logger.info(`Successfull registration for ${userId}`);
    return makeAuthToken(userId, roles);
  }
}

module.exports = new AuthenticationService();
