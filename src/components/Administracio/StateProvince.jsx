import React, { useState } from 'react';

function FiltresState({ suggestions = [], onFilter, onClear }) {
  // Estats
  const [name, setName] = useState('');
  const [orden, setOrden] = useState('none'); 

  const handleFilter = () => {
    onFilter({ name, orden });
  };

  const handleClear = () => {
    setName('');
    setOrden('none');
    onClear();
  };

  return (
    <>
      <div className="row bg-grey pt-3 px-2 mx-0 mb-3">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="stateFilterName" className="form-label">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Estado..."
              className="form-control"
              id="stateFilterName"
              list="stateNameOptions"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <datalist id="stateNameOptions">
              {suggestions.map((option, index) => (
                <option key={index} value={option} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="stateFilterOrden" className="form-label">Ordenar alfabéticamente</label>
            <select
              className="form-control"
              id="stateFilterOrden"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="none">Sin ordenar</option>
              <option value="asc">De la A a la Z</option>
            </select>
          </div>
        </div>
        <div className="row bg-grey pb-3">
                            <div className="col-xl-4"></div>
                            <div className="col-xl-4"></div>
                            <div className="col-12 col-xl-4 text-end">
                                <button className="btn btn-secondary ps-2 me-2 text-white"><i className="bi bi-trash px-1 text-white"  onClick={handleClear}></i>Netejar</button>
                                <button className="btn btn-primary me-2 ps-2 orange-button text-white"><i className="bi bi-funnel px-1 text-white"  onClick={handleFilter}></i>Filtrar</button>
                            </div>
                        </div>
      </div>
    </>
  );
}

export default FiltresState;
