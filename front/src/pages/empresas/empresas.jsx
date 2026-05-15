import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Flex, Text, Badge, Input, Select, Button,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  useDisclosure, useToast, Spinner,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
  Menu, MenuButton, MenuList, MenuItem, IconButton,
} from '@chakra-ui/react';
import { LuPlus, LuEllipsisVertical } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';
import { EmpresaModal } from '../patrimonio/patrimonio';
import { atualizarEmpresa, criarEmpresa, inativarEmpresa, listarEmpresas } from '../../services/empresas.service';

const STATUS_MAP = {
  Ativa: { bg: 'green.100', color: 'green.700' },
  Inativa: { bg: 'gray.100', color: 'gray.600' },
};

const getFriendlyError = (error) => error?.data?.message || error?.message || 'Não foi possível concluir a ação. Tente novamente.';

function ConfirmDialog({ isOpen, onClose, onConfirm, name }) {
  const cancelRef = useRef();
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#132034">Inativar Empresa</AlertDialogHeader>
          <AlertDialogBody color="gray.600">
            Tem certeza que deseja inativar <strong>{name}</strong>?
          </AlertDialogBody>
          <AlertDialogFooter gap="3">
            <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancelar</Button>
            <Button colorScheme="red" onClick={onConfirm}>Inativar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

function Empresas() {
  const isLoggedIn = isAuthenticated();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ nome: '', categoria: '', status: '' });
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setError('');
        setEmpresas(await listarEmpresas());
      } catch (err) {
        setError(getFriendlyError(err));
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (!isLoggedIn) return <Navigate to="/login" />;

  function setFilter(key, val) { setFilters((prev) => ({ ...prev, [key]: val })); }

  const filtered = empresas.filter((e) => {
    if (filters.nome && !e.nome?.toLowerCase().includes(filters.nome.toLowerCase())) return false;
    if (filters.categoria && !e.categoria?.toLowerCase().includes(filters.categoria.toLowerCase())) return false;
    if (filters.status && (e.status || 'Ativa') !== filters.status) return false;
    return true;
  });

  function handleOpenAdd() { setEditItem(null); onOpen(); }
  function handleEdit(item) { setEditItem(item); onOpen(); }
  function handleDeleteClick(item) { setDeleteTarget(item); onConfirmOpen(); }

  async function refreshList() {
    setEmpresas(await listarEmpresas());
  }

  async function handleDeleteConfirm() {
    try {
      await inativarEmpresa(deleteTarget.id);
      await refreshList();
      toast({ title: 'Empresa inativada.', status: 'info', duration: 2000, isClosable: true, position: 'top' });
      setDeleteTarget(null);
      onConfirmClose();
    } catch (err) {
      toast({ title: getFriendlyError(err), status: 'error', duration: 3000, isClosable: true, position: 'top' });
    }
  }

  async function handleSave(form) {
    try {
      if (editItem) {
        await atualizarEmpresa(editItem.id, form);
      } else {
        await criarEmpresa(form);
      }
      await refreshList();
      toast({ title: editItem ? 'Empresa atualizada!' : 'Empresa cadastrada!', status: 'success', duration: 2000, isClosable: true, position: 'top' });
      onClose();
    } catch (err) {
      toast({ title: getFriendlyError(err), status: 'error', duration: 3500, isClosable: true, position: 'top' });
      throw err;
    }
  }

  const inputStyle = { size: 'sm', borderRadius: 'md', borderColor: 'gray.200', bg: 'white', _focus: { borderColor: '#132034' } };

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
          <Input {...inputStyle} placeholder="Buscar por nome..." value={filters.nome} onChange={(e) => setFilter('nome', e.target.value)} maxW="220px" />
          <Input {...inputStyle} placeholder="Categoria..." value={filters.categoria} onChange={(e) => setFilter('categoria', e.target.value)} maxW="160px" />
          <Select {...inputStyle} value={filters.status} onChange={(e) => setFilter('status', e.target.value)} placeholder="Status" maxW="130px">
            <option value="Ativa">Ativa</option>
            <option value="Inativa">Inativa</option>
          </Select>
          <Button size="sm" variant="ghost" color="gray.500" onClick={() => setFilters({ nome: '', categoria: '', status: '' })}>Limpar</Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py="12"><Spinner color="#132034" /></Flex>
        ) : error ? (
          <Box textAlign="center" py="10">
            <Text color="red.500" fontSize="sm" mb="4">Erro ao carregar empresas: {error}</Text>
            <Button onClick={refreshList}>Tentar novamente</Button>
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" py="14">
            <Text color="gray.400" fontSize="sm" mb="4">
              {empresas.length === 0 ? 'Nenhuma empresa cadastrada ainda.' : 'Nenhuma empresa encontrada com os filtros selecionados.'}
            </Text>
          </Box>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead><Tr><Th>NOME</Th><Th>Razão Social</Th><Th>CNPJ</Th><Th>Categoria</Th><Th>Cidade / Estado</Th><Th>STATUS</Th><Th>AÇÕES</Th></Tr></Thead>
              <Tbody>
                {filtered.map((emp) => {
                  const status = emp.status || 'Ativa';
                  const sc = STATUS_MAP[status] || STATUS_MAP.Ativa;
                  const localidade = [emp.cidade, emp.estado].filter(Boolean).join(' / ') || '-';
                  return (
                    <Tr key={emp.id} _hover={{ bg: 'gray.50' }}>
                      <Td fontWeight="bold" color="#132034">{emp.nome}</Td>
                      <Td>{emp.razaoSocial || '-'}</Td>
                      <Td fontFamily="mono">{emp.cnpj || '-'}</Td>
                      <Td>{emp.categoria || '-'}</Td>
                      <Td>{localidade}</Td>
                      <Td><Badge bg={sc.bg} color={sc.color}>{status}</Badge></Td>
                      <Td>
                        <Menu>
                          <MenuButton as={IconButton} icon={<LuEllipsisVertical />} variant="ghost" size="sm" aria-label="Ações" />
                          <MenuList minW="140px" borderRadius="xl" shadow="lg">
                            <MenuItem fontSize="sm" onClick={() => handleEdit(emp)}>Editar</MenuItem>
                            <MenuItem fontSize="sm" color="red.500" onClick={() => handleDeleteClick(emp)}>Inativar</MenuItem>
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

      <EmpresaModal isOpen={isOpen} onClose={onClose} onSave={handleSave} initialData={editItem} />
      <ConfirmDialog isOpen={isConfirmOpen} onClose={onConfirmClose} onConfirm={handleDeleteConfirm} name={deleteTarget?.nome} />
    </Box>
  );
}

export default Empresas;
