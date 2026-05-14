import React, { useState, useMemo, useRef } from 'react';
import {
    Box, Flex, Text, Button, Badge, Input, Select, SimpleGrid,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    useDisclosure, FormControl, FormLabel, FormErrorMessage, Textarea, Grid, GridItem, useToast,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay,
} from '@chakra-ui/react';
import { LuPencil, LuTrash2, LuPlus, LuArrowUpRight, LuArrowDownRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate, formatCurrency } from '../../utils/format';
import { validatePositiveNumber } from '../../utils/validators';

const STATUS_MAP = {
    Previsto: { bg: 'purple.100', color: 'purple.700' },
    Vencido: { bg: 'red.100', color: 'red.700' },
    Pago: { bg: 'green.100', color: 'green.700' },
};

const PER_PAGE = 10;

const EMPTY_FORM = {
    descricao: '', valor: '', dataEmissao: '', dataVencimento: '',
    empresaId: '', contaBancaria: '', entidadeId: '', observacoes: '', status: 'Previsto',
};

function StatCard({ title, value, isPositive }) {
    return (
        <Box bg="white" p="5" borderRadius="xl" boxShadow="sm">
            <Flex justifyContent="space-between" alignItems="center" mb="3">
                <Text fontWeight="semibold" color="gray.500" fontSize="sm">{title}</Text>
                <Badge bg={isPositive ? 'green.100' : 'red.100'} color={isPositive ? 'green.700' : 'red.700'} px="2" py="1" borderRadius="md" display="flex" alignItems="center" gap="1">
                    {isPositive ? <LuArrowUpRight /> : <LuArrowDownRight />}
                </Badge>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="#132034">{value}</Text>
        </Box>
    );
}

function ContaModal({ isOpen, onClose, onSave, initialData, tipo, empresas, entidades }) {
    const [form, setForm] = useState(initialData || EMPTY_FORM);
    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        setForm(initialData || EMPTY_FORM);
        setErrors({});
    }, [initialData, isOpen]);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }

    function validate() {
        const errs = {};
        if (!form.descricao.trim()) errs.descricao = 'Descrição é obrigatória.';
        const valorErr = validatePositiveNumber(form.valor);
        if (valorErr) errs.valor = valorErr;
        if (!form.dataVencimento) errs.dataVencimento = 'Data de vencimento é obrigatória.';
        return errs;
    }

    function handleSalvar() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        onSave({ ...form, valor: parseFloat(form.valor) });
        onClose();
    }

    const label = tipo === 'pagar' ? 'Pagar' : 'Receber';
    const focus = { borderColor: '#132034' };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" p="2">
                <ModalHeader color="#132034" fontSize="lg" textAlign="center">
                    {initialData ? `Editar Conta a ${label}` : `Nova Conta a ${label}`}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="6">
                    <Flex flexDirection="column" gap="4">
                        <FormControl isRequired isInvalid={!!errors.descricao}>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Descrição</FormLabel>
                            <Input name="descricao" value={form.descricao} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                            <FormErrorMessage fontSize="xs">{errors.descricao}</FormErrorMessage>
                        </FormControl>

                        <Grid templateColumns="1fr 1fr" gap="4">
                            <GridItem>
                                <FormControl isRequired isInvalid={!!errors.valor}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Valor (R$)</FormLabel>
                                    <Input name="valor" type="number" min="0.01" step="0.01" value={form.valor} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                    <FormErrorMessage fontSize="xs">{errors.valor}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Status</FormLabel>
                                    <Select name="status" value={form.status} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus}>
                                        <option value="Previsto">Previsto</option>
                                        <option value="Vencido">Vencido</option>
                                        <option value="Pago">Pago</option>
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Data de Emissão</FormLabel>
                                    <Input name="dataEmissao" type="date" value={form.dataEmissao} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired isInvalid={!!errors.dataVencimento}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Data de Vencimento</FormLabel>
                                    <Input name="dataVencimento" type="date" value={form.dataVencimento} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                    <FormErrorMessage fontSize="xs">{errors.dataVencimento}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                        </Grid>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Empresa Vinculada</FormLabel>
                            <Select name="empresaId" value={form.empresaId} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} placeholder="Selecione...">
                                {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Conta Bancária</FormLabel>
                            <Input name="contaBancaria" value={form.contaBancaria} onChange={handleChange} placeholder="Ex: Banco Itaú - Ag. 0001" borderRadius="lg" borderColor="gray.200" _focus={focus} />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">{tipo === 'pagar' ? 'Fornecedor / Cliente' : 'Cliente / Pagador'}</FormLabel>
                            <Select name="entidadeId" value={form.entidadeId} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} placeholder="Selecione...">
                                {entidades.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Observações</FormLabel>
                            <Textarea name="observacoes" value={form.observacoes} onChange={handleChange} borderRadius="lg" borderColor="gray.200" rows={2} _focus={focus} />
                        </FormControl>

                        <Flex justifyContent="flex-end" gap="3" mt="2">
                            <Button variant="ghost" borderRadius="lg" onClick={onClose} color="gray.500">Cancelar</Button>
                            <Button bg="#61B4DD" color="white" borderRadius="lg" _hover={{ bg: '#4A9DC4' }} onClick={handleSalvar}>Salvar</Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, body }) {
    const cancelRef = useRef();
    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
            <AlertDialogOverlay>
                <AlertDialogContent borderRadius="xl">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#132034">{title}</AlertDialogHeader>
                    <AlertDialogBody color="gray.600">{body}</AlertDialogBody>
                    <AlertDialogFooter gap="3">
                        <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancelar</Button>
                        <Button colorScheme="red" onClick={onConfirm}>Excluir</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

function Tabela({ contas, tipo, empresas, entidades, onEdit, onDelete, page, setPage }) {
    const [filters, setFilters] = useState({ descricao: '', valor: '', data: '', contaBancaria: '', empresa: '', status: '' });

    function setFilter(key, val) {
        setFilters(prev => ({ ...prev, [key]: val }));
        setPage(1);
    }

    const uniqueBancos = [...new Set(contas.map(c => c.contaBancaria).filter(Boolean))];
    const uniqueStatus = ['Previsto', 'Vencido', 'Pago'];

    const filtered = useMemo(() => {
        let result = contas.filter(c => {
            if (filters.descricao && !c.descricao?.toLowerCase().includes(filters.descricao.toLowerCase())) return false;
            if (filters.data && c.dataVencimento !== filters.data) return false;
            if (filters.contaBancaria && c.contaBancaria !== filters.contaBancaria) return false;
            if (filters.empresa && String(c.empresaId) !== String(filters.empresa)) return false;
            if (filters.status && c.status !== filters.status) return false;
            return true;
        });
        if (filters.valor === 'asc') result = [...result].sort((a, b) => Number(a.valor) - Number(b.valor));
        if (filters.valor === 'desc') result = [...result].sort((a, b) => Number(b.valor) - Number(a.valor));
        return result;
    }, [contas, filters]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const empNome = (id) => empresas.find(e => String(e.id) === String(id))?.nome || '-';

    const inputStyle = { size: 'sm', borderRadius: 'md', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' }, fontSize: 'xs' };

    return (
        <Box>
            <TableContainer>
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr bg="gray.50">
                            <Th w="22%">
                                <Input {...inputStyle} placeholder="Buscar descrição..." value={filters.descricao} onChange={e => setFilter('descricao', e.target.value)} />
                            </Th>
                            <Th w="12%">
                                <Select {...inputStyle} value={filters.valor} onChange={e => setFilter('valor', e.target.value)} placeholder="Valor">
                                    <option value="asc">Menor → Maior</option>
                                    <option value="desc">Maior → Menor</option>
                                </Select>
                            </Th>
                            <Th w="14%">
                                <Input {...inputStyle} type="date" value={filters.data} onChange={e => setFilter('data', e.target.value)} />
                            </Th>
                            <Th w="18%">
                                <Select {...inputStyle} value={filters.contaBancaria} onChange={e => setFilter('contaBancaria', e.target.value)} placeholder="Conta Bancária">
                                    {uniqueBancos.map(b => <option key={b} value={b}>{b}</option>)}
                                </Select>
                            </Th>
                            <Th w="16%">
                                <Select {...inputStyle} value={filters.empresa} onChange={e => setFilter('empresa', e.target.value)} placeholder="Empresa">
                                    {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                </Select>
                            </Th>
                            <Th w="12%">
                                <Select {...inputStyle} value={filters.status} onChange={e => setFilter('status', e.target.value)} placeholder="Status">
                                    {uniqueStatus.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                            </Th>
                            <Th w="6%"></Th>
                        </Tr>
                        <Tr>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Descrição</Th>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Valor</Th>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Data Vencimento</Th>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Conta Bancária</Th>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Empresa</Th>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Status</Th>
                            <Th color="gray.500" fontSize="xs" textTransform="none">Ações</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginated.length === 0 ? (
                            <Tr>
                                <Td colSpan={7} textAlign="center" py="8" color="gray.400" fontSize="sm">Nenhum lançamento encontrado.</Td>
                            </Tr>
                        ) : paginated.map(c => {
                            const sc = STATUS_MAP[c.status] || STATUS_MAP.Previsto;
                            return (
                                <Tr key={c.id} _hover={{ bg: 'gray.50' }}>
                                    <Td fontSize="sm" fontWeight="medium" color="#132034">{c.descricao}</Td>
                                    <Td fontSize="sm" fontWeight="semibold">{formatCurrency(c.valor)}</Td>
                                    <Td fontSize="sm">{formatDate(c.dataVencimento)}</Td>
                                    <Td fontSize="sm" color="gray.600">{c.contaBancaria || '-'}</Td>
                                    <Td fontSize="sm" color="gray.600">{empNome(c.empresaId)}</Td>
                                    <Td>
                                        <Badge bg={sc.bg} color={sc.color} px="2" py="1" borderRadius="md" fontSize="xs">{c.status}</Badge>
                                    </Td>
                                    <Td>
                                        <Flex gap="1">
                                            <IconButton icon={<LuPencil size={14} />} size="xs" variant="ghost" colorScheme="blue" aria-label="Editar" onClick={() => onEdit(c)} />
                                            <IconButton icon={<LuTrash2 size={14} />} size="xs" variant="ghost" colorScheme="red" aria-label="Excluir" onClick={() => onDelete(c)} />
                                        </Flex>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>

            <Flex justifyContent="center" alignItems="center" gap="3" pt="4" pb="2">
                <IconButton icon={<LuChevronLeft />} size="sm" variant="ghost" isDisabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Anterior" />
                <Text fontSize="sm" color="gray.500">{page} de {totalPages}</Text>
                <IconButton icon={<LuChevronRight />} size="sm" variant="ghost" isDisabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Próxima" />
            </Flex>
        </Box>
    );
}

function Lancamentos() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const { state, dispatch } = useApp();
    const { empresas, entidades, contasAPagar, contasAReceber } = state;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [tab, setTab] = useState('pagar');
    const [editItem, setEditItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [pagePagar, setPagePagar] = useState(1);
    const [pageReceber, setPageReceber] = useState(1);
    const toast = useToast();

    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

    if (!isLoggedIn) return <Navigate to="/login" />;

    const sumPago = (list) => list.filter(c => c.status === 'Pago').reduce((s, c) => s + Number(c.valor || 0), 0);
    const sumAtivo = (list) => list.filter(c => c.status !== 'Pago').reduce((s, c) => s + Number(c.valor || 0), 0);

    const saldoAtual = sumPago(contasAReceber) - sumPago(contasAPagar);
    const totalReceber = sumAtivo(contasAReceber);
    const totalPagar = sumAtivo(contasAPagar);
    const previsaoCaixa = saldoAtual + totalReceber - totalPagar;

    function handleOpenAdd() {
        setEditItem(null);
        onOpen();
    }

    function handleEdit(item) {
        setEditItem({ ...item, valor: String(item.valor), empresaId: String(item.empresaId || ''), entidadeId: String(item.entidadeId || '') });
        onOpen();
    }

    function handleDeleteClick(item) {
        setDeleteTarget(item);
        onConfirmOpen();
    }

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        dispatch({ type: tab === 'pagar' ? 'DELETE_CONTA_PAGAR' : 'DELETE_CONTA_RECEBER', payload: deleteTarget.id });
        toast({ title: 'Lançamento excluído.', status: 'info', duration: 2000, isClosable: true, position: 'top' });
        setDeleteTarget(null);
        onConfirmClose();
    }

    function handleSave(form) {
        const payload = {
            ...form,
            empresaId: form.empresaId ? Number(form.empresaId) : null,
            entidadeId: form.entidadeId ? Number(form.entidadeId) : null,
        };
        if (editItem) {
            dispatch({ type: tab === 'pagar' ? 'UPDATE_CONTA_PAGAR' : 'UPDATE_CONTA_RECEBER', payload: { ...payload, id: editItem.id } });
            toast({ title: 'Lançamento atualizado!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        } else {
            dispatch({ type: tab === 'pagar' ? 'ADD_CONTA_PAGAR' : 'ADD_CONTA_RECEBER', payload });
            toast({ title: 'Lançamento cadastrado!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        }
    }

    const tabStyle = (t) => ({
        px: '6', py: '2', borderRadius: 'xl', cursor: 'pointer', fontWeight: 'semibold', fontSize: 'sm',
        bg: tab === t ? '#132034' : 'white',
        color: tab === t ? 'white' : '#132034',
        border: '2px solid',
        borderColor: tab === t ? '#132034' : 'gray.200',
        _hover: { bg: tab === t ? '#132034' : 'gray.50' },
    });

    return (
        <Box p="8" w="100%">
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="6" mb="8">
                <StatCard title="Saldo Atual" value={formatCurrency(saldoAtual)} isPositive={saldoAtual >= 0} />
                <StatCard title="Previsão de Caixa" value={formatCurrency(previsaoCaixa)} isPositive={previsaoCaixa >= 0} />
                <StatCard title="Total a Receber" value={formatCurrency(totalReceber)} isPositive={true} />
                <StatCard title="Total a Pagar" value={formatCurrency(totalPagar)} isPositive={false} />
            </SimpleGrid>

            <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
                <Flex justifyContent="space-between" alignItems="center" mb="6">
                    <Flex gap="3">
                        <Box {...tabStyle('pagar')} onClick={() => setTab('pagar')}>Contas a Pagar</Box>
                        <Box {...tabStyle('receber')} onClick={() => setTab('receber')}>Contas a Receber</Box>
                    </Flex>
                    <Button bg="#61B4DD" color="white" borderRadius="xl" leftIcon={<LuPlus />} _hover={{ bg: '#4A9DC4' }} onClick={handleOpenAdd}>
                        Nova Conta
                    </Button>
                </Flex>

                <Text fontSize="lg" fontWeight="bold" color="#132034" mb="4">
                    {tab === 'pagar' ? 'Contas a Pagar' : 'Contas a Receber'}
                </Text>

                <Tabela
                    contas={tab === 'pagar' ? contasAPagar : contasAReceber}
                    tipo={tab}
                    empresas={empresas}
                    entidades={entidades}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    page={tab === 'pagar' ? pagePagar : pageReceber}
                    setPage={tab === 'pagar' ? setPagePagar : setPageReceber}
                />
            </Box>

            <ContaModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSave}
                initialData={editItem}
                tipo={tab}
                empresas={empresas}
                entidades={entidades}
            />

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={onConfirmClose}
                onConfirm={handleDeleteConfirm}
                title="Excluir lançamento"
                body={`Tem certeza que deseja excluir "${deleteTarget?.descricao}"? Esta ação não pode ser desfeita.`}
            />
        </Box>
    );
}

export default Lancamentos;
