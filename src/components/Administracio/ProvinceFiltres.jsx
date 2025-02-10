import React, { useState } from 'react';

function FiltresProvince({ suggestions = [], onFilter, onClear }) {
  // Estats
  const [nombre, setNombre] = useState('');
  const [orden, setOrden] = useState('none'); 

  const handleFilter = () => {
    onFilter({ nombre, orden });
  };

  const netejar = () => {
    setNombre('');
    setOrden('none');
    onClear();
  };

  return (
    <>
      <div className="row bg-grey pt-3 px-2 mx-0">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Catalunya"
              className="form-control"
              id="nombre"
              list="nombreOptions"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <datalist id="nombreOptions">
              {suggestions.map((option, index) => (
                <option key={index} value={option} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="orden" className="form-label">Ordenar alfabéticamente</label>
            <select
              className="form-control"
              id="orden"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="none">Sin ordenar</option>
              <option value="asc">De la A a la Z</option>
            </select>
          </div>
        </div>
      </div>
      <div className="row bg-grey pb-3 mx-0">
        <div className="col-xl-4"></div>
        <div className="col-xl-4"></div>
        <div className="col-12 col-xl-4 text-end">
          <button 
            className="btn btn-secondary ps-2 me-2 text-white" 
            onClick={netejar}
          >
            <i className="bi bi-trash px-1 text-white"></i> Netejar
          </button>
          <button 
            className="btn btn-primary me-2 ps-2 orange-button text-white" 
            onClick={handleFilter}
          >
            <i className="bi bi-funnel px-1 text-white"></i> Filtrar
          </button>
        </div>
      </div>
    </>
  );
}

export default FiltresProvince;
