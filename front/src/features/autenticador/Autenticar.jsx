import { Navigate } from 'react-router-dom';

function Autenticar({ caminho }) {
  const usuarioLogado = localStorage.getItem('loggedIn') === 'true';
  return (
    <>
      {usuarioLogado ? <Navigate to={caminho} /> : <Navigate to="/login" />}
    </>
  );
}

export default Autenticar;