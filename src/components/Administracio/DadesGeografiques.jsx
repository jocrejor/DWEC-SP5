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
        <Route path="Province/:provinceId?" element={<Provincia />} />
        <Route path="State/:stateId" element={<State />} />
      </Routes>
    </div>
  );
};

export default DadesGeografiques;