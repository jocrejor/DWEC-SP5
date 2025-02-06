 import React from 'react';
  import Header from '../Header';
  import {Routes,Route,Outlet } from 'react-router-dom';
  import Magatzem from './Magatzem';
  import Carrer from './Carrer';
  import Estanteria from './Estanteria';
  import Espai from './Espai';

function DadesGeografiques() {
 
  
  

      return (
          <div>
              <Header title="Dades geografiques"></Header>
              <Outlet />
               <Routes >
                        <Route path="pais" element={<Pais />} />
                        <Route path="provincia/:pais" element={<Provincia />} />
                        <Route path="ciutat/:pais/:provincia" element={<Ciutat />} />
                       
               </Routes>
               
          </div>
      );
  }
  

export default DadesGeografiques
