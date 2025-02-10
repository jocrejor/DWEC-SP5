import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import FilterEstanteria from './FilterEstanteria';

const apiUrl = import.meta.env.VITE_API_URL;

const ShelfSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  storage_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
  street_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
});

function Shelf() {
  const [shelves, setShelves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("Crear");
  const [initialValues, setInitialValues] = useState({ name: '', storage_id: '', street_id: '' });
  const navigate = useNavigate();
  const { magatzem, carrer } = useParams();

  useEffect(() => {
    if (magatzem && carrer) {
      axios.get(`${apiUrl}/shelf?storage_id=${magatzem}&street_id=${carrer}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      })
        .then(response => {
          setShelves(response.data);
        })
        .catch(error => {
          console.log('Error fetching data:', error);
        });
    }
  }, [magatzem, carrer]);

  const viewSupplier = async (id) => {
    try {
      await axios.delete(`${apiUrl}/shelf/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setShelves(shelves.filter(item => item.id !== id));
    } catch (error) {
      console.log('Error deleting shelf:', error);
    }
  };

  const deleteSuppliers = async (id) => {
    try {
      await axios.delete(`${apiUrl}/supplier/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      // After deleting the supplier, you may want to update the list
      setShelves(shelves.filter(item => item.id !== id));
    } catch (error) {
      console.log('Error deleting supplier:', error);
    }
  };

  const modSuppliers = (values) => {
    setModalType("Modificar");
    setInitialValues(values);
    setShowModal(true);
  };

  const openModal = () => {
    setShowModal(!showModal);
    setModalType("Crear");
  };

  const handleShelfClick = (id) => {
    navigate(`../espai/${magatzem}/${carrer}/${id}`);
  };

  return (
    <>
      <FilterEstanteria />
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
            <button type="button" onClick={openModal} className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
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
              <th scope="col"><input className="form-check-input" type="checkbox" name="" id="" /></th>
              <th scope="col">ID</th>
              <th scope="col">Nom</th>
              <th scope="col">ID Magatzem</th>
              <th scope="col">ID Carrer</th>
              <th scope="col">Espai</th>
              <th scope="col">Accions</th>
              
            </tr>
          </thead>
          <tbody>
            {shelves.map((values) => (
              <tr key={values.id}>
                <td scope="row" data-cell="Seleccionar">
                  <input className="form-check-input" type="checkbox" name="" id="" />
                </td>
                <td>{values.id}</td>
                <td>{values.name}</td>
                <td>{values.storage_id}</td>
                <td>{values.street_id}</td>
                <td><Button onClick={() => handleShelfClick(values.id)}>Espai</Button></td>
                <td data-no-colon="true">
                    <span onClick={() => viewSupplier(values)} style={{ cursor: "pointer" }}>
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

      {/* Modal for Create/Modify Shelf */}
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
                    placeholder="Nom de l'estanteria"
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
                <div>
                  <label htmlFor='street_id'>ID Carrer</label>
                  <Field
                    type="text"
                    name="street_id"
                    placeholder="ID del carrer"
                    autoComplete="off"
                    value={values.street_id}
                    className="form-control"
                  />
                  {errors.street_id && touched.street_id && <div className="text-danger">{errors.street_id}</div>}
                </div>
                <Button type="submit" variant="primary">{modalType === "Crear" ? "Crear" : "Modificar"}</Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Shelf;
