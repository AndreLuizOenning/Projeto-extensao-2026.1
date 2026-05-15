import express from 'express';
import { z } from 'zod';
import db from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { decimalToCents, centsToDecimal } from '../../utils/money.js';

const router = express.Router();

const baseTituloSchema = z.object({
  tipo: z.enum(['RECEBER', 'PAGAR']),
  descricao: z.string().min(1),
  valor_original: z.union([z.string(), z.number()]),
  data_emissao: z.string().optional(),
  data_vencimento: z.string(),
  empresa_id: z.coerce.number().int().positive(),
  entidade_id: z.coerce.number().int().positive().nullable().optional(),
  conta_bancaria_id: z.coerce.number().int().positive().nullable().optional(),
  categoria_id: z.coerce.number().int().positive().nullable().optional(),
  centro_custo_id: z.coerce.number().int().positive().nullable().optional(),
  observacoes: z.string().optional()
}).strict();

const updateSchema = baseTituloSchema.partial().strict();

function toPositiveMoneyCents(value, fieldName) {
  try {
    const cents = decimalToCents(value, { allowNegative: false });
    if (cents <= 0) throw new Error('Valor monetário deve ser maior que zero.');
    return cents;
  } catch {
    throw new AppError(`${fieldName} inválido. Informe valor monetário positivo com até 2 casas decimais.`, 422);
  }
}

async function validateTitleRelations(trx, data) {
  const empresa = await trx('empresas').where({ id: data.empresa_id, ativo: true }).first();
  if (!empresa) throw new AppError('Empresa inválida ou inativa.', 422);

  if (data.entidade_id) {
    const entidade = await trx('entidades').where({ id: data.entidade_id, ativo: true }).first();
    if (!entidade) throw new AppError('Entidade inválida ou inativa.', 422);
    if (entidade.empresa_id && Number(entidade.empresa_id) !== Number(data.empresa_id)) {
      throw new AppError('Entidade não pertence à empresa informada.', 422);
    }
  }

  if (data.categoria_id) {
    const categoria = await trx('categorias_financeiras').where({ id: data.categoria_id, ativo: true }).first();
    if (!categoria) throw new AppError('Categoria inválida ou inativa.', 422);
  }

  if (data.centro_custo_id) {
    const centro = await trx('centros_custo').where({ id: data.centro_custo_id, ativo: true, empresa_id: data.empresa_id }).first();
    if (!centro) throw new AppError('Centro de custo inválido/inativo ou não pertence à empresa.', 422);
  }

  if (data.conta_bancaria_id) {
    const conta = await trx('contas_bancarias').where({ id: data.conta_bancaria_id, ativo: true, empresa_id: data.empresa_id }).first();
    if (!conta) throw new AppError('Conta bancária inválida/inativa ou não pertence à empresa.', 422);
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const rows = await db('titulos_financeiros').where({ cancelado: false }).orderBy('id', 'desc');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = baseTituloSchema.parse(req.body);
  const valorOriginalCents = toPositiveMoneyCents(data.valor_original, 'valor_original');

  const created = await db.transaction(async trx => {
    await validateTitleRelations(trx, data);

    const valorOriginal = centsToDecimal(valorOriginalCents);
    const [row] = await trx('titulos_financeiros')
      .insert({ ...data, valor_original: valorOriginal, valor_saldo: valorOriginal, status: 'PENDENTE' })
      .returning('*');

    await trx('auditoria').insert({
      entidade: 'titulos_financeiros',
      entidade_id: row.id,
      acao: 'CREATE',
      user_id: req.user?.sub || null,
      dados: { before: null, after: row }
    });

    return row;
  });

  res.status(201).json(created);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const updated = await db.transaction(async trx => {
    const current = await trx('titulos_financeiros').where({ id: req.params.id }).first();
    if (!current || current.cancelado) throw new AppError('Título não encontrado.', 404);

    const totalCents = decimalToCents(current.valor_original);
    const saldoCents = decimalToCents(current.valor_saldo);
    const valorBaixadoCents = totalCents - saldoCents;

    const safePayload = { ...payload };
    if (Object.prototype.hasOwnProperty.call(safePayload, 'valor_saldo')) {
      throw new AppError('Alteração manual de saldo_restante não é permitida.', 422);
    }

    if (Object.prototype.hasOwnProperty.call(safePayload, 'valor_original')) {
      if (valorBaixadoCents > 0) {
        throw new AppError('Não é permitido alterar valor_original após baixa parcial/total.', 422);
      }
      const novoValorOriginalCents = toPositiveMoneyCents(safePayload.valor_original, 'valor_original');
      safePayload.valor_original = centsToDecimal(novoValorOriginalCents);
      safePayload.valor_saldo = centsToDecimal(novoValorOriginalCents);
      safePayload.status = 'PENDENTE';
    }

    const merged = { ...current, ...safePayload };
    await validateTitleRelations(trx, merged);

    const [row] = await trx('titulos_financeiros')
      .where({ id: req.params.id })
      .update({ ...safePayload, updated_at: trx.fn.now() })
      .returning('*');

    await trx('auditoria').insert({
      entidade: 'titulos_financeiros',
      entidade_id: row.id,
      acao: 'UPDATE',
      user_id: req.user?.sub || null,
      dados: { before: current, after: row }
    });

    return row;
  });

  res.json(updated);
}));

router.post('/:id/baixas', asyncHandler(async (req, res) => {
  const body = z.object({ conta_bancaria_id: z.coerce.number().int().positive(), valor: z.coerce.number().positive(), data_baixa: z.string(), observacao: z.string().optional() }).parse(req.body);

  const result = await db.transaction(async trx => {
    const titulo = await trx('titulos_financeiros').where({ id: req.params.id }).forUpdate().first();
    if (!titulo || titulo.cancelado) throw new AppError('Título não encontrado.', 404);
    if (['RECEBIDO', 'PAGO', 'CANCELADO'].includes(titulo.status)) throw new AppError('Título não permite novas baixas.', 422);

    if (titulo.conta_bancaria_id && Number(titulo.conta_bancaria_id) !== Number(body.conta_bancaria_id)) {
      throw new AppError('Conta bancária divergente da conta vinculada ao título.', 422);
    }

    const conta = await trx('contas_bancarias').where({ id: body.conta_bancaria_id, ativo: true }).forUpdate().first();
    if (!conta) throw new AppError('Conta bancária não encontrada ou inativa.', 422);

    const saldoCents = decimalToCents(titulo.valor_saldo);
    const baixaCents = decimalToCents(body.valor);

    if (baixaCents > saldoCents) {
      await trx('auditoria').insert({
        entidade: 'titulos_financeiros', entidade_id: titulo.id, acao: 'BAIXA_BLOQUEADA', user_id: req.user?.sub || null,
        dados: { before: { valor_saldo: titulo.valor_saldo, status: titulo.status }, after: { tentativa_valor: body.valor }, motivo: 'VALOR_ACIMA_SALDO' }
      });
      throw new AppError('Baixa não pode ser maior que saldo restante.', 422, { saldo_restante: titulo.valor_saldo });
    }

    const [baixaRow] = await trx('baixas_financeiras').insert({
      titulo_id: titulo.id,
      conta_bancaria_id: body.conta_bancaria_id,
      valor: centsToDecimal(baixaCents),
      data_baixa: body.data_baixa,
      observacao: body.observacao,
      created_by: req.user?.sub || null
    }).returning('*');

    const novoSaldoCents = saldoCents - baixaCents;
    const novoStatus = novoSaldoCents <= 0 ? (titulo.tipo === 'RECEBER' ? 'RECEBIDO' : 'PAGO') : 'PARCIAL';
    const [tituloUp] = await trx('titulos_financeiros').where({ id: titulo.id }).update({ valor_saldo: centsToDecimal(novoSaldoCents), status: novoStatus, updated_at: trx.fn.now() }).returning('*');

    const tipoMov = titulo.tipo === 'RECEBER' ? 'CREDITO' : 'DEBITO';
    const [mov] = await trx('movimentacoes_financeiras').insert({
      conta_bancaria_id: body.conta_bancaria_id,
      titulo_id: titulo.id,
      baixa_id: baixaRow.id,
      tipo: tipoMov,
      valor: centsToDecimal(baixaCents),
      data_movimento: body.data_baixa,
      historico: `${titulo.tipo} - ${titulo.descricao}`,
      origem: 'BAIXA_TITULO'
    }).returning('*');

    const contaSaldoCents = decimalToCents(conta.saldo_atual);
    const novoSaldoContaCents = tipoMov === 'CREDITO' ? contaSaldoCents + baixaCents : contaSaldoCents - baixaCents;
    await trx('contas_bancarias').where({ id: body.conta_bancaria_id }).update({ saldo_atual: centsToDecimal(novoSaldoContaCents), updated_at: trx.fn.now() });

    await trx('auditoria').insert({
      entidade: 'titulos_financeiros',
      entidade_id: titulo.id,
      acao: 'BAIXA',
      user_id: req.user?.sub || null,
      dados: { before: { valor_saldo: titulo.valor_saldo, status: titulo.status }, after: { valor_saldo: tituloUp.valor_saldo, status: tituloUp.status, baixa_id: baixaRow.id } }
    });

    return { baixa: baixaRow, titulo: tituloUp, movimentacao: mov };
  });

  res.status(201).json(result);
}));

router.post('/:id/cancelar', asyncHandler(async (req, res) => {
  const row = await db.transaction(async trx => {
    const current = await trx('titulos_financeiros').where({ id: req.params.id }).first();
    if (!current) throw new AppError('Título não encontrado.', 404);
    if (current.cancelado) throw new AppError('Título já está cancelado.', 422);

    const [updated] = await trx('titulos_financeiros').where({ id: req.params.id }).update({ cancelado: true, status: 'CANCELADO', updated_at: trx.fn.now() }).returning('*');

    await trx('auditoria').insert({
      entidade: 'titulos_financeiros',
      entidade_id: updated.id,
      acao: 'CANCELAR',
      user_id: req.user?.sub || null,
      dados: { before: current, after: updated }
    });

    return updated;
  });

  res.json(row);
}));

export default router;
