import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; 
import FiltresCity from './CityFiltres'; 

const apiUrl = import.meta.env.VITE_API_URL;

const CitySchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'El valor mínim és de 4 caràcters.')
    .max(40, 'El valor màxim és de 40 caràcters.')
    .required('Valor requerit'),
  province_id: Yup.number()
    .integer('El valor ha de ser un número enter.')
    .required('Valor requerit'),
});

function City() {

  const { provinceId } = useParams();
  const navigate = useNavigate();
  
  const [showCreate, setShowCrear] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [cities, setCities] = useState([]);
  const [currentCity, setCurrentCity] = useState(null);
  

  const [appliedFilters, setAppliedFilters] = useState({ name: '', orden: 'none', provinceId: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const cargarDatos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/city`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      setCities(response.data);
    } catch (error) {
      console.error("Error al buscar dades de city:", error);
    }
  };
  
  useEffect(() => {
    cargarDatos();
  }, []);
  
  const crearciutat = (values, { setSubmitting, resetForm }) => {
    axios
      .post(`${apiUrl}/city`, values, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then(() => {
        cargarDatos();
      })
      .catch((err) => console.error("Error al crear city:", err))
      .finally(() => {
        setSubmitting(false);
        resetForm();
        setShowCrear(false);
      });
  };
  
  const eliminarCity = (id) => {
    axios
      .delete(`${apiUrl}/city/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then(() => {
        cargarDatos();
      })
      .catch((err) => console.error("Error al eliminar city:", err.response || err));
  };
  
  const handleView = (city) => {
    setCurrentCity(city);
    setShowView(true);
  };
  
  const edicio = (city) => {
    setCurrentCity(city);
    setShowEdit(true);
  };
  
  const canviseditar = (values, { setSubmitting, resetForm }) => {
    axios
      .put(`${apiUrl}/city/${currentCity.id}`, values, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then(() => {
        cargarDatos();
      })
      .catch((err) => console.error("Error al editar city:", err))
      .finally(() => {
        setSubmitting(false);
        resetForm();
        setShowEdit(false);
      });
  };
  
  // Filtra las ciudades según el provinceId obtenido de la URL
  let filteredCities = cities;
  if (provinceId) {
    filteredCities = filteredCities.filter(
      city => city.province_id === Number(provinceId)
    );
  }
  
  // Aplica otros filtros si los hubiera
  if (appliedFilters.name) {
    filteredCities = filteredCities.filter(city =>
      city.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
    );
  }
  if (appliedFilters.provinceId) {
    filteredCities = filteredCities.filter(
      city => city.province_id === Number(appliedFilters.provinceId)
    );
  }
  if (appliedFilters.orden === 'asc') {
    filteredCities = [...filteredCities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  
  // Cálculs de paginación
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCities.slice(startIndex, startIndex + itemsPerPage);
  
  // Paginación en bloques de 3 páginas
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
  
  const handleClearFilters = () => {
    setAppliedFilters({ name: '', orden: 'none', provinceId: '' });
    setCurrentPage(1);
  };
  
  // Función para navegar a la vista de la provincia (opcional)
  const navegarprovincies = (province_id) => {
    navigate(`./Province/${province_id}`);
  };
  
  return (
    <>
  
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
  
      {/* Componente de filtres */}
      <FiltresCity
        suggestions={[...new Set(cities.map(city => city.name))]}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />
  
      {/* Modal para crear City */}
      <Modal show={showCreate} onHide={() => setShowCrear(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nova City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ name: '', province_id: '' }}
            validationSchema={CitySchema}
            onSubmit={crearciutat}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="name">Nom de la city</label>
                  <Field id="name" name="name" type="text" className="form-control" />
                  {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="province_id">ID de la provincia</label>
                  <Field id="province_id" name="province_id" type="number" className="form-control" />
                  {errors.province_id && touched.province_id && (
                    <div className="text-danger">{errors.province_id}</div>
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
  
      {/* Modal para visualizar City */}
      <Modal show={showView} onHide={() => setShowView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCity ? (
            <>
              <p><strong>ID:</strong> {currentCity.id}</p>
              <p><strong>Nom:</strong> {currentCity.name}</p>
              <p><strong>ID de la provincia:</strong> {currentCity.province_id}</p>
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
  
      {/* Modal para editar City */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modificar City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCity && (
            <Formik
              initialValues={{ name: currentCity.name, province_id: currentCity.province_id }}
              validationSchema={CitySchema}
              onSubmit={canviseditar}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name">Nom de la city</label>
                    <Field id="name" name="name" type="text" className="form-control" />
                    {errors.name && touched.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="province_id">ID de la provincia</label>
                    <Field id="province_id" name="province_id" type="number" className="form-control" />
                    {errors.province_id && touched.province_id && (
                      <div className="text-danger">{errors.province_id}</div>
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
  
      {/* Tabla de City */}
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
                <th scope="col">ID de la provincia</th>
                <th scope="col">Accions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((city) => (
                <tr key={city.id}>
                  <td data-cell="Seleccionar">
                    <input className="form-check-input" type="checkbox" />
                  </td>
                  <td data-cell="ID">{city.id}</td>
                  <td data-cell="Nom">{city.name}</td>
                  <td>
                    <Button size="sm" onClick={() => navegarprovincies(city.province_id)} title="Veure Provincias">
                      Provincias
                    </Button>
                  </td>
                  <td className="fs-5" data-no-colon="true">
                    <i
                      className="bi bi-pencil-square me-2"
                      title="Modificar"
                      onClick={() => edicio(city)}
                    ></i>
                    <i
                      className="bi bi-eye px-3 me-2"
                      onClick={() => handleView(city)}
                      title="Visualitzar"
                    ></i>
                    <i
                      className="bi bi-trash"
                      title="Eliminar"
                      onClick={() => eliminarCity(city.id)}
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
              <a
                className="page-link text-light-blue"
                href="#"
                aria-label="Previous"
                onClick={handlePreviousBlock}
              >
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
  
            {Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i).map((page) => (
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
              <a
                className="page-link text-light-blue"
                href="#"
                aria-label="Next"
                onClick={handleNextBlock}
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

export default City;
