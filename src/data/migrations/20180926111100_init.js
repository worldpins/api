exports.up = function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('email').unique();
      table.string('password_hash');
      table.integer('failed_login_attempts');
      table.timestamp('last_failed_login');
      table.timestamp('last_login');
      table.boolean('locked');
      table.boolean('activated');
      table.string('reset_password_code');
      table.datetime('reset_password_code_valid_date');
      table.specificType('roles', 'text[]');
      table.timestamp('created_on').comment('Date the user was created.');
      table.timestamp('updated_on').comment('Date the user was last updated.');
      table.timestamp('deleted_on').comment('Date the user was soft-deleted.');
    })
    .createTable('profiles', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('first_name');
      table.string('last_name');
      table.string('date_of_birth');
      table.uuid('user_id').references('id').inTable('users');
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTable('profile')
    .dropTable('users');
};
