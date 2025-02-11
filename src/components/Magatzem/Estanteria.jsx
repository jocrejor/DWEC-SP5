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
  storage_id: Yup.string().required('Valor requerit'),
  street_id: Yup.string().required('Valor requerit'),
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
          console.error('Error fetching shelves:', error);
        });
    }
  }, [magatzem, carrer]);

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

  const openModal = () => {
    setShowModal(true);
    setModalType("Crear");
  };

  const handleShelfClick = (id) => {
    navigate(`../espai/${magatzem}/${carrer}/${id}`);
  };

  return (
    <>
      <FilterEstanteria />
      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 col-md-6 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1">
            <div className="form-floating bg-white">
              <select className="form-select">
                <option selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label>Accions en lot</label>
            </div>
            <button className="btn rounded-0 orange-button text-white px-2">
              <i className="bi bi-check-circle text-white px-1"></i>Aplicar
            </button>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-4 text-end">
          <button type="button" onClick={openModal} className="btn btn-dark mt-2">
            <i className="bi bi-plus-circle text-white pe-1"></i>Crear Estanteria
          </button>
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
            {shelves
              .filter(shelf => shelf.storage_id === magatzem && shelf.street_id === carrer)
              .map((values) => (
                <tr key={values.id}>
                  <td><input className="form-check-input" type="checkbox" /></td>
                  <td>{values.id}</td>
                  <td>{values.name}</td>
                  <td>{values.storage_id}</td>
                  <td>{values.street_id}</td>
                  <td><Button onClick={() => handleShelfClick(values.id)}>Espai</Button></td>
                  <td>
                    <span onClick={() => editShelf(values)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-pencil-square"></i>
                    </span>
                    <span onClick={() => deleteShelf(values.id)} className="mx-2" style={{ cursor: "pointer" }}>
                      <i className="bi bi-trash"></i>
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
