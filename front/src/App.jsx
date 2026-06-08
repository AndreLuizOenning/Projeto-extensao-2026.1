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
import Bancos from './pages/bancos/bancos'
import ContasBancarias from './pages/contas-bancarias/contas-bancarias'
import CategoriasFinanceiras from './pages/categorias-financeiras/categorias-financeiras'
import CentrosCusto from './pages/centros-custo/centros-custo'
import Sidebar from './features/sidebar/sidebar'
import AssistenteIA from './pages/assistente-ia/AssistenteIA';
import { Flex, Box } from '@chakra-ui/react'
import { isAuthenticated } from './utils/session'

function App() {
  const [isLogged, setIsLogged] = useState(isAuthenticated());
  const location = useLocation();

  useEffect(() => {
    setIsLogged(isAuthenticated());
  }, [location.pathname]);

  function setLoggedIn(value) {
    setIsLogged(value === true || value === 'true');
  }

  const isLoginPage = location.pathname === '/login';

  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
      {isLogged && !isLoginPage && <Sidebar onLogout={() => setLoggedIn(false)} />}

      <Box flex="1" overflowY="auto" bg={isLogged && !isLoginPage ? '#132034' : 'white'}>
        <Routes>
          <Route path="/" element={<Autenticar caminho="/dashboard" />} />
          <Route path="*" element={<Autenticar caminho="/dashboard" />} />
          <Route path="/login" element={<Login loggedIn={setLoggedIn} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patrimonio" element={<Patrimonio />} />
          <Route path="/lancamentos" element={<Lancamentos />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/entidades" element={<Entidades />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/bancos" element={<Bancos />} />
          <Route path="/contas-bancarias" element={<ContasBancarias />} />
          <Route path="/categorias-financeiras" element={<CategoriasFinanceiras />} />
          <Route path="/centros-custo" element={<CentrosCusto />} />
          <Route path="/assistente-ia" element={<AssistenteIA />} />
        </Routes>
      </Box>
    </Flex>
  )
}

export default App
