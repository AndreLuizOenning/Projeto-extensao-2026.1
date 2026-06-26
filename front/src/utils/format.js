export function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function monthlyAgg(contas, year) {
  const yr = year || new Date().getFullYear();
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return months.map((name, i) => {
    const total = contas
      .filter(c => {
        const d = new Date(c.dataVencimento);
        return d.getFullYear() === yr && d.getMonth() === i;
      })
      .reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
    return { name, valor: total };
  });
}

export function monthlyAggDouble(receber, pagar, year) {
  const yr = year || new Date().getFullYear();
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return months.map((name, i) => {
    const receitas = receber
      .filter(c => { const d = new Date(c.dataVencimento); return d.getFullYear() === yr && d.getMonth() === i; })
      .reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
    const despesas = pagar
      .filter(c => { const d = new Date(c.dataVencimento); return d.getFullYear() === yr && d.getMonth() === i; })
      .reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
    return { name, receitas, despesas };
  });
}
