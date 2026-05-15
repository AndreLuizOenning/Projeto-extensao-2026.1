export async function up(knex) {
  await knex.schema.alterTable('contas_bancarias', (t) => {
    t.decimal('saldo_inicial', 14, 2).notNullable().defaultTo(0);
  });
}

export async function down(knex) {
  await knex.schema.alterTable('contas_bancarias', (t) => {
    t.dropColumn('saldo_inicial');
  });
}
