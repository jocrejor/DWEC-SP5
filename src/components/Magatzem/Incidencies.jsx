import React from 'react'
import Header from '../Header'
import { Routes,Route, Outlet, Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import IncidenciesGenerar from './IncidenciesGenerar'
import IncidenciesResoldre from './IncidenciesResoldre'


export default function Incidencies() {
  return (
    <>
        <Header title="Incidencies" />

        <Button variant='success' className="text-white text-decoration-none">
            <Link to="/incidencies/incidenciesGenerar">Generar Incidències</Link>
        </Button>
        <Button variant='danger'>
            <Link to="/incidencies/incidenciesResoldre">Resoldre Incidències</Link>
        </Button>
        
        
        <Outlet/>
        <Routes>
          <Route path="incidenciesGenerar" element={<IncidenciesGenerar />} />
          <Route path="incidenciesResoldre" element={<IncidenciesResoldre />} />
        </Routes>
    </>
  )
  
}
