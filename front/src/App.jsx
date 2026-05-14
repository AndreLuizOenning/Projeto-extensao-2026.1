import { useState, useEffect } from 'react'
import Login from './pages/login/login'
import { Routes, Route, useLocation } from 'react-router-dom'
import Autenticar from './features/autenticador/Autenticar'
import Dashboard from './pages/dashboard/dashboard'
import Patrimonio from './pages/patrimonio/patrimonio'
import Lancamentos from './pages/lancamentos/lancamentos'
import Relatorios from './pages/relatorios/relatorios'
import Entidades from './pages/entidades/entidades'
import Empresas from './pages/empresas/empresas'
import Sidebar from './features/sidebar/sidebar'
import { Flex, Box } from '@chakra-ui/react'

function App() {
  const [isLogged, setIsLogged] = useState(localStorage.getItem('loggedIn') === 'true');
  const location = useLocation();

  useEffect(() => {
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

      <Box flex="1" overflowY="auto" bg={isLogged && !isLoginPage ? '#132034' : 'white'}>
        <Routes>
          <Route path="*" element={<Autenticar caminho="/dashboard" />} />
          <Route path="/login" element={<Login loggedIn={setLoggedIn} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patrimonio" element={<Patrimonio />} />
          <Route path="/lancamentos" element={<Lancamentos />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/entidades" element={<Entidades />} />
          <Route path="/empresas" element={<Empresas />} />
        </Routes>
      </Box>
    </Flex>
  )
}

export default App
