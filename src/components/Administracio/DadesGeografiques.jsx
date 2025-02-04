import React from 'react';
import Header from '../Header';
import { Routes, Route, Outlet } from 'react-router-dom';
import Provincia from './Province';
import State from './State';
import City from './City';

const DadesGeografiques = () => {
  return (
    <div>
      <Header title="Gestió de Dades Geografiques" />
      <Outlet />  
      <Routes>
      <Route  index element={<City />} />  
        <Route  element={<Provincia />} />  
        <Route path="state/:id" element={<State />} /> 
        <Route path="city/:id" element={<City />} />  
      </Routes>
    </div>
  );
};

export default DadesGeografiques;
