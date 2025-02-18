import { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table, Spinner } from 'react-bootstrap';
import Header from '../Header';
import Filtres from "./OrdresRecepcioFiltres";
import { useNavigate, useLocation } from "react-router-dom";
import IncidenciaGenerarModal from '../Magatzem/IncidenciesGenerar'

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
  const [users, setUsers] = useState([]);
  const [operariSeleccionat, setOperariSeleccionat] = useState("");
  // Estats Paginació
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState([]);
  const elementsPaginacio = import.meta.env.VITE_PAGINACIO;
  const [showModalIncident,setShowModalIncident]=useState(false)
  const [idModalIncident, setIdModalIncident] = useState(0)

  // Funcions paginació
  useEffect(() => {
    const totalPages = Math.ceil(orderReceptions.length / elementsPaginacio);
    setTotalPages(totalPages);
    console.log(totalPages)
  }, [orderReceptions])

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    const indexOfLastItem = currentPage * elementsPaginacio;
    const indexOfFirstItem = indexOfLastItem - elementsPaginacio;
    const currentItems = orderReceptions.slice(indexOfFirstItem, indexOfLastItem);
    setOrderPage(currentItems)
  }, [currentPage, orderReceptions])

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes, productsRes, statusesRes, statusLineRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/orderreception`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/supplier`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/product`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/orderreception_status`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/orderline_status`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/users`, { headers: { "auth-token": localStorage.getItem("token") } })
      ]);
      setOrderReceptions(ordersRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
      setorderReceptionStatus(statusesRes.data);
      setOrderLineStatus(statusLineRes.data);
      setUsers(usersRes.data);
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

  const handleInputChange = (event) => {
    setOperariSeleccionat(event.target.value);
  };

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

  const descarregarOrdre = async (ordreId, operatorId) => {
    try {
      await axios.put(`${apiUrl}/orderreception/${ordreId}`, {
        orderreception_status_id: 2,
        created_by: operariSeleccionat,
      }, {
        headers: { "auth-token": localStorage.getItem("token") },
      });

      setOrderReceptions(prev => prev.map(order =>
        order.id === ordreId ? { ...order, orderreception_status_id: 2, created_by: operatorId } : order
      ));

      setShowReviewModal(false);
    } catch (err) {
      console.error("Error canviant l'estat de l'ordre:", err);
      setError("Error actualitzant l'estat de l'ordre.");
    }
  };

  const desempaquetarOrdre = async (ordreId) => {
    try {
      const orderLinesResponse = await axios.get(`${apiUrl}/orderlinereception`, {
        params: { order_reception_id: ordreId },
        headers: { "auth-token": localStorage.getItem("token") },
      });

      const orderLines = orderLinesResponse.data;

      const updatePromises = orderLines.map(line => {
        return axios.put(`${apiUrl}/orderlinereception/${line.id}`, {
          quantity_received: line.quantity_ordered,
        }, {
          headers: { "auth-token": localStorage.getItem("token") },
        });
      });

      await Promise.all(updatePromises);

      await axios.put(`${apiUrl}/orderreception/${ordreId}`, {
        orderreception_status_id: 3,
      }, {
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


  const emmagatzemarOrdre = async (ordreId) => {
    try {
      await axios.put(`${apiUrl}/orderreception/${ordreId}`, { orderreception_status_id: 4 }, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      setOrderReceptions(prev => prev.map(order =>
        order.id === ordreId ? { ...order, orderreception_status_id: 4 } : order
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

  const actualitzaFiltres = (id, nomEstat, data, estat) => {
    let filteredOrders = orderReceptions;

    if (id) {
      filteredOrders = filteredOrders.filter(order => order.id.toString().includes(id));
    }

    if (nomEstat) {
      filteredOrders = filteredOrders.filter(order => {
        const supplier = suppliers.find(sup => sup.id === order.supplier_id);
        return supplier && supplier.name.toLowerCase().includes(nomEstat.toLowerCase());
      });
    }

    if (data) {
      filteredOrders = filteredOrders.filter(order => order.estimated_reception_date.includes(data));
    }

    if (estat) {
      filteredOrders = filteredOrders.filter(order => {
        const status = orderReceptionStatus.find(status => status.id === order.orderreception_status_id);
        return status && status.name.toLowerCase().includes(estat.toLowerCase());
      });
    }

    setOrderReceptions(filteredOrders);
  };

  const netejaFiltres = () => {
    axios.get(`${apiUrl}/orderreception`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrderReceptions(response.data);
      })
      .catch(() => {
        setError("Error carregant les dades.");
      });
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

  //Control modal incident
  const handleModalIncident = (id) => {  
    setShowModalIncident(!showModalIncident)
    setIdModalIncident(id)
  }

  useEffect(() => {
    console.log("id ", idModalIncident)
  }, [idModalIncident]);

  return (
    <>
      <Header title="Llistat Ordres de Recepció" />
      <Filtres onFilterChange={actualitzaFiltres} onFilterRestart={netejaFiltres} />
      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Selecciona una opció">
                <option value="" disabled selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label for="floatingSelect">Accions en lot</label>
            </div>
            <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0"
              type="button"
              aria-label="Aplicar acció en lot">
              <i className="bi bi-check-circle text-white px-1"></i>Aplicar</button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 order-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            <Button
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              onClick={() => {
                setTipoModal('Crear');
                setValorsInicials({
                  supplier_id: '',
                  estimated_reception_date: '',
                });
                canviEstatModal();
              }}
              aria-label="Crear nova ordre de recepció">
              <i class="bi bi-plus-circle text-white pe-1"></i>Crear</Button>
          </div>
        </div>
      </div>

      <div className='container-fluid pt-3'>
        <Table className='table table-striped border text-center m-2' aria-live="polite">
          <thead class="table-active border-bottom border-dark-subtle">
            <tr>
              <th>Id</th>
              <th>Proveïdor</th>
              <th>Data Estimada</th>
              <th>Estat</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {orderPage.length === 0 ? (
              <tr>
                <td colSpan="5">No hi ha ordres de recepció</td>
              </tr>
            ) : (
              orderPage
                .filter((ordre) => ordre.orderreception_status_id !== 4)
                .map((valors) => (
                  <tr key={valors.id}>
                    <td data-cell="ID">{valors.id}</td>
                    <td data-cell="Proveïdor">{suppliers.find((sup) => sup.id === valors.supplier_id)?.name}</td>
                    <td data-cell="Data Estimada">{formateaFecha(valors.estimated_reception_date)}</td>
                    <td data-cell="Estat">{getStatusName(valors.orderreception_status_id)}</td>
                    <td data-no-colon="true">
                      {valors.orderreception_status_id === 3 && (
                        <span onClick={() => emmagatzemarOrdre(valors.id)} style={{ cursor: "pointer" }} aria-label="Emmagatzemada">
                          <i className="bi bi-check"></i>
                        </span>
                      )}

                      {(valors.orderreception_status_id === 1 || valors.orderreception_status_id === 2) && (
                        <>
                          <span onClick={() => revisarOrdre(valors)} style={{ cursor: "pointer" }} aria-label="Revisar">
                            <i className="bi bi-eye pe-2"></i>
                          </span>

                          {valors.orderreception_status_id === 1 && (
                            <>
                              <span onClick={() => modificarOrdre(valors)} style={{ cursor: "pointer" }} aria-label="Modificar">
                                <i className="bi bi-pencil-square pe-2"></i>
                              </span>
                              <span onClick={() => eliminarOrdre(valors.id)} style={{ cursor: "pointer" }} aria-label="Eliminar">
                                <i className="bi bi-trash"></i>
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </Table>
        {/* Paginació */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation example" className="d-block">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}>
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <li key={number} className={`page-item ${currentPage === number ? 'activo-2' : ''}`}>
                  <a className="page-link text-light-blue" href="#" onClick={(e) => { e.preventDefault(); paginate(number); }}>
                    {number}
                  </a>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={(e) => { e.preventDefault(); goToNextPage(); }}>
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Ordre de Recepció</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingModal ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Formik
              enableReinitialize
              initialValues={valorsInicials}
              validationSchema={OrderReceptionSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form>
                  {/* PROVEÏDOR */}
                  <div className="form-group">
                    <label htmlFor="supplier_id">Proveïdor</label>
                    <Field
                      as="select"
                      id="supplier_id"
                      name="supplier_id"
                      className={`form-control ${touched.supplier_id && errors.supplier_id ? 'is-invalid' : ''}`}
                    >
                      <option value="">Selecciona un proveïdor</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </Field>
                    {errors.supplier_id && touched.supplier_id && (
                      <div className="invalid-feedback">{errors.supplier_id}</div>
                    )}
                  </div>

                  {/* DATA ESTIMADA */}
                  <div className="form-group mt-2">
                    <label htmlFor="estimated_reception_date">Data Estimada</label>
                    <Field
                      id="estimated_reception_date"
                      type="date"
                      name="estimated_reception_date"
                      className={`form-control ${touched.estimated_reception_date && errors.estimated_reception_date ? 'is-invalid' : ''}`}
                      value={valorsInicials.estimated_reception_date}
                      onChange={(e) => setValorsInicials({ ...valorsInicials, estimated_reception_date: e.target.value })}
                    />
                    {errors.estimated_reception_date && touched.estimated_reception_date && (
                      <div className="invalid-feedback">{errors.estimated_reception_date}</div>
                    )}
                  </div>

                  {/* PRODUCTE */}
                  <div className="form-group mt-2">
                    <label htmlFor="product">Producte</label>
                    <Field
                      as="select"
                      id="product"
                      name="product"
                      className="form-control"
                      onChange={(e) => setProductId(e.target.value)}
                      value={productId}
                    >
                      <option value="">Selecciona un producte</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.name}>{product.name}</option>
                      ))}
                    </Field>
                  </div>

                  {/* QUANTITAT */}
                  <div className="form-group mt-2">
                    <label htmlFor="quantity">Quantitat</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* BOTÓ AFEGIR PRODUCTE */}
                  <div className="text-end mt-3">
                    <Button variant="info" type="button" className="btn orange-button text-white" onClick={afegirProducte}>
                      Afegir Producte
                    </Button>
                  </div>

                  {/* PRODUCTES AFEGITS */}
                  {selectedProducts.length > 0 && (
                    <div className="mt-3">
                      <h4>Productes Afegits</h4>
                      <Table striped bordered hover className="table-sm">
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
                                <Button variant="danger" size="sm" onClick={() => eliminarProducte(index)}>
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* BOTONS D'ACCIÓ */}
                  <div className="form-group text-right mt-3">
                    <Button variant="secondary" onClick={canviEstatModal}>
                      Tanca
                    </Button>
                    <Button
                      variant={tipoModal === 'Modificar' ? 'success' : 'info'}
                      type="submit"
                      className="btn orange-button text-white ms-2"
                    >
                      {tipoModal}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal per Revisar Ordre */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ordre de Recepció</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToReview ? (
            <div>
              <p><strong>Id:</strong> {orderToReview.id}</p>
              <p><strong>Proveïdor:</strong> {suppliers.find((sup) => sup.id === orderToReview.supplier_id)?.name}</p>
              <p><strong>Data Estimada:</strong> {formateaFecha(orderToReview.estimated_reception_date)}</p>
              <p><strong>Estat:</strong> {getStatusName(orderToReview.orderreception_status_id)}</p>

              <h5 className="mt-3">Productes:</h5>
              <Table striped bordered hover className="table-sm">
                <thead>
                  <tr>
                    <th>Producte</th>
                    <th>Quantitat</th>
                    <th>Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.length > 0 ? (
                    orderLines.map((linea, index) => (
                      <tr key={index}>
                        <td>{products.find((product) => product.id === linea.product_id)?.name}</td>
                        <td>{linea.quantity_ordered}</td>
                        <td>
                          {orderToReview?.orderreception_status_id === 2 && (
                            <>
                              <Button className="btn btn-danger mb-2" onClick={() =>{handleModalIncident(linea.id)}}>
                                Incidència
                              </Button>
                         {/*     <Button variant="secondary" onClick={() => alert(`Lot/Serie per ${linea.product_id}`)} className="ms-2">
                                Lot/Serie
                              </Button> */}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No hi ha productes associats a aquesta ordre.</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {orderToReview.orderreception_status_id === 1 && (
                <div className="mt-3">
                  <label htmlFor="created_by">Operari Associat:</label>
                  <select className="form-select" name="operari" aria-label="Seleccione un operari"
                    value={operariSeleccionat} onChange={handleInputChange}
                  >
                    <option value="" selected disabled>Tria una opció</option>
                    {users.map((user) => {
                      return (
                        <option value={user.id}>{user.name}</option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          ) : null}
        </Modal.Body>

        {/* Botons d'Acció */}
        <Modal.Footer>
          {orderToReview?.orderreception_status_id === 1 && (
            <>
              <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                Tancar
              </Button>
              <Button
                className="btn orange-button text-white ms-2"
                onClick={() => descarregarOrdre(orderToReview.id)}
              >
                Descarregada
              </Button>
            </>
          )}

          {orderToReview?.orderreception_status_id === 2 && (
            <>
              <Button className="btn orange-button text-white ms-2" onClick={() => desempaquetarOrdre(orderToReview.id)}>
                Desempaquetada
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/*Modal incident*/}
      {(idModalIncident!=0 && showModalIncident === true) ? 
        <IncidenciaGenerarModal orderLineReceptionID={idModalIncident} viewModal={showModalIncident} handleModal={handleModalIncident}/>
      : null}
    </>
  );
}
export default OrderReception;
