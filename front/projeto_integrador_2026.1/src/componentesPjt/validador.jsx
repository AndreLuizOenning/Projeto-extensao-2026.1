import { Navigate } from 'react-router-dom';

function Validador({ caminho }) {

  const usuarioLogado = false; // Substitua isso pela lógica real de verificação de autenticação
  return (
    <>
      {usuarioLogado ? <Navigate to={caminho} /> : <Navigate to="/login" />}
    </>
  );
}

export default Validador;