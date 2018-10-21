exports.up = function up(knex) {
  return knex.schema
    .createTable('template_pins', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('name');
      table.text('comment');
      table.jsonb('fields').comment('arbitrary data fields for a pin.');
      table.timestamp('created_on').comment('Date the user was created.');
      table.string('created_by').references('id').inTable('users');
      table.timestamp('updated_on').comment('Date the user was last updated.');
      table.string('updated_by').references('id').inTable('users');
      table.timestamp('deleted_on').comment('Date the user was soft-deleted.');
      table.string('deleted_by').references('id').inTable('users');
    })
    .alterTable('pins', (table) => {
      table.jsonb('data').comment('Arbitrary data fields based on the template pin.');
      table.uuid('template_pins_id').references('id').inTable('pins');
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTable('template_pins');
};
