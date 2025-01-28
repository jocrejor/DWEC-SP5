import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import './App.css'
import Lateral from './components/Lateral'
import Login from './components/login';
import Logout from './components/logout';
import Home from './components/Home.jsx'

import Productes from './components/Recepcio/Productes';
import Usuaris from './components/Administracio/Usuaris';
import Rols from './components/Administracio/Rols';
import DadesGeografiques from './components/Administracio/DadesGeografiques';

import Transportistes from './components/Administracio/Transportistes';
import Clients from './components/Enviament/Clients';
import OrdresEnviament from './components/Enviament/OrdresEnviament.jsx';
import EstatsOrdreEnviament from './components/Enviament/EstatsOrdreEnviament.jsx';

import Proveidors from './components/Recepcio/Proveidors';
import OrdresRecepcio from './components/Recepcio/OrdresRecepcio';
import EstatsOrdreRecepcio from './components/Recepcio/EstatsOrdreRecepcio';
import EstatsOrdreRecepcioLinia from './components/Recepcio/EstatsOrdreRecepcioLinia.jsx';

import Lots from './components/Recepcio/Lots';


import GestioMagatzem from './components/Magatzem/GestioMagatzem';



import Inventaris from './components/Magatzem/Inventaris';
import Incidencies from './components/Magatzem/Incidencies';
import Moviments from './components/Magatzem/Moviments';
import Inventariar from './components/Magatzem/Inventariar';
import CompletarInventari from './components/Magatzem/CompletarInventari';
import './App.js';
import OrderPickingReception from './components/Recepcio/OrderPickingReception';
import OrderPickingShipping from './components/Enviament/OrderPickingShipping';

function App() {
  const navigate = useNavigate(); 

  useEffect(() => { 
    if (localStorage.getItem('token') === null) {
        console.log('No has iniciat sessió')
        navigate('/login'); 
    }
  }, [navigate]);

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <Lateral />
          <div className="col-12 col-xl-10 px-0">
            <div>

              <Routes>

                <Route path="/login" element={<Login />} />

                <Route path="/logout" element={<Logout />} />

                <Route path="/usuaris" element={<Usuaris />} />

                <Route path="/rols" element={<Rols />} />

                <Route path="/dadesGeografiques" element={<DadesGeografiques />} />

                <Route path="/transportistes" element={<Transportistes />} />

                <Route path="/clients" element={<Clients />} />

                <Route path="/ordresEnviament" element={<OrdresEnviament />} />

                <Route path="/proveidors" element={<Proveidors />} />

                <Route path="/ordresRecepcio" element={<OrdresRecepcio />} />

                <Route path="/estatsOrdreRecepcio" element={<EstatsOrdreRecepcio />} />

                <Route path="/estatsOrdreRecepcioLinia" element={<EstatsOrdreRecepcioLinia />} />

                <Route path="/estatsOrdreEnviament" element={<EstatsOrdreEnviament />} />

                <Route path="/productes" element={<Productes />} />

                <Route path="/lots" element={<Lots />} />

                <Route path="/GestioMagatzem/*" element={<GestioMagatzem/>} / >
                   
                                   
                <Route path="/inventaris/" element={<Inventaris />} />
                <Route path="/inventaris/inventariar/:id" element={<Inventariar />} />
                <Route path="/inventaris/completarInventari/:id" element={<CompletarInventari />} />
                


                <Route path="/incidencies/*" element={<Incidencies />} />

                <Route path="/moviments" element={<Moviments />} />
                
                <Route path="/orderpickingreception" element={<OrderPickingReception />} />

                <Route path="/orderpickingshipping" element={<OrderPickingShipping />} />

                <Route path="/" element={<Home />} />

                <Route path="/404" element={<Error404 />} />

                <Route path="*" element={<Error404 />} />

              </Routes>


            </div>
          </div>
        </div>
      </div>

    </>
  )
}

function Error404() {

  return (
    <div>
      <h2>ERROR 404</h2>
    </div>
  );
}

export default App