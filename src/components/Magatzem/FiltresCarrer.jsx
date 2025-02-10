import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const apiUrl = import.meta.env.VITE_API_URL;

const FiltresCarrer = ({ onFilter, onClear }) => {
    const [magatzems, setMagatzems] = useState([]); // Aquí se almacenan los magatzems para los filtros
    const [filters, setFilters] = useState({
        name: '',        // Filtro por nombre de la calle
        storage_id: ''   // Filtro por id_magatzem (almacen)
    });

    // Cargar magatzems para los filtros
    useEffect(() => {
        axios.get(`${apiUrl}/magatzem`, { headers: { "auth-token": localStorage.getItem("token") } })
            .then(response => {
                setMagatzems(response.data);
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
            storage_id: ''
        });
        onClear(); // Llamar a la función de borrar los filtros en el componente padre
    };

    return (
        <form className="row bg-grey pt-3 px-2 mx-0 text-light-blue" onSubmit={handleFilterSubmit}>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterName" className="form-label">Nom del Carrer</label>
                <input
                    type="text"
                    className="form-control"
                    id="filterName"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    placeholder="Filtra per nom"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-4 text-light-blue">
                <label htmlFor="filterStorageId" className="form-label">Magatzem</label>
                <select
                    className="form-control"
                    id="filterStorageId"
                    name="storage_id"
                    value={filters.storage_id}
                    onChange={handleFilterChange}
                    placeholder="Filtra per magatzem"
                >
                    <option value="">Seleccionar Magatzem</option>
                    {magatzems.map(magatzem => (
                        <option key={magatzem.id} value={magatzem.id}>
                            {magatzem.name}
                        </option>
                    ))}
                </select>
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

FiltresCarrer.propTypes = {
    onFilter: PropTypes.func.isRequired, 
    onClear: PropTypes.func.isRequired, 
};

export default FiltresCarrer;
