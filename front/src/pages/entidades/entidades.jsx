import React, { useState, useRef } from 'react';
import {
    Box, Flex, Text, Badge, Select, Input, Button,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    FormControl, FormLabel, FormErrorMessage, Grid, GridItem,
    useDisclosure, useToast,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay,
    Menu, MenuButton, MenuList, MenuItem, IconButton,
} from '@chakra-ui/react';
import { LuPlus, LuEllipsisVertical } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { maskPhone, validateCNPJorCPF, validateEmail } from '../../utils/validators';

const STATUS_MAP = {
    Ativo: { bg: 'green.100', color: 'green.700' },
    Pendente: { bg: 'yellow.100', color: 'yellow.700' },
    Negativo: { bg: 'red.100', color: 'red.700' },
};

const TIPOS = ['Cliente', 'Fornecedor', 'Funcionário'];
const STATUS_OPTS = ['Ativo', 'Pendente', 'Negativo'];

const EMPTY_FORM = {
    nome: '', tipo: '', empresaId: '', contato: '', status: 'Ativo', cnpjCpf: '', endereco: '',
};

function EntidadeModal({ isOpen, onClose, onSave, initialData, empresas }) {
    const [form, setForm] = useState(initialData || EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const toast = useToast();

    React.useEffect(() => {
        setForm(initialData || EMPTY_FORM);
        setErrors({});
    }, [initialData, isOpen]);

    function handleChange(e) {
        let { name, value } = e.target;
        if (name === 'contato') {
            const digits = value.replace(/\D/g, '');
            if (digits.length <= 11 && !value.includes('@')) value = maskPhone(value);
        }
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }

    function validate() {
        const errs = {};
        if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.';
        if (!form.tipo) errs.tipo = 'Tipo é obrigatório.';

        const cnpjErr = validateCNPJorCPF(form.cnpjCpf);
        if (cnpjErr) errs.cnpjCpf = cnpjErr;

        if (form.contato && form.contato.includes('@')) {
            const emailErr = validateEmail(form.contato);
            if (emailErr) errs.contato = emailErr;
        }

        return errs;
    }

    function handleSalvar() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        onSave(form);
        onClose();
    }

    const focus = { borderColor: '#132034' };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" p="2">
                <ModalHeader color="#132034" fontSize="lg" textAlign="center">
                    {initialData ? 'Editar Entidade' : 'Cadastrar Nova Entidade'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="6">
                    <Flex flexDirection="column" gap="4">
                        <FormControl isRequired isInvalid={!!errors.nome}>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Nome</FormLabel>
                            <Input name="nome" value={form.nome} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                            <FormErrorMessage fontSize="xs">{errors.nome}</FormErrorMessage>
                        </FormControl>

                        <Grid templateColumns="1fr 1fr" gap="4">
                            <GridItem>
                                <FormControl isRequired isInvalid={!!errors.tipo}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Tipo</FormLabel>
                                    <Select name="tipo" value={form.tipo} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} placeholder="Selecione...">
                                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                    <FormErrorMessage fontSize="xs">{errors.tipo}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Empresa Vinculada</FormLabel>
                                    <Select name="empresaId" value={form.empresaId} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} placeholder="Selecione...">
                                        {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isInvalid={!!errors.contato}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Telefone / E-mail</FormLabel>
                                    <Input name="contato" value={form.contato} onChange={handleChange}
                                        placeholder="(48) 99999-0000 ou email@..." borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                    <FormErrorMessage fontSize="xs">{errors.contato}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Status</FormLabel>
                                    <Select name="status" value={form.status} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus}>
                                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isInvalid={!!errors.cnpjCpf}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">CNPJ / CPF</FormLabel>
                                    <Input name="cnpjCpf" value={form.cnpjCpf} onChange={handleChange}
                                        placeholder="CPF ou CNPJ" borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                    <FormErrorMessage fontSize="xs">{errors.cnpjCpf}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Endereço</FormLabel>
                                    <Input name="endereco" value={form.endereco} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                </FormControl>
                            </GridItem>
                        </Grid>

                        <Flex justifyContent="flex-end" gap="3" mt="2">
                            <Button variant="ghost" borderRadius="lg" onClick={onClose} color="gray.500">Cancelar</Button>
                            <Button bg="#132034" color="white" borderRadius="lg" _hover={{ bg: '#1e3a5f' }} onClick={handleSalvar}>Salvar</Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, name }) {
    const cancelRef = useRef();
    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
            <AlertDialogOverlay>
                <AlertDialogContent borderRadius="xl">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#132034">Excluir Entidade</AlertDialogHeader>
                    <AlertDialogBody color="gray.600">Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.</AlertDialogBody>
                    <AlertDialogFooter gap="3">
                        <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancelar</Button>
                        <Button colorScheme="red" onClick={onConfirm}>Excluir</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

function Entidades() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const { state, dispatch } = useApp();
    const { entidades, empresas } = state;

    const [filters, setFilters] = useState({ nome: '', tipo: '', empresaId: '', status: '' });
    const [editItem, setEditItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const toast = useToast();

    if (!isLoggedIn) return <Navigate to="/login" />;

    function setFilter(key, val) { setFilters(prev => ({ ...prev, [key]: val })); }

    const filtered = entidades.filter(e => {
        if (filters.nome && !e.nome?.toLowerCase().includes(filters.nome.toLowerCase())) return false;
        if (filters.tipo && e.tipo !== filters.tipo) return false;
        if (filters.empresaId && String(e.empresaId) !== String(filters.empresaId)) return false;
        if (filters.status && e.status !== filters.status) return false;
        return true;
    });

    const empNome = (id) => empresas.find(e => String(e.id) === String(id))?.nome || '-';

    function handleOpenAdd() { setEditItem(null); onOpen(); }
    function handleEdit(item) { setEditItem({ ...item, empresaId: String(item.empresaId || '') }); onOpen(); }
    function handleDeleteClick(item) { setDeleteTarget(item); onConfirmOpen(); }

    function handleDeleteConfirm() {
        dispatch({ type: 'DELETE_ENTIDADE', payload: deleteTarget.id });
        toast({ title: 'Entidade excluída.', status: 'info', duration: 2000, isClosable: true, position: 'top' });
        setDeleteTarget(null);
        onConfirmClose();
    }

    function handleSave(form) {
        const payload = { ...form, empresaId: form.empresaId ? Number(form.empresaId) : null };
        if (editItem) {
            dispatch({ type: 'UPDATE_ENTIDADE', payload: { ...payload, id: editItem.id } });
            toast({ title: 'Entidade atualizada!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        } else {
            dispatch({ type: 'ADD_ENTIDADE', payload });
            toast({ title: 'Entidade cadastrada!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        }
    }

    const selectStyle = { size: 'sm', borderRadius: 'md', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' } };
    const inputStyle = { size: 'sm', borderRadius: 'md', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' } };

    return (
        <Box p="8" w="100%">
            <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
                <Flex justifyContent="space-between" alignItems="center" mb="6">
                    <Text fontSize="lg" fontWeight="bold" color="#132034">Entidades</Text>
                    <Button bg="#132034" color="white" borderRadius="xl" leftIcon={<LuPlus />} _hover={{ bg: '#1e3a5f' }} onClick={handleOpenAdd}>
                        Nova Entidade
                    </Button>
                </Flex>

                <Flex gap="3" mb="5" flexWrap="wrap" alignItems="center">
                    <Input {...inputStyle} placeholder="Buscar por nome..." value={filters.nome} onChange={e => setFilter('nome', e.target.value)} maxW="200px" />
                    <Select {...selectStyle} value={filters.tipo} onChange={e => setFilter('tipo', e.target.value)} placeholder="Tipo" maxW="140px">
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Select {...selectStyle} value={filters.empresaId} onChange={e => setFilter('empresaId', e.target.value)} placeholder="Empresa" maxW="160px">
                        {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </Select>
                    <Select {...selectStyle} value={filters.status} onChange={e => setFilter('status', e.target.value)} placeholder="Status" maxW="130px">
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <Button size="sm" variant="ghost" color="gray.500" onClick={() => setFilters({ nome: '', tipo: '', empresaId: '', status: '' })}>Limpar</Button>
                </Flex>

                {filtered.length === 0 ? (
                    <Box textAlign="center" py="12">
                        <Text color="gray.400" fontSize="sm">
                            {entidades.length === 0 ? 'Nenhuma entidade cadastrada ainda.' : 'Nenhuma entidade encontrada com os filtros selecionados.'}
                        </Text>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">NOME</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">Tipo</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">Empresa Vinculada</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">Contato</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">STATUS</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">AÇÕES</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filtered.map(ent => {
                                    const sc = STATUS_MAP[ent.status] || STATUS_MAP.Pendente;
                                    return (
                                        <Tr key={ent.id} _hover={{ bg: 'gray.50' }}>
                                            <Td fontSize="sm" fontWeight="semibold" color="#132034">{ent.nome}</Td>
                                            <Td fontSize="sm" color="gray.600">{ent.tipo}</Td>
                                            <Td fontSize="sm" color="gray.600">{empNome(ent.empresaId)}</Td>
                                            <Td fontSize="sm" color="gray.600">{ent.contato || '-'}</Td>
                                            <Td>
                                                <Badge bg={sc.bg} color={sc.color} px="2" py="1" borderRadius="md" fontSize="xs">{ent.status}</Badge>
                                            </Td>
                                            <Td>
                                                <Menu>
                                                    <MenuButton as={IconButton} icon={<LuEllipsisVertical />} variant="ghost" size="sm" aria-label="Ações" />
                                                    <MenuList minW="140px" borderRadius="xl" shadow="lg">
                                                        <MenuItem fontSize="sm" onClick={() => handleEdit(ent)}>Editar</MenuItem>
                                                        <MenuItem fontSize="sm" color="red.500" onClick={() => handleDeleteClick(ent)}>Excluir</MenuItem>
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

            <EntidadeModal isOpen={isOpen} onClose={onClose} onSave={handleSave} initialData={editItem} empresas={empresas} />
            <ConfirmDialog isOpen={isConfirmOpen} onClose={onConfirmClose} onConfirm={handleDeleteConfirm} name={deleteTarget?.nome} />
        </Box>
    );
}

export default Entidades;
