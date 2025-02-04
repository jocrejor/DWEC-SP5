import { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Añadir para la navegación

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
  const [showCreate, setShowCrear] = useState(false);
  const [showView, setShowVisualitzar] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [cities, setCities] = useState([]);
  const [currentCity, setCurrentCity] = useState(null);
  const navigate = useNavigate();  // Hook para navegación

  // Función para cargar el listado de ciudades
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

  // Crear ciudad
  const handleCreateSubmit = (values, { setSubmitting, resetForm }) => {
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

  // Eliminar ciudad
  const eliminarCity = (id) => {
    axios
      .delete(`${apiUrl}/city/${id}`, {
        headers: { "auth-token": localStorage.getItem("token") },
      })
      .then(() => {
        cargarDatos();
      })
      .catch((err) =>
        console.error("Error al eliminar city:", err.response || err)
      );
  };

  // Visualizar ciudad: asigna la city actual y abre el modal de visualización
  const handleView = (city) => {
    setCurrentCity(city);
    setShowVisualitzar(true);
  };

  // Abrir modal de edición con la city actual.
  const handleEdit = (city) => {
    setCurrentCity(city);
    setShowEdit(true);
  };

  // Enviar edición (PUT)
  const handleEditSubmit = (values, { setSubmitting, resetForm }) => {
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

  const navegarprovincies = (province_id) => {
    navigate(`./Province/${province_id}`); 
  };

  return (
    <>
 
      <Button onClick={() => setShowCrear(true)} className="mb-3">
        Nova Ciutat
      </Button>

      <Modal show={showCreate} onHide={() => setShowCrear(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nova City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ name: '', province_id: '' }}
            validationSchema={CitySchema}
            onSubmit={handleCreateSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="name">Nom de la city</label>
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
                  <label htmlFor="province_id">ID de la provincia</label>
                  <Field
                    id="province_id"
                    name="province_id"
                    type="number"
                    className="form-control"
                  />
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

      <Modal show={showView} onHide={() => setShowVisualitzar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCity ? (
            <>
              <p>
                <strong>ID:</strong> {currentCity.id}
              </p>
              <p>
                <strong>Nom:</strong> {currentCity.name}
              </p>
              <p>
                <strong>ID de la provincia:</strong> {currentCity.province_id}
              </p>
            </>
          ) : (
            <p>No hi ha dades per mostrar.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVisualitzar(false)}>
            Tancar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de edición */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modificar City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCity && (
            <Formik
              initialValues={{
                name: currentCity.name,
                province_id: currentCity.province_id,
              }}
              validationSchema={CitySchema}
              onSubmit={handleEditSubmit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name">Nom de la city</label>
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
                    <label htmlFor="province_id">ID de la provincia</label>
                    <Field
                      id="province_id"
                      name="province_id"
                      type="number"
                      className="form-control"
                    />
                    {errors.province_id && touched.province_id && (
                      <div className="text-danger">{errors.province_id}</div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Actualitzar
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>

      {/* Listado de cities */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>ID de la provincia</th>
            <th>Accions</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id}>
              <td>{city.id}</td>
              <td>{city.name}</td>
                   <td> 
                     <Button
                     
                  variant="info"
                  size="sm"
                  onClick={() => navegarprovincies(city.province_id)}  // Navegar a la vista de Provincias
                  title="Veure Provincias"
                >
                  Provincias
                </Button>
                </td>
              <td>
       
                {/* Botón para visualizar */}
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleView(city)}
                  title="Visualitzar"
                >
                  <i className="bi bi-eye"></i>
                </Button>
                {/* Botón para editar */}
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(city)}
                  title="Modificar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                {/* Botón para eliminar */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => eliminarCity(city.id)}
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

export default City;
