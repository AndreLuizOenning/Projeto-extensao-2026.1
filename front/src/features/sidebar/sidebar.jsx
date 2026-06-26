import { Box, Flex, Text, VStack, Icon, Button } from "@chakra-ui/react"
import { LuLayoutDashboard, LuWallet, LuFileText, LuChartPie, LuSmile, LuPlus, LuBuilding2, LuBriefcase, LuLandmark, LuCreditCard, LuTag, LuFolders } from "react-icons/lu"
import { useLocation, useNavigate } from "react-router-dom"
import { clearSession, getUser } from '../../utils/session';

function Sidebar({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LuLayoutDashboard, path: '/dashboard' },
        { name: 'Fluxo de Caixa', icon: LuWallet, path: '/patrimonio' },
        { name: 'Lançamentos financeiros', icon: LuFileText, path: '/lancamentos' },
        { name: 'Relatórios', icon: LuChartPie, path: '/relatorios' },
        { name: 'Entidades', icon: LuBuilding2, path: '/entidades' },
        { name: 'Empresas', icon: LuBriefcase, path: '/empresas' },
        { name: 'Bancos', icon: LuLandmark, path: '/bancos' },
        { name: 'Contas Bancárias', icon: LuCreditCard, path: '/contas-bancarias' },
        { name: 'Categorias Financeiras', icon: LuTag, path: '/categorias-financeiras' },
        { name: 'Centros de Custo', icon: LuFolders, path: '/centros-custo' },
        { name: 'Assistente IA', icon: LuSmile, path: '/assistente-ia' },
    ];

    const user = getUser();

    const handleLogout = () => {
        clearSession();
        if (onLogout) onLogout();
        navigate('/login');
    };

    return (
        <Flex
            w="260px"
            minW="260px"
            h="100vh"
            bg="white"
            flexDirection="column"
            borderRight="2px solid #E2E8F0"
            py="8"
            px="4"
        >
            {/* Perfil — fixo no topo */}
            <Flex alignItems="center" mb="6" px="4" flexShrink={0}>
                <Box>
                    <Text fontWeight="bold" fontSize="md" color="#132034">
                        Renato Gaidzinski
                    </Text>
                    <Text fontSize="sm" color="gray.400">{user?.role || 'ADMIN'}</Text>
                </Box>
                <Box ml="auto" color="gray.400" cursor="pointer">
                    <Text fontSize="xl">···</Text>
                </Box>
            </Flex>

            {/* Itens de navegação — área rolável */}
            <Box flex="1" overflowY="auto" mb="4"
                sx={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
                }}
            >
                <VStack align="stretch" spacing="1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Flex
                                key={item.name}
                                alignItems="center"
                                px="4"
                                py="3"
                                cursor="pointer"
                                borderRadius="xl"
                                bg={isActive ? "#132034" : "transparent"}
                                color={isActive ? "white" : "#132034"}
                                _hover={{ bg: isActive ? "#132034" : "gray.100" }}
                                onClick={() => navigate(item.path)}
                            >
                                <Icon as={item.icon} boxSize="5" mr="3" />
                                <Text fontWeight={isActive ? "semibold" : "medium"} fontSize="sm">
                                    {item.name}
                                </Text>
                            </Flex>
                        );
                    })}
                </VStack>
            </Box>

            {/* Botões — fixos no rodapé, sempre visíveis */}
            <Box px="4" display="flex" flexDirection="column" gap="3" flexShrink={0}>
                <Button
                    w="full"
                    bg="transparent"
                    color="#132034"
                    border="2px solid #132034"
                    borderRadius="xl"
                    py="6"
                    leftIcon={<LuPlus />}
                    _hover={{ bg: "gray.50" }}
                    onClick={() => navigate('/patrimonio?novaEmpresa=true')}
                >
                    Nova Empresa
                </Button>

                <Button
                    w="full"
                    bg="#132034"
                    color="white"
                    borderRadius="xl"
                    py="6"
                    _hover={{ bg: "#2A3A50" }}
                    onClick={handleLogout}
                >
                    Sair
                </Button>
            </Box>
        </Flex>
    )
}

export default Sidebar
