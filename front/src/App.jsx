import { useState } from 'react'
import Login from './pages/login/login'
import { Routes, Route } from 'react-router-dom'
import Autenticar from './features/autenticador/Autenticar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      <Routes>
        <Route path="*" element={<Autenticar caminho="/home  " />} />
        <Route path="/home" element={<h1>Home</h1>} />
        <Route path="/login" element= {<Login/>}/>
        <Route path="/about" element={<h1>About</h1>} />
      </Routes>
    </>
  )
}

export default App
