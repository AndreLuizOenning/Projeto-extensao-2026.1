import { useState, useEffect } from 'react'
import Login from './pages/login/login'
import { Routes, Route, useLocation } from 'react-router-dom'
import Autenticar from './features/autenticador/Autenticar'
import Dashboard from './pages/dashboard/dashboard'
import Sidebar from './features/sidebar/sidebar'
import { Flex, Box, Text } from '@chakra-ui/react'

function App() {
  const [isLogged, setIsLogged] = useState(localStorage.getItem('loggedIn') === 'true');
  const location = useLocation();

  useEffect(() => {
    // Garantir que a checagem é feita ao mudar a rota
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLogged(localStorage.getItem('loggedIn') === 'true');
  }, [location.pathname]);

  function setLoggedIn(value) {
    localStorage.setItem('loggedIn', value);
    setIsLogged(value === true || value === 'true');
  }

  const isLoginPage = location.pathname === '/login';

  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
      {isLogged && !isLoginPage && <Sidebar onLogout={() => setLoggedIn(false)} />}
      
      <Box flex="1" overflowY="auto" bg={isLogged && !isLoginPage ? "#132034" : "white"}>
        <Routes>
          <Route path="*" element={<Autenticar caminho="/dashboard" />} />
          <Route path="/home" element={<h1>Home</h1>} />
          <Route path="/login" element={<Login loggedIn={setLoggedIn} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patrimonio" element={<Box p="8"><Text color="white">Tela Patrimônio (Em construção)</Text></Box>} />
          <Route path="/lancamentos" element={<Box p="8"><Text color="white">Tela Lançamentos Financeiros (Em construção)</Text></Box>} />
          <Route path="/relatorios" element={<Box p="8"><Text color="white">Tela Relatórios (Em construção)</Text></Box>} />
          <Route path="/assistente" element={<Box p="8"><Text color="white">Assistente IA (Em construção)</Text></Box>} />
        </Routes>
      </Box>
    </Flex>
  )
}

export default App
