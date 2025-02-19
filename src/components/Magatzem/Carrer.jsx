import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import FiltresCarrer from './FiltresCarrer';

const apiUrl = import.meta.env.VITE_API_URL;

const StreetSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  storage_id: Yup.number().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
});

function Street() {
  const [streets, setStreets] = useState([]);
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Puedes ajustar cuántos ítems por página deseas
  const [showViewModal, setShowViewModal] = useState(false); // Modal de visualización
  const [tipoModal, setTipoModal] = useState("Crear");
  const [valorsInicials, setValorsInicials] = useState({ name: '', storage_id: '' });
  const [selectedStreet, setSelectedStreet] = useState(null); // Estado para la calle seleccionada
  const navigate = useNavigate();
  const { magatzem } = useParams();
  const { magatzem_name } = useParams();
  const [filters, setFilters] = useState({
    storage_id: magatzem,
    name: magatzem_name,
  });

  useEffect(() => {
    axios.get(`${apiUrl}/street?storage_id=${magatzem}`, {
      headers: { "auth-token": localStorage.getItem("token") }
    })
      .then(response => {
        setStreets(response.data);
        setFilteredStreets(response.data);
      })
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, [magatzem]);

  useEffect(() => {
    const filtered = streets.filter(street => street.storage_id === filters.storage_id);
    setFilteredStreets(filtered);
  }, [filters, streets]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const eliminarStreet = async (id) => {
    try {
      await axios.delete(`${apiUrl}/street/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setStreets(streets.filter(item => item.id !== id));
    } catch (e) {
      console.log('Error deleting street:', e);
    }
  };

  const modificarStreet = (valors) => {
    setTipoModal("Modificar");
    setValorsInicials(valors);
    setShowModal(true);
  };

  const handleStreetClick = (id) => {
    navigate(`../estanteria/${magatzem}/${id}`);
  };

  const handleBackClick = () => {
    navigate(`/gestioMagatzem/magatzem/`);  // Navega hacia la página del magatzem
  };


  const canviEstatModal = () => {
    setShowModal(!showModal);
    setTipoModal("Crear");
  };

  const handleFilter = (filters) => {
    setFilters(filters);
  };

  const viewSupplier = (valors) => {
    setSelectedStreet(valors);  // Establece la calle seleccionada
    setShowViewModal(true);     // Muestra el modal de visualización
  };

  const modSuppliers = (valors) => {
    console.log("Modifying supplier:", valors);
    modificarStreet(valors);
  };

  const deleteSuppliers = (id) => {
    console.log("Deleting supplier:", id);
    eliminarStreet(id);
  };

  // Calcular las calles a mostrar para la página actual
  const indexOfLastStreet = currentPage * itemsPerPage;
  const indexOfFirstStreet = indexOfLastStreet - itemsPerPage;
  const currentStreets = filteredStreets.slice(indexOfFirstStreet, indexOfLastStreet);

  return (
    <>
      <FiltresCarrer onFilter={handleFilter} onClear={() => setFilters({ storage_id: magatzem })} initialStorageId={magatzem} />
      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Seleccione una opció">
                <option selected>Tria una opció</option>
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
            <Button
              onClick={() => handleBackClick()}
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0 me-2">
              Magatzem
            </Button>
            <button
              type="button"
              onClick={canviEstatModal}
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
            >
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear Carrer
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-striped text-center">
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th scope="col"><input className="form-check-input" type="checkbox" name="" id="" /></th>
              <th scope="col">ID</th>
              <th scope="col">Nom</th>
              <th scope="col">ID Magatzem</th>
              <th scope="col">Estanteria</th>
              <th scope="col">Accions</th>
            </tr>
          </thead>
          <tbody>
            {currentStreets.map((valors) => (
              <tr key={valors.id}>
                <td scope="row" data-cell="Seleccionar">
                  <input className="form-check-input" type="checkbox" name="" id="" />
                </td>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>{valors.storage_id}</td>
                <td><Button onClick={() => handleStreetClick(valors.id)} className='outline-orange'>Estanteria</Button></td>
                <td data-no-colon="true">
                  <span onClick={() => viewSupplier(valors)} style={{ cursor: "pointer" }}>
                    <i className="bi bi-eye"></i>
                  </span>

                  <span onClick={() => modSuppliers(valors)} className="mx-2" style={{ cursor: "pointer" }}>
                    <i className="bi bi-pencil-square"></i>
                  </span>

                  <span onClick={() => deleteSuppliers(valors.id)} style={{ cursor: "pointer" }}>
                    <i className="bi bi-trash"></i>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <nav aria-label="Page navigation example" className="d-block">
          <ul className="pagination justify-content-center">
            <li className="page-item">
              <a className="page-link text-light-blue" href="#" onClick={() => paginate(currentPage - 1)} aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            {Array.from({ length: Math.ceil(filteredStreets.length / itemsPerPage) }).map((_, index) => (
              <li key={index} className="page-item">
                <a
                  className={`page-link ${currentPage === index + 1 ? 'activo-2' : 'text-light-blue'}`}
                  href="#"
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </a>
              </li>
            ))}
            <li className="page-item">
              <a className="page-link text-light-blue" href="#" onClick={() => paginate(currentPage + 1)} aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal para visualización de la calle */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar Carrer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStreet && (
            <>
              <p><strong>ID:</strong> {selectedStreet.id}</p>
              <p><strong>Nom:</strong> {selectedStreet.name}</p>
              <p><strong>ID Magatzem:</strong> {selectedStreet.storage_id}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Tancar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Carrer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '', storage_id: '' }}
            validationSchema={StreetSchema}
            onSubmit={async (values) => {
              try {
                if (tipoModal === "Crear") {
                  await axios.post(`${apiUrl}/street`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                } else {
                  await axios.put(`${apiUrl}/street/${values.id}`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                }
                setShowModal(false);
                window.location.reload();
              } catch (e) {
                console.log('Error on submit:', e);
              }
            }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <div>
                  <label htmlFor='name'>Nom</label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Nom del carrer"
                    autoComplete="off"
                    value={values.name}
                    className="form-control"
                  />
                  {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <div>
                  <label htmlFor='storage_id'>ID Magatzem</label>
                  <Field
                    type="text"
                    name="storage_id"
                    placeholder="ID del magatzem"
                    autoComplete="off"
                    value={values.storage_id}
                    className="form-control"
                  />
                  {errors.storage_id && touched.storage_id && <div className="text-danger">{errors.storage_id}</div>}
                </div>
                <Button type="submit" variant="primary">{tipoModal === "Crear" ? "Crear" : "Modificar"}</Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Street;
