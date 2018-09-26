const uuid = require('uuid/v4');

const dataController = require('../data');
const { checkPw, hash } = require('../utils/pwHasher');
const { makeAuthToken, verifyAuthToken } = require('../utils/tokenizer');
const { makeLogger } = require('../utils/logger');

const logger = makeLogger('authenticationService');

class AuthenticationService {
  constructor() {
    this.dataController = dataController.knex;
  }

  async getMe(token) {
    if (!token) {
      throw new Error('You need to be authorised to get your profile');
    }

    const decodedToken = await verifyAuthToken(token);
    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    logger.info(`Getting user and profile for ${decodedToken.userId}`);
    const user = await this.dataController('users')
      .select('users.id as id', 'users.email as email', 'profiles.id as profileId', 'profiles.first_name as firstName', 'profiles.last_name as lastName', 'profiles.date_of_birth as dateOfBirth', 'users.roles as roles')
      .innerJoin('profiles', 'users.id', 'profiles.user_id')
      .where('users.id', decodedToken.userId)
      .first();

    if (!user) {
      throw new Error('User not found');
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
  }, token) {
    if (!token) {
      throw new Error('You need to be authorised to get your profile');
    }

    const decodedToken = await verifyAuthToken(token);
    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    if (id !== decodedToken.userId) {
      throw new Error("You are trying to modify someone else's profile");
    }

    const user = await this.dataController('users')
      .select('id', 'password_hash as passwordHash', 'roles', 'locked', 'failed_login_attempts as failedLoginAttempts')
      .where('id', id)
      .first();

    if (!user) {
      throw new Error('user not found');
    }

    if (!await checkPw(oldPassword, user.passwordHash)) {
      throw new Error('Incorrect password');
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error("Passwords don't match");
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
      throw new Error("User with this email can't be found");
    }

    if (user.locked) {
      throw new Error('This account is locked');
    }

    if (!await checkPw(password, user.passwordHash)) {
      await this.dataController('users').update({
        failed_login_attempts: user.failedLoginAttempts + 1,
        last_failed_login: new Date(),
      }).where('id', user.id);
      throw new Error('Invalid credentials');
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
  }, token) {
    if (!token) {
      throw new Error('Unauthorized');
    }

    const decodedToken = await verifyAuthToken(token);

    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    if (id !== decodedToken.userId) {
      throw new Error("You are trying to modify someone else's profile");
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
    if (password !== confirmPassword) {
      throw new Error("password and confirmPassword don't match");
    }

    // TODO: check if email is valid

    const dbUser = await this.dataController('users').select('id').where('email', email).first();
    if (dbUser) {
      throw new Error('User with this email already exists');
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
