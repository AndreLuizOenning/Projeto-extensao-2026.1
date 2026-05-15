import { Box, Flex, Text, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LuArrowUpRight, LuArrowDownRight } from "react-icons/lu";
import { useApp } from '../../context/AppContext';
import { formatCurrency, monthlyAggDouble } from '../../utils/format';

const COLORS = ['#132034', '#61B4DD', '#4A90D9', '#2E6BA8', '#1A4A7C', '#0D2B4E'];

function StatCard({ title, value, percentage, isPositive }) {
    return (
        <Box bg="white" p="6" borderRadius="xl" boxShadow="sm" display="flex" flexDirection="column" justifyContent="space-between">
            <Flex justifyContent="space-between" alignItems="center" mb="4">
                <Text fontWeight="semibold" color="gray.600" fontSize="sm">{title}</Text>
                <Badge
                    bg={isPositive ? "green.100" : "red.100"}
                    color={isPositive ? "green.700" : "red.700"}
                    px="2" py="1" borderRadius="md"
                    display="flex" alignItems="center" gap="1"
                >
                    {isPositive ? <LuArrowUpRight /> : <LuArrowDownRight />}
                    {percentage}
                </Badge>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="#132034">{value}</Text>
        </Box>
    );
}

function Dashboard() {
    const isLoggedIn = isAuthenticated();
    const { state } = useApp();
    const { contasAPagar, contasAReceber, empresas } = state;

    if (!isLoggedIn) return <Navigate to="/login" />;

    const sumPago = (list) => list.filter(c => c.status === 'Pago').reduce((s, c) => s + Number(c.valor || 0), 0);
    const sumAtivo = (list) => list.filter(c => c.status !== 'Pago').reduce((s, c) => s + Number(c.valor || 0), 0);

    const saldoAtual = sumPago(contasAReceber) - sumPago(contasAPagar);
    const totalReceber = sumAtivo(contasAReceber);
    const totalPagar = sumAtivo(contasAPagar);
    const previsaoCaixa = saldoAtual + totalReceber - totalPagar;

    const faturamentoData = monthlyAggDouble(contasAReceber, contasAPagar);

    const distribuicaoData = empresas.map((emp, i) => {
        const total = contasAReceber
            .filter(c => c.empresaId === emp.id && c.status === 'Pago')
            .reduce((s, c) => s + Number(c.valor || 0), 0);
        return { name: emp.nome, value: total, color: COLORS[i % COLORS.length] };
    }).filter(e => e.value > 0);

    const empresasTableData = empresas.map(emp => {
        const receber = contasAReceber.filter(c => c.empresaId === emp.id);
        const pagar = contasAPagar.filter(c => c.empresaId === emp.id);
        const saldo = receber.filter(c => c.status === 'Pago').reduce((s, c) => s + Number(c.valor || 0), 0)
            - pagar.filter(c => c.status === 'Pago').reduce((s, c) => s + Number(c.valor || 0), 0);
        const lastDate = [...receber, ...pagar]
            .map(c => c.dataVencimento)
            .filter(Boolean)
            .sort()
            .pop();
        const status = saldo > 0 ? 'Positivo' : saldo < 0 ? 'Negativo' : 'Pendente';
        return { id: emp.id, empresa: emp.nome, data: lastDate || '-', saldo, status };
    });

    const statusColors = { Positivo: 'green', Negativo: 'red', Pendente: 'yellow' };

    return (
        <Box p="8" w="100%">
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="6" mb="8">
                <StatCard title="Saldo Atual" value={formatCurrency(saldoAtual)} percentage="Atual" isPositive={saldoAtual >= 0} />
                <StatCard title="Previsão de Caixa" value={formatCurrency(previsaoCaixa)} percentage="Previsto" isPositive={previsaoCaixa >= 0} />
                <StatCard title="Total a Receber" value={formatCurrency(totalReceber)} percentage="A receber" isPositive={true} />
                <StatCard title="Total a Pagar" value={formatCurrency(totalPagar)} percentage="A pagar" isPositive={false} />
            </SimpleGrid>

            <Box bg="white" p="6" borderRadius="xl" boxShadow="sm" mb="8" h="400px">
                <Flex justifyContent="space-between" alignItems="center" mb="6">
                    <Text fontSize="lg" fontWeight="bold" color="#132034">Faturamento por mês</Text>
                    <Flex gap="4" alignItems="center">
                        <Flex alignItems="center" gap="2">
                            <Box w="3" h="3" bg="#132034" borderRadius="sm" />
                            <Text fontSize="sm" color="gray.600">Receitas</Text>
                        </Flex>
                        <Flex alignItems="center" gap="2">
                            <Box w="3" h="3" bg="#E0E7FF" borderRadius="sm" />
                            <Text fontSize="sm" color="gray.600">Despesas</Text>
                        </Flex>
                    </Flex>
                </Flex>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={faturamentoData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} formatter={(v) => formatCurrency(v)} />
                        <Bar dataKey="receitas" stackId="a" fill="#132034" radius={[0, 0, 4, 4]} barSize={40} />
                        <Bar dataKey="despesas" stackId="a" fill="#E0E7FF" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing="6">
                <Box bg="white" p="6" borderRadius="xl" boxShadow="sm" gridColumn={{ xl: "span 2" }}>
                    <Flex justifyContent="space-between" alignItems="center" mb="6">
                        <Text fontSize="lg" fontWeight="bold" color="#132034">Empresas</Text>
                    </Flex>
                    {empresasTableData.length === 0 ? (
                        <Text color="gray.400" fontSize="sm" textAlign="center" py="8">Nenhuma empresa cadastrada.</Text>
                    ) : (
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th color="gray.400" textTransform="none" fontSize="sm">Empresa</Th>
                                        <Th color="gray.400" textTransform="none" fontSize="sm">Última Mov.</Th>
                                        <Th color="gray.400" textTransform="none" fontSize="sm">Saldo</Th>
                                        <Th color="gray.400" textTransform="none" fontSize="sm">Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {empresasTableData.map((emp) => (
                                        <Tr key={emp.id}>
                                            <Td fontWeight="bold" color="#132034" borderBottom="none">{emp.empresa}</Td>
                                            <Td fontWeight="medium" borderBottom="none">{emp.data !== '-' ? emp.data.split('-').reverse().join('/') : '-'}</Td>
                                            <Td fontWeight="bold" borderBottom="none">{formatCurrency(emp.saldo)}</Td>
                                            <Td borderBottom="none">
                                                <Badge
                                                    bg={`${statusColors[emp.status]}.100`}
                                                    color={`${statusColors[emp.status]}.700`}
                                                    px="2" py="1" borderRadius="md"
                                                >
                                                    {emp.status}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>

                <Box
                    p="6" borderRadius="xl" boxShadow="sm"
                    bgGradient="linear(to-br, gray.300, gray.500, gray.700)"
                    display="flex" justifyContent="center" alignItems="center"
                    position="relative" overflow="hidden"
                >
                    <Flex position="absolute" flexDirection="column" alignItems="center" justifyContent="center" zIndex="1">
                        <Text fontSize="sm" fontWeight="bold" color="white" textAlign="center" lineHeight="1.2">
                            Distribuição<br />por Empresas
                        </Text>
                    </Flex>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={distribuicaoData.length > 0 ? distribuicaoData : [{ name: 'Sem dados', value: 1 }]}
                                cx="50%" cy="50%"
                                innerRadius={70} outerRadius={90}
                                paddingAngle={5} dataKey="value" stroke="none"
                            >
                                {(distribuicaoData.length > 0 ? distribuicaoData : [{ color: '#4A5568' }]).map((entry, i) => (
                                    <Cell key={i} fill={entry.color || '#4A5568'} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>
        </Box>
    );
}

export default Dashboard;
