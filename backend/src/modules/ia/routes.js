import { Router } from 'express';
import OpenAI from 'openai';
import db from '../../config/db.js';

const router = Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

async function montarContextoFinanceiro() {
  const empresas = await db('empresas')
    .select(
      'id',
      'nome',
      'razao_social',
      'cnpj',
      'categoria',
      'cidade',
      'estado',
      'status',
      'ativo'
    )
    .orderBy('nome');

  const entidades = await db('entidades')
    .select(
      'id',
      'empresa_id',
      'nome',
      'tipo',
      'contato',
      'status',
      'cnpj_cpf',
      'ativo'
    )
    .orderBy('nome');

  const contasBancarias = await db('contas_bancarias')
    .leftJoin('bancos', 'contas_bancarias.banco_id', 'bancos.id')
    .leftJoin('empresas', 'contas_bancarias.empresa_id', 'empresas.id')
    .select(
      'contas_bancarias.id',
      'contas_bancarias.empresa_id',
      'contas_bancarias.banco_id',
      'contas_bancarias.agencia',
      'contas_bancarias.numero_conta',
      'contas_bancarias.digito',
      'contas_bancarias.tipo_conta',
      'contas_bancarias.saldo_atual',
      'contas_bancarias.saldo_inicial',
      'contas_bancarias.ativo',
      'bancos.nome as banco',
      'empresas.nome as empresa'
    );

  const titulos = await db('titulos_financeiros')
    .leftJoin('empresas', 'titulos_financeiros.empresa_id', 'empresas.id')
    .leftJoin('entidades', 'titulos_financeiros.entidade_id', 'entidades.id')
    .leftJoin('categorias_financeiras', 'titulos_financeiros.categoria_id', 'categorias_financeiras.id')
    .select(
      'titulos_financeiros.id',
      'titulos_financeiros.tipo',
      'titulos_financeiros.descricao',
      'titulos_financeiros.valor_original',
      'titulos_financeiros.valor_saldo as saldo',
      'titulos_financeiros.data_emissao',
      'titulos_financeiros.data_vencimento',
      'titulos_financeiros.status',
      'titulos_financeiros.observacoes',
      'titulos_financeiros.cancelado',
      'empresas.nome as empresa',
      'entidades.nome as entidade',
      'categorias_financeiras.nome as categoria'
    )
    .orderBy('titulos_financeiros.data_vencimento');

  const saldoBancario = contasBancarias.reduce(
    (total, conta) => total + Number(conta.saldo_atual || 0),
    0
  );

  const totalReceber = titulos
    .filter((titulo) => titulo.tipo === 'RECEBER' && titulo.status !== 'BAIXADO' && !titulo.cancelado)
    .reduce((total, titulo) => total + Number(titulo.saldo || 0), 0);

  const totalPagar = titulos
    .filter((titulo) => titulo.tipo === 'PAGAR' && titulo.status !== 'BAIXADO' && !titulo.cancelado)
    .reduce((total, titulo) => total + Number(titulo.saldo || 0), 0);

  const previsaoCaixa = saldoBancario + totalReceber - totalPagar;

  const empresasResumo = empresas
    .map((empresa) =>
      `- ${empresa.nome} | Razão social: ${empresa.razao_social || 'N/A'} | CNPJ: ${empresa.cnpj || 'N/A'} | Categoria: ${empresa.categoria || 'N/A'} | Cidade/UF: ${empresa.cidade || 'N/A'}/${empresa.estado || 'N/A'} | Status: ${empresa.status || 'N/A'}`
    )
    .join('\n');

  const entidadesResumo = entidades
    .map((entidade) =>
      `- ${entidade.nome} | Tipo: ${entidade.tipo} | Contato: ${entidade.contato || 'N/A'} | CNPJ/CPF: ${entidade.cnpj_cpf || 'N/A'} | Status: ${entidade.status || 'N/A'} | Empresa ID: ${entidade.empresa_id || 'N/A'}`
    )
    .join('\n');

  const contasResumo = contasBancarias
    .map((conta) =>
      `- Empresa: ${conta.empresa || 'N/A'} | Banco: ${conta.banco || 'N/A'} | Agência: ${conta.agencia || 'N/A'} | Conta: ${conta.numero_conta || 'N/A'}-${conta.digito || ''} | Tipo: ${conta.tipo_conta || 'N/A'} | Saldo atual: ${formatarMoeda(conta.saldo_atual)}`
    )
    .join('\n');

  const titulosResumo = titulos
    .map((titulo) =>
      `- ${titulo.tipo}: ${titulo.descricao} | Valor original: ${formatarMoeda(titulo.valor_original)} | Saldo: ${formatarMoeda(titulo.saldo)} | Vencimento: ${titulo.data_vencimento} | Status: ${titulo.status} | Empresa: ${titulo.empresa || 'N/A'} | Entidade: ${titulo.entidade || 'N/A'} | Categoria: ${titulo.categoria || 'N/A'}`
    )
    .join('\n');

  return `
RESUMO FINANCEIRO ATUAL DO SISTEMA:

Saldo bancário total: ${formatarMoeda(saldoBancario)}
Total a receber: ${formatarMoeda(totalReceber)}
Total a pagar: ${formatarMoeda(totalPagar)}
Previsão de caixa: ${formatarMoeda(previsaoCaixa)}

EMPRESAS CADASTRADAS:
${empresasResumo || 'Nenhuma empresa cadastrada.'}

ENTIDADES CADASTRADAS:
${entidadesResumo || 'Nenhuma entidade cadastrada.'}

CONTAS BANCÁRIAS:
${contasResumo || 'Nenhuma conta bancária cadastrada.'}

TÍTULOS FINANCEIROS:
${titulosResumo || 'Nenhum título financeiro cadastrado.'}
`;
}

router.post('/chat', async (req, res, next) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({ message: 'Mensagem é obrigatória.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OPENAI_API_KEY não configurada no backend.' });
    }

    const contextoFinanceiro = await montarContextoFinanceiro();

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: `
Você é um assistente financeiro inteligente para um sistema de holding financeira.

Responda em português do Brasil.
Use os dados reais do sistema abaixo para responder.
Não diga que não tem acesso aos dados, porque eles estão no contexto.
Se algum dado estiver vazio, informe isso claramente.
Seja objetivo, profissional e prático.
Sempre que possível, cite valores em reais.

${contextoFinanceiro}
          `,
        },
        {
          role: 'user',
          content: mensagem,
        },
      ],
    });

    return res.json({
      resposta: response.output_text,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;