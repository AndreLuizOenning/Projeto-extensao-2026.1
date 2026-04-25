import { Box, Flex, Text, SimpleGrid, Badge, Icon, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LuArrowUpRight, LuArrowDownRight } from "react-icons/lu";

// Dados vazios que serão preenchidos futuramente por outras telas
const faturamentoData = [];

const empresasData = [];

const distribuicaoData = [];

function StatCard({ title, value, percentage, isPositive }) {
    return (
        <Box bg="white" p="6" borderRadius="xl" boxShadow="sm" display="flex" flexDirection="column" justifyContent="space-between">
            <Flex justifyContent="space-between" alignItems="center" mb="4">
                <Text fontWeight="semibold" color="gray.600" fontSize="sm">{title}</Text>
                <Badge 
                    bg={isPositive ? "green.100" : "red.100"} 
                    color={isPositive ? "green.700" : "red.700"} 
                    px="2" 
                    py="1" 
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    gap="1"
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
    // Corrigido: Se loggedIn NÃO for 'true', isLoggedIn será false
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        <Box p="8" w="100%">
            {/* Top Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="6" mb="8">
                <StatCard title="Saldo Atual" value="0" percentage="0.0%" isPositive={true} />
                <StatCard title="Previsão de Caixa" value="0" percentage="0.0%" isPositive={true} />
                <StatCard title="Total a Receber" value="0" percentage="0.0%" isPositive={true} />
                <StatCard title="Total a Pagar" value="0" percentage="0.0%" isPositive={false} />
            </SimpleGrid>

            {/* Faturamento Chart */}
            <Box bg="white" p="6" borderRadius="xl" boxShadow="sm" mb="8" h="400px">
                <Flex justifyContent="space-between" alignItems="center" mb="6">
                    <Text fontSize="lg" fontWeight="bold" color="#132034">Faturamento por mês</Text>
                    <Flex gap="4" alignItems="center">
                        <Flex alignItems="center" gap="2">
                            <Box w="3" h="3" bg="#132034" borderRadius="sm"></Box>
                            <Text fontSize="sm" color="gray.600">Receitas</Text>
                        </Flex>
                        <Flex alignItems="center" gap="2">
                            <Box w="3" h="3" bg="#E0E7FF" borderRadius="sm"></Box>
                            <Text fontSize="sm" color="gray.600">Despesas</Text>
                        </Flex>
                        <Box bg="gray.50" px="3" py="1" borderRadius="md" cursor="pointer">
                            <Text fontSize="sm" fontWeight="medium">Esse mês v</Text>
                        </Box>
                    </Flex>
                </Flex>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={faturamentoData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="receitas" stackId="a" fill="#132034" radius={[0, 0, 4, 4]} barSize={40} />
                        <Bar dataKey="despesas" stackId="a" fill="#E0E7FF" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Bottom Row: Table and Donut Chart */}
            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing="6">
                
                {/* Empresas Table */}
                <Box bg="white" p="6" borderRadius="xl" boxShadow="sm" gridColumn={{ xl: "span 2" }}>
                    <Flex justifyContent="space-between" alignItems="center" mb="6">
                        <Text fontSize="lg" fontWeight="bold" color="#132034">Empresas</Text>
                        <Box bg="gray.50" px="3" py="1" borderRadius="md" cursor="pointer">
                            <Text fontSize="sm" fontWeight="medium">Ultimas vendas v</Text>
                        </Box>
                    </Flex>
                    <TableContainer>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.400" textTransform="none" fontSize="sm">Empresa</Th>
                                    <Th color="gray.400" textTransform="none" fontSize="sm">Data</Th>
                                    <Th color="gray.400" textTransform="none" fontSize="sm">Saldo Atual</Th>
                                    <Th color="gray.400" textTransform="none" fontSize="sm">Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {empresasData.map((emp) => (
                                    <Tr key={emp.id}>
                                        <Td fontWeight="bold" color="#132034" borderBottom="none">{emp.empresa}</Td>
                                        <Td fontWeight="medium" borderBottom="none">{emp.data}</Td>
                                        <Td fontWeight="bold" borderBottom="none">{emp.saldo}</Td>
                                        <Td borderBottom="none">
                                            <Badge bg={`${emp.statusColor}.100`} color={`${emp.statusColor}.700`} px="2" py="1" borderRadius="md">
                                                {emp.status}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Donut Chart */}
                <Box 
                    p="6" 
                    borderRadius="xl" 
                    boxShadow="sm"
                    bgGradient="linear(to-br, gray.300, gray.500, gray.700)"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    overflow="hidden"
                >
                    {/* Glassmorphism inner container for the chart title */}
                    <Flex 
                        position="absolute" 
                        flexDirection="column" 
                        alignItems="center" 
                        justifyContent="center"
                        zIndex="1"
                    >
                        <Text fontSize="sm" fontWeight="bold" color="#132034" textAlign="center" lineHeight="1.2">
                            Distribuição<br/>por Empresas
                        </Text>
                    </Flex>
                    
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={distribuicaoData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {distribuicaoData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Labels */}
                    {/* Exibidos apenas se houver dados (atualmente vazio) */}
                    {distribuicaoData.length > 0 && (
                        <>
                            <Badge position="absolute" top="15%" left="15%" bg="white" color="#132034" px="2" py="1" borderRadius="md" boxShadow="md">
                                20%<br/><Text fontSize="xs" fontWeight="normal">Emp 1</Text>
                            </Badge>
                            <Badge position="absolute" top="10%" right="25%" bg="white" color="#132034" px="2" py="1" borderRadius="md" boxShadow="md">
                                15%<br/><Text fontSize="xs" fontWeight="normal">Emp 2</Text>
                            </Badge>
                            <Badge position="absolute" bottom="20%" left="10%" bg="white" color="#132034" px="2" py="1" borderRadius="md" boxShadow="md">
                                25%<br/><Text fontSize="xs" fontWeight="normal">Emp 3</Text>
                            </Badge>
                            <Badge position="absolute" bottom="15%" right="15%" bg="white" color="#132034" px="2" py="1" borderRadius="md" boxShadow="md">
                                40%<br/><Text fontSize="xs" fontWeight="normal">Emp 4</Text>
                            </Badge>
                        </>
                    )}
                </Box>
            </SimpleGrid>
        </Box>
    );
}

export default Dashboard;