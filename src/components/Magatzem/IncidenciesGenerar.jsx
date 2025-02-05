import { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';
import Filtres from "../Filtres";

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

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        axios.get(`${apiUrl}/orderreception`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/supplier`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/product`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/orderline_status`, { headers: { "auth-token": localStorage.getItem("token") } }),
      ]);
      setOrderReceptions(ordersRes.data);
      setSuppliers(suppliersRes.data);
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

  // Aconseguir el format de data desitjat DD-MM-YYYY
  const formateaFecha = (fecha) => {
    const fechaSoloFecha = fecha.split('T')[0];
    const [year, month, day] = fechaSoloFecha.split('-');
    return `${day}-${month}-${year}`;
  };



  // Funció per eliminar ordre de recepció
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
  

  // Funció per modificar ordre de recepció
  const [loadingModal, setLoadingModal] = useState(false);

  // Modificar Ordre
  const modificarOrdre = async (ordre) => {
    setTipoModal('Modificar');
    setLoadingModal(true);
  
    try {
      const res = await axios.get(`${apiUrl}/orderlinereception/${ordre.id}`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
  
      const productesAssociats = res.data.map((linea) => ({
        product_id: linea.product_id,
        name: products.find((p) => p.id === linea.product_id)?.name || 'Producte desconegut',
        quantity: linea.quantity_ordered,
      }));
  
      setSelectedProducts(productesAssociats);
  
      setValorsInicials({
        supplier_id: ordre.supplier_id,
        estimated_reception_date: formateaFecha(ordre.estimated_reception_date),
      });
    } catch (err) {
      console.error("Error carregant línies d'ordre:", err);
      setSelectedProducts([]);
    }
  
    setLoadingModal(false); // Quan les dades estiguin carregades, mostrem el modal
    setShowModal(true);
  };
  


  const canviEstatModal = () => {
    setShowModal(!showModal);
    setSelectedProducts([]);
    setProductId('');
    setQuantity('');
  };

  // Funció per afegir producte a la llista de productes seleccionats
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

  // Funció per eliminar producte de la llista seleccionada
  const eliminarProducte = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // Funció per crear l'Ordre de Recepció
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

  // Funció per crear les línies d'Ordre de Recepció
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

  // Funció per enviar el formulari (crear ordre i línies associades)
  const handleSubmit = async (values) => {
    //try {
    const ordreDeRecepcio = {
      ...values,
      orderreception_status_id: 1,
    };

    // Crear l'Ordre de Recepció
    const resultat = await crearOrdreDeRecepcio(ordreDeRecepcio);
    const ordreIdValue = resultat

    for (let product of selectedProducts) {
      const liniaOrdre = {
        order_reception_id: ordreIdValue,
        product_id: product.product_id,
        quantity_ordered: product.quantity,
        orderline_status_id: 1,
        quantity_received: 0,
      };
      await crearLiniaOrdreDeRecepcio(liniaOrdre);
    }

    // Actualitzar la llista de dades
    await fetchInitialData();
    canviEstatModal();
    setError(null);
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
              <th>Modificar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {orderReceptions.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{suppliers.find((sup) => sup.id === valors.supplier_id)?.name}</td>
                <td>{formateaFecha(valors.estimated_reception_date)}</td>
                <td>{valors.orderreception_status}</td>
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
    </>
  );
}

export default OrderReception;