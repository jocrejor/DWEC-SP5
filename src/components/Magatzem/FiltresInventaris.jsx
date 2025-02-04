import React, { useEffect, useState } from 'react'
import axios from 'axios';

function FiltresInventaris() {
    const [storages, setStorages] = useState([]);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.get(`${apiURL}storage`, { headers: { "auth-token": localStorage.getItem('token') } })
            .then(response => {
                setStorages(response.data);
            })
            .catch(e => { console.log(e.response.data) })
    }, [])

    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="date-from" className="form-label">Data de</label>
                        <input type="date" className="form-control" id="date-from" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="date-to" className="form-label">Fins</label>
                        <input type="date" className="form-control" id="date-to" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="status" className="form-label">Estat</label>
                        <select className='form-select' id='status'>
                            <option>Selecciona una opció</option>
                            <option value="Pendent">Pendent</option>
                            <option value="Fent-se">Fent-se</option>
                            <option value="Completat">Completat</option>
                        </select>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="magatzem" className="form-label">Magatzem</label>
                        <select className='form-select' id='magatzem' defaultValue="def">
                            <option value="def">Selecciona una opció</option>
                            {storages?.map(storage => {
                                return (
                                    <option value={storage.name} key={storage.id}>{storage.name}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
            </div>
            <div className="row bg-grey pb-3 mx-0">
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
                <div className="col-12 col-xl-4 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white"><i className="bi bi-trash px-1 text-white"></i>Netejar</button>
                    <button className="btn btn-primary me-2 ps-2 orange-button text-white"><i className="bi bi-funnel px-1 text-white"></i>Filtrar</button>
                </div>
            </div>
        </>
    )
}

export default FiltresInventaris