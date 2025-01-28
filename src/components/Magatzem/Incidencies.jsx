import React from 'react'
import Header from '../Header'
import {Routes,Route, Outlet, Link} from 'react-router-dom'
import IncidenciesGenerar from './IncidenciesGenerar'
import IncidenciesResoldre from './IncidenciesResoldre'
export default function Incidencies() {
  return (
    <>
        <Header title="Incidencies" />
        <ul>
          <li><Link to="/incidencies/incidenciesGenerar">Generar Incidències</Link></li>
          <li><Link to="/incidencies/incidenciesResoldre">Resoldre Incidències</Link></li>
        </ul>
        
        <Outlet/>
        <Routes>
          <Route path="incidenciesGenerar" element={<IncidenciesGenerar />} />
          <Route path="incidenciesResoldre" element={<IncidenciesResoldre />} />
        </Routes>
    </>
  )
  
}
