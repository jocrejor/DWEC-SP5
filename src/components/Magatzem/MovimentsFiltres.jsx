import React, { useState } from 'react';

function FiltresMoviments({ onFilter = () => {}, suggestions = {} }) {
  const [filtres, setFiltres] = useState({
    magatzem: '',
    carrer: '',
    estanteria: '',
    espai: '',
    producte: '',
    data: '',
    operari: '',
    origen: ''
  });

  const handleChange = (e) => {
    setFiltres({
      ...filtres,
      [e.target.id]: e.target.value
    });
  };

  const netejafiltres = () => {
    const neteja = {
      magatzem: '',
      carrer: '',
      estanteria: '',
      espai: '',
      producte: '',
      data: '',
      operari: '',
      origen: ''
    };
    setFiltres(neteja);
    onFilter(neteja);
  };

  const handleFilter = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filtres).filter(([_, value]) => value.trim() !== '')
    );
    onFilter(activeFilters);
  };

  return (
    <>
      <div className="row bg-grey pt-3 px-2 mx-0">
        {Object.keys(filtres).map((key, index) => (
          <div key={index} className="col-12 col-md-6 col-xl-4">
            <div className="mb-3 text-light-blue">
              <label htmlFor={key} className="form-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type={key === 'data' ? 'date' : 'text'}
                placeholder={`Ex: ${key}`}
                className="form-control"
                id={key}
                value={filtres[key]}
                onChange={handleChange}
                list={`list-${key}`}
              />
              {suggestions[key] && suggestions[key].length > 0 && (
                <datalist id={`list-${key}`}>
                  {suggestions[key].map((option, i) => (
                    <option key={i} value={option} />
                  ))}
                </datalist>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="row bg-grey pb-3 mx-0">
        <div className="col-xl-4"></div>
        <div className="col-xl-4"></div>
        <div className="col-12 col-xl-4 text-end">
          <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejafiltres}>
            <i className="bi bi-trash px-1 text-white"></i> Netejar
          </button>
          <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={handleFilter}>
            <i className="bi bi-funnel px-1 text-white"></i> Filtrar
          </button>
        </div>
      </div>
    </>
  );
}

export default FiltresMoviments;
