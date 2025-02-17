import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import FilterEstanteria from './FilterEstanteria'; // Componente de filtros

const apiUrl = import.meta.env.VITE_API_URL;

const ShelfSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  storage_id: Yup.string().required('Valor requerit'),
  street_id: Yup.string().required('Valor requerit'),
});

function Shelf() {
  const [shelves, setShelves] = useState([]);
  const [filteredShelfs, setFilteredShelfs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState("Crear");
  const [initialValues, setInitialValues] = useState({ name: '', storage_id: '', street_id: '' });
  const [selectedShelf, setSelectedShelf] = useState(null);
  const navigate = useNavigate();
  const { magatzem, carrer } = useParams();
  const [filters, setFilters] = useState({
    storage_id: magatzem,
    street_id: carrer,
  });
  
  // Actualiza los filtros si cambian los parámetros de la URL
  useEffect(() => {
    setFilters({
      storage_id: magatzem,
      street_id: carrer,
    });
  }, [magatzem, carrer]);

  useEffect(() => {
    if (magatzem && carrer) {
      axios.get(`${apiUrl}/shelf?storage_id=${magatzem}&street_id=${carrer}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      })
        .then(response => {
          setShelves(response.data);
        })
        .catch(error => {
          console.error('Error fetching shelves:', error);
        });
    }
  }, [magatzem, carrer]);

  useEffect(() => {
    const filtered = shelves.filter(shelf => {
      return shelf.storage_id === filters.storage_id && shelf.street_id === filters.street_id;
    });
    setFilteredShelfs(filtered);
  }, [filters, shelves]);

  const deleteShelf = async (id) => {
    try {
      await axios.delete(`${apiUrl}/shelf/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setShelves(shelves.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting shelf:', error);
    }
  };

  const editShelf = (values) => {
    setModalType("Modificar");
    setInitialValues(values);
    setShowModal(true);
  };

  const viewShelf = (shelf) => {
    setSelectedShelf(shelf);
    setShowViewModal(true);
  };

  const modSuppliers = (valors) => {
    console.log("Modifying shelf:", valors);
    editShelf(valors);
  };

  const deleteSuppliers = (id) => {
    console.log("Deleting shelf:", id);
    deleteShelf(id);
  };

  const canviEstatModal = () => {
    setShowModal(true);
    setModalType("Crear");
  };

  const handleShelfClick = (id) => {
    navigate(`../espai/${magatzem}/${carrer}/${id}`);
  };

  const handleFilter = (filters) => {
    setFilters(filters); // Actualiza los filtros
  };

  return (
    <>
      {/* Filtro de Estanteria */}
      <FilterEstanteria 
        filters={filters}
        onFilterChange={handleFilter}
      />

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
            <button type="button" onClick={canviEstatModal} className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear Estanteria
            </button>
          </div>
        </div>
      </div>

      <h2>Magatzem: {magatzem}</h2>
      <h2>Carrer: {carrer}</h2>

      <div className="table-responsive mt-3">
        <table className="table table-striped text-center">
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th><input className="form-check-input" type="checkbox" /></th>
              <th>ID</th>
              <th>Nom</th>
              <th>ID Magatzem</th>
              <th>ID Carrer</th>
              <th>Espai</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShelfs.map((values) => (
              <tr key={values.id}>
                <td><input className="form-check-input" type="checkbox" /></td>
                <td>{values.id}</td>
                <td>{values.name}</td>
                <td>{values.storage_id}</td>
                <td>{values.street_id}</td>
                <td><Button onClick={() => handleShelfClick(values.id)}>Espai</Button></td>
                <td data-no-colon="true">
                  <span onClick={() => viewShelf(values)} style={{ cursor: "pointer" }}>
                    <i className="bi bi-eye"></i>
                  </span>

                  <span onClick={() => modSuppliers(values)} className="mx-2" style={{ cursor: "pointer" }}>
                    <i className="bi bi-pencil-square"></i>
                  </span>

                  <span onClick={() => deleteSuppliers(values.id)} style={{ cursor: "pointer" }}>
                    <i className="bi bi-trash"></i>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <nav aria-label="Page navigation example" className="d-block">
          <ul className="pagination justify-content-center">
            <li className="page-item">
              <a className="page-link text-light-blue" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li className="page-item"><a className="page-link activo-2" href="#">1</a></li>
            <li className="page-item"><a className="page-link text-light-blue" href="#">2</a></li>
            <li className="page-item"><a className="page-link text-light-blue" href="#">3</a></li>
            <li className="page-item">
              <a className="page-link text-light-blue" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal for Viewing Shelf */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar Estanteria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShelf ? (
            <div>
              <p><strong>Nom:</strong> {selectedShelf.name}</p>
              <p><strong>ID Magatzem:</strong> {selectedShelf.storage_id}</p>
              <p><strong>ID Carrer:</strong> {selectedShelf.street_id}</p>
            </div>
          ) : (
            <p>No shelf selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Tancar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Creating/Editing Shelf */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType} Estanteria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={modalType === 'Modificar' ? initialValues : { name: '', storage_id: '', street_id: '' }}
            validationSchema={ShelfSchema}
            onSubmit={async (values) => {
              try {
                if (modalType === "Crear") {
                  await axios.post(`${apiUrl}/shelf`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                } else {
                  await axios.put(`${apiUrl}/shelf/${values.id}`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                }
                setShowModal(false);
                window.location.reload();
              } catch (error) {
                console.error('Error on submit:', error);
              }
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <div>
                  <label>Nom</label>
                  <Field type="text" name="name" className="form-control" />
                  {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <div>
                  <label>ID Magatzem</label>
                  <Field type="text" name="storage_id" className="form-control" />
                  {errors.storage_id && touched.storage_id && <div className="text-danger">{errors.storage_id}</div>}
                </div>
                <div>
                  <label>ID Carrer</label>
                  <Field type="text" name="street_id" className="form-control" />
                  {errors.street_id && touched.street_id && <div className="text-danger">{errors.street_id}</div>}
                </div>
                <Button type="submit">{modalType === "Crear" ? "Crear" : "Modificar"}</Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Shelf;
