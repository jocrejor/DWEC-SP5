import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Filtres from '../Filtres';

const apiUrl = import.meta.env.VITE_API_URL;

const StorageSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  type: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
  address: Yup.number().min(10, 'Valor mínim de 10.').max(100, 'El valor màxim és de 100 ').required('Valor requerit'),
});

function Storage() {
  const [storages, setStorages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Crear");
  const [valorsInicials, setValorsInicials] = useState({ name: '', type: '', address: '' });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${apiUrl}/storage`, {
      headers: { "auth-token": localStorage.getItem("token") }
    })
      .then(response => {
        setStorages(response.data);
      })
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, []);

  const eliminarStorage = async (id) => {
    try {
      await axios.delete(`${apiUrl}/storage/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setStorages(storages.filter(item => item.id !== id));
    } catch (e) {
      console.log('Error deleting storage:', e);
    }
  };

  const modificarStorage = (valors) => {
    setTipoModal("Modificar");
    setValorsInicials(valors);
    setShowModal(true);
  };

  const modSuppliers = (valors) => {
    modificarStorage(valors); // Reuse modificarStorage logic
  };

  const viewSupplier = (valors) => {
    // Implement viewSupplier functionality (for example, open a details page)
    console.log("Viewing supplier", valors);
  };

  const deleteSuppliers = async (id) => {
    // Implement deleteSuppliers functionality
    if (window.confirm("Are you sure you want to delete this storage?")) {
      await eliminarStorage(id);
    }
  };

  const handleCarrerClick = (id) => {
    navigate(`../carrer/${id}`);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
    setTipoModal("Crear");
  };

  return (
    <>
      <Filtres />
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
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear Magatzem
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
              <th scope="col">Tipus</th>
              <th scope="col">Adreça</th>
              <th scope="col">Carrer</th>
              <th scope="col">Accions</th>
            </tr>
          </thead>
          <tbody>
            {storages.map((valors) => (
              <tr key={valors.id}>
                <td scope="row" data-cell="Seleccionar">
                  <input className="form-check-input" type="checkbox" name="" id="" />
                </td>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>{valors.type}</td>
                <td>{valors.address}</td>
                <td><Button onClick={() => handleCarrerClick(valors.id)}>Carrer</Button></td>
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

      {/* Modal for Create/Modify Storage */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Magatzem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '', type: '', address: '' }}
            validationSchema={StorageSchema}
            onSubmit={async (values) => {
              try {
                if (tipoModal === "Crear") {
                  await axios.post(`${apiUrl}/storage`, values, {
                    headers: { "auth-token": localStorage.getItem("token") }
                  });
                } else {
                  await axios.put(`${apiUrl}/storage/${values.id}`, values, {
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
                    placeholder="Nom del magatzem"
                    autoComplete="off"
                    value={values.name}
                    className="form-control"
                  />
                  {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <div>
                  <label htmlFor='type'>Tipus</label>
                  <Field
                    type="text"
                    name="type"
                    placeholder="Tipus de magatzem"
                    autoComplete="off"
                    value={values.type}
                    className="form-control"
                  />
                  {errors.type && touched.type && <div className="text-danger">{errors.type}</div>}
                </div>
                <div>
                  <label htmlFor='address'>Adreça</label>
                  <Field
                    type="text"
                    name="address"
                    placeholder="Adreça del magatzem"
                    autoComplete="off"
                    value={values.address}
                    className="form-control"
                  />
                  {errors.address && touched.address && <div className="text-danger">{errors.address}</div>}
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

export default Storage;