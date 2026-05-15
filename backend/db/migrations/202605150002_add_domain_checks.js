export async function up(knex) {
  await knex.schema.alterTable('titulos_financeiros', t => {
    t.check("tipo in ('RECEBER','PAGAR')", undefined, 'titulos_tipo_check');
    t.check("status in ('PENDENTE','PARCIAL','RECEBIDO','PAGO','CANCELADO')", undefined, 'titulos_status_check');
  });

  await knex.schema.alterTable('movimentacoes_financeiras', t => {
    t.check("tipo in ('CREDITO','DEBITO')", undefined, 'mov_tipo_check');
    t.check("origem in ('BAIXA_TITULO')", undefined, 'mov_origem_check');
  });

  await knex.schema.alterTable('entidades', t => {
    t.check("tipo in ('Cliente','Fornecedor','Funcionário','Parceiro')", undefined, 'entidades_tipo_check');
  });

  await knex.schema.alterTable('categorias_financeiras', t => {
    t.check("tipo in ('PAGAR','RECEBER')", undefined, 'categorias_tipo_check');
  });

  await knex.schema.alterTable('contas_bancarias', t => {
    t.check("tipo_conta in ('CORRENTE','POUPANCA')", undefined, 'conta_tipo_check');
  });

  await knex.schema.alterTable('conciliacoes_bancarias', t => {
    t.check("status in ('CONCILIADO','DIVERGENTE')", undefined, 'conciliacao_status_check');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('conciliacoes_bancarias', t => t.dropChecks(['conciliacao_status_check']));
  await knex.schema.alterTable('contas_bancarias', t => t.dropChecks(['conta_tipo_check']));
  await knex.schema.alterTable('categorias_financeiras', t => t.dropChecks(['categorias_tipo_check']));
  await knex.schema.alterTable('entidades', t => t.dropChecks(['entidades_tipo_check']));
  await knex.schema.alterTable('movimentacoes_financeiras', t => t.dropChecks(['mov_tipo_check', 'mov_origem_check']));
  await knex.schema.alterTable('titulos_financeiros', t => t.dropChecks(['titulos_tipo_check', 'titulos_status_check']));
}
