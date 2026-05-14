import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

const defaultState = {
  empresas: [],
  contasBancarias: [],
  contasAPagar: [],
  contasAReceber: [],
  entidades: [],
};

function reducer(state, { type, payload }) {
  switch (type) {
    case 'ADD_EMPRESA':
      return { ...state, empresas: [...state.empresas, { ...payload, id: Date.now() }] };
    case 'UPDATE_EMPRESA':
      return { ...state, empresas: state.empresas.map(e => e.id === payload.id ? payload : e) };
    case 'DELETE_EMPRESA':
      return { ...state, empresas: state.empresas.filter(e => e.id !== payload) };

    case 'ADD_CONTA_BANCARIA':
      return { ...state, contasBancarias: [...state.contasBancarias, { ...payload, id: Date.now() }] };
    case 'DELETE_CONTA_BANCARIA':
      return { ...state, contasBancarias: state.contasBancarias.filter(c => c.id !== payload) };

    case 'ADD_CONTA_PAGAR':
      return { ...state, contasAPagar: [...state.contasAPagar, { ...payload, id: Date.now() }] };
    case 'UPDATE_CONTA_PAGAR':
      return { ...state, contasAPagar: state.contasAPagar.map(c => c.id === payload.id ? payload : c) };
    case 'DELETE_CONTA_PAGAR':
      return { ...state, contasAPagar: state.contasAPagar.filter(c => c.id !== payload) };

    case 'ADD_CONTA_RECEBER':
      return { ...state, contasAReceber: [...state.contasAReceber, { ...payload, id: Date.now() }] };
    case 'UPDATE_CONTA_RECEBER':
      return { ...state, contasAReceber: state.contasAReceber.map(c => c.id === payload.id ? payload : c) };
    case 'DELETE_CONTA_RECEBER':
      return { ...state, contasAReceber: state.contasAReceber.filter(c => c.id !== payload) };

    case 'ADD_ENTIDADE':
      return { ...state, entidades: [...state.entidades, { ...payload, id: Date.now() }] };
    case 'UPDATE_ENTIDADE':
      return { ...state, entidades: state.entidades.map(e => e.id === payload.id ? payload : e) };
    case 'DELETE_ENTIDADE':
      return { ...state, entidades: state.entidades.filter(e => e.id !== payload) };

    default:
      return state;
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('appData');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, loadState() || defaultState);

  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
