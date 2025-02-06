import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Filtres from '../Filtres';

const apiUrl = import.meta.env.VITE_API_URL;

const StateSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Mínimo 4 caracteres').max(50, 'Máximo 50 caracteres').required('Campo requerido')
});

function State() {
  const [states, setStates] = useState([]);
  const [showModal, mostrarmodal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Crear");
  const [valorsInicials, setValorsInicials] = useState({ name: '' });


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
    mostrarmodal(true);
  };

  const crearestat = () => {
    mostrarmodal(!showModal);
    setTipoModal("Crear");
  };

  return (
    <>
      <Filtres />
      <div className="d-flex justify-content-between my-3">
        <h2>Estados</h2>
        <Button variant="dark" onClick={crearestat}>+ Crear Estado</Button>
      </div>
      <table className="table table-striped text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
         
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {states.map((valors) => (
            <tr key={valors.id}>
              <td>{valors.id}</td>
              <td>{valors.name}</td>
           
              <td>
                <span onClick={() => modificarestat(valors)} style={{ cursor: "pointer" }}>
                  <i className="bi bi-pencil-square"></i>
                </span>
                <span onClick={() => eliminarestat(valors.id)} className="mx-2" style={{ cursor: "pointer" }}>
                  <i className="bi bi-trash"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={() => mostrarmodal(false)}>
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
                mostrarmodal(false);
                window.location.reload();
              } catch (e) {
                console.log('Error al enviar:', e);
              }
            }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <div>
                  <label htmlFor='name'>Nombre</label>
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
                <Button type="submit" variant="primary">{tipoModal === "Crear" ? "Crear" : "Modificar"}</Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default State;
