import React from 'react';
import Header from '../Header';
import { Routes, Route } from 'react-router-dom';
import City from './City';
import Provincia from './Province';
import State from './State';


const DadesGeografiques = () => {
  return (
    <div>
      <Header title="Gestió de Dades Geografiques" />
      <Routes>
        <Route index element={<City />} />
        <Route path="Province/:id" element={<Provincia />} />
   
        <Route path="state" element={<State />} />
        <Route path="city" element={<City />} />
      </Routes>
    </div>
  );
};

export default DadesGeografiques;
