import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const OrderReception_StatusSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Valor mínim d'1 caràcter.")
    .max(25, 'El valor màxim és de 25 caràcters.')
    .required('Valor requerit'),
});

function OrderReception_Status() {
  const [ordersReceptionStatus, setOrdersReceptionStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({ name: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl}/orderreception_status`, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
        setOrdersReceptionStatus(response.data);
        setError(null);
      } catch (err) {
        setError('Error carregant les dades.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const eliminarEstat = async (id) => {
    if (window.confirm('Estàs segur que vols eliminar aquest estat?')) {
      try {
        await axios.delete(`${apiUrl}/orderreception_status/${id}`, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
        setOrdersReceptionStatus((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError("Error eliminant l'estat.");
      }
    }
  };

  const modificarEstat = (valors) => {
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
        await axios.post(`${apiUrl}/orderreception_status`, values, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
      } else {
        await axios.put(`${apiUrl}/orderreception_status/${values.id}`, values, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
      }
      const response = await axios.get(`${apiUrl}/orderreception_status`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      setOrdersReceptionStatus(response.data);
      canviEstatModal();
      setError(null);
    } catch (err) {
      setError("Error en l'operació.");
    }
  };

  return (
    <>
      <Header title="Llistat Estats de Ordre" />
      <Button
        variant="success"
        onClick={() => {
          setTipoModal('Crear');
          setValorsInicials({ name: '' });
          canviEstatModal();
        }}
      >
        Nou Estat de Ordre
      </Button>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <div>{error}</div>
      ) : ordersReceptionStatus.length === 0 ? (
        <div>No hi ha estats</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nom</th>
              <th>Modificar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {ordersReceptionStatus.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => modificarEstat(valors)}
                  >
                    Modificar
                  </Button>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => eliminarEstat(valors.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Estat de Línia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={valorsInicials}
            validationSchema={OrderReception_StatusSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <div>
                  <label htmlFor="name">Nom</label>
                  <Field
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Nom del estat de línia"
                    autoComplete="off"
                  />
                  {errors.name && touched.name && <div>{errors.name}</div>}
                </div>
                <div>
                  <Button variant="secondary" onClick={canviEstatModal}>
                    Tanca
                  </Button>
                  <Button
                    variant={tipoModal === 'Modificar' ? 'success' : 'info'}
                    type="submit"
                  >
                    {tipoModal}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default OrderReception_Status;
