import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const FiltresProveidors = ({ onFilter, onClear }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        nif: '',
        phone: '',
        email: ''
    });

    // Cargar los proveedores desde la API
    useEffect(() => {
        axios.get(`${apiUrl}supplier`, { headers: { "auth-token": localStorage.getItem("token") } })
        .then(response => {
          console.log(response)
          setSuppliers(response.data)
        })
        .catch(e => {
          console.log(e)
        }
        )
    },[])

    const filtrat = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const botoFiltra = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const netejaFiltres = (e) => {
        e.preventDefault();
        setFilters({
            name: '',
            nif: '',
            phone: '',
            email: ''
        });
        onClear();
    };

    return (
        <form className="row bg-grey pt-3 px-2 mx-0 text-light-blue">
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterName" className="form-label">Nom</label>
                <select
                    className="form-control"
                    id="filterName"
                    name="name"
                    value={filters.name}
                    onChange={filtrat}
                    placeholder="Filtra per nom"
                >
                    <option value="">Seleccionar nom</option>
                    {Array.isArray(suppliers) && suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.name}>
                            {supplier.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4 text-light-blue">
                <label htmlFor="filterNif" className="form-label">NIF</label>
                <select
                    className="form-control"
                    id="filterNif"
                    name="nif"
                    value={filters.nif}
                    onChange={filtrat}
                    placeholder="Filtra per NIF"
                >
                    <option value="">Seleccionar NIF</option>
                    {Array.isArray(suppliers) && suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.nif}>
                            {supplier.nif}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4 text-light-blue">
                <label htmlFor="phone" className="form-label">Telèfon</label>
                <input
                    list="phoneSuggestions"
                    type="text"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={filters.phone}
                    onChange={filtrat}
                    placeholder="Filtra per Telèfon"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-4 text-light-blue pt-3">
                <label htmlFor="email" className="form-label">Email</label>
                <select
                    className="form-control"
                    id="email"
                    name="email"
                    value={filters.email}
                    onChange={filtrat}
                    placeholder="Filtra per Email"
                >
                    <option value="">Seleccionar Email</option>
                    {Array.isArray(suppliers) && suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.email}>
                            {supplier.email}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row bg-grey pb-3 pt-2 mx-0">
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
                <div className="col-12 col-xl-4 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejaFiltres}>
                        <i className="bi bi-trash px-1 text-white"></i> Netejar
                    </button>
                    <button className="btn btn-secondary me-2 ps-2 orange-button text-white" onClick={botoFiltra}>
                        <i className="bi bi-funnel px-1 text-white"></i> Filtrar
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FiltresProveidors;
