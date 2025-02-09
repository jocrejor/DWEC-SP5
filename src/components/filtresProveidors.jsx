import { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

function Filtres({ onFilterChange, onFilterRestart }) {
    const [suppliers, setSuppliers] = useState([]);
    const [name, setName] = useState('');
    const [nif, setNif] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        axios.get(`${apiUrl}supplier`, { headers: { "auth-token": localStorage.getItem("token") } })
            .then(response => {
                setSuppliers(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const filtrar = () => {
        // Enviar los filtros actualizados al componente principal
        onFilterChange(name, nif, phone, email);
    };

    const netejaFiltre = () => {
        // Limpiar los filtros
        setName('');
        setNif('');
        setPhone('');
        setEmail('');
        onFilterRestart();
    };

    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="name" className="form-label">Nom</label>
                        <select className='form-control' name="name" id="name" value={name} onChange={(e) => setName(e.target.value)}>
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
                        <select className='form-control' name="nif" id="nif" value={nif} onChange={(e) => setNif(e.target.value)}>
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
                        <input
                            type="text"
                            placeholder='Ex: 966483212'
                            className="form-control"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="email" className="form-label">Email</label>
                        <select className='form-control' name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}>
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
