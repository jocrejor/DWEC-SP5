 import React from 'react';
  import Header from '../Header';
  import {Routes,Route,Outlet } from 'react-router-dom';
  import Pais from './Pais';
  import Provincia from './Provincia';
  import Ciutat from './Ciutat';


function DadesGeografiques() {
 
  
  

      return (
          <div>
              <Header title="Dades geografiques"></Header>
              <Outlet />
               <Routes >
                        <Route path="/pais" element={<Pais />} />
                        <Route path="/provincia/:pais" element={<Provincia />} />
                        <Route path="/ciutat/:pais/:provincia" element={<Ciutat />} />
                        <Route path="/" element={<Pais />} />
                       
               </Routes>
               
          </div>
      );
  }
  

export default DadesGeografiques
