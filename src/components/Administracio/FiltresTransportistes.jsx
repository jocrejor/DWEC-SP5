// FiltresTransportistes.jsx
import React, { useState } from 'react';

const FiltresTransportistes = ({ carriers, pais, provincia, ciutat, onFilter, onClear }) => {
    const [filters, setFilters] = useState({
        name: '',
        nif: '',
        state_id: '',
        province: '',
        city: '',
    });

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleClear = (e) => {
        e.preventDefault();
        setFilters({
            name: '',
            nif: '',
            state_id: '',
            province: '',
            city: '',
        });
        onClear();
    };

    return (
        <form className="row bg-grey pt-3 px-2 mx-0">
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterName" className="form-label">Nom</label>
                <input
                    list="nameSuggestions"
                    type="text"
                    className="form-control"
                    id="filterName"
                    name="name"
                    value={filters.name}
                    onChange={handleChange}
                    placeholder="Filtra per nom"
                />
                <datalist id="nameSuggestions">
                    {carriers && carriers.map(carrier => (
                        <option key={carrier.id} value={carrier.name} />
                    ))}
                </datalist>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterNif" className="form-label">NIF</label>
                <input
                    list="nifSuggestions"
                    type="text"
                    className="form-control"
                    id="filterNif"
                    name="nif"
                    value={filters.nif}
                    onChange={handleChange}
                    placeholder="Filtra per NIF"
                />
                <datalist id="nifSuggestions">
                    {carriers && carriers.map(carrier => (
                        <option key={carrier.id} value={carrier.nif} />
                    ))}
                </datalist>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterState" className="form-label">Estat</label>
                <select
                    className="form-select"
                    id="filterState"
                    name="state_id"
                    value={filters.state_id}
                    onChange={handleChange}
                >
                    <option value="">Tots</option>
                    {pais && pais.map(state => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                </select>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterProvince" className="form-label">Província</label>
                <input
                    list="provinceSuggestions"
                    type="text"
                    className="form-control"
                    id="filterProvince"
                    name="province"
                    value={filters.province}
                    onChange={handleChange}
                    placeholder="Filtra per província"
                />
                <datalist id="provinceSuggestions">
                    {provincia && provincia.map(prov => (
                        <option key={prov.id || prov.name} value={prov.name} />
                    ))}
                </datalist>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterCity" className="form-label">Ciutat</label>
                <input
                    list="citySuggestions"
                    type="text"
                    className="form-control"
                    id="filterCity"
                    name="city"
                    value={filters.city}
                    onChange={handleChange}
                    placeholder="Filtra per ciutat"
                />
                <datalist id="citySuggestions">
                    {ciutat && ciutat.map(city => (
                        <option key={city.id} value={city.name} />
                    ))}
                </datalist>
            </div>
            <div className="row bg-grey pb-3 pt-2 mx-0">
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
                <div className="col-12 col-xl-4 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white" onClick={handleClear}><i className="bi bi-trash px-1 text-white"></i>Netejar</button>
                    <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={handleFilter}><i className="bi bi-funnel px-1 text-white"></i>Filtrar</button>
                </div>
            </div>
        </form>
    );
};

export default FiltresTransportistes;
