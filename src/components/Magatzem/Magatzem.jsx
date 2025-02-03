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

  const handleCarrerClick = (id) => {
    navigate(`../carrer/${id}`);
  };

  return (
    <>
      <Filtres />
      <h1> Magatzems</h1>
      <Button variant='success' onClick={() => { setShowModal(true); setTipoModal("Crear"); }}>Alta Magatzem</Button>
      
      <table className="table table-striped text-center align-middle">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nom</th>
            <th>Tipus</th>
            <th>Adreça</th>
            <th>Carrer</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {storages.length === 0 ? (
            <tr><td>No hi han magatzems</td></tr>
          ) : (
            storages.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>{valors.type}</td>
                <td>{valors.address}</td>
                <td><Button onClick={() => handleCarrerClick(valors.id)}>Carrer</Button></td>
                <td><Button variant="warning" onClick={() => modificarStorage(valors)}>Modificar</Button></td>
                <td><Button variant="danger" onClick={() => eliminarStorage(valors.id)}>Eliminar</Button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
