import { useState } from 'react'
import Login from './pages/login/login'
import { Routes, Route } from 'react-router-dom'
import Autenticar from './features/autenticador/Autenticar'
import Dashboard from './pages/dashboard/dashboard'
import Sidebar from './features/sidebar/sidebar'

function App() {

  function setLoggedIn(value) {
    localStorage.setItem('loggedIn', value);
  }
  
  alert(localStorage.getItem('loggedIn'));

  return (
    <>

      {localStorage.getItem('loggedIn') === 'true' ? <Sidebar /> : null}

      <Routes>
        <Route path="*" element={<Autenticar caminho="/home  " />} />
        <Route path="/home" element={<h1>Home</h1>} />
        <Route path="/login" element= {<Login loggedIn={setLoggedIn} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
