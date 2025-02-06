import { useState, useEffect } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  

const apiUrl = import.meta.env.VITE_API_URL;


const CitySchema = Yup.object().shape({
  name: Yup.string().min(4, 'El valor mínim és de 4 caràcters.')
    .max(40, 'El valor màxim és de 40 caràcters.')
    .required('Valor requerit'),
  province_id: Yup.number()
    .integer('El valor ha de ser un número enter.')
    .required('Valor requerit'),
});

function City() {
  const [showCreate, setShowCrear] = useState(false);
  const [showView, modalvisualitzar] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [cities, setCities] = useState([]);
  const [currentCity, setCurrentCity] = useState(null);
  const navigate = useNavigate();  

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
    axios.post(`${apiUrl}/city`, values, {
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
      .catch((err) =>
        console.error("Error al eliminar city:", err.response || err)
      );
  };

  const handleView = (city) => {
    setCurrentCity(city);
    modalvisualitzar(true);
  };

  const edicio = (city) => {
    setCurrentCity(city);
    setShowEdit(true);
  };

  const canviseditar = (values, { setSubmitting, resetForm }) => {
    axios.put(`${apiUrl}/city/${currentCity.id}`, values, {
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
              <button type="button" onClick={() => setShowCrear(true)}  className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
                <i className="bi bi-plus-circle text-white pe-1"></i>Crear
              </button>
            </div>
          </div>                                                    
        </div>
    

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

      <Modal show={showView} onHide={() => modalvisualitzar(false)}>
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
          <Button variant="secondary" onClick={() => modalvisualitzar(false)}>
            Tancar
          </Button>
        </Modal.Footer>
      </Modal>

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
              onSubmit={canviseditar}
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


      <div className="row">
        <div className="col-12">
          <table className="table table-striped text-center align-middle">
            <thead className="table-active border-bottom border-dark-subtle">
              <tr>
                <th className="align-middle" scope="col"><input className="form-check-input" type="checkbox" /></th>
                <th scope="col">ID</th>
                <th scope="col">Nom</th>
                <th scope="col">ID de la provincia</th>
                <th scope="col">Accions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id}>
                  <td data-cell="Seleccionar"><input className="form-check-input" type="checkbox" /></td>
                  <td data-cell="ID">{city.id}</td>
                  <td data-cell="Nom">{city.name}</td>
                  <td><Button size="sm" onClick={() => navegarprovincies(city.province_id)} title="Veure Provincias">Provincias</Button></td>
                  <td className="fs-5" data-no-colon="true">
                   <i className="bi bi-pencil-square me-2"     title="Modificar" onClick={() => edicio(city)} ></i>
                  <i className="bi bi-eye px-3 me-2" onClick={() => handleView(city)} title="Visualitzar" ></i>
                   <i className="bi bi-trash"  title="Eliminar"  onClick={() => eliminarCity(city.id)}  ></i>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default City;
