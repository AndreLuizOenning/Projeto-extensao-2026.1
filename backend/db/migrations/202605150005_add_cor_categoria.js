export async function up(knex) {
  await knex.schema.alterTable('categorias_financeiras', (t) => {
    t.string('cor', 30).nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('categorias_financeiras', (t) => {
    t.dropColumn('cor');
  });
}
