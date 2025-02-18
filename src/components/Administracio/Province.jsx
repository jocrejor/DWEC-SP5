// Province.jsx
import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Filtres from './ProvinceFiltres';

const apiUrl = import.meta.env.VITE_API_URL;

const ProvinciaSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'El valor mínim és de 4 caràcters.')
    .max(25, 'El valor màxim és de 25 caràcters.')
    .required('Valor requerit'),
  state_id: Yup.number()
    .integer('El valor ha de ser un número enter.')
    .required('Valor requerit'),
});

function Province() {
  const { stateId } = useParams();
  const navigate = useNavigate();

  const [provincias, setProvincias] = useState([]);
  const [currentProvince, setCurrentProvince] = useState(null);
  const [showCreate, setShowCrear] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ nombre: '', orden: 'none' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarDatos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/province`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      setProvincias(response.data);
    } catch (error) {
      console.error("Error al buscar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const crearProvincia = (values, { setSubmitting, resetForm }) => {
    axios.post(`${apiUrl}/province`, values, {
      headers: { "auth-token": localStorage.getItem("token") },
    })
      .then(() => {
        cargarDatos();
      })
      .catch((err) => console.error("Error al crear la provincia:", err))
      .finally(() => {
        setSubmitting(false);
        resetForm();
        setShowCrear(false);
      });
  };

  const eliminarProvincia = (id) => {
    axios
      .delete(`${apiUrl}/province/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then(() => {
        cargarDatos();
      })
      .catch((err) => {
        console.error("Error al eliminar la provincia:", err.response || err);
      });
  };

  const modalvisualitzar = (prov) => {
    setCurrentProvince(prov);
    setShowView(true);
  };

  const modaleditar = (prov) => {
    setCurrentProvince(prov);
    setShowEdit(true);
  };

  const editarprovincia = (values, { setSubmitting, resetForm }) => {
    axios
      .put(`${apiUrl}/province/${currentProvince.id}`, values, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then(() => {
        cargarDatos();
      })
      .catch((err) => console.error("Error al editar la provincia:", err))
      .finally(() => {
        setSubmitting(false);
        resetForm();
        setShowEdit(false);
      });
  };

  // Filtrar provincias según el estado seleccionado
  let filteredProvincias = provincias;
  if (stateId) {
    filteredProvincias = filteredProvincias.filter(
      (prov) => prov.state_id === Number(stateId)
    );
  }
  if (appliedFilters.nombre) {
    filteredProvincias = filteredProvincias.filter((prov) =>
      prov.name.toLowerCase().includes(appliedFilters.nombre.toLowerCase())
    );
  }
  if (appliedFilters.orden === 'asc') {
    filteredProvincias = [...filteredProvincias].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  const totalpagines = Math.ceil(filteredProvincias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProvincias.slice(startIndex, startIndex + itemsPerPage);

  const handleFilter = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setAppliedFilters({ nombre: '', orden: 'none' });
    setCurrentPage(1);
  };

  const pagesToShow = 3;
  const currentBlock = Math.floor((currentPage - 1) / pagesToShow);
  const blocinici = currentBlock * pagesToShow + 1;
  const blockfinal = Math.min(totalpagines, (currentBlock + 1) * pagesToShow);

  const flegespaginacio = (e) => {
    e.preventDefault();
    if (currentBlock > 0) {
      setCurrentPage((currentBlock - 1) * pagesToShow + 1);
    }
  };

  const canvibloc = (e) => {
    e.preventDefault();
    if (blockfinal < totalpagines) {
      setCurrentPage((currentBlock + 1) * pagesToShow + 1);
    }
  };

  return (
    <>
      <Filtres 
        suggestions={[...new Set(provincias.map((prov) => prov.name))]}
        onFilter={handleFilter}
        onClear={handleClearFilters}
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
            <button type="button" onClick={() => setShowCrear(true)} className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear
            </button>
          </div>
        </div>
      </div>

      {/* Modal para crear */}
      <Modal show={showCreate} onHide={() => setShowCrear(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nova Provincia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ name: '', state_id: '' }}
            validationSchema={ProvinciaSchema}
            onSubmit={crearProvincia}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="name">Nom de la provincia</label>
                  <Field id="name" name="name" type="text" className="form-control" />
                  {errors.name && touched.name && (
                    <div className="text-danger">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="state_id">ID de l'estat</label>
                  <Field id="state_id" name="state_id" type="number" className="form-control" />
                  {errors.state_id && touched.state_id && (
                    <div className="text-danger">{errors.state_id}</div>
                  )}
                </div>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  Crear
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Modal para visualizar */}
      <Modal show={showView} onHide={() => setShowView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar Provincia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProvince ? (
            <>
              <p><strong>ID:</strong> {currentProvince.id}</p>
              <p><strong>Nom:</strong> {currentProvince.name}</p>
              <p><strong>ID de l'estat:</strong> {currentProvince.state_id}</p>
            </>
          ) : (
            <p>No hi ha dades per mostrar.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowView(false)}>
            Tancar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modificar Provincia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProvince && (
            <Formik
              initialValues={{
                name: currentProvince.name,
                state_id: currentProvince.state_id,
              }}
              validationSchema={ProvinciaSchema}
              onSubmit={editarprovincia}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name">Nom de la provincia</label>
                    <Field id="name" name="name" type="text" className="form-control" />
                    {errors.name && touched.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="state_id">ID de l'estat</label>
                    <Field id="state_id" name="state_id" type="number" className="form-control" />
                    {errors.state_id && touched.state_id && (
                      <div className="text-danger">{errors.state_id}</div>
                    )}
                  </div>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Actualitzar
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>

      {/* Tabla de Provincias */}
      <div className="row">
        <div className="col-12">
          <table className="table table-striped text-center align-middle">
            <thead className="table-active border-bottom border-dark-subtle">
              <tr>
                <th className="align-middle" scope="col">
                  <input className="form-check-input" type="checkbox" />
                </th>
                <th scope="col">ID</th>
                <th scope="col">Nom</th>
                <th scope="col">ID de l'estat</th>
                <th scope="col">City</th>
                <th scope="col">Accions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((prov) => (
                <tr key={prov.id}>
                  <td data-cell="Seleccionar">
                    <input className="form-check-input" type="checkbox" />
                  </td>
                  <td data-cell="ID">{prov.id}</td>
                  <td data-cell="Nom">{prov.name}</td>
                  <td data-cell="ID de l'estat">
                    <Button  className='outline-orange' onClick={() => navigate('/dadesGeografiques')}>
                      Veure Estat
                    </Button>
                  </td>
                  <td data-cell="City">
                  <Button className='outline-blue' onClick={() => navigate(`../city/${prov.id}`)}> City </Button>
                  </td>
                  <td className="fs-5" data-no-colon="true">
                    <i
                      className="bi bi-eye me-2"
                      title="Visualitzar"
                      onClick={() => modalvisualitzar(prov)}
                    ></i>
                    <i
                      className="bi bi-pencil-square me-2"
                      title="Modificar"
                      onClick={() => modaleditar(prov)}
                    ></i>
                    <i
                      className="bi bi-trash"
                      title="Eliminar"
                      onClick={() => eliminarProvincia(prov.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginació */}
      {totalpagines > 1 && (
        <nav aria-label="Page navigation example" className="d-block">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentBlock === 0 ? 'disabled' : ''}`}>
              <a
                className="page-link text-light-blue"
                href="#"
                aria-label="Previous"
                onClick={flegespaginacio}
              >
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            {Array.from({ length: blockfinal - blocinici + 1 }, (_, i) => blocinici + i).map((page) => (
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
            <li className={`page-item ${blockfinal === totalpagines ? 'disabled' : ''}`}>
              <a
                className="page-link text-light-blue"
                href="#"
                aria-label="Next"
                onClick={canvibloc}
              >
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}

export default Province;
