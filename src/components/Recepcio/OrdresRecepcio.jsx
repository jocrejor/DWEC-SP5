import { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';

const apiUrl = import.meta.env.VITE_API_URL;

const OrderReceptionSchema = Yup.object().shape({
  supplier_id: Yup.number().required('Proveïdor requerit'),
  estimated_reception_date: Yup.date().required('Data estimada requerida'),
  ordrerline_status: Yup.string()
    .min(1, "Valor mínim d'1 caràcter.")
    .max(25, 'El valor màxim és de 25 caràcters.')
    .required('Estat requerit'),
});

function OrderReception() {
  const [orderReceptions, setOrderReceptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({
    supplier_id: '',
    estimated_reception_date: '',
    ordrerline_status: '',
  });
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes, statusesRes, productsRes] = await Promise.all([
        axios.get(`${apiUrl}/orderreception`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/supplier`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/orderreception_status`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/product`, { headers: { "auth-token": localStorage.getItem("token") } }),
      ]);
      setOrderReceptions(ordersRes.data);
      setSuppliers(suppliersRes.data);
      setStatuses(statusesRes.data);
      setProducts(productsRes.data);
      setError(null);
    } catch (err) {
      console.error("Error al carregar dades:", err);
      setError('Error carregant les dades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const eliminarOrdre = async (id) => {
    if (window.confirm('Estàs segur que vols eliminar aquesta ordre?')) {
      try {
        await axios.delete(`${apiUrl}/orderreception/${id}`, { headers: { "auth-token": localStorage.getItem("token") } });
        setOrderReceptions(prev => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Error eliminant ordre:", err);
        setError("Error eliminant l'ordre.");
      }
    }
  };

  const modificarOrdre = (valors) => {
    setTipoModal('Modificar');
    // Carreguem els valors inicials de l'ordre a modificar
    setValorsInicials(valors);
    // Carreguem els productes ja assignats (o un array buit si no n'hi ha)
    setSelectedProducts(valors.products || []);
    setShowModal(true);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
    // Reiniciem els camps per afegir productes
    setSelectedProducts([]);
    setProductId('');
    setQuantity('');
  };

  const afegirProducte = () => {
    if (!productId || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
      alert('Selecciona un producte vàlid i una quantitat positiva!');
      return;
    }

    const product = products.find((p) => p.name === productId);
    if (!product) {
      alert('Producte no trobat!');
      return;
    }
    setSelectedProducts((prev) => [
      ...prev,
      { product_id: product.id, name: product.name, quantity: parseInt(quantity) },
    ]);
    setProductId('');
    setQuantity('');
  };

  const eliminarProducte = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedProducts.length === 0) {
        alert("Afegir com a mínim un producte a l'ordre.");
        return;
      }
      const dataToSend = { ...values, products: selectedProducts };
      console.log("Data to send:", dataToSend);
      if (tipoModal === 'Crear') {
        const res = await axios.post(`${apiUrl}/orderreception`, dataToSend, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
        console.log("Resposta creació:", res.data);
      } else {
        const res = await axios.put(`${apiUrl}/orderreception/${values.id}`, dataToSend, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
        console.log("Resposta modificació:", res.data);
      }
      await fetchInitialData();
      canviEstatModal();
      setError(null);
    } catch (err) {
      // Mostrem més informació sobre l'error per depurar
      console.error("Error en la creació/modificació de l'ordre:", err.response ? err.response.data : err);
      setError("Error en l'operació.");
    }
  };

  return (
    <>
      <Header title="Llistat Ordres de Recepció" />
      <Button
        variant="success"
        onClick={() => {
          setTipoModal('Crear');
          setValorsInicials({
            supplier_id: '',
            estimated_reception_date: '',
            ordrerline_status: '',
          });
          canviEstatModal();
        }}
      >
        Nova Ordre de Recepció
      </Button>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <div>{error}</div>
      ) : orderReceptions.length === 0 ? (
        <div>No hi ha ordres</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Id</th>
              <th>Proveïdor</th>
              <th>Data Estimada</th>
              <th>Estat</th>
              <th>Modificar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {orderReceptions.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{suppliers.find((sup) => sup.id === valors.supplier_id)?.name}</td>
                <td>{valors.estimated_reception_date}</td>
                <td>{statuses.find((status) => status.id === valors.ordrerline_status)?.name}</td>
                <td>
                  <Button variant="warning" onClick={() => modificarOrdre(valors)}>
                    Modificar
                  </Button>
                </td>
                <td>
                  <Button variant="primary" onClick={() => eliminarOrdre(valors.id)}>
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
          <Modal.Title>{tipoModal} Ordre de Recepció</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            enableReinitialize
            initialValues={valorsInicials}
            validationSchema={OrderReceptionSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <div>
                  <label htmlFor="supplier_id">Proveïdor</label>
                  <Field as="select" id="supplier_id" name="supplier_id">
                    <option value="">Selecciona un proveïdor</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </Field>
                  {errors.supplier_id && touched.supplier_id && (
                    <div>{errors.supplier_id}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="estimated_reception_date">Data Estimada</label>
                  <Field
                    id="estimated_reception_date"
                    type="date"
                    name="estimated_reception_date"
                  />
                  {errors.estimated_reception_date &&
                    touched.estimated_reception_date && (
                      <div>{errors.estimated_reception_date}</div>
                    )}
                </div>
                <div>
                  <label htmlFor="ordrerline_status">Estat</label>
                  <Field
                    as="select"
                    id="ordrerline_status"
                    name="ordrerline_status"
                  >
                    <option value="">Selecciona un estat</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Field>
                  {errors.ordrerline_status &&
                    touched.ordrerline_status && (
                      <div>{errors.ordrerline_status}</div>
                    )}
                </div>
                <div>
                  <label htmlFor="product">Producte</label>
                  <Field
                    as="select"
                    id="product"
                    name="product"
                    onChange={(e) => setProductId(e.target.value)}
                    value={productId}
                  >
                    <option value="">Selecciona un producte</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label htmlFor="quantity">Quantitat</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
                <button type="button" onClick={afegirProducte}>
                  Afegir Producte
                </button>
                <div>
                  <h4>Productes Afegits</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Producte</th>
                        <th>Quantitat</th>
                        <th>Eliminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((prod, index) => (
                        <tr key={index}>
                          <td>{prod.name}</td>
                          <td>{prod.quantity}</td>
                          <td>
                            <button type="button" onClick={() => eliminarProducte(index)}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <Button variant="primary" type="submit">
                  {tipoModal === 'Crear' ? 'Crear' : 'Modificar'}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default OrderReception;
