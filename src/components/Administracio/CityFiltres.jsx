import React, { useState } from 'react';

function FiltresCity({ suggestions = [], onFilter, onClear }) {

  const [name, setName] = useState('');
  const [orden, setOrden] = useState('none'); 
  const [provinceId, setProvinceId] = useState('');

 
  const handleFilter = () => {
    onFilter({ name, orden, provinceId });
  };


  const handleClear = () => {
    setName('');
    setOrden('none');
    setProvinceId('');
    onClear();
  };

  return (
    <>
      <div className="row bg-grey pt-3 px-2 mx-0 mb-3">
        {/* Filtro de nombre con autocompletado */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Barcelona"
              className="form-control"
              id="name"
              list="nameOptions"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <datalist id="nameOptions">
              {suggestions.map((option, index) => (
                <option key={index} value={option} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Filtro para ordenar alfabéticamente */}
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



      <div className="row bg-grey pb-3 mx-0">
        <div className="col-xl-4"></div>
        <div className="col-xl-4"></div>
        <div className="col-12 col-xl-4 text-end">
          <button className="btn btn-secondary ps-2 me-2 text-white" onClick={handleClear}>
            <i className="bi bi-trash px-1 text-white"></i> Netejar
          </button>
          <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={handleFilter}>
            <i className="bi bi-funnel px-1 text-white"></i> Filtrar
          </button>
        </div>
        </div>
      </div>
    </>
  );
}

export default FiltresCity;
