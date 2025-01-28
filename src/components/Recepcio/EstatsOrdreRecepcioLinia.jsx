import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { url, postData, getData, deleteData, updateId } from '../../apiAccess/crud';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header'

const OrderReception_StatusSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Valor mínim d'1 caràcter.")
    .max(25, 'El valor màxim és de 25 caràcters.')
    .required('Valor requerit'),
});

function OrderReception_Status() {
  const [ordersLineReceptionStatus, setOrdersLineReceptionStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({ name: '' });
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getData(url, 'OrderReception_Status');
      setOrdersLineReceptionStatus(data);
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

  const eliminarEstatLinia = async (id) => {
    if (window.confirm('Estàs segur que vols eliminar aquest estat?')) {
      try {
        await deleteData(url, 'OrderReception_Status', id);
        setOrdersLineReceptionStatus((prev) =>
          prev.filter((item) => item.id !== id)
        );
      } catch (err) {
        setError('Error eliminant l\'estat.');
      }
    }
  };

  const modificarEstatLinia = (valors) => {
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
        await postData(url, 'OrderReception_Status', values);
      } else {
        await updateId(url, 'OrderReception_Status', values.id, values);
      }
      await fetchOrders();
      canviEstatModal();
      setError(null);
    } catch (err) {
      setError('Error en l\'operació.');
    }
  };

  return (
    <>
      <Header title="Llistat Estats de Línia" />
      <Button
        variant="success"
        onClick={() => {
          setTipoModal('Crear');
          setValorsInicials({ name: '' });
          canviEstatModal();
        }}
      >
        Nou Estat de línia
      </Button>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <div>{error}</div>
      ) : ordersLineReceptionStatus.length === 0 ? (
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
            {ordersLineReceptionStatus.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => modificarEstatLinia(valors)}
                  >
                    Modificar
                  </Button>
                </td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => eliminarEstatLinia(valors.id)}
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
