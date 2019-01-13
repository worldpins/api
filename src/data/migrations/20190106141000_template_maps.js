exports.up = function up(knex) {
  return knex.schema
    .alterTable('template_pins', (table) => {
      table.uuid('map_id').references('id').inTable('pins');
    })
    .alterTable('pins', (table) => {
      table.uuid('template_pin_id').references('id').inTable('pins');
      table.dropColumn('template_pins_id');
    });
};

exports.down = function down() {};
