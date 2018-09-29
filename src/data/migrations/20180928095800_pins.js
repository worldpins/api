exports.up = function up(knex) {
  return knex.schema
    .createTable('maps', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('name');
      table.text('comment');
      table.specificType('initial_area', 'POINT');
      table.timestamp('created_on').comment('Date the user was created.');
      table.string('created_by').references('id').inTable('users');
      table.timestamp('updated_on').comment('Date the user was last updated.');
      table.string('updated_by').references('id').inTable('users');
      table.timestamp('deleted_on').comment('Date the user was soft-deleted.');
      table.string('deleted_by').references('id').inTable('users');
    })
    .createTable('pins', (table) => {
      table.uuid('id').primary().comment('Primary (id) entails an index.');
      table.string('name');
      table.text('comment');
      table.specificType('coordinates', 'POINT');
      table.timestamp('created_on').comment('Date the user was created.');
      table.string('created_by').references('id').inTable('users');
      table.timestamp('updated_on').comment('Date the user was last updated.');
      table.string('updated_by').references('id').inTable('users');
      table.timestamp('deleted_on').comment('Date the user was soft-deleted.');
      table.string('deleted_by').references('id').inTable('users');
      table.uuid('map_id').references('id').inTable('maps');
    })
    .createTable('userHasMaps', (table) => {
      table.uuid('user_id').references('id').inTable('users');
      table.uuid('map_id').references('id').inTable('maps');
      table.integer('rights').comment('0 means view, 1 means edit (making pins), 2 means delete (pins), 3 means admin.');
    });
};

exports.down = function down(knex) {
  return knex.schema
    .dropTable('pins')
    .dropTable('userHasMaps')
    .dropTable('maps');
};
