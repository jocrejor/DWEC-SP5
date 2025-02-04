import { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';
import Filtres from "../Filtres";

const apiUrl = import.meta.env.VITE_API_URL;

const OrderLineReception_StatusSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Valor mínim d'1 caràcter.")
    .max(25, 'El valor màxim és de 25 caràcters.')
    .required('Valor requerit'),
});

function OrderLineReception_Status() {
  const [ordersLineReception, setOrdersLineReception] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({ name: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/orderline_status`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrdersLineReception(response.data);
        setError(null);
      })
      .catch(() => {
        setError('Error carregant les dades.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const eliminarEstatOrdre = async (id) => {
    if (window.confirm('Estàs segur que vols eliminar aquest estat?')) {
      axios.delete(`${apiUrl}/orderline_status/${id}`, { headers: { "auth-token": localStorage.getItem("token") } })
        .then(() => {
          setOrdersLineReception(prev => prev.filter(item => item.id !== id));
        })
        .catch(() => {
          setError('Error eliminant l\'estat.');
        });
    }
  };

  const modificarEstatOrdre = (valors) => {
    setTipoModal('Modificar');
    setValorsInicials(valors);
    setShowModal(true);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  const handleSubmit = async (values) => {
    try {
      if (tipoModal === 'Crear') {
        await axios.post(`${apiUrl}/orderline_status`, values, { headers: { "auth-token": localStorage.getItem("token") } });
      } else {
        await axios.put(`${apiUrl}/orderline_status/${values.id}`, values, { headers: { "auth-token": localStorage.getItem("token") } });
      }
      const updatedData = await axios.get(`${apiUrl}/orderline_status`, { headers: { "auth-token": localStorage.getItem("token") } });
      setOrdersLineReception(updatedData.data);
      canviEstatModal();
      setError(null);
    } catch (err) {
      setError('Error en l\'operació.');
    }
  };

  return (
    <>
      <Header title="Llistat Estats de Línia" />
      <Filtres />

      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                <option selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label for="floatingSelect">Accions en lot</label>
            </div>
            <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button"><i className="bi bi-check-circle text-white px-1"></i>Aplicar</button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            <Button
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              onClick={() => {
                 setTipoModal('Crear'); setValorsInicials({ name: '' }); canviEstatModal(); }}><i class="bi bi-plus-circle text-white pe-1"></i>Nou Estat de línia</Button>
      </div>
        </div>
      </div>

      <div className='container-fluid pt-3'>

        <Table className='table table-striped border m-2'>
          <thead class="table-active border-bottom border-dark-subtle text-center ">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nom</th>
              <th scope="col">Accions</th>
            </tr>
          </thead>
          <tbody>
            {ordersLineReception.length === 0 ? (
              <tr>
                <td colSpan="13">No hi ha estats de ordres de línia </td>
              </tr>
            ) : (
            ordersLineReception.map((valors) => (
              <tr key={valors.id}>
                  <td className='text-center'>{valors.id}</td>
                  <td className='text-center'>{valors.name}</td>
                  <td className='text-center'>
                    <span onClick={() => modificarEstatOrdre(valors)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-pencil-square"></i>
                    </span>
                    <span onClick={() => eliminarEstatOrdre(valors.id)} className="mx-2" style={{ cursor: "pointer" }}>
                      <i className="bi bi-trash"></i>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Estat de Ordre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik initialValues={valorsInicials} validationSchema={OrderLineReception_StatusSchema} onSubmit={handleSubmit}>
            {({ errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Nom</label>
                  <Field id="name" type="text" name="name" placeholder="Nom del estat" autoComplete="off"className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  />
                  {errors.name && touched.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="form-group text-right">
                  <Button variant="secondary" onClick={canviEstatModal}>Tanca</Button>
                  <Button variant={tipoModal === 'Modificar' ? 'success' : 'info'} type="submit">{tipoModal}</Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default OrderLineReception_Status;
