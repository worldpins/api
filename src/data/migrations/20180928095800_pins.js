exports.up = function up(knex) {
  return knex.schema
    .createTable('maps', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('name');
      table.text('comment');
      table.specificType('initial_area', 'POINT').defaultTo(knex.raw('POINT (37.3875, -122.0575)'));
      table.timestamp('created_on').comment('Date the user was created.');
      table.timestamp('updated_on').comment('Date the user was last updated.');
      table.timestamp('deleted_on').comment('Date the user was soft-deleted.');
    })
    .createTable('pins', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('name');
      table.text('comment');
      table.specificType('coordinates', 'POINT').defaultTo(knex.raw('POINT (37.3875, -122.0575)'));
      table.timestamp('created_on').comment('Date the user was created.');
      table.timestamp('updated_on').comment('Date the user was last updated.');
      table.timestamp('deleted_on').comment('Date the user was soft-deleted.');
      table.uuid('map_id').references('id').inTable('maps');
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTable('pins')
    .dropTable('maps');
};
