// State.jsx
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FiltresState from './StateProvince'; 

const apiUrl = import.meta.env.VITE_API_URL;

const StateSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'Mínimo 4 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .required('Campo requerido')
});

function State() {
  const [states, setStates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Crear");
  const [valorsInicials, setValorsInicials] = useState({ name: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${apiUrl}/state`, {
      headers: { "auth-token": localStorage.getItem("token") }
    })
      .then(response => setStates(response.data))
      .catch(error => console.log('Error al obtener estados:', error));
  }, []);

  const eliminarestat = async (id) => {
    try {
      await axios.delete(`${apiUrl}/state/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setStates(states.filter(item => item.id !== id));
    } catch (e) {
      console.log('Error al eliminar estado:', e);
    }
  };

  const modificarestat = (valors) => {
    setTipoModal("Modificar");
    setValorsInicials(valors);
    setShowModal(true);
  };

  const crearestat = () => {
    setShowModal(true);
    setTipoModal("Crear");
  };

  const visualizarestat = (stateItem) => {
    setSelectedState(stateItem);
    setShowViewModal(true);
  };

  const [appliedFilters, setAppliedFilters] = useState({ name: '', orden: 'none' });

  const suggestions = [...new Set(states.map(item => item.name))];

  let filteredStates = states;
  if (appliedFilters.name) {
    filteredStates = filteredStates.filter(item =>
      item.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
    );
  }
  if (appliedFilters.orden === 'asc') {
    filteredStates = [...filteredStates].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Paginación
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredStates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredStates.slice(startIndex, startIndex + itemsPerPage);

  const pagesToShow = 3;
  const currentBlock = Math.floor((currentPage - 1) / pagesToShow);
  const blockStart = currentBlock * pagesToShow + 1;
  const blockEnd = Math.min(totalPages, (currentBlock + 1) * pagesToShow);

  const handlePreviousBlock = (e) => {
    e.preventDefault();
    if (currentBlock > 0) {
      setCurrentPage((currentBlock - 1) * pagesToShow + 1);
    }
  };

  const handleNextBlock = (e) => {
    e.preventDefault();
    if (blockEnd < totalPages) {
      setCurrentPage((currentBlock + 1) * pagesToShow + 1);
    }
  };

  const handleFilter = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setAppliedFilters({ name: '', orden: 'none' });
    setCurrentPage(1);
  };

  return (
    <>
      <FiltresState 
        suggestions={suggestions} 
        onFilter={handleFilter} 
        onClear={handleClear} 
      />
      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                <option defaultValue>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label htmlFor="floatingSelect">Accions en lot</label>
            </div>
            <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button">
              <i className="bi bi-check-circle text-white px-1"></i>Aplicar
            </button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            <button type="button" onClick={crearestat} className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear
            </button>
          </div>
        </div>
      </div>
  
      <div className="row">
        <div className="col-12">
          <table className="table table-striped text-center align-middle">
            <thead className="table-active border-bottom border-dark-subtle">
              <tr>
                <th className="align-middle" scope="col">
                  <input className="form-check-input" type="checkbox" />
                </th>
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Provincies</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(item => (
                <tr key={item.id}>
                  <td data-cell="Seleccionar">
                    <input className="form-check-input" type="checkbox" />
                  </td>
                  <td data-cell="ID">{item.id}</td>
                  <td data-cell="Nombre">{item.name}</td>
                  <td data-cell="Nombre">
                    <Button 
                      title="Veure Provincias" 
                      className='outline-orange'
                      onClick={() => navigate(`./province/${item.id}`)}
                    >
                      Provincies
                    </Button>
                  </td>
                  <td className="fs-5" data-no-colon="true">
                    {/* Icono para visualizar */}
                    <i 
                      className="bi bi-eye me-2" 
                      title="Visualizar" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => visualizarestat(item)}
                    ></i>
                    <i 
                      className="bi bi-pencil-square me-2" 
                      title="Modificar" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => modificarestat(item)}
                    ></i>
                    <i 
                      className="bi bi-trash" 
                      title="Eliminar" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => eliminarestat(item.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Page navigation example" className="d-block">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentBlock === 0 ? 'disabled' : ''}`}>
              <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={handlePreviousBlock}>
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            {Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i).map(page => (
              <li key={page} className="page-item">
                <a
                  className={`page-link ${currentPage === page ? 'activo-2' : 'text-light-blue'}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </a>
              </li>
            ))}
            <li className={`page-item ${blockEnd === totalPages ? 'disabled' : ''}`}>
              <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={handleNextBlock}>
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal para Crear/Modificar Estado */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '' }}
            validationSchema={StateSchema}
            onSubmit={async (values) => {
              try {
                if (tipoModal === "Crear") {
                  await axios.post(`${apiUrl}/state`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                } else {
                  await axios.put(`${apiUrl}/state/${values.id}`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                }
                setShowModal(false);
                window.location.reload();
              } catch (e) {
                console.log('Error al enviar:', e);
              }
            }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <div>
                  <label htmlFor="name">Nombre</label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Nombre del estado"
                    autoComplete="off"
                    value={values.name}
                    className="form-control"
                  />
                  {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <Button type="submit" variant="primary" className="mt-2">
                  {tipoModal === "Crear" ? "Crear" : "Modificar"}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualizar Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedState ? (
            <>
              <p><strong>ID:</strong> {selectedState.id}</p>
              <p><strong>Nombre:</strong> {selectedState.name}</p>
            
            </>
          ) : (
            <p>No hay datos para mostrar.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default State;
