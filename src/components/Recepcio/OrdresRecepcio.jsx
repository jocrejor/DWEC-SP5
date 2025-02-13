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
});

function OrderReception() {
  const [orderReceptions, setOrderReceptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({
    supplier_id: '',
    estimated_reception_date: '',
  });
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false); // Nou modal per revisar
  const [orderToReview, setOrderToReview] = useState(null);
  const [orderReceptionStatus, setorderReceptionStatus] = useState([]);
  const [orderLineStatus, setOrderLineStatus] = useState([]);
  const [orderLines, setOrderLines] = useState([]);


  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes, productsRes, statusesRes, statusLineRes] = await Promise.all([
        axios.get(`${apiUrl}/orderreception`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/supplier`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/product`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/orderreception_status`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/orderline_status`, { headers: { "auth-token": localStorage.getItem("token") } })
      ]);
      setOrderReceptions(ordersRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
      setorderReceptionStatus(statusesRes.data);
      setOrderLineStatus(statusLineRes.data);
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

  const formateaFecha = (fecha) => {
    const fechaSoloFecha = fecha.split('T')[0];
    const [year, month, day] = fechaSoloFecha.split('-');
    return `${day}-${month}-${year}`;
  };

  const eliminarOrdre = async (id) => {
    if (window.confirm('Estàs segur que vols eliminar aquesta ordre?')) {
      try {
        const response = await axios.get(`${apiUrl}/orderlinereception`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });

        const responseData = response.data;

        if (responseData.length > 0) {
          const deletePromises = responseData
            .filter(orderLine => orderLine.order_reception_id === id)
            .map(orderLine =>
              axios.delete(`${apiUrl}/orderlinereception/${orderLine.id}`, {
                headers: { "auth-token": localStorage.getItem("token") }
              })
            );

          await Promise.all(deletePromises);
        }

        await axios.delete(`${apiUrl}/orderreception/${id}`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });

        setOrderReceptions(prev => prev.filter((item) => item.id !== id));

      } catch (err) {
        console.error("Error eliminant ordre:", err);
        setError("Error eliminant l'ordre.");
      }
    }
  };

  const [loadingModal, setLoadingModal] = useState(false);

  const modificarOrdre = async (ordre) => {
    setTipoModal('Modificar');
    canviEstatModal();

    try {
      const res = await axios.get(`${apiUrl}/orderreception/${ordre.id}`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });

      const orderLinesRes = await axios.get(`${apiUrl}/orderlinereception/`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });

      const orderLinesResFilter = orderLinesRes.data.filter(line => line.order_reception_id === ordre.id);
      setOrderLines(orderLinesResFilter);

      const productesAssociats = orderLinesResFilter.map((linea) => ({
        product_id: linea.product_id,
        name: products.find((p) => p.id === linea.product_id)?.name || 'Producte desconegut',
        quantity: linea.quantity_ordered,
      }));

      setSelectedProducts(productesAssociats);
      setValorsInicials({
        id: ordre.id,
        supplier_id: ordre.supplier_id,
        estimated_reception_date: formateaFecha(ordre.estimated_reception_date),
      });

    } catch (err) {
      console.error("Error carregant les dades per modificar l'ordre:", err);
      setSelectedProducts([]);
    }

    setLoadingModal(false);
    setShowModal(true);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
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

  const revisarOrdre = async (ordre) => {
    setOrderToReview(ordre);
    try {

      const orderLinesRes = await axios.get(`${apiUrl}/orderlinereception/`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      const orderLinesResFilter = orderLinesRes.data.filter(line => line.order_reception_id === ordre.id)
      console.log(orderLinesResFilter)
      setOrderLines(orderLinesResFilter);

    } catch (err) {
      console.error("Error al carregar les línies de l'ordre:", err);
      setError("Error carregant les línies de l'ordre.");
    }

    setShowReviewModal(true);
  };

  const descarregarOrdre = async (ordreId) => {
    try {
      await axios.put(`${apiUrl}/orderreception/${ordreId}`, { orderreception_status_id: 2 }, {
        headers: { "auth-token": localStorage.getItem("token") },
      });

      setOrderReceptions(prev => prev.map(order =>
        order.id === ordreId ? { ...order, orderreception_status_id: 2 } : order
      ));

      setShowReviewModal(false);
    } catch (err) {
      console.error("Error canviant l'estat de l'ordre:", err);
      setError("Error actualitzant l'estat de l'ordre.");
    }
  };

  const desempaquetarOrdre = async (ordreId) => {
    try {
      await axios.put(`${apiUrl}/orderreception/${ordreId}`, { orderreception_status_id: 3 }, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      setOrderReceptions(prev => prev.map(order =>
        order.id === ordreId ? { ...order, orderreception_status_id: 3 } : order
      ));
      setShowReviewModal(false);
    } catch (err) {
      console.error("Error canviant l'estat de l'ordre:", err);
    }
  };

  const eliminarProducte = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const getStatusName = (statusId) => {
    const status = orderReceptionStatus.find((status) => status.id === statusId);
    if (status) {
      return status.name;
    } else {
      return 'Desconegut';
    }
  };

  const crearOrdreDeRecepcio = async (ordreDeRecepcio) => {
    try {
      const res = await axios.post(`${apiUrl}/orderreception`, ordreDeRecepcio, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      return res.data.results.insertId;
    } catch (err) {
      console.error("Error creant ordre de recepció:", err);
      throw new Error("No s'ha pogut crear l'ordre de recepció.");
    }
  };

  const crearLiniaOrdreDeRecepcio = async (liniaOrdreDeRecepcio) => {
    try {
      await axios.post(`${apiUrl}/orderlinereception`, liniaOrdreDeRecepcio, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
    } catch (err) {
      console.error("Error creant línia d'ordre de recepció:", err);
      throw new Error("No s'ha pogut crear la línia d'ordre de recepció.");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (tipoModal === 'Crear') {
        const ordreIdValue = await crearOrdreDeRecepcio({
          ...values,
          orderreception_status_id: 1
        });

        for (let product of selectedProducts) {
          await crearLiniaOrdreDeRecepcio({
            order_reception_id: ordreIdValue,
            product_id: product.product_id,
            quantity_ordered: product.quantity,
            orderline_status_id: 1,
            quantity_received: 0,
          });
        }

      } else if (tipoModal === 'Modificar') {
        await axios.put(`${apiUrl}/orderreception/${valorsInicials.id}`, values, {
          headers: { "auth-token": localStorage.getItem("token") }
        });

        await axios.delete(`${apiUrl}/orderlinereception/order/${valorsInicials.id}`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });

        for (let product of selectedProducts) {
          await crearLiniaOrdreDeRecepcio({
            order_reception_id: valorsInicials.id,
            product_id: product.product_id,
            quantity_ordered: product.quantity,
            orderline_status_id: 1,
            quantity_received: 0,
          });
        }
      }

      await fetchInitialData();
      canviEstatModal();
      setError(null);
    } catch (err) {
      console.error("Error en el procés:", err);
      setError("No s'ha pogut processar la sol·licitud.");
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
              <th>Accions</th>

            </tr>
          </thead>
          <tbody>
            {orderReceptions.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{suppliers.find((sup) => sup.id === valors.supplier_id)?.name}</td>
                <td>{formateaFecha(valors.estimated_reception_date)}</td>
                <td>{getStatusName(valors.orderreception_status_id)}</td>
                <td>
                  <Button variant="info" onClick={() => revisarOrdre(valors)}>
                    Revisar
                  </Button>

                  {valors.orderreception_status_id === 1 && (
                    <>
                      <Button variant="warning" onClick={() => modificarOrdre(valors)}>
                        Modificar
                      </Button>
                      <Button variant="primary" onClick={() => eliminarOrdre(valors.id)}>
                        Eliminar
                      </Button>
                    </>
                  )}
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
          {loadingModal ? (
            <Spinner animation="border" />
          ) : (
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
                      value={valorsInicials.estimated_reception_date}
                      onChange={(e) => {
                        setValorsInicials({
                          ...valorsInicials,
                          estimated_reception_date: e.target.value,
                        });
                      }}
                    />
                    {errors.estimated_reception_date &&
                      touched.estimated_reception_date && (
                        <div>{errors.estimated_reception_date}</div>
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
          )}
        </Modal.Body>
      </Modal>

      {/* Modal per Revisar Ordre */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Revisió Ordre de Recepció</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToReview ? (
            <div>
              <p><strong>Id:</strong> {orderToReview.id}</p>
              <p><strong>Proveïdor:</strong> {suppliers.find((sup) => sup.id === orderToReview.supplier_id)?.name}</p>
              <p><strong>Data Estimada:</strong> {formateaFecha(orderToReview.estimated_reception_date)}</p>
              <p><strong>Estat:</strong> {getStatusName(orderToReview.orderreception_status_id)}</p>

              {/* Taula de productes associats a l'ordre */}
              <h5>Productes:</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Producte</th>
                    <th>Quantitat</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.length > 0 ? (
                    orderLines.map((linea, index) => (
                      <tr key={index}>
                        <td>{products.find((product) => product.id === linea.product_id)?.name}</td>
                        <td>{linea.quantity_ordered}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2">No hi ha productes associats a aquesta ordre.</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          {orderToReview?.orderreception_status_id === 1 ? (
            <>
              <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                Tancar
              </Button>
              <Button variant="success" onClick={() => descarregarOrdre(orderToReview.id)}>
                Descarregada
              </Button>
            </>
          ) : null}
          {orderToReview?.orderreception_status_id === 2 ? (
            <>
              <Button variant="warning" href="#">Incidència</Button>
              <Button variant="primary" href="#">Lot/Serie</Button>
              <Button variant="success" onClick={() => desempaquetarOrdre(orderToReview.id)}>
                Desempaquetada
              </Button>
            </>
          ) : null}
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default OrderReception;
