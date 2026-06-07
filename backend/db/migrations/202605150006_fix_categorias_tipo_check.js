export async function up(knex) {
  await knex.schema.alterTable('categorias_financeiras', (t) => {
    t.dropChecks(['categorias_tipo_check']);
  });
  await knex.raw(
    "ALTER TABLE categorias_financeiras ADD CONSTRAINT categorias_tipo_check CHECK (tipo IN ('DESPESA','RECEITA'))"
  );
}

export async function down(knex) {
  await knex.schema.alterTable('categorias_financeiras', (t) => {
    t.dropChecks(['categorias_tipo_check']);
  });
  await knex.raw(
    "ALTER TABLE categorias_financeiras ADD CONSTRAINT categorias_tipo_check CHECK (tipo IN ('PAGAR','RECEBER'))"
  );
}
