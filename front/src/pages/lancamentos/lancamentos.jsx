import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Box, Flex, Text, Button, Badge, Input, Select, SimpleGrid,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, FormErrorMessage, Textarea, Grid, GridItem, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Spinner,
} from '@chakra-ui/react';
import { LuPencil, LuTrash2, LuPlus, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';
import { formatDate, formatCurrency } from '../../utils/format';
import { validatePositiveNumber } from '../../utils/validators';
import { listarTitulos, criarTitulo, atualizarTitulo, cancelarTitulo, registrarBaixa } from '../../services/titulos.service';
import { listarEmpresas } from '../../services/empresas.service';
import { listarEntidades } from '../../services/entidades.service';
import { listarCategoriasFinanceiras } from '../../services/categoriasFinanceiras.service';
import { listarCentrosCusto } from '../../services/centrosCusto.service';
import { listarContasBancarias } from '../../services/contasBancarias.service';

const STATUS_META = {
  PENDENTE: { label: 'Pendente', bg: 'purple.100', color: 'purple.700' },
  PARCIAL: { label: 'Parcial', bg: 'orange.100', color: 'orange.700' },
  RECEBIDO: { label: 'Recebido', bg: 'green.100', color: 'green.700' },
  PAGO: { label: 'Pago', bg: 'green.100', color: 'green.700' },
  CANCELADO: { label: 'Cancelado', bg: 'red.100', color: 'red.700' },
};
const BLOQUEIA_EDICAO_SALDO = ['PARCIAL', 'RECEBIDO', 'PAGO'];
const EMPTY_FORM = {
  tipo: 'RECEBER', descricao: '', valorOriginal: '', dataEmissao: '', dataVencimento: '', empresaId: '', entidadeId: '', categoriaId: '', centroCustoId: '', contaBancariaId: '', observacoes: '',
};


function getApiErrorMessage(error) {
  const message = error?.message;
  const dataMessage = error?.data?.message;
  const dataError = error?.data?.error;
  const details = error?.data?.details;

  if (Array.isArray(details) && details.length > 0) {
    const first = details
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.message) return item.message;
        if (item?.msg) return item.msg;
        if (item?.field && item?.error) return `${item.field}: ${item.error}`;
        return null;
      })
      .filter(Boolean)
      .join('; ');
    if (first) return first;
  }

  if (details && typeof details === 'object') {
    const readable = Object.entries(details)
      .map(([field, value]) => {
        if (Array.isArray(value)) return `${field}: ${value.join(', ')}`;
        if (typeof value === 'string') return `${field}: ${value}`;
        return null;
      })
      .filter(Boolean)
      .join('; ');
    if (readable) return readable;
  }

  if (typeof details === 'string' && details.trim()) return details;
  if (typeof dataError === 'string' && dataError.trim()) return dataError;
  if (typeof dataMessage === 'string' && dataMessage.trim()) return dataMessage;
  if (typeof message === 'string' && message.trim()) return message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}

function StatCard({ title, value, isPositive }) { return <Box bg="white" p="5" borderRadius="xl" boxShadow="sm"><Flex justifyContent="space-between" alignItems="center" mb="3"><Text fontWeight="semibold" color="gray.500" fontSize="sm">{title}</Text><Badge bg={isPositive ? 'green.100' : 'red.100'} color={isPositive ? 'green.700' : 'red.700'} px="2" py="1" borderRadius="md" display="flex" alignItems="center" gap="1">{isPositive ? <LuArrowUpRight /> : <LuArrowDownRight />}</Badge></Flex><Text fontSize="2xl" fontWeight="bold" color="#132034">{value}</Text></Box>; }

function ContaModal({ isOpen, onClose, onSave, initialData, empresas, entidades, categorias, centrosCusto, contasBancarias }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM); const [errors, setErrors] = useState({});
  useEffect(() => { setForm(initialData || EMPTY_FORM); setErrors({}); }, [initialData, isOpen]);
  function handleChange(e) { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); if (errors[name]) setErrors((p) => ({ ...p, [name]: '' })); }
  function validate() { const errs = {}; if (!form.tipo) errs.tipo = 'Tipo é obrigatório.'; if (!form.empresaId) errs.empresaId = 'Empresa é obrigatória.'; if (!form.descricao.trim()) errs.descricao = 'Descrição é obrigatória.'; const valorErr = validatePositiveNumber(form.valorOriginal); if (valorErr) errs.valorOriginal = valorErr; if (!form.dataVencimento) errs.dataVencimento = 'Data de vencimento é obrigatória.'; return errs; }
  function handleSalvar() { const errs = validate(); if (Object.keys(errs).length) return setErrors(errs); onSave(form); onClose(); }
  const contaPodeEditarValor = !initialData || !BLOQUEIA_EDICAO_SALDO.includes(initialData.status);
  const categoriasFiltradas = categorias.filter((c) => (form.tipo === 'RECEBER' ? c.tipo === 'RECEITA' : c.tipo === 'DESPESA'));
  const centrosFiltrados = centrosCusto.filter((c) => !form.empresaId || String(c.empresaId) === String(form.empresaId));
  const contasFiltradas = contasBancarias.filter((c) => !form.empresaId || String(c.empresaId) === String(form.empresaId));
  return <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered><ModalOverlay backdropFilter="blur(4px)" /><ModalContent borderRadius="xl" p="2"><ModalHeader color="#132034" fontSize="lg" textAlign="center">{initialData ? 'Editar Título Financeiro' : 'Novo Título Financeiro'}</ModalHeader><ModalCloseButton /><ModalBody pb="6"><Flex flexDirection="column" gap="4"><Grid templateColumns="1fr 1fr" gap="4"><FormControl isRequired isInvalid={!!errors.tipo}><FormLabel fontSize="sm">Tipo</FormLabel><Select name="tipo" value={form.tipo} onChange={handleChange}><option value="RECEBER">A Receber</option><option value="PAGAR">A Pagar</option></Select><FormErrorMessage>{errors.tipo}</FormErrorMessage></FormControl><FormControl isRequired isInvalid={!!errors.empresaId}><FormLabel fontSize="sm">Empresa</FormLabel><Select name="empresaId" value={form.empresaId} onChange={handleChange} placeholder="Selecione...">{empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</Select><FormErrorMessage>{errors.empresaId}</FormErrorMessage></FormControl></Grid><FormControl isRequired isInvalid={!!errors.descricao}><FormLabel fontSize="sm">Descrição</FormLabel><Input name="descricao" value={form.descricao} onChange={handleChange} /><FormErrorMessage>{errors.descricao}</FormErrorMessage></FormControl><Grid templateColumns="1fr 1fr" gap="4"><GridItem><FormControl isRequired isInvalid={!!errors.valorOriginal}><FormLabel fontSize="sm">Valor Original (R$)</FormLabel><Input isDisabled={!contaPodeEditarValor} name="valorOriginal" type="number" min="0.01" step="0.01" value={form.valorOriginal} onChange={handleChange} /><FormErrorMessage>{errors.valorOriginal}</FormErrorMessage></FormControl></GridItem><GridItem><FormControl><FormLabel fontSize="sm">Saldo Atual</FormLabel><Input isDisabled value={initialData ? formatCurrency(initialData.valorSaldo) : '-'} /></FormControl></GridItem></Grid><Grid templateColumns="1fr 1fr" gap="4"><GridItem><FormControl><FormLabel fontSize="sm">Data de Emissão</FormLabel><Input name="dataEmissao" type="date" value={form.dataEmissao || ''} onChange={handleChange} /></FormControl></GridItem><GridItem><FormControl isRequired isInvalid={!!errors.dataVencimento}><FormLabel fontSize="sm">Data de Vencimento</FormLabel><Input name="dataVencimento" type="date" value={form.dataVencimento || ''} onChange={handleChange} /><FormErrorMessage>{errors.dataVencimento}</FormErrorMessage></FormControl></GridItem></Grid><Grid templateColumns="1fr 1fr" gap="4"><FormControl><FormLabel fontSize="sm">Entidade</FormLabel><Select name="entidadeId" value={form.entidadeId} onChange={handleChange} placeholder="Selecione...">{entidades.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</Select></FormControl><FormControl><FormLabel fontSize="sm">Categoria</FormLabel><Select name="categoriaId" value={form.categoriaId} onChange={handleChange} placeholder="Selecione...">{categoriasFiltradas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select></FormControl></Grid><Grid templateColumns="1fr 1fr" gap="4"><FormControl><FormLabel fontSize="sm">Centro de Custo</FormLabel><Select name="centroCustoId" value={form.centroCustoId} onChange={handleChange} placeholder="Selecione...">{centrosFiltrados.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select></FormControl><FormControl><FormLabel fontSize="sm">Conta Bancária</FormLabel><Select name="contaBancariaId" value={form.contaBancariaId} onChange={handleChange} placeholder="Selecione...">{contasFiltradas.map((c) => <option key={c.id} value={c.id}>{`${c.bancoNome || 'Banco'} - ${c.agencia}/${c.conta}`}</option>)}</Select></FormControl></Grid><FormControl><FormLabel fontSize="sm">Observações</FormLabel><Textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={2} /></FormControl><Flex justifyContent="flex-end" gap="3"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button bg="#61B4DD" color="white" onClick={handleSalvar}>Salvar</Button></Flex></Flex></ModalBody></ModalContent></Modal>;
}

function Lancamentos() {
  const isLoggedIn = isAuthenticated(); const toast = useToast(); const { isOpen, onOpen, onClose } = useDisclosure(); const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure(); const { isOpen: isBaixaOpen, onOpen: onBaixaOpen, onClose: onBaixaClose } = useDisclosure(); const cancelRef = useRef();
  const [tab, setTab] = useState('PAGAR'); const [titulos, setTitulos] = useState([]); const [empresas, setEmpresas] = useState([]); const [entidades, setEntidades] = useState([]); const [categorias, setCategorias] = useState([]); const [centrosCusto, setCentrosCusto] = useState([]); const [contasBancarias, setContasBancarias] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [editItem, setEditItem] = useState(null); const [cancelTarget, setCancelTarget] = useState(null); const [baixaTarget, setBaixaTarget] = useState(null); const [dataBaixa, setDataBaixa] = useState(''); const [baixaError, setBaixaError] = useState('');

  const carregarDados = useCallback(async () => { try { setLoading(true); setError(''); const [ts, emps, ents, cats, centros, contas] = await Promise.all([listarTitulos(), listarEmpresas(), listarEntidades(), listarCategoriasFinanceiras(), listarCentrosCusto(), listarContasBancarias()]); setTitulos(ts); setEmpresas(emps); setEntidades(ents); setCategorias(cats); setCentrosCusto(centros); setContasBancarias(contas); } catch (e) { setError(e.message || 'Erro ao carregar títulos.'); } finally { setLoading(false); } }, []);
  useEffect(() => { carregarDados(); }, [carregarDados]);
  if (!isLoggedIn) return <Navigate to="/login" />;

  const list = useMemo(() => titulos.filter((t) => t.tipo === tab), [titulos, tab]);
  const empresaNome = (id) => empresas.find((e) => String(e.id) === String(id))?.nome || '-';
  const entidadeNome = (id) => entidades.find((e) => String(e.id) === String(id))?.nome || '-';
  const categoriaNome = (id) => categorias.find((e) => String(e.id) === String(id))?.nome || '-';
  const contaNome = (id) => { const c = contasBancarias.find((x) => String(x.id) === String(id)); return c ? `${c.bancoNome || 'Banco'} - ${c.agencia}/${c.conta}` : '-'; };
  const saldoAtual = titulos.filter((t) => t.status === 'RECEBIDO').reduce((s, t) => s + Number(t.valorOriginal || 0), 0) - titulos.filter((t) => t.status === 'PAGO').reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
  const totalReceber = titulos.filter((t) => t.tipo === 'RECEBER' && !['RECEBIDO', 'CANCELADO'].includes(t.status)).reduce((s, t) => s + Number(t.valorSaldo || 0), 0);
  const totalPagar = titulos.filter((t) => t.tipo === 'PAGAR' && !['PAGO', 'CANCELADO'].includes(t.status)).reduce((s, t) => s + Number(t.valorSaldo || 0), 0);

  async function handleSave(form) { try { if (editItem) await atualizarTitulo(editItem.id, form); else await criarTitulo(form); await carregarDados(); toast({ title: editItem ? 'Título atualizado!' : 'Título cadastrado!', status: 'success', duration: 2000, position: 'top' }); } catch (e) { toast({ title: 'Erro ao salvar título', description: getApiErrorMessage(e), status: 'error' }); } }
  function handleEdit(item) { if (item.status === 'CANCELADO') return; setEditItem({ ...item, empresaId: String(item.empresaId || ''), entidadeId: String(item.entidadeId || ''), categoriaId: String(item.categoriaId || ''), centroCustoId: String(item.centroCustoId || ''), contaBancariaId: String(item.contaBancariaId || ''), valorOriginal: String(item.valorOriginal || '') }); onOpen(); }
  function handleOpenAdd() { setEditItem(null); onOpen(); }
  function handleCancelClick(item) { if (item.status === 'CANCELADO') return; setCancelTarget(item); onConfirmOpen(); }
  function handleBaixaClick(item) {
    if (['CANCELADO', 'PAGO', 'RECEBIDO'].includes(item.status)) return;
    setBaixaTarget(item);
    setDataBaixa(new Date().toISOString().slice(0, 10));
    setBaixaError('');
    onBaixaOpen();
  }
  async function handleConfirmCancel() { if (!cancelTarget) return; try { await cancelarTitulo(cancelTarget.id); await carregarDados(); onConfirmClose(); setCancelTarget(null); toast({ title: 'Título cancelado!', status: 'success', duration: 2000, position: 'top' }); } catch (e) { toast({ title: 'Erro ao cancelar título', description: getApiErrorMessage(e), status: 'error', duration: 3500, position: 'top' }); } }
  async function handleConfirmBaixa() {
    if (!baixaTarget) return;
    if (!dataBaixa) {
      setBaixaError('A data da baixa é obrigatória.');
      return;
    }
    try {
      await registrarBaixa(baixaTarget.id, { data_baixa: dataBaixa });
      await carregarDados();
      onBaixaClose();
      setBaixaTarget(null);
      setDataBaixa('');
      toast({ title: 'Baixa registrada!', status: 'success', duration: 2000, position: 'top' });
    } catch (e) {
      toast({ title: 'Erro ao registrar baixa', description: getApiErrorMessage(e), status: 'error', duration: 3500, position: 'top' });
    }
  }
  const baixaLabel = baixaTarget?.tipo === 'PAGAR' ? 'Data de pagamento' : baixaTarget?.tipo === 'RECEBER' ? 'Data de recebimento' : 'Data da baixa';

  return <Box p="8" w="100%"><SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="6" mb="8"><StatCard title="Saldo Atual" value={formatCurrency(saldoAtual)} isPositive={saldoAtual >= 0} /><StatCard title="Previsão de Caixa" value={formatCurrency(saldoAtual + totalReceber - totalPagar)} isPositive={saldoAtual + totalReceber - totalPagar >= 0} /><StatCard title="Total a Receber" value={formatCurrency(totalReceber)} isPositive /><StatCard title="Total a Pagar" value={formatCurrency(totalPagar)} isPositive={false} /></SimpleGrid><Box bg="white" p="6" borderRadius="xl" boxShadow="sm"><Flex justifyContent="space-between" alignItems="center" mb="6"><Flex gap="3"><Button variant={tab === 'PAGAR' ? 'solid' : 'outline'} onClick={() => setTab('PAGAR')}>Contas a Pagar</Button><Button variant={tab === 'RECEBER' ? 'solid' : 'outline'} onClick={() => setTab('RECEBER')}>Contas a Receber</Button></Flex><Button bg="#61B4DD" color="white" leftIcon={<LuPlus />} onClick={handleOpenAdd}>Novo Título</Button></Flex>{loading && <Flex justify="center" py="10"><Spinner /></Flex>}{error && <Flex direction="column" align="center" py="10" gap="3"><Text color="red.500">{error}</Text><Button onClick={carregarDados}>Tentar novamente</Button></Flex>}{!loading && !error && <TableContainer><Table size="sm"><Thead><Tr><Th>Descrição</Th><Th>Empresa</Th><Th>Entidade</Th><Th>Categoria</Th><Th>Conta</Th><Th>Vencimento</Th><Th>Valor Original</Th><Th>Saldo</Th><Th>Status</Th><Th>Ações</Th></Tr></Thead><Tbody>{list.length === 0 ? <Tr><Td colSpan={10} textAlign="center" py="8">Nenhum título encontrado.</Td></Tr> : list.map((t) => <Tr key={t.id}><Td>{t.descricao}</Td><Td>{empresaNome(t.empresaId)}</Td><Td>{entidadeNome(t.entidadeId)}</Td><Td>{categoriaNome(t.categoriaId)}</Td><Td>{contaNome(t.contaBancariaId)}</Td><Td>{formatDate(t.dataVencimento)}</Td><Td>{formatCurrency(t.valorOriginal)}</Td><Td>{formatCurrency(t.valorSaldo)}</Td><Td><Badge bg={STATUS_META[t.status]?.bg || 'gray.100'} color={STATUS_META[t.status]?.color || 'gray.700'}>{STATUS_META[t.status]?.label || t.status}</Badge></Td><Td><Flex gap="1"><IconButton isDisabled={t.status === 'CANCELADO'} icon={<LuPencil size={14} />} size="xs" variant="ghost" aria-label="Editar" onClick={() => handleEdit(t)} /><Button size="xs" colorScheme="blue" variant="outline" isDisabled={['CANCELADO', 'PAGO', 'RECEBIDO'].includes(t.status)} onClick={() => handleBaixaClick(t)}>Baixa</Button><IconButton isDisabled={t.status === 'CANCELADO'} icon={<LuTrash2 size={14} />} size="xs" variant="ghost" colorScheme="red" aria-label="Cancelar" onClick={() => handleCancelClick(t)} /></Flex></Td></Tr>)}</Tbody></Table></TableContainer>}</Box><ContaModal isOpen={isOpen} onClose={onClose} onSave={handleSave} initialData={editItem} empresas={empresas} entidades={entidades} categorias={categorias} centrosCusto={centrosCusto} contasBancarias={contasBancarias} /><Modal isOpen={isBaixaOpen} onClose={onBaixaClose} isCentered><ModalOverlay backdropFilter="blur(4px)" /><ModalContent borderRadius="xl"><ModalHeader>Registrar baixa financeira</ModalHeader><ModalCloseButton /><ModalBody pb="6"><Flex direction="column" gap="4"><Text fontSize="sm" color="gray.600">Informe a data efetiva em que ocorreu o pagamento/recebimento do título.</Text><FormControl><FormLabel fontSize="sm">Data de vencimento</FormLabel><Input value={formatDate(baixaTarget?.dataVencimento)} isReadOnly /></FormControl><FormControl isRequired isInvalid={!!baixaError}><FormLabel fontSize="sm">{baixaLabel}</FormLabel><Input type="date" value={dataBaixa} onChange={(e) => { setDataBaixa(e.target.value); if (baixaError) setBaixaError(''); }} /><FormErrorMessage>{baixaError}</FormErrorMessage></FormControl><Flex justifyContent="flex-end" gap="3"><Button variant="ghost" onClick={onBaixaClose}>Cancelar</Button><Button colorScheme="blue" onClick={handleConfirmBaixa}>Confirmar baixa</Button></Flex></Flex></ModalBody></ModalContent></Modal><AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose}><AlertDialogOverlay><AlertDialogContent><AlertDialogHeader>Cancelar título</AlertDialogHeader><AlertDialogBody>Deseja cancelar "{cancelTarget?.descricao}"?</AlertDialogBody><AlertDialogFooter><Button ref={cancelRef} onClick={onConfirmClose}>Voltar</Button><Button colorScheme="red" ml={3} onClick={handleConfirmCancel}>Cancelar título</Button></AlertDialogFooter></AlertDialogContent></AlertDialogOverlay></AlertDialog></Box>;
}

export default Lancamentos;
