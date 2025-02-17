import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';
import Filter from "../EstatsOrdresEnviamentFiltres";
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const OrderShippingStatusSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Valor mínim d'1 caràcter.")
    .max(25, 'El valor màxim és de 25 caràcters.')
    .required('Valor requerit'),
});

function OrderShipping_Status() {
  const [orderShippingStatus, setOrderShippingStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({ name: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl}/ordershipping_status`, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
        setOrderShippingStatus(response.data);
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
        await axios.delete(`${apiUrl}/ordershipping_status/${id}`, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
        setOrderShippingStatus((prev) => prev.filter((item) => item.id !== id));
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
        await axios.post(`${apiUrl}/ordershipping_status`, values, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
      } else {
        await axios.put(`${apiUrl}/ordershipping_status/${values.id}`, values, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
      }
      const response = await axios.get(`${apiUrl}/ordershipping_status`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      setOrderShippingStatus(response.data);
      canviEstatModal();
      setError(null);
    } catch (err) {
      setError("Error en l'operació.");
    }
  };

  const actualitzaFiltres = async (estats) => {
    let ordersFiltradas = orderShippingStatus;
    ordersFiltradas = ordersFiltradas.filter((order) => {
      const matchesStatus = estats ? order.id === parseInt(estats) : true;
      console.log(order.id)
      return matchesStatus;
    });
    setOrderShippingStatus(ordersFiltradas);
  }

  const actualitzaDades = () => {
    axios.get(`${apiUrl}ordershipping_status`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrderShippingStatus(response.data)
      })
  }

  const netejaFiltres = () => {
    actualitzaDades();
    document.getElementById("status").value = "";
  }

  return (
    <>
      <Header title="Llistat Estats de Ordre" />
      <Filter onFilterChange={actualitzaFiltres} onFilterRestart={netejaFiltres} />
      <div className="container-fluid pt-3">
        <Table striped bordered hover>
          <thead className="table-active border-bottom border-dark-subtle text-center">
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {orderShippingStatus.length === 0 ? (
              <tr>
                <td colSpan="3">No hi ha estats de ordre</td>
              </tr>
            ) : (
              orderShippingStatus.map((valors) => (
                <tr key={valors.id}>
                  <td className='text-center'>{valors.id}</td>
                  <td className='text-center'>{valors.name}</td>
                  <td className='text-center'>
                    <span onClick={() => modificarEstat(valors)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-pencil-square"></i>
                    </span>
                    <span onClick={() => eliminarEstat(valors.id)} className="mx-2" style={{ cursor: "pointer" }}>
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
          <Modal.Title>{tipoModal} Estat de Línia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={valorsInicials}
            validationSchema={OrderShippingStatusSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Nom</label>
                  <Field
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Nom del estat de línia"
                    autoComplete="off"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  />
                  {errors.name && touched.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="form-group text-right">
                  <Button variant="secondary" onClick={canviEstatModal}>
                    Tanca
                  </Button>
                  <Button
                    variant={tipoModal === 'Modificar' ? 'success' : 'info'}
                    type="submit"
                    className="ml-2"
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

export default OrderShipping_Status;
