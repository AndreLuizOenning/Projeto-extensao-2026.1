import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AssistenteIA() {
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function enviarMensagem() {
    if (!mensagem.trim()) return;

    const textoUsuario = mensagem;

    setHistorico((prev) => [
      ...prev,
      { tipo: 'usuario', texto: textoUsuario },
    ]);

    setMensagem('');
    setCarregando(true);

    try {
      const token = localStorage.getItem('auth.token');

      const response = await fetch(`${API_URL}/ia/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mensagem: textoUsuario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao consultar IA');
      }

      setHistorico((prev) => [
        ...prev,
        { tipo: 'ia', texto: data.resposta },
      ]);
    } catch (error) {
      setHistorico((prev) => [
        ...prev,
        {
          tipo: 'ia',
          texto: `Erro: ${error.message}`,
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ padding: 32, color: '#0f172a' }}>
      <h1>Assistente IA</h1>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          minHeight: 400,
          marginTop: 24,
        }}
      >
        {historico.length === 0 && (
          <p>Faça uma pergunta sobre finanças, fluxo de caixa, contas a pagar ou receber.</p>
        )}

        {historico.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              background: item.tipo === 'usuario' ? '#e0f2fe' : '#f1f5f9',
            }}
          >
            <strong>{item.tipo === 'usuario' ? 'Você' : 'Assistente IA'}</strong>
            <p>{item.texto}</p>
          </div>
        ))}

        {carregando && <p>Assistente pensando...</p>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <input
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') enviarMensagem();
          }}
          placeholder="Digite sua pergunta..."
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 10,
            border: '1px solid #cbd5e1',
          }}
        />

        <button
          onClick={enviarMensagem}
          disabled={carregando}
          style={{
            padding: '14px 24px',
            borderRadius: 10,
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}