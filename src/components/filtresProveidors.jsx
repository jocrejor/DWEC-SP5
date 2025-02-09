import { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

function Filtres({ onFilterChange, onFilterRestart }) {
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        axios.get(`${apiUrl}supplier`, { headers: { "auth-token": localStorage.getItem("token") } })
            .then(response => {
                console.log(response);
                setSuppliers(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const filtrar = () => {
        const clientValue = document.getElementById('name').value;
        const nifValue = document.getElementById('nif').value;
        const phoneValue = document.getElementById('phone').value;
        const emailValue = document.getElementById('email').value;
        onFilterChange(clientValue, nifValue, phoneValue, emailValue);
    }

    const netejaFiltre = () => {
        onFilterRestart();
    }

    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="name" className="form-label">Nom</label>
                        <select className='form-control' name="name" id="name">
                            <option value="">Selecciona un nom del proveidor:</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="nif" className="form-label">NIF</label>
                        <select className='form-control' name="nif" id="nif">
                            <option value="">Selecciona un NIF del proveidor:</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.nif}>{supplier.nif}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="phone" className="form-label">Telèfon</label>
                        <input type="text" placeholder='Ex: 966483212' className="form-control" id="phone" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="email" className="form-label">Email</label>
                        <select className='form-control' name="email" id="email">
                            <option value="">Selecciona un email del proveidor:</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.email}>{supplier.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="row bg-grey pb-3 mx-0">
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
                <div className="col-12 col-xl-4 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejaFiltre}>
                        <i className="bi bi-trash px-1 text-white"></i>Netejar
                    </button>
                    <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={filtrar}>
                        <i className="bi bi-funnel px-1 text-white"></i>Filtrar
                    </button>
                </div>
            </div>
        </>
    );
}

export default Filtres;
