import React from 'react';
import Header from '../Header';
import { Routes, Route } from 'react-router-dom';
import City from './City';
import Provincia from './Province';
import State from './State';
//import error404 from '../../assets/404Error.png';

const DadesGeografiques = () => {
  return (
    <div>
      <Header title="Gestió de Dades Geografiques" />
      <Routes>
        <Route index element={<State />} />
        <Route path="province/:state" element={<Provincia />} />
        <Route path="city/:provinceId" element={<City />} />
         <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
};


function Error404() {

  return (
    <div>
      <Header title="Pàgina no trobada" />
      <div className="d-flex justify-content-center align-items-center" >
      <img  className="img-fluid m-4" src=""/> 
      <h1>404</h1>
      </div>
    </div>
  );
}


export default DadesGeografiques;
