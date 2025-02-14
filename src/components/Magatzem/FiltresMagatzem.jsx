import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const apiUrl = import.meta.env.VITE_API_URL;

const FiltresMagatzem = ({ onFilter, onClear }) => {
    const [storages, setStorages] = useState([]); 
    const [filters, setFilters] = useState({
        name: '',
        type: '',
        address: ''
    });

    useEffect(() => {
        
        axios.get(`${apiUrl}/storage`, { headers: { "auth-token": localStorage.getItem("token") } })
            .then(response => {
                setStorages(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);  // Pasa los filtros hacia el componente padre
    };

    const handleClearFilters = (e) => {
        e.preventDefault();
        setFilters({
            name: '',
            type: '',
            address: ''
        });
        onClear(); 
    };

    return (
        <form className="row bg-grey pt-3 px-2 mx-0 text-light-blue" onSubmit={handleFilterSubmit}>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterName" className="form-label">Nom</label>
                <select
                    className="form-control"
                    id="filterName"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    placeholder="Filtra per nom"
                >
                    <option value="">Seleccionar nom</option>
                    {storages.map(storage => (
                        <option key={storage.id} value={storage.name}>
                            {storage.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4 text-light-blue">
                <label htmlFor="filterType" className="form-label">Tipus</label>
                <select
                    className="form-control"
                    id="filterType"
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    placeholder="Filtra per Tipus"
                >
                    <option value="">Seleccionar Tipus</option>
                    {storages.map(storage => (
                        <option key={storage.id} value={storage.type}>
                            {storage.type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4 text-light-blue">
                <label htmlFor="filterAddress" className="form-label">Adreça</label>
                <input
                    list="addressSuggestions"
                    type="text"
                    className="form-control"
                    id="filterAddress"
                    name="address"
                    value={filters.address}
                    onChange={handleFilterChange}
                    placeholder="Filtra per Adreça"
                />
            </div>

            {/* Contenedor para los botones con alineación a la derecha */}
            <div className="col-12 d-flex justify-content-end align-items-center w-100">
                <button className="btn btn-secondary ps-2 me-2 text-white" onClick={handleClearFilters}>
                    <i className="bi bi-trash px-1 text-white"></i>Netejar
                </button>
                <button 
                    type="submit" 
                    className="btn btn-primary me-2 ps-2 orange-button text-white"
                >
                    <i className="bi bi-funnel px-1 text-white"></i>Filtrar
                </button>
            </div>
        </form>
    );
};


FiltresMagatzem.propTypes = {
    onFilter: PropTypes.func.isRequired, 
    onClear: PropTypes.func.isRequired, 
};

export default FiltresMagatzem;
