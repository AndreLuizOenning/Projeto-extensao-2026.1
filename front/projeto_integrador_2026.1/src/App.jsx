import { useState } from 'react'
import Login from './login/login'
import { Button } from '@chakra-ui/react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Validador from './componentesPjt/validador'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      <Routes>
        <Route path="*" element={<Validador caminho="/home  " />} />
        <Route path="/home" element={<h1>Home</h1>} />
        <Route path="/login" element= {<Login/>}/>
        <Route path="/about" element={<h1>About</h1>} />
      </Routes>
    </>
  )
}

export default App
