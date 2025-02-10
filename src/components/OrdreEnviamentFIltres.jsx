import {useState, useEffect} from 'react'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL;

function Filtres({onFilterChange, onFilterRestart}) {
    const [clients,setClients] = useState([])
    const [status,SetStatus] = useState([])

    useEffect(() => {
        axios.get(`${apiUrl}client`, { headers: { "auth-token": localStorage.getItem("token") } })
        .then(response => {
          console.log(response)
          setClients(response.data)
        })
        .catch(e => {
          console.log(e)
        }
        )

        axios.get(`${apiUrl}ordershipping_status`, { headers: { "auth-token": localStorage.getItem("token") } })
        .then(response => {
          console.log(response)
          SetStatus(response.data)
        })
        .catch(e => {
          console.log(e)
        }
        )
    },[])

    const filtrar = () => {
        const clientValue = document.getElementById('client').value;
        const idValue = document.getElementById('id').value;
        const statusValue = document.getElementById('status').value;
        onFilterChange(clientValue,idValue,statusValue);
    }

    const netejaFiltre = () => {
       onFilterRestart();
    }
    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="id" className="form-label">Identificador</label>
                        <input type="text" placeholder='Ex: 01' className="form-control" id="id" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="status" className="form-label">Estat</label>
                        <select className='form-control' name="status" id="status">
                            <option value="">Selecciona un estat:</option>
                            {status.map(estat => {
                                return <option key={estat.id} value={estat.id}>{estat.name}</option>
                            })}
                        </select>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="client" className="form-label">Client</label>
                        <select className='form-control' name="client" id="client">
                            <option value="">Selecciona un client:</option>
                            {clients.map(client => {
                                return <option key={client.id} value={client.id}>{client.name}</option>
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
                    <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejaFiltre}><i className="bi bi-trash px-1 text-white"></i>Netejar</button>
                    <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={filtrar}><i className="bi bi-funnel px-1 text-white"></i>Filtrar</button>
                </div>
            </div>
        </>
    )
}

export default Filtres