import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { url, postData, getData, deleteData, updateId } from '../../apiAccess/crud';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';

const API_URL = 'https://api.dwes.iesevalorpego.es';

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/OrderLineReception_Status`);
      setOrdersLineReception(data);
      setError(null);
    } catch (err) {
      setError('Error carregant les dades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const eliminarEstatOrdre = async (id) => {
    if (window.confirm('Estàs segur que vols eliminar aquest estat?')) {
      try {
        await axios.delete(`${API_URL}/OrderLineReception_Status/${id}`);
        setOrdersLineReception((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError("Error eliminant l'estat.");
      }
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
        await axios.post(`${API_URL}/OrderLineReception_Status`, values);
      } else {
        await axios.put(`${API_URL}/OrderLineReception_Status/${values.id}`, values);
      }
      await fetchOrders();
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
        Nou Estat de ordre
      </Button>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <div>{error}</div>
      ) : ordersLineReception.length === 0 ? (
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
            {ordersLineReception.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => modificarEstatOrdre(valors)}
                  >
                    Modificar
                  </Button>
                </td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => eliminarEstatOrdre(valors.id)}
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
          <Modal.Title>{tipoModal} Estat de Ordre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={valorsInicials}
            validationSchema={OrderLineReception_StatusSchema}
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
                    placeholder="Nom del estat"
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

export default OrderLineReception_Status;