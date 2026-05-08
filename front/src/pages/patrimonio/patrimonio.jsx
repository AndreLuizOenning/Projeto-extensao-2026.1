import React, { useEffect } from 'react';
import {
    Box, Flex, Text, SimpleGrid, Button, Icon,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalCloseButton, useDisclosure,
    Input, Textarea, FormControl, FormLabel, Grid, GridItem
} from '@chakra-ui/react';
import { Navigate, useSearchParams } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Dados de exemplo (serão substituídos por dados reais do backend) ───────────

const empresas = [
    { id: 1, nome: 'Empresa A' },
    { id: 2, nome: 'Empresa B' },
];

const faturamentoGeral = [
    { name: 'Jan', receitas: 40000, despesas: 24000 },
    { name: 'Fev', receitas: 55000, despesas: 30000 },
    { name: 'Mar', receitas: 70000, despesas: 42000 },
    { name: 'Abr', receitas: 50000, despesas: 28000 },
    { name: 'Mai', receitas: 38000, despesas: 20000 },
    { name: 'Jun', receitas: 62000, despesas: 35000 },
    { name: 'Jul', receitas: 74000, despesas: 40000 },
    { name: 'Ago', receitas: 80000, despesas: 45000 },
    { name: 'Set', receitas: 68000, despesas: 38000 },
    { name: 'Out', receitas: 55000, despesas: 30000 },
    { name: 'Nov', receitas: 42000, despesas: 22000 },
    { name: 'Dez', receitas: 90000, despesas: 50000 },
];

const faturamentoPorEmpresa = {
    1: [
        { name: 'Jan', valor: 40000 },
        { name: 'Fev', valor: 55000 },
        { name: 'Mar', valor: 70000 },
        { name: 'Abr', valor: 50000 },
        { name: 'Mai', valor: 38000 },
    ],
    2: [
        { name: 'Jan', valor: 32000 },
        { name: 'Fev', valor: 48000 },
        { name: 'Mar', valor: 60000 },
        { name: 'Abr', valor: 42000 },
        { name: 'Mai', valor: 55000 },
    ],
};

const totaisPorEmpresa = {
    1: 20000,
    2: 20000,
};

// ─── Componente de Card por Empresa ─────────────────────────────────────────────

function EmpresaCard({ nome, total }) {
    return (
        <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
            <Text fontWeight="semibold" color="gray.500" fontSize="sm" mb="3">{nome}</Text>
            <Text
                fontSize="2xl"
                fontWeight="bold"
                color="green.400"
                bg="green.50"
                px="3"
                py="1"
                borderRadius="md"
                display="inline-block"
            >
                R${total.toLocaleString('pt-BR')}
            </Text>
        </Box>
    );
}

// ─── Modal Cadastrar Nova Empresa ────────────────────────────────────────────────

function NovaEmpresaModal({ isOpen, onClose }) {
    const [form, setForm] = React.useState({
        nome: '', razaoSocial: '', cnpj: '', categoria: '', cep: '', pais: '', estado:'', cidade:'', rua:'',descricao: ''
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSalvar() {
        if (!form.nome || !form.razaoSocial || !form.cnpj || !form.rua) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }
        // Futuramente: enviar para o backend via POST /api/empresas
        console.log('Nova empresa:', form);
        onClose();
    }

    function handleCancel() {
        setForm({ nome: '', razaoSocial: '', endereco: '', cnpj: '', categoria: '', descricao: '' });
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl" p="2">
                <ModalHeader color="#132034" fontSize="lg" textAlign="center">
                    Cadastrar Nova Empresa
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="6">
                    <Flex flexDirection="column" gap="4">

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Nome da Empresa</FormLabel>
                            <Input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                borderRadius="lg"
                                borderColor="gray.200"
                                _focus={{ borderColor: '#132034', boxShadow: '0 0 0 1px #132034' }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Razão Social</FormLabel>
                            <Input
                                name="razaoSocial"
                                value={form.razaoSocial}
                                onChange={handleChange}
                                borderRadius="lg"
                                borderColor="gray.200"
                                _focus={{ borderColor: '#132034', boxShadow: '0 0 0 1px #132034' }}
                            />
                        </FormControl>

                        <Grid templateColumns="1fr 1fr" gap="4">
                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">CEP</FormLabel>
                                    <Input name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000" />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired>
                                   <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">País</FormLabel>
                                   <Input name="pais" value={form.pais} onChange={handleChange} placeholder="Brasil" />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired>
                                   <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Estado</FormLabel>
                                   <Input name="estado" value={form.estado} onChange={handleChange} placeholder="SC" />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired>
                                   <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Cidade</FormLabel>
                                   <Input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Criciúma" />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired>
                                   <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Rua / Número</FormLabel>
                                   <Input name="rua/número" value={form.rua} onChange={handleChange} placeholder="Rua XV de Novembro, 100" />
                                </FormControl>
                            </GridItem>
                        </Grid>

                        <Grid templateColumns="1fr 1fr" gap="4">
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">CNPJ</FormLabel>
                                    <Input
                                        name="cnpj"
                                        value={form.cnpj}
                                        onChange={handleChange}
                                        placeholder="XX.XXX.XXX/XXXX-XX"
                                        borderRadius="lg"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: '#132034', boxShadow: '0 0 0 1px #132034' }}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Categoria</FormLabel>
                                    <Input
                                        name="categoria"
                                        value={form.categoria}
                                        onChange={handleChange}
                                        borderRadius="lg"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: '#132034', boxShadow: '0 0 0 1px #132034' }}
                                    />
                                </FormControl>
                            </GridItem>
                        </Grid>

                        <FormControl>
                            <FormLabel fontSize="sm" color="#132034" fontWeight="semibold">Descrição</FormLabel>
                            <Textarea
                                name="descricao"
                                value={form.descricao}
                                onChange={handleChange}
                                borderRadius="lg"
                                borderColor="gray.200"
                                rows={4}
                                _focus={{ borderColor: '#132034', boxShadow: '0 0 0 1px #132034' }}
                            />
                        </FormControl>

                        <Flex justifyContent="flex-end" gap="3" mt="2">
                            <Button
                                variant="ghost"
                                borderRadius="lg"
                                onClick={handleCancel}
                                color="gray.500"
                            >
                                Cancelar
                            </Button>
                            <Button
                                bg="#132034"
                                color="white"
                                borderRadius="lg"
                                _hover={{ bg: '#1e3a5f' }}
                                onClick={handleSalvar}
                            >
                                Salvar
                            </Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────────

function Patrimonio() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchParams, setSearchParams] = useSearchParams();

    // Abre o modal automaticamente se vier ?novaEmpresa=true na URL
    useEffect(() => {
        if (searchParams.get('novaEmpresa') === 'true') {
            onOpen();
            setSearchParams({});
        }
    }, [searchParams]);

    if (!isLoggedIn) return <Navigate to="/login" />;

    const totalArrecadado = Object.values(totaisPorEmpresa).reduce((acc, v) => acc + v, 0);

    return (
        <Box p="8" w="100%">

            {/* ── Cards por Empresa + Total Arrecadado ── */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: empresas.length + 1 }} spacing="6" mb="8">
                {empresas.map(emp => (
                    <EmpresaCard
                        key={emp.id}
                        nome={`Total ${emp.nome}`}
                        total={totaisPorEmpresa[emp.id] ?? 0}
                    />
                ))}
                <Box bg="white" p="6" borderRadius="xl" boxShadow="sm">
                    <Text fontWeight="semibold" color="gray.500" fontSize="sm" mb="3">Total Arrecadado</Text>
                    <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color="green.400"
                        bg="green.50"
                        px="3"
                        py="1"
                        borderRadius="md"
                        display="inline-block"
                    >
                        R${totalArrecadado.toLocaleString('pt-BR')}
                    </Text>
                </Box>
            </SimpleGrid>

            {/* ── Gráfico Faturamento Total ── */}
            <Box bg="#132034" p="6" borderRadius="xl" boxShadow="sm" mb="8" h="360px">
                <Flex justifyContent="space-between" alignItems="center" mb="6">
                    <Text fontSize="lg" fontWeight="bold" color="white">Faturamento Total</Text>
                    <Flex gap="4" alignItems="center">
                        <Flex alignItems="center" gap="2">
                            <Box w="3" h="3" bg="white" borderRadius="sm" />
                            <Text fontSize="sm" color="gray.300">Receitas</Text>
                        </Flex>
                        <Flex alignItems="center" gap="2">
                            <Box w="3" h="3" bg="#E0E7FF" borderRadius="sm" opacity="0.5" />
                            <Text fontSize="sm" color="gray.300">Despesas</Text>
                        </Flex>
                    </Flex>
                </Flex>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={faturamentoGeral} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#1e3a5f', border: 'none', borderRadius: '8px', color: 'white' }} />
                        <Bar dataKey="receitas" stackId="a" fill="white" radius={[0, 0, 4, 4]} barSize={36} />
                        <Bar dataKey="despesas" stackId="a" fill="#E0E7FF" radius={[4, 4, 0, 0]} barSize={36} opacity={0.5} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* ── Gráficos por Empresa ── */}
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="6">
                {empresas.map(emp => (
                    <Box key={emp.id} bg="#132034" p="6" borderRadius="xl" boxShadow="sm" h="280px">
                        <Text fontSize="md" fontWeight="bold" color="white" mb="4">{emp.nome}</Text>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={faturamentoPorEmpresa[emp.id] ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#1e3a5f', border: 'none', borderRadius: '8px', color: 'white' }} />
                                <Bar dataKey="valor" fill="#E0E7FF" radius={[4, 4, 4, 4]} barSize={32} opacity={0.85} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                ))}
            </SimpleGrid>

            {/* ── Modal Nova Empresa ── */}
            <NovaEmpresaModal isOpen={isOpen} onClose={onClose} />
        </Box>
    );
}

export default Patrimonio;