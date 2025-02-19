import React, { useState } from 'react';

function FiltresClients({ onSearch }) {
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        nif: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [id]: value
        }));
    };

    const handleFilter = () => {
        onSearch(filters);
    };

    const handleClear = () => {
        setFilters({
            name: '',
            email: '',
            phone: '',
            address: '',
            nif: ''
        });
        onFilter({});
    };

    const handleSubmit = () => {
        onSearch(filters);  
      };

    return (
        <form onSubmit={handleFilter}>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="name" className="form-label">Nom</label>
                        <input
                            type="text"
                            value={filters.name}
                            onChange={handleChange}
                            placeholder='Paco Perez'
                            className="form-control"
                            id="name"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            value={filters.email}
                            onChange={handleChange}
                            placeholder='prova@gmail.com'
                            className="form-control"
                            id="email"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="phone" className="form-label">Telèfon</label>
                        <input
                            type="text"
                            value={filters.phone}
                            onChange={handleChange}
                            placeholder='743883232'
                            className="form-control"
                            id="phone"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="address" className="form-label">Adreça</label>
                        <input
                            type="text"
                            value={filters.address}
                            onChange={handleChange}
                            placeholder='Calle Gran Vía, 32'
                            className="form-control"
                            id="address"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="nif" className="form-label">NIF</label>
                        <input
                            type="text"
                            value={filters.nif}
                            onChange={handleChange}
                            placeholder='32186572R'
                            className="form-control"
                            id="nif"
                        />
                    </div>
                </div>
            </div>
            <div className="row bg-grey pb-3 mx-0 d-flex justify-content-end">
                <div className="col-12 col-xl-4 text-end">
                    <button
                        className="btn btn-secondary ps-2 me-2 text-white"
                        onClick={handleClear}
                    >
                        <i className="bi bi-trash px-1 text-white"></i> Netejar
                    </button>
                    <button
                        type='button'
                        className="btn btn-primary me-2 ps-2 orange-button text-white"
                        onClick={handleFilter}
                    >
                        <i className="bi bi-funnel px-1 text-white"></i> Filtrar
                    </button>
                </div>
            </div>
        </form>
    );
}

export default FiltresClients;
