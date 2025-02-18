import React from 'react'
import Header from '../Header'
import { Routes, Route, Outlet, Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import IncidenciesGenerar from './IncidenciesGenerar'
import IncidenciesResoldre from './IncidenciesResoldre'
import IncidenciesResoldre from './IncidenciesTemporal'


export default function Incidencies() {
    return (
        <>
            <Header title="Incidencies" />

            <Outlet />
            <Routes>
                <Route path="incidenciesGenerar" element={<IncidenciesGenerar />} />
                <Route path="incidenciesResoldre" element={<IncidenciesResoldre />} />
                <Route path="temporal" element={<IncidenciesTemporal />} />
                <Route path="/" element={<IncidenciesResoldre />} />
            </Routes>
        </>
    )
}
