export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('users', table => {
    table.bigIncrements('id').primary();
    table.string('nome', 150).notNullable();
    table.string('cpf', 14).notNullable().unique();
    table.string('email', 180).unique();
    table.string('password_hash', 255).notNullable();
    table.string('role', 40).notNullable().defaultTo('ADMIN');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('empresas', t => {
    t.bigIncrements('id').primary();
    t.string('nome', 150).notNullable();
    t.string('razao_social', 180);
    t.string('cnpj', 18).notNullable().unique();
    t.string('categoria', 100);
    t.string('cep', 10);
    t.string('pais', 80).defaultTo('Brasil');
    t.string('estado', 2);
    t.string('cidade', 100);
    t.string('rua', 180);
    t.text('descricao');
    t.string('status', 30).notNullable().defaultTo('ATIVA');
    t.boolean('ativo').notNullable().defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('bancos', t => {
    t.bigIncrements('id').primary();
    t.string('codigo', 10).notNullable().unique();
    t.string('nome', 120).notNullable();
    t.boolean('ativo').notNullable().defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('contas_bancarias', t => {
    t.bigIncrements('id').primary();
    t.bigInteger('empresa_id').unsigned().notNullable().references('id').inTable('empresas');
    t.bigInteger('banco_id').unsigned().notNullable().references('id').inTable('bancos');
    t.string('agencia', 20).notNullable();
    t.string('numero_conta', 30).notNullable();
    t.string('digito', 5);
    t.string('tipo_conta', 30).notNullable().defaultTo('CORRENTE');
    t.decimal('saldo_atual', 14, 2).notNullable().defaultTo(0);
    t.boolean('ativo').notNullable().defaultTo(true);
    t.unique(['empresa_id', 'banco_id', 'agencia', 'numero_conta']);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('entidades', t => {
    t.bigIncrements('id').primary();
    t.bigInteger('empresa_id').unsigned().references('id').inTable('empresas');
    t.string('nome', 160).notNullable();
    t.string('tipo', 40).notNullable();
    t.string('contato', 180);
    t.string('status', 30).notNullable().defaultTo('ATIVO');
    t.string('cnpj_cpf', 18);
    t.string('endereco', 220);
    t.boolean('ativo').notNullable().defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('categorias_financeiras', t => {
    t.bigIncrements('id').primary();
    t.string('nome', 100).notNullable();
    t.string('tipo', 20).notNullable();
    t.boolean('ativo').notNullable().defaultTo(true);
    t.unique(['nome', 'tipo']);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('centros_custo', t => {
    t.bigIncrements('id').primary();
    t.bigInteger('empresa_id').unsigned().notNullable().references('id').inTable('empresas');
    t.string('codigo', 30).notNullable();
    t.string('nome', 120).notNullable();
    t.boolean('ativo').notNullable().defaultTo(true);
    t.unique(['empresa_id', 'codigo']);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('titulos_financeiros', t => {
    t.bigIncrements('id').primary();
    t.string('tipo', 20).notNullable(); // RECEBER/PAGAR
    t.string('descricao', 180).notNullable();
    t.decimal('valor_original', 14, 2).notNullable();
    t.decimal('valor_saldo', 14, 2).notNullable();
    t.date('data_emissao');
    t.date('data_vencimento').notNullable();
    t.string('status', 20).notNullable().defaultTo('PENDENTE');
    t.bigInteger('empresa_id').unsigned().references('id').inTable('empresas');
    t.bigInteger('entidade_id').unsigned().references('id').inTable('entidades');
    t.bigInteger('conta_bancaria_id').unsigned().references('id').inTable('contas_bancarias');
    t.bigInteger('categoria_id').unsigned().references('id').inTable('categorias_financeiras');
    t.bigInteger('centro_custo_id').unsigned().references('id').inTable('centros_custo');
    t.text('observacoes');
    t.boolean('cancelado').notNullable().defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('baixas_financeiras', t => {
    t.bigIncrements('id').primary();
    t.bigInteger('titulo_id').unsigned().notNullable().references('id').inTable('titulos_financeiros');
    t.bigInteger('conta_bancaria_id').unsigned().notNullable().references('id').inTable('contas_bancarias');
    t.decimal('valor', 14, 2).notNullable();
    t.date('data_baixa').notNullable();
    t.text('observacao');
    t.bigInteger('created_by').unsigned().references('id').inTable('users');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('movimentacoes_financeiras', t => {
    t.bigIncrements('id').primary();
    t.bigInteger('conta_bancaria_id').unsigned().notNullable().references('id').inTable('contas_bancarias');
    t.bigInteger('titulo_id').unsigned().references('id').inTable('titulos_financeiros');
    t.bigInteger('baixa_id').unsigned().references('id').inTable('baixas_financeiras');
    t.string('tipo', 20).notNullable(); // CREDITO/DEBITO
    t.decimal('valor', 14, 2).notNullable();
    t.date('data_movimento').notNullable();
    t.text('historico').notNullable();
    t.string('origem', 30).notNullable().defaultTo('BAIXA_TITULO');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('auditoria', t => {
    t.bigIncrements('id').primary();
    t.string('entidade', 80).notNullable();
    t.bigInteger('entidade_id').unsigned().notNullable();
    t.string('acao', 40).notNullable();
    t.bigInteger('user_id').unsigned().references('id').inTable('users');
    t.jsonb('dados');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('conciliacoes_bancarias', t => {
    t.bigIncrements('id').primary();
    t.bigInteger('conta_bancaria_id').unsigned().notNullable().references('id').inTable('contas_bancarias');
    t.date('data_referencia').notNullable();
    t.decimal('saldo_extrato', 14, 2).notNullable();
    t.decimal('saldo_sistema', 14, 2).notNullable();
    t.decimal('diferenca', 14, 2).notNullable();
    t.string('status', 20).notNullable();
    t.text('observacao');
    t.bigInteger('created_by').unsigned().references('id').inTable('users');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('conciliacoes_bancarias');
  await knex.schema.dropTableIfExists('auditoria');
  await knex.schema.dropTableIfExists('movimentacoes_financeiras');
  await knex.schema.dropTableIfExists('baixas_financeiras');
  await knex.schema.dropTableIfExists('titulos_financeiros');
  await knex.schema.dropTableIfExists('centros_custo');
  await knex.schema.dropTableIfExists('categorias_financeiras');
  await knex.schema.dropTableIfExists('entidades');
  await knex.schema.dropTableIfExists('contas_bancarias');
  await knex.schema.dropTableIfExists('bancos');
  await knex.schema.dropTableIfExists('empresas');
  await knex.schema.dropTableIfExists('users');
}
