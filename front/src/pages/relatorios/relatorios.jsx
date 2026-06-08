import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge, Box, Button, Divider, Flex, IconButton,
  Input, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  Select, SimpleGrid, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { LuEllipsisVertical, LuFileText, LuDownload, LuPrinter } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';
import { formatDate, formatCurrency } from '../../utils/format';
import { listarEmpresas } from '../../services/empresas.service';
import { listarTitulos } from '../../services/titulos.service';
import { listarContasBancarias } from '../../services/contasBancarias.service';

const STATUS_EMP_MAP = {
  Positivo: { bg: 'green.100', color: 'green.700' },
  Negativo: { bg: 'red.100', color: 'red.700' },
  Pendente: { bg: 'yellow.100', color: 'yellow.700' },
};

const STATUS_TITULO_MAP = {
  PENDENTE:  { bg: 'yellow.100', color: 'yellow.700' },
  PARCIAL:   { bg: 'blue.100',   color: 'blue.700'   },
  RECEBIDO:  { bg: 'green.100',  color: 'green.700'  },
  PAGO:      { bg: 'green.100',  color: 'green.700'  },
  CANCELADO: { bg: 'gray.100',   color: 'gray.600'   },
};

function exportToCSV(empresa, receber, pagar) {
  const rows = [
    ['Tipo', 'Descrição', 'Valor Original', 'Saldo Restante', 'Data Vencimento', 'Status'],
    ...receber.map((t) => ['Receber', t.descricao, t.valorOriginal, t.valorSaldo, formatDate(t.dataVencimento), t.status]),
    ...pagar.map((t) => ['Pagar', t.descricao, t.valorOriginal, t.valorSaldo, formatDate(t.dataVencimento), t.status]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_${empresa.nome.replace(/\s+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function TituloTable({ items, contaMap }) {
  if (items.length === 0) return <Text color="gray.400" fontSize="sm" mb="4">Nenhum registro.</Text>;
  return (
    <TableContainer mb="5">
      <Table size="sm" variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th fontSize="xs" color="gray.500" textTransform="none">Descrição</Th>
            <Th fontSize="xs" color="gray.500" textTransform="none">Valor</Th>
            <Th fontSize="xs" color="gray.500" textTransform="none">Saldo Rest.</Th>
            <Th fontSize="xs" color="gray.500" textTransform="none">Vencimento</Th>
            <Th fontSize="xs" color="gray.500" textTransform="none">Conta Bancária</Th>
            <Th fontSize="xs" color="gray.500" textTransform="none">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((t) => {
            const sc = STATUS_TITULO_MAP[t.status] || STATUS_TITULO_MAP.PENDENTE;
            return (
              <Tr key={t.id}>
                <Td fontSize="sm">{t.descricao}</Td>
                <Td fontSize="sm" fontWeight="semibold">{formatCurrency(t.valorOriginal)}</Td>
                <Td fontSize="sm" color="gray.500">{formatCurrency(t.valorSaldo)}</Td>
                <Td fontSize="sm">{formatDate(t.dataVencimento)}</Td>
                <Td fontSize="sm" color="gray.500">
                  {t.contaBancariaId ? (contaMap.get(String(t.contaBancariaId)) || '-') : '-'}
                </Td>
                <Td>
                  <Badge bg={sc.bg} color={sc.color} px="2" py="1" borderRadius="md" fontSize="xs">
                    {t.status}
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function ReportModal({ isOpen, onClose, empresa, receber, pagar, contaMap }) {
  if (!empresa) return null;

  const totalReceber = receber.reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
  const totalPagar = pagar.reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
  const saldo = totalReceber - totalPagar;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" maxH="85vh">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          <Flex justifyContent="space-between" alignItems="center" pr="8">
            <Box>
              <Text color="#132034" fontSize="lg" fontWeight="bold">{empresa.nome}</Text>
              <Text color="gray.400" fontSize="xs" fontWeight="normal">
                {empresa.razaoSocial && `${empresa.razaoSocial} · `}
                {empresa.cnpj && `CNPJ: ${empresa.cnpj}`}
                {empresa.categoria && ` · ${empresa.categoria}`}
              </Text>
            </Box>
            <Flex gap="2">
              <Button size="sm" leftIcon={<LuDownload size={14} />} variant="outline" borderColor="#132034" color="#132034" borderRadius="lg"
                onClick={() => exportToCSV(empresa, receber, pagar)}>
                Excel / CSV
              </Button>
              <Button size="sm" leftIcon={<LuPrinter size={14} />} bg="#132034" color="white" borderRadius="lg" _hover={{ bg: '#1e3a5f' }}
                onClick={() => window.print()}>
                PDF
              </Button>
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6" pt="4">
          <SimpleGrid columns={3} spacing="4" mb="6">
            <Box bg="green.50" p="4" borderRadius="xl" textAlign="center">
              <Text fontSize="xs" color="green.600" fontWeight="semibold" mb="1">Total Receitas</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.700">{formatCurrency(totalReceber)}</Text>
            </Box>
            <Box bg="red.50" p="4" borderRadius="xl" textAlign="center">
              <Text fontSize="xs" color="red.600" fontWeight="semibold" mb="1">Total Despesas</Text>
              <Text fontSize="xl" fontWeight="bold" color="red.700">{formatCurrency(totalPagar)}</Text>
            </Box>
            <Box bg={saldo >= 0 ? 'blue.50' : 'orange.50'} p="4" borderRadius="xl" textAlign="center">
              <Text fontSize="xs" color={saldo >= 0 ? 'blue.600' : 'orange.600'} fontWeight="semibold" mb="1">Saldo Líquido</Text>
              <Text fontSize="xl" fontWeight="bold" color={saldo >= 0 ? 'blue.700' : 'orange.700'}>{formatCurrency(saldo)}</Text>
            </Box>
          </SimpleGrid>

          <Text fontWeight="bold" color="#132034" mb="3" fontSize="sm">Contas a Receber</Text>
          <TituloTable items={receber} contaMap={contaMap} />

          <Divider mb="4" />

          <Text fontWeight="bold" color="#132034" mb="3" fontSize="sm">Contas a Pagar</Text>
          <TituloTable items={pagar} contaMap={contaMap} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Relatorios() {
  const isLoggedIn = isAuthenticated();
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [titulos, setTitulos] = useState([]);
  const [contas, setContas] = useState([]);
  const [filters, setFilters] = useState({ empresa: '', status: '', dataInicio: '', dataFim: '', periodo: '' });
  const [selectedRel, setSelectedRel] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function carregar() {
      try {
        const [e, t, c] = await Promise.all([listarEmpresas(), listarTitulos(), listarContasBancarias()]);
        setEmpresas(e);
        setTitulos(t);
        setContas(c);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (!isLoggedIn) return <Navigate to="/login" />;

  // Map de conta bancária: id → "Banco agencia/conta"
  const contaMap = useMemo(
    () => new Map(contas.map((c) => [String(c.id), `${c.agencia || ''}/${c.conta || c.numeroConta || c.id}`])),
    [contas]
  );

  function setFilter(key, val) {
    const nf = { ...filters, [key]: val };
    if (key === 'periodo') {
      const today = new Date();
      if (val === 'mes') {
        nf.dataInicio = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        nf.dataFim = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (val === 'trimestre') {
        nf.dataInicio = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split('T')[0];
        nf.dataFim = today.toISOString().split('T')[0];
      } else if (val === 'ano') {
        nf.dataInicio = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        nf.dataFim = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      } else {
        nf.dataInicio = '';
        nf.dataFim = '';
      }
    }
    setFilters(nf);
  }

  const relatorios = useMemo(() => {
    const ativos = titulos.filter((t) => t.status !== 'CANCELADO');
    return empresas.map((emp) => {
      let receber = ativos.filter((t) => t.tipo === 'RECEBER' && String(t.empresaId) === String(emp.id));
      let pagar = ativos.filter((t) => t.tipo === 'PAGAR' && String(t.empresaId) === String(emp.id));

      if (filters.dataInicio || filters.dataFim) {
        const from = filters.dataInicio || '0000-01-01';
        const to = filters.dataFim || '9999-12-31';
        receber = receber.filter((t) => t.dataVencimento >= from && t.dataVencimento <= to);
        pagar = pagar.filter((t) => t.dataVencimento >= from && t.dataVencimento <= to);
      }

      const totalReceber = receber.reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
      const totalPagar = pagar.reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
      const saldo = totalReceber - totalPagar;
      const status = (receber.length + pagar.length) === 0 ? 'Pendente' : saldo > 0 ? 'Positivo' : saldo < 0 ? 'Negativo' : 'Pendente';
      const lastDate = [...receber, ...pagar].map((t) => t.dataVencimento).filter(Boolean).sort().pop();

      return { emp, receber, pagar, saldo, status, lastDate: lastDate || null };
    });
  }, [empresas, titulos, filters.dataInicio, filters.dataFim]);

  const filtered = relatorios.filter((r) => {
    if (filters.empresa && String(r.emp.id) !== String(filters.empresa)) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  const selectStyle = { size: 'sm', borderRadius: 'lg', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' }, minW: '140px' };
  const inputStyle = { size: 'sm', borderRadius: 'lg', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' } };

  return (
    <Box p="8" w="100%">
      <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" color="#132034" mb="5">Relatórios</Text>

        <Flex gap="3" mb="6" flexWrap="wrap" alignItems="flex-end">
          <Box>
            <Text fontSize="xs" color="gray.500" mb="1" fontWeight="semibold">Período Rápido</Text>
            <Select {...selectStyle} value={filters.periodo} onChange={(e) => setFilter('periodo', e.target.value)} placeholder="Todos">
              <option value="mes">Este mês</option>
              <option value="trimestre">Últimos 3 meses</option>
              <option value="ano">Este ano</option>
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb="1" fontWeight="semibold">Data Início</Text>
            <Input {...inputStyle} type="date" value={filters.dataInicio} onChange={(e) => setFilter('dataInicio', e.target.value)} />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb="1" fontWeight="semibold">Data Fim</Text>
            <Input {...inputStyle} type="date" value={filters.dataFim} onChange={(e) => setFilter('dataFim', e.target.value)} />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb="1" fontWeight="semibold">Empresa</Text>
            <Select {...selectStyle} value={filters.empresa} onChange={(e) => setFilter('empresa', e.target.value)} placeholder="Todas">
              {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </Select>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb="1" fontWeight="semibold">Status</Text>
            <Select {...selectStyle} value={filters.status} onChange={(e) => setFilter('status', e.target.value)} placeholder="Todos">
              <option value="Positivo">Positivo</option>
              <option value="Negativo">Negativo</option>
              <option value="Pendente">Pendente</option>
            </Select>
          </Box>
          <Button size="sm" bg="#132034" color="white" borderRadius="lg" _hover={{ bg: '#1e3a5f' }}
            onClick={() => setFilters({ empresa: '', status: '', dataInicio: '', dataFim: '', periodo: '' })}>
            Limpar
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py="12"><Spinner color="#132034" /></Flex>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" py="12">
            <LuFileText size={40} style={{ margin: '0 auto', color: '#CBD5E0' }} />
            <Text color="gray.400" mt="3" fontSize="sm">
              {empresas.length === 0
                ? 'Nenhuma empresa cadastrada. Cadastre uma empresa no Patrimônio.'
                : 'Nenhum relatório encontrado com os filtros selecionados.'}
            </Text>
          </Box>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.500" textTransform="none" fontSize="sm">DATA</Th>
                  <Th color="gray.500" textTransform="none" fontSize="sm">Empresa</Th>
                  <Th color="gray.500" textTransform="none" fontSize="sm">Tipo</Th>
                  <Th color="gray.500" textTransform="none" fontSize="sm">Saldo</Th>
                  <Th color="gray.500" textTransform="none" fontSize="sm">STATUS</Th>
                  <Th color="gray.500" textTransform="none" fontSize="sm">AÇÕES</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((rel) => {
                  const sc = STATUS_EMP_MAP[rel.status];
                  return (
                    <Tr key={rel.emp.id} cursor="pointer" _hover={{ bg: 'gray.50' }} onClick={() => { setSelectedRel(rel); onOpen(); }}>
                      <Td fontSize="sm">{rel.lastDate ? formatDate(rel.lastDate) : '-'}</Td>
                      <Td fontSize="sm" fontWeight="semibold" color="#132034">{rel.emp.nome}</Td>
                      <Td fontSize="sm" color="gray.500">Financeiro</Td>
                      <Td fontSize="sm" fontWeight="semibold" color={rel.saldo >= 0 ? 'green.600' : 'red.600'}>
                        {formatCurrency(rel.saldo)}
                      </Td>
                      <Td>
                        <Badge bg={sc.bg} color={sc.color} px="2" py="1" borderRadius="md" fontSize="xs">
                          {rel.status}
                        </Badge>
                      </Td>
                      <Td onClick={(e) => e.stopPropagation()}>
                        <Menu>
                          <MenuButton as={IconButton} icon={<LuEllipsisVertical />} variant="ghost" size="sm" aria-label="Ações" />
                          <MenuList minW="160px" borderRadius="xl" shadow="lg">
                            <MenuItem fontSize="sm" onClick={() => { setSelectedRel(rel); onOpen(); }}>Ver Relatório</MenuItem>
                            <MenuItem fontSize="sm" onClick={() => exportToCSV(rel.emp, rel.receber, rel.pagar)}>Exportar CSV</MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <ReportModal
        isOpen={isOpen}
        onClose={onClose}
        empresa={selectedRel?.emp}
        receber={selectedRel?.receber || []}
        pagar={selectedRel?.pagar || []}
        contaMap={contaMap}
      />
    </Box>
  );
}

export default Relatorios;
