import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { LuEllipsisVertical, LuPlus } from 'react-icons/lu';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';
import {
  atualizarContaBancaria,
  criarContaBancaria,
  inativarContaBancaria,
  listarContasBancarias,
} from '../../services/contasBancarias.service';
import { listarEmpresas } from '../../services/empresas.service';
import { listarBancos } from '../../services/bancos.service';

const EMPTY_FORM = {
  empresaId: '',
  bancoId: '',
  agencia: '',
  conta: '',
  digito: '',
  pix: '',
  tipoConta: 'CORRENTE',
  saldoInicial: '0,00',
};

const TIPO_CONTA_LABEL = {
  CORRENTE: 'Conta Corrente',
  POUPANCA: 'Conta Poupança',
};

const getFriendlyError = (error) => error?.data?.message || error?.message || 'Não foi possível concluir a ação. Tente novamente.';

const formatMoney = (value) => Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ContaModal({ isOpen, onClose, onSave, initialData, empresas, bancos }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData, saldoInicial: formatMoney(initialData.saldoInicial ?? 0) } : EMPTY_FORM);
    setErrors({});
  }, [isOpen, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.empresaId) nextErrors.empresaId = 'Empresa obrigatória';
    if (!form.bancoId) nextErrors.bancoId = 'Banco obrigatório';
    if (!form.tipoConta) nextErrors.tipoConta = 'Tipo de conta obrigatório';

    const normalizedSaldo = Number(String(form.saldoInicial).replace('.', '').replace(',', '.'));
    if (Number.isNaN(normalizedSaldo)) nextErrors.saldoInicial = 'Informe um saldo inicial válido';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await onSave(form);
      onClose();
    } catch {
      // mantém modal aberto quando salvar falhar
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialData ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          <Grid gap="3">
            <FormControl isRequired isInvalid={!!errors.empresaId}>
              <FormLabel>Empresa</FormLabel>
              <Select name="empresaId" value={form.empresaId} onChange={handleChange} placeholder="Selecione a empresa">
                {empresas.map((empresa) => (<option key={empresa.id} value={empresa.id}>{empresa.nome}</option>))}
              </Select>
              <FormErrorMessage>{errors.empresaId}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.bancoId}>
              <FormLabel>Banco</FormLabel>
              <Select name="bancoId" value={form.bancoId} onChange={handleChange} placeholder="Selecione o banco">
                {bancos.map((banco) => (<option key={banco.id} value={banco.id}>{banco.nome}</option>))}
              </Select>
              <FormErrorMessage>{errors.bancoId}</FormErrorMessage>
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap="3">
              <FormControl><FormLabel>Agência</FormLabel><Input name="agencia" value={form.agencia} onChange={handleChange} /></FormControl>
              <FormControl><FormLabel>Conta</FormLabel><Input name="conta" value={form.conta} onChange={handleChange} /></FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap="3">
              <FormControl><FormLabel>Dígito</FormLabel><Input name="digito" value={form.digito} onChange={handleChange} maxLength={20} /></FormControl>
              <FormControl><FormLabel>PIX</FormLabel><Input name="pix" value={form.pix} onChange={handleChange} /></FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap="3">
              <FormControl isRequired isInvalid={!!errors.tipoConta}>
                <FormLabel>Tipo de Conta</FormLabel>
                <Select name="tipoConta" value={form.tipoConta} onChange={handleChange}>
                  <option value="CORRENTE">CORRENTE</option>
                  <option value="POUPANCA">POUPANCA</option>
                </Select>
                <FormErrorMessage>{errors.tipoConta}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.saldoInicial}>
                <FormLabel>Saldo Inicial</FormLabel>
                <Input name="saldoInicial" value={form.saldoInicial} onChange={handleChange} placeholder="0,00" />
                <FormErrorMessage>{errors.saldoInicial}</FormErrorMessage>
              </FormControl>
            </Grid>

            <Flex justify="flex-end" gap="3" mt="2">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button bg="#132034" color="white" _hover={{ bg: '#1e3a5f' }} onClick={handleSave}>Salvar</Button>
            </Flex>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default function ContasBancarias() {
  const isLoggedIn = isAuthenticated();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contas, setContas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  const carregar = async () => {
    try {
      setLoading(true);
      setError('');
      const [contasData, empresasData, bancosData] = await Promise.all([
        listarContasBancarias(),
        listarEmpresas(),
        listarBancos(),
      ]);
      setContas(contasData);
      setEmpresas(empresasData);
      setBancos(bancosData);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const empresaMap = useMemo(() => new Map(empresas.map((e) => [String(e.id), e.nome])), [empresas]);
  const bancoMap = useMemo(() => new Map(bancos.map((b) => [String(b.id), b.nome])), [bancos]);

  const save = async (form) => {
    try {
      if (editItem) await atualizarContaBancaria(editItem.id, form);
      else await criarContaBancaria(form);

      await carregar();
      toast({ title: editItem ? 'Conta bancária atualizada.' : 'Conta bancária criada.', status: 'success', position: 'top' });
    } catch (err) {
      toast({ title: getFriendlyError(err), status: 'error', position: 'top' });
      throw err;
    }
  };

  const remove = async () => {
    try {
      await inativarContaBancaria(deleteTarget.id);
      await carregar();
      onConfirmClose();
      setDeleteTarget(null);
      toast({ title: 'Conta bancária inativada.', status: 'info', position: 'top' });
    } catch (err) {
      toast({ title: getFriendlyError(err), status: 'error', position: 'top' });
    }
  };

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <Box p="8" w="100%">
      <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="4">
          <Text fontWeight="bold" fontSize="lg" color="#132034">Contas Bancárias</Text>
          <Button bg="#132034" color="white" leftIcon={<LuPlus />} _hover={{ bg: '#1e3a5f' }} onClick={() => { setEditItem(null); onOpen(); }}>
            Nova Conta
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py="10"><Spinner color="#132034" /></Flex>
        ) : error ? (
          <Box textAlign="center" py="8">
            <Text color="red.500" mb="4">Erro ao carregar contas bancárias: {error}</Text>
            <Button onClick={carregar}>Tentar novamente</Button>
          </Box>
        ) : contas.length === 0 ? (
          <Box textAlign="center" py="12"><Text color="gray.500">Nenhuma conta bancária cadastrada.</Text></Box>
        ) : (
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Empresa</Th><Th>Banco</Th><Th>Agência</Th><Th>Conta</Th><Th>Dígito</Th><Th>PIX</Th><Th>Tipo</Th><Th>Saldo Inicial</Th><Th>Saldo Atual</Th><Th>Status</Th><Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contas.map((conta) => (
                  <Tr key={conta.id}>
                    <Td>{empresaMap.get(String(conta.empresaId)) || '-'}</Td>
                    <Td>{bancoMap.get(String(conta.bancoId)) || '-'}</Td>
                    <Td>{conta.agencia || '-'}</Td>
                    <Td>{conta.conta || '-'}</Td>
                    <Td>{conta.digito || '-'}</Td>
                    <Td>{conta.pix || '-'}</Td>
                    <Td>{TIPO_CONTA_LABEL[conta.tipoConta] || conta.tipoConta}</Td>
                    <Td>{formatMoney(conta.saldoInicial)}</Td>
                    <Td>{formatMoney(conta.saldoAtual)}</Td>
                    <Td><Badge>{conta.status || 'ATIVO'}</Badge></Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<LuEllipsisVertical />} variant="ghost" size="sm" aria-label="Ações" />
                        <MenuList>
                          <MenuItem onClick={() => { setEditItem(conta); onOpen(); }}>Editar</MenuItem>
                          <MenuItem color="red.500" onClick={() => { setDeleteTarget(conta); onConfirmOpen(); }}>Inativar</MenuItem>
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

      <ContaModal isOpen={isOpen} onClose={onClose} onSave={save} initialData={editItem} empresas={empresas} bancos={bancos} />

      <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Inativar Conta Bancária</AlertDialogHeader>
            <AlertDialogBody>Tem certeza que deseja inativar esta conta bancária?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose} variant="ghost">Cancelar</Button>
              <Button colorScheme="red" ml="3" onClick={remove}>Inativar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
