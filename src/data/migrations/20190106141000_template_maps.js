exports.up = function up(knex) {
  return knex.schema
    .alterTable('template_pins', (table) => {
      table.uuid('map_id').references('id').inTable('maps');
    })
    .alterTable('pins', (table) => {
      table.uuid('template_pin_id').references('id').inTable('template_pins');
      table.dropColumn('template_pins_id');
    });
};

exports.down = function down() {};
