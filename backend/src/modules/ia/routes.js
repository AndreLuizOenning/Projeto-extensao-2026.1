import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res, next) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({ message: 'Mensagem é obrigatória.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OPENAI_API_KEY não configurada no backend.' });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'Você é um assistente financeiro inteligente para um sistema de holding financeira. Responda em português do Brasil, de forma objetiva, prática e profissional. Ajude com fluxo de caixa, contas a pagar, contas a receber, saldo bancário, títulos financeiros, empresas, bancos, entidades e relatórios.',
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