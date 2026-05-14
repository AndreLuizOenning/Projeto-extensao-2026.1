import React, { useState, useRef } from 'react';
import {
    Box, Flex, Text, Badge, Input, Select, Button,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    useDisclosure, useToast,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay,
    Menu, MenuButton, MenuList, MenuItem, IconButton,
} from '@chakra-ui/react';
import { LuPlus, LuEllipsisVertical } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EmpresaModal } from '../patrimonio/patrimonio';

const STATUS_MAP = {
    Ativa: { bg: 'green.100', color: 'green.700' },
    Inativa: { bg: 'gray.100', color: 'gray.600' },
};

function ConfirmDialog({ isOpen, onClose, onConfirm, name }) {
    const cancelRef = useRef();
    return (
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
            <AlertDialogOverlay>
                <AlertDialogContent borderRadius="xl">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#132034">Excluir Empresa</AlertDialogHeader>
                    <AlertDialogBody color="gray.600">
                        Tem certeza que deseja excluir <strong>{name}</strong>?<br />
                        Todos os lançamentos e entidades vinculados a ela serão desvinculados. Esta ação não pode ser desfeita.
                    </AlertDialogBody>
                    <AlertDialogFooter gap="3">
                        <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancelar</Button>
                        <Button colorScheme="red" onClick={onConfirm}>Excluir</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

function Empresas() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const { state, dispatch } = useApp();
    const { empresas } = state;

    const [filters, setFilters] = useState({ nome: '', categoria: '', status: '' });
    const [editItem, setEditItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const toast = useToast();

    if (!isLoggedIn) return <Navigate to="/login" />;

    function setFilter(key, val) { setFilters(prev => ({ ...prev, [key]: val })); }

    const filtered = empresas.filter(e => {
        if (filters.nome && !e.nome?.toLowerCase().includes(filters.nome.toLowerCase())) return false;
        if (filters.categoria && !e.categoria?.toLowerCase().includes(filters.categoria.toLowerCase())) return false;
        if (filters.status && (e.status || 'Ativa') !== filters.status) return false;
        return true;
    });

    function handleOpenAdd() { setEditItem(null); onOpen(); }
    function handleEdit(item) { setEditItem(item); onOpen(); }
    function handleDeleteClick(item) { setDeleteTarget(item); onConfirmOpen(); }

    function handleDeleteConfirm() {
        dispatch({ type: 'DELETE_EMPRESA', payload: deleteTarget.id });
        toast({ title: 'Empresa excluída.', status: 'info', duration: 2000, isClosable: true, position: 'top' });
        setDeleteTarget(null);
        onConfirmClose();
    }

    function handleSave(form) {
        if (editItem) {
            dispatch({ type: 'UPDATE_EMPRESA', payload: { ...form, id: editItem.id } });
            toast({ title: 'Empresa atualizada!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        } else {
            dispatch({ type: 'ADD_EMPRESA', payload: form });
            toast({ title: 'Empresa cadastrada!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        }
    }

    const inputStyle = { size: 'sm', borderRadius: 'md', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' } };
    const selectStyle = { ...inputStyle };

    return (
        <Box p="8" w="100%">
            <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
                <Flex justifyContent="space-between" alignItems="center" mb="6">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" color="#132034">Empresas</Text>
                        <Text fontSize="sm" color="gray.400">{empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}</Text>
                    </Box>
                    <Button bg="#132034" color="white" borderRadius="xl" leftIcon={<LuPlus />} _hover={{ bg: '#1e3a5f' }} onClick={handleOpenAdd}>
                        Nova Empresa
                    </Button>
                </Flex>

                <Flex gap="3" mb="5" flexWrap="wrap" alignItems="center">
                    <Input {...inputStyle} placeholder="Buscar por nome..." value={filters.nome} onChange={e => setFilter('nome', e.target.value)} maxW="220px" />
                    <Input {...inputStyle} placeholder="Categoria..." value={filters.categoria} onChange={e => setFilter('categoria', e.target.value)} maxW="160px" />
                    <Select {...selectStyle} value={filters.status} onChange={e => setFilter('status', e.target.value)} placeholder="Status" maxW="130px">
                        <option value="Ativa">Ativa</option>
                        <option value="Inativa">Inativa</option>
                    </Select>
                    <Button size="sm" variant="ghost" color="gray.500" onClick={() => setFilters({ nome: '', categoria: '', status: '' })}>Limpar</Button>
                </Flex>

                {filtered.length === 0 ? (
                    <Box textAlign="center" py="14">
                        <Text color="gray.400" fontSize="sm" mb="4">
                            {empresas.length === 0 ? 'Nenhuma empresa cadastrada ainda.' : 'Nenhuma empresa encontrada com os filtros selecionados.'}
                        </Text>
                        {empresas.length === 0 && (
                            <Button bg="#61B4DD" color="white" borderRadius="xl" _hover={{ bg: '#4A9DC4' }} leftIcon={<LuPlus />} onClick={handleOpenAdd}>
                                Cadastrar primeira empresa
                            </Button>
                        )}
                    </Box>
                ) : (
                    <TableContainer>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">NOME</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">Razão Social</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">CNPJ</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">Categoria</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">Cidade / Estado</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">STATUS</Th>
                                    <Th color="gray.500" textTransform="none" fontSize="sm">AÇÕES</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filtered.map(emp => {
                                    const status = emp.status || 'Ativa';
                                    const sc = STATUS_MAP[status] || STATUS_MAP.Ativa;
                                    const localidade = [emp.cidade, emp.estado].filter(Boolean).join(' / ') || '-';
                                    return (
                                        <Tr key={emp.id} _hover={{ bg: 'gray.50' }}>
                                            <Td fontSize="sm" fontWeight="bold" color="#132034">{emp.nome}</Td>
                                            <Td fontSize="sm" color="gray.600">{emp.razaoSocial || '-'}</Td>
                                            <Td fontSize="sm" color="gray.500" fontFamily="mono">{emp.cnpj || '-'}</Td>
                                            <Td fontSize="sm" color="gray.600">{emp.categoria || '-'}</Td>
                                            <Td fontSize="sm" color="gray.600">{localidade}</Td>
                                            <Td>
                                                <Badge bg={sc.bg} color={sc.color} px="2" py="1" borderRadius="md" fontSize="xs">{status}</Badge>
                                            </Td>
                                            <Td>
                                                <Menu>
                                                    <MenuButton as={IconButton} icon={<LuEllipsisVertical />} variant="ghost" size="sm" aria-label="Ações" />
                                                    <MenuList minW="140px" borderRadius="xl" shadow="lg">
                                                        <MenuItem fontSize="sm" onClick={() => handleEdit(emp)}>Editar</MenuItem>
                                                        <MenuItem fontSize="sm" color="red.500" onClick={() => handleDeleteClick(emp)}>Excluir</MenuItem>
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

            <EmpresaModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSave}
                initialData={editItem}
            />

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={onConfirmClose}
                onConfirm={handleDeleteConfirm}
                name={deleteTarget?.nome}
            />
        </Box>
    );
}

export default Empresas;
