export async function up(knex) {
  await knex.schema.alterTable('empresas', (t) => {
    t.string('estado', 100).alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('empresas', (t) => {
    t.string('estado', 2).alter();
  });
}
