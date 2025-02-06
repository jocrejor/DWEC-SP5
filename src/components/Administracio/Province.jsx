import { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

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

function Provincia() {
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [currentProvince, setCurrentProvince] = useState(null);

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
        setShowCreate(false);
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

  return (
    <>
  
      <Button onClick={() => setShowCreate(true)} className="mb-3">
        Nova Provincia
      </Button>

      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
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
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                  />
                  {errors.name && touched.name && (
                    <div className="text-danger">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="state_id">ID de l'estat</label>
                  <Field
                    id="state_id"
                    name="state_id"
                    type="number"
                    className="form-control"
                  />
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

     
      <Modal show={showView} onHide={() => setShowView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar Provincia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProvince ? (
            <>
              <p>
                <strong>ID:</strong> {currentProvince.id}
              </p>
              <p>
                <strong>Nom:</strong> {currentProvince.name}
              </p>
              <p>
                <strong>ID de l'estat:</strong> {currentProvince.state_id}
              </p>
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
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      className="form-control"
                    />
                    {errors.name && touched.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="state_id">ID de l'estat</label>
                    <Field
                      id="state_id"
                      name="state_id"
                      type="number"
                      className="form-control"
                    />
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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>ID de l'estat</th>
            <th>Accions</th>
          </tr>
        </thead>
        <tbody>
          {provincias.map((prov) => (
            <tr key={prov.id}>
              <td>{prov.id}</td>
              <td>{prov.name}</td>
              <td>{prov.state_id}</td>
              <td>
                {/* Botón para visualizar */}
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => modalvisualitzar(prov)}
                  title="Visualitzar"
                >
                  <i className="bi bi-eye"></i>
                </Button>
                {/* Botón para editar */}
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => modaleditar(prov)}
                  title="Modificar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                {/* Botón para eliminar */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => eliminarProvincia(prov.id)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default Provincia;
