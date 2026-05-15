import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/session';

function Autenticar({ caminho }) {
  const usuarioLogado = isAuthenticated();
  return (
    <>
      {usuarioLogado ? <Navigate to={caminho} /> : <Navigate to="/login" />}
    </>
  );
}

export default Autenticar;