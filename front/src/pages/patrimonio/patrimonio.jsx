import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Flex, Text, SimpleGrid, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalCloseButton, useDisclosure, useToast,
    Input, Textarea, Select, FormControl, FormLabel, FormErrorMessage,
    Grid, GridItem, Spinner,
} from '@chakra-ui/react';
import { Navigate, useSearchParams } from 'react-router-dom';

const ESTADOS_BR = [
    { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' },
    { uf: 'SC', nome: 'Santa Catarina' }, { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' },
];
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/format';
import { maskCNPJ, maskCEP, validateCNPJ, validateCEP } from '../../utils/validators';
import { isAuthenticated } from '../../utils/session';
import { listarEmpresas, criarEmpresa } from '../../services/empresas.service';
import { listarTitulos } from '../../services/titulos.service';

function EmpresaCard({ nome, total }) {
    return (
        <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
            <Text fontWeight="semibold" color="gray.500" fontSize="sm" mb="3">{nome}</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.400" bg="green.50" px="3" py="1" borderRadius="md" display="inline-block">
                {formatCurrency(total)}
            </Text>
        </Box>
    );
}

export function EmpresaModal({ isOpen, onClose, onSave, initialData }) {
    const emptyForm = {
        nome: '', razaoSocial: '', cnpj: '', categoria: '',
        cep: '', pais: 'Brasil', estado: '', cidade: '', rua: '', descricao: '', status: 'Ativa'
    };
    const [form, setForm] = useState(initialData || emptyForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(initialData || emptyForm);
        setErrors({});
    }, [initialData, isOpen]);

    function handleChange(e) {
        const { name, value } = e.target;
        let v = value;
        if (name === 'cnpj') v = maskCNPJ(value);
        if (name === 'cep') v = maskCEP(value);
        setForm(prev => ({ ...prev, [name]: v }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }

    function validate() {
        const errs = {};
        if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.';
        if (!form.razaoSocial?.trim()) errs.razaoSocial = 'Razão social é obrigatória.';
        if (!form.cnpj.trim()) {
            errs.cnpj = 'CNPJ é obrigatório.';
        } else if (!validateCNPJ(form.cnpj)) {
            errs.cnpj = 'CNPJ inválido.';
        }
        const cepErr = validateCEP(form.cep);
        if (cepErr) errs.cep = cepErr;
        return errs;
    }

    async function handleSalvar() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            await onSave(form);
            if (onClose) onClose();
        } catch {
            // Tratamento exibido pela tela chamadora para manter modal aberto em caso de falha.
        }
    }

    const focus = { borderColor: '#132034', boxShadow: '0 0 0 1px #132034' };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" p="2">
                <ModalHeader color="#132034" fontSize="lg" textAlign="center">
                    {initialData ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="6">
                    <Flex flexDirection="column" gap="4">
                        <FormControl isRequired isInvalid={!!errors.nome}>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Nome da Empresa</FormLabel>
                            <Input name="nome" value={form.nome} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                            <FormErrorMessage fontSize="xs">{errors.nome}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.razaoSocial}>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Razão Social</FormLabel>
                            <Input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                            <FormErrorMessage fontSize="xs">{errors.razaoSocial}</FormErrorMessage>
                        </FormControl>

                        <Grid templateColumns="1fr 1fr" gap="4">
                            <GridItem>
                                <FormControl isRequired isInvalid={!!errors.cnpj}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">CNPJ</FormLabel>
                                    <Input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="XX.XXX.XXX/XXXX-XX" borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                    <FormErrorMessage fontSize="xs">{errors.cnpj}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Categoria</FormLabel>
                                    <Input name="categoria" value={form.categoria} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isInvalid={!!errors.cep}>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">CEP</FormLabel>
                                    <Input name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000" borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                    <FormErrorMessage fontSize="xs">{errors.cep}</FormErrorMessage>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">País</FormLabel>
                                    <Input name="pais" value={form.pais} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Estado</FormLabel>
                                    <Select name="estado" value={form.estado} onChange={handleChange} placeholder="Selecione..." borderRadius="lg" borderColor="gray.200" _focus={focus}>
                                        {ESTADOS_BR.map((e) => (
                                            <option key={e.uf} value={e.uf}>{e.uf} — {e.nome}</option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Cidade</FormLabel>
                                    <Input name="cidade" value={form.cidade} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Rua / Número</FormLabel>
                                    <Input name="rua" value={form.rua} onChange={handleChange} borderRadius="lg" borderColor="gray.200" _focus={focus} />
                                </FormControl>
                            </GridItem>
                        </Grid>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Descrição</FormLabel>
                            <Textarea name="descricao" value={form.descricao} onChange={handleChange} borderRadius="lg" borderColor="gray.200" rows={3} _focus={focus} />
                        </FormControl>

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

function buildMonthlyData(titulos, year) {
    const yr = year || new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((name, i) => {
        const receitas = titulos
            .filter((t) => t.tipo === 'RECEBER' && t.status !== 'CANCELADO')
            .filter((t) => { const d = new Date(t.dataVencimento); return d.getFullYear() === yr && d.getMonth() === i; })
            .reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
        const despesas = titulos
            .filter((t) => t.tipo === 'PAGAR' && t.status !== 'CANCELADO')
            .filter((t) => { const d = new Date(t.dataVencimento); return d.getFullYear() === yr && d.getMonth() === i; })
            .reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
        return { name, receitas, despesas };
    });
}

function buildMonthlyByEmpresa(titulos, empresaId, year) {
    const yr = year || new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((name, i) => {
        const valor = titulos
            .filter((t) => String(t.empresaId) === String(empresaId) && t.tipo === 'RECEBER' && t.status !== 'CANCELADO')
            .filter((t) => { const d = new Date(t.dataVencimento); return d.getFullYear() === yr && d.getMonth() === i; })
            .reduce((s, t) => s + Number(t.valorOriginal || 0), 0);
        return { name, valor };
    });
}

function Patrimonio() {
    const isLoggedIn = isAuthenticated();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchParams, setSearchParams] = useSearchParams();
    const [empresas, setEmpresas] = useState([]);
    const [titulos, setTitulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const toast = useToast();

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [emps, tits] = await Promise.all([listarEmpresas(), listarTitulos()]);
            setEmpresas(emps);
            setTitulos(tits);
        } catch (e) {
            setError(e.message || 'Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    useEffect(() => {
        if (searchParams.get('novaEmpresa') === 'true') {
            onOpen();
            setSearchParams({});
        }
    }, [searchParams]);

    if (!isLoggedIn) return <Navigate to="/login" />;

    async function handleSaveEmpresa(form) {
        try {
            await criarEmpresa(form);
            await carregar();
            toast({ title: 'Empresa cadastrada!', status: 'success', duration: 2000, position: 'top' });
        } catch (e) {
            toast({ title: 'Erro ao cadastrar empresa', description: e?.data?.message || e?.message || 'Tente novamente.', status: 'error', duration: 3500, position: 'top' });
            throw e;
        }
    }

    // Valor já recebido por empresa = valorOriginal - valorSaldo dos títulos RECEBER não cancelados
    const totaisPorEmpresa = {};
    empresas.forEach((emp) => {
        totaisPorEmpresa[emp.id] = titulos
            .filter((t) => t.tipo === 'RECEBER' && String(t.empresaId) === String(emp.id) && t.status !== 'CANCELADO')
            .reduce((s, t) => s + (Number(t.valorOriginal || 0) - Number(t.valorSaldo || 0)), 0);
    });

    const totalArrecadado = Object.values(totaisPorEmpresa).reduce((a, v) => a + v, 0);
    const faturamentoGeral = buildMonthlyData(titulos);

    return (
        <Box p="8" w="100%">
            {loading && <Flex justify="center" py="20"><Spinner size="xl" color="#132034" /></Flex>}
            {error && (
                <Box textAlign="center" py="16">
                    <Text color="red.500" mb="4">{error}</Text>
                    <Button onClick={carregar}>Tentar novamente</Button>
                </Box>
            )}

            {!loading && !error && (
                <>
                    <SimpleGrid columns={{ base: 1, md: 2, xl: empresas.length + 1 }} spacing="6" mb="8">
                        {empresas.map((emp) => (
                            <EmpresaCard key={emp.id} nome={`Total ${emp.nome}`} total={totaisPorEmpresa[emp.id] ?? 0} />
                        ))}
                        <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
                            <Text fontWeight="semibold" color="gray.500" fontSize="sm" mb="3">Total Arrecadado</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="green.400" bg="green.50" px="3" py="1" borderRadius="md" display="inline-block">
                                {formatCurrency(totalArrecadado)}
                            </Text>
                        </Box>
                    </SimpleGrid>

                    <Box bg="#132034" p="6" borderRadius="xl" boxShadow="sm" mb="8" h="360px">
                        <Flex justifyContent="space-between" alignItems="center" mb="6">
                            <Text fontSize="lg" fontWeight="bold" color="white">Faturamento Total</Text>
                            <Flex gap="4" alignItems="center">
                                <Flex alignItems="center" gap="2"><Box w="3" h="3" bg="white" borderRadius="sm" /><Text fontSize="sm" color="gray.300">Receitas</Text></Flex>
                                <Flex alignItems="center" gap="2"><Box w="3" h="3" bg="#E0E7FF" borderRadius="sm" opacity="0.5" /><Text fontSize="sm" color="gray.300">Despesas</Text></Flex>
                            </Flex>
                        </Flex>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={faturamentoGeral} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#1e3a5f', border: 'none', borderRadius: '8px', color: 'white' }} formatter={(v) => formatCurrency(v)} />
                                <Bar dataKey="receitas" stackId="a" fill="white" radius={[0, 0, 4, 4]} barSize={36} />
                                <Bar dataKey="despesas" stackId="a" fill="#E0E7FF" radius={[4, 4, 0, 0]} barSize={36} opacity={0.5} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    {empresas.length > 0 && (
                        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="6">
                            {empresas.map((emp) => (
                                <Box key={emp.id} bg="#132034" p="6" borderRadius="xl" boxShadow="sm" h="280px">
                                    <Text fontSize="md" fontWeight="bold" color="white" mb="4">{emp.nome}</Text>
                                    <ResponsiveContainer width="100%" height="85%">
                                        <BarChart data={buildMonthlyByEmpresa(titulos, emp.id)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: '#1e3a5f', border: 'none', borderRadius: '8px', color: 'white' }} formatter={(v) => formatCurrency(v)} />
                                            <Bar dataKey="valor" fill="#E0E7FF" radius={[4, 4, 4, 4]} barSize={32} opacity={0.85} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            ))}
                        </SimpleGrid>
                    )}

                    {empresas.length === 0 && (
                        <Box bg="#132034" p="12" borderRadius="xl" textAlign="center">
                            <Text color="gray.400" mb="4">Nenhuma empresa cadastrada ainda.</Text>
                            <Button bg="#61B4DD" color="white" _hover={{ bg: '#4A9DC4' }} onClick={onOpen}>
                                Cadastrar primeira empresa
                            </Button>
                        </Box>
                    )}
                </>
            )}

            <EmpresaModal isOpen={isOpen} onClose={onClose} onSave={handleSaveEmpresa} />
        </Box>
    );
}

export default Patrimonio;
