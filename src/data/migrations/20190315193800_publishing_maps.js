exports.up = function up(knex) {
  return knex.schema
    .alterTable('maps', (table) => {
      table.boolean('published');
    });
};

exports.down = function down() {};
