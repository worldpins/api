const uuid = require('uuid/v4');

const dataController = require('../data');
const { checkPw, hash } = require('../utils/pwHasher');
const { makeAuthToken } = require('../utils/tokenizer');

class AuthenticationService {
  constructor() {
    this.userController = dataController.knex('users');
    this.profileController = dataController.knex('profiles');
  }

  async login({ email, password }) {
    const user = await this.userController
      .select('id', 'password_hash as passwordHash', 'roles', 'locked', 'failed_login_attempts as failedLoginAttempts')
      .where('email', email).first();
    if (!user) {
      throw new Error("User with this email can't be found");
    }

    if (user.locked) {
      throw new Error('This account is locked');
    }

    if (!await checkPw(password, user.passwordHash)) {
      await this.userController.update({
        failed_login_attempts: user.failedLoginAttempts + 1,
        last_failed_login: new Date(),
      }).where('id', user.id);
      throw new Error('Invalid credentials');
    }

    await this.userController.update({
      last_login: new Date(),
      failed_login_attempts: 0,
    });

    return makeAuthToken(user.id, user.roles);
  }

  async register({
    email, password, confirmPassword, profile,
  }) {
    if (password !== confirmPassword) {
      throw new Error("password and confirmPassword don't match");
    }

    // TODO: check if email is valid

    const passwordHash = await hash(password);
    const userId = uuid();
    const roles = ['ADMIN']; // TODO: TEMP
    await this.userController.insert({
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
    await this.profileController.insert({
      id: uuid(),
      first_name: firstName,
      last_name: lastName,
      user_id: userId,
    });

    return makeAuthToken(userId, roles);
  }
}

module.exports = new AuthenticationService();
