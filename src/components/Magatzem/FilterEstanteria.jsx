import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';


const apiUrl = import.meta.env.VITE_API_URL;

const FilterEstanteria = ({ onFilter, onClear }) => {
    const [magatzems, setMagatzems] = useState([]); // Aquí se almacenan los magatzems para los filtros
    const [filters, setFilters] = useState({
        nom: '',          // Filtro por nombre de la calle
        id_storage: '',   // Filtro por id_storage (almacen)
        id_street: ''     // Filtro por id_street
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
            nom: '',
            id_storage: '',
            id_street: ''
        });
        onClear(); // Llamar a la función de borrar los filtros en el componente padre
    };

    return (
        <form className="row bg-grey pt-3 px-2 mx-0 text-light-blue" onSubmit={handleFilterSubmit}>
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterNom" className="form-label">Nom Estanteria</label>
                <input
                    type="text"
                    className="form-control"
                    id="filterNom"
                    name="nom"
                    value={filters.nom}
                    onChange={handleFilterChange}
                    placeholder="Filtra per nom"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterIdStreet" className="form-label">Carrer</label>
                <input
                    type="text"
                    className="form-control"
                    id="filterIdStreet"
                    name="id_street"
                    value={filters.id_street}
                    onChange={handleFilterChange}
                    placeholder="Filtra per ID del carrer"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterIdStorage" className="form-label">Magatzem</label>
                <input
                    type="text"
                    className="form-control"
                    id="filterIdStorage"
                    name="id_magatzem"
                    value={filters.id_street}
                    onChange={handleFilterChange}
                    placeholder="Filtra per ID del magatzem"
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

FilterEstanteria.propTypes = {
    onFilter: PropTypes.func.isRequired, 
    onClear: PropTypes.func.isRequired, 
};

export default FilterEstanteria;
