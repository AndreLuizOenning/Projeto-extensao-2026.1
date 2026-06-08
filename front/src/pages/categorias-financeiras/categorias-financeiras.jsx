import React, { useEffect, useRef, useState } from 'react';
import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, Badge, Box, Button, Flex,
  FormControl, FormErrorMessage, FormLabel, Grid, IconButton, Input,
  Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalHeader, ModalOverlay, Select, Spinner, Table,
  TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useToast,
} from '@chakra-ui/react';
import { LuEllipsisVertical, LuPlus } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';
import {
  atualizarCategoriaFinanceira,
  criarCategoriaFinanceira,
  inativarCategoriaFinanceira,
  listarCategoriasFinanceiras,
} from '../../services/categoriasFinanceiras.service';

const CORES = [
  { label: 'Vermelho',      value: '#E53E3E' },
  { label: 'Laranja',       value: '#DD6B20' },
  { label: 'Amarelo',       value: '#D69E2E' },
  { label: 'Verde',         value: '#38A169' },
  { label: 'Verde-água',    value: '#319795' },
  { label: 'Azul',          value: '#3182CE' },
  { label: 'Azul escuro',   value: '#132034' },
  { label: 'Roxo',          value: '#805AD5' },
  { label: 'Rosa',          value: '#D53F8C' },
  { label: 'Cinza',         value: '#718096' },
];

const EMPTY_FORM = { nome: '', tipo: 'RECEITA', cor: '#38A169', status: 'Ativo' };

const getFriendlyError = (e) => e?.data?.message || e?.message || 'Não foi possível concluir a ação.';

function CategoriaModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
    setErrors({});
  }, [isOpen, initialData]);

  const ch = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const salvar = async () => {
    const next = {};
    if (!form.nome?.trim()) next.nome = 'Nome obrigatório';
    if (!form.tipo) next.tipo = 'Tipo obrigatório';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await onSave(form);
      onClose();
    } catch {}
  };

  const corAtual = CORES.find((c) => c.value === form.cor);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialData ? 'Editar Categoria Financeira' : 'Nova Categoria Financeira'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          <Grid gap="3">
            <FormControl isRequired isInvalid={!!errors.nome}>
              <FormLabel>Nome</FormLabel>
              <Input name="nome" value={form.nome} onChange={ch} />
              <FormErrorMessage>{errors.nome}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.tipo}>
              <FormLabel>Tipo</FormLabel>
              <Select name="tipo" value={form.tipo} onChange={ch}>
                <option value="RECEITA">RECEITA</option>
                <option value="DESPESA">DESPESA</option>
              </Select>
              <FormErrorMessage>{errors.tipo}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Cor</FormLabel>
              <Flex align="center" gap="3">
                <Box w="32px" h="32px" borderRadius="md" bg={form.cor || 'gray.200'} border="1px solid" borderColor="gray.200" flexShrink={0} />
                <Select name="cor" value={form.cor} onChange={ch} flex="1">
                  {CORES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </Flex>
            </FormControl>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select name="status" value={form.status} onChange={ch}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </Select>
            </FormControl>

            <Flex justify="flex-end" gap="3" mt="2">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button bg="#132034" color="white" _hover={{ bg: '#1e3a5f' }} onClick={salvar}>Salvar</Button>
            </Flex>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default function CategoriasFinanceiras() {
  const isLoggedIn = isAuthenticated();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef();

  const carregar = async () => {
    try {
      setLoading(true);
      setError('');
      setItems(await listarCategoriasFinanceiras());
    } catch (e) {
      setError(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  if (!isLoggedIn) return <Navigate to="/login" />;

  const save = async (form) => {
    try {
      if (editItem) await atualizarCategoriaFinanceira(editItem.id, form);
      else await criarCategoriaFinanceira(form);
      await carregar();
      toast({ title: 'Categoria salva com sucesso.', status: 'success', position: 'top' });
    } catch (e) {
      toast({ title: getFriendlyError(e), status: 'error', position: 'top' });
      throw e;
    }
  };

  const remove = async () => {
    try {
      await inativarCategoriaFinanceira(deleteTarget.id);
      await carregar();
      onConfirmClose();
      toast({ title: 'Categoria inativada.', status: 'info', position: 'top' });
    } catch (e) {
      toast({ title: getFriendlyError(e), status: 'error', position: 'top' });
    }
  };

  return (
    <Box p="8" w="100%">
      <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="4">
          <Text fontWeight="bold" fontSize="lg" color="#132034">Categorias Financeiras</Text>
          <Button bg="#132034" color="white" leftIcon={<LuPlus />} _hover={{ bg: '#1e3a5f' }}
            onClick={() => { setEditItem(null); onOpen(); }}>
            Nova Categoria
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py="10"><Spinner color="#132034" /></Flex>
        ) : error ? (
          <Box textAlign="center" py="8">
            <Text color="red.500" mb="3">{error}</Text>
            <Button onClick={carregar}>Tentar novamente</Button>
          </Box>
        ) : items.length === 0 ? (
          <Box textAlign="center" py="12">
            <Text color="gray.500">Nenhuma categoria financeira cadastrada.</Text>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome</Th><Th>Tipo</Th><Th>Cor</Th><Th>Status</Th><Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item) => (
                  <Tr key={item.id}>
                    <Td fontWeight="semibold">{item.nome}</Td>
                    <Td>
                      <Badge colorScheme={item.tipo === 'RECEITA' ? 'green' : 'red'}>{item.tipo}</Badge>
                    </Td>
                    <Td>
                      {item.cor ? (
                        <Flex align="center" gap="2">
                          <Box w="16px" h="16px" borderRadius="sm" bg={item.cor} border="1px solid" borderColor="gray.200" />
                          <Text fontSize="sm" color="gray.600">
                            {CORES.find((c) => c.value === item.cor)?.label || item.cor}
                          </Text>
                        </Flex>
                      ) : '-'}
                    </Td>
                    <Td><Badge>{item.status || 'Ativo'}</Badge></Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<LuEllipsisVertical />} variant="ghost" size="sm" aria-label="Ações" />
                        <MenuList>
                          <MenuItem onClick={() => { setEditItem(item); onOpen(); }}>Editar</MenuItem>
                          <MenuItem color="red.500" onClick={() => { setDeleteTarget(item); onConfirmOpen(); }}>Inativar</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <CategoriaModal isOpen={isOpen} onClose={onClose} onSave={save} initialData={editItem} />

      <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Inativar Categoria</AlertDialogHeader>
            <AlertDialogBody>Tem certeza que deseja inativar <strong>{deleteTarget?.nome}</strong>?</AlertDialogBody>
            <AlertDialogFooter gap="3">
              <Button ref={cancelRef} onClick={onConfirmClose} variant="ghost">Cancelar</Button>
              <Button colorScheme="red" onClick={remove}>Inativar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
