import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const apiUrl = import.meta.env.VITE_API_URL;

const FiltresEspai = ({ filters }) => {
  const [magatzem, setMagatzem] = useState(null); 
  const [carrer, setCarrer] = useState(null);     
  const [shelf, setShelf] = useState(null);      

  useEffect(() => {
    
    if (filters.storage_id) {
      axios.get(`${apiUrl}/magatzem/${filters.storage_id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      })
      .then(response => {
        setMagatzem(response.data);  
      })
      .catch(error => {
        console.error('Error al cargar el magatzem:', error);
      });
    }

    
    if (filters.street_id) {
      axios.get(`${apiUrl}/carrer/${filters.street_id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      })
      .then(response => {
        setCarrer(response.data);  
      })
      .catch(error => {
        console.error('Error al cargar el carrer:', error);
      });
    }

    
    if (filters.shelf_id) {
      axios.get(`${apiUrl}/shelf/${filters.shelf_id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      })
      .then(response => {
        setShelf(response.data);  // Guardar el shelf en el estado
      })
      .catch(error => {
        console.error('Error al cargar el shelf:', error);
      });
    }
  }, [filters]);

  return (
    <form className="row bg-grey pt-3 px-2 mx-0 text-light-blue">
      {}
      <div className="col-12 col-md-6 col-xl-4">
        <label htmlFor="filterName" className="form-label">Nom del Espai</label>
        <input
          type="text"
          className="form-control"
          id="filterName"
          name="name"
          value={filters.name || ''}
          readOnly
          placeholder="Filtra per nom"
        />
      </div>

      {}
      <div className="col-12 col-md-6 col-xl-4">
        <label htmlFor="filterStorageId" className="form-label">Magatzem</label>
        <input
          type="text"
          className="form-control"
          id="filterStorageId"
          value={magatzem ? magatzem.id : filters.storage_id} 
          readOnly 
        />
      </div>

      {}
      <div className="col-12 col-md-6 col-xl-4">
        <label htmlFor="filterStreetId" className="form-label">Carrer</label>
        <input
          type="text"
          className="form-control"
          id="filterStreetId"
          value={carrer ? carrer.id : filters.street_id} 
          readOnly 
        />
      </div>

      {}
      <div className="col-12 col-md-6 col-xl-4">
        <label htmlFor="filterShelfId" className="form-label">Estanteria</label>
        <input
          type="text"
          className="form-control"
          id="filterShelfId"
          value={shelf ? shelf.id : filters.shelf_id} 
          readOnly 
        />
      </div>

      {}
      <div className="col-12 d-flex justify-content-end align-items-center w-100">
        <button className="btn btn-secondary ps-2 me-2 text-white" onClick={() => window.location.reload()}>
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

FiltresEspai.propTypes = {
  filters: PropTypes.shape({
    storage_id: PropTypes.string.isRequired,
    street_id: PropTypes.string.isRequired,
    shelf_id: PropTypes.string.isRequired, 
    name: PropTypes.string,
  }).isRequired,
};

export default FiltresEspai;
