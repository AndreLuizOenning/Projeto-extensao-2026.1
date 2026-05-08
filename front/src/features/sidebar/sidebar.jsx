import { Box, Flex, Text, VStack, Icon, Button, Avatar } from "@chakra-ui/react"
import { LuLayoutDashboard, LuWallet, LuFileText, LuChartPie, LuSmile, LuPlus } from "react-icons/lu"
import { useLocation, useNavigate } from "react-router-dom"

function Sidebar({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LuLayoutDashboard, path: '/dashboard' },
        { name: 'Patrimonio', icon: LuWallet, path: '/patrimonio' },
        { name: 'Lançamentos financeiros', icon: LuFileText, path: '/lancamentos' },
        { name: 'Relatórios', icon: LuChartPie, path: '/relatorios' },
        { name: 'Assistente IA', icon: LuSmile, path: '/assistente' },
    ];

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/login');
    };

    const handleNovaEmpresa = () => {
        navigate('/patrimonio?novaEmpresa=true');
    };

    return (
        <Flex
            w="280px"
            h="100vh"
            bg="white"
            flexDirection="column"
            justifyContent="space-between"
            borderRight="2px solid #E2E8F0"
            py="8"
            px="4"
        >
            <Box>
                {/* User Profile */}
                <Flex alignItems="center" mb="12" px="4">
                    <Box>
                        <Text fontWeight="bold" fontSize="lg" color="#132034">Renato Gaidzinski</Text>
                        <Text fontSize="sm" color="gray.400">Gerente</Text>
                    </Box>
                    <Box ml="auto" color="gray.400" cursor="pointer">
                        <Text fontSize="xl">...</Text>
                    </Box>
                </Flex>

                {/* Navigation Menu */}
                <VStack align="stretch" spacing="4">
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
                                <Icon as={item.icon} boxSize="5" mr="4" />
                                <Text fontWeight={isActive ? "semibold" : "medium"}>
                                    {item.name}
                                </Text>
                            </Flex>
                        );
                    })}
                </VStack>
            </Box>


            {/* Logout Button */}
            <Box px="4" display="flex" flexDirection="column" gap="3">
                <Button
                   w="full"
                   bg="transparent"
                   color="#132034"
                   border="2px solid #132034"
                   borderRadius="xl"
                   py="6"
                   leftIcon={<LuPlus />}
                   _hover={{ bg: "gray.50" }}
                   onClick={handleNovaEmpresa}
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