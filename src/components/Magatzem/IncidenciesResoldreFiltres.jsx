import axios from 'axios';
import  { useState, useEffect } from 'react';

function IncidenciesResoldreFiltres({onFilter, onClear}) {
    
    const [orderlineStatus, setOrderlineStatus] = useState([]);
    const [filters, setFilters] = useState({
        orderline_status_id: ''
    })
    
    /*Carguem l'ordre line status desde l'API */
    const getDataOrderLineStatus = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/orderline_status`, { headers: { "auth-token": token } })
            .then(response => setOrderlineStatus(response.data))
            .catch(error => console.log(error))
    }

    /*UseEffect*/
    useEffect(() => {
        getDataOrderLineStatus()
    },[]) // DAVID
    

    const filter = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        })
    }
    
    const buttonFilter = (e) => {
        e.preventDefault()
        onFilter(filters)
    }
    
    const cleanFilters = (e) => {
        e.preventDefault()
        setFilters({
            orderline_status_id: ''
        });
        onClear()
    }
    
    return (
        <>
        <form className="row bg-grey pt-3 px-2 mx-0 text-light-blue">
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="orderline_status_id" className="form-label">Estat</label>
                <select
                    className="form-control"
                    id="orderline_status_id"
                    name="orderline_status_id"
                    value={filters.orderline_status_id}
                    onChange={filter}
                >
                    <option value="">Seleccionar estat</option>
                    {orderlineStatus.map(status => (
                        <option key={status.id} value={status.id}>
                            {status.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="row bg-grey pb-3 mx-0">
                    <div className="col-xl-4"></div>
                    <div className="col-xl-4"></div>
                    <div className="col-12 col-xl-4 text-end">
                        <button className="btn btn-secondary ps-2 me-2 text-white" onClick={cleanFilters}>
                            <i className="bi bi-trash px-1 text-white"></i> Netejar
                        </button>
                        <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={buttonFilter}>
                            <i className="bi bi-funnel px-1 text-white"></i> Filtrar
                        </button>
                    </div>
                </div>
            </div>
            </form>
        </>
    )
}

export default IncidenciesResoldreFiltres;