import { useState, useEffect, useMemo } from 'react';
import Header from "../Header";
import FiltresMoviments from "./MovimentsFiltres";
import { Button, Modal } from 'react-bootstrap';
import axios from "axios";

function Moviments() {
  const [moviments, setMoviments] = useState([]);
  const [filteredMoviments, setFilteredMoviments] = useState([]);
  const [producte, setProduct] = useState([]);
  
  const [users, setUsers] = useState([]);
  const [selectMoviments, setSelectedMoviment] = useState(null);
  const [show, setShow] = useState(false);
  
  const [inventari, setInventari] = useState([]);
  const [Orderreception, setOrdrerecepcio] = useState([]);
  const [Orderlinereception, setOrdrelinerecepcio] = useState([]);
  const [incidencies, setIncidencies] = useState([]);

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventariseleccionat, setSelectedInventory] = useState(null);
  
  const [showOrderReceptionModal, setShowOrderReceptionModal] = useState(false);
  const [ordreRecepcioseleccionada, setSelectedOrderReception] = useState(null);
  
  const [showOrderLineModal, setShowOrderLineModal] = useState(false);
  const [ordrelineaseleccionada, setSelectedOrderLine] = useState(null);
  
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidencia_seleccionada, setSelectedIncident] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pagina = 10;

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleClose = () => setShow(false);
  const handleShow = (product) => {
    setSelectedMoviment(product);
    setShow(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const polsarorigin = (origin, id) => {
    switch (origin) {
      case 'inventoryl': {
        const inventariDetails = inventari.find(item => item.id === id);
        if (inventariDetails) {
          setSelectedInventory(inventariDetails);
          setShowInventoryModal(true);
        } else {
          alert('No se encontró el inventario con ese ID.');
        }
        break;
      }
      case 'Recepcio': {  
        const orderReceptionDetails = Orderreception.find(item => item.id === id);
        if (orderReceptionDetails) {
          setSelectedOrderReception(orderReceptionDetails);
          setShowOrderReceptionModal(true);
        } else {
          alert('No se encontró la orden de recepción con ese ID.');
        }
        break;
      }
      case 'ordrerecep': {  
        const orderReceptionDetails = Orderreception.find(item => item.id === id);
        if (orderReceptionDetails) {
          setSelectedOrderReception(orderReceptionDetails);
          setShowOrderReceptionModal(true);
        } else {
          alert('No se encontró la orden de recepción con ese ID.');
        }
        break;
      }
      case 'orderliner': {
        const orderLineReceptionDetails = Orderlinereception.find(item => item.id === id);
        if (orderLineReceptionDetails) {
          setSelectedOrderLine(orderLineReceptionDetails);
          setShowOrderLineModal(true);
        } else {
          alert('No se encontró la línea de orden de recepción con ese ID.');
        }
        break;
      }
      case 'incidencies': {
        const incidenciesDetails = incidencies.find(item => item.id === id);
        if (incidenciesDetails) {
          setSelectedIncident(incidenciesDetails);
          setShowIncidentModal(true);
        } else {
          alert('No se encontró la incidencia con ese ID.');
        }
        break;
      }
      default: {
        console.log("Origen no reconocido:", origin);
        break;
      }
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const agafamoviments = await axios.get(`${apiUrl}movement`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setMoviments(agafamoviments.data);
        setFilteredMoviments(agafamoviments.data);

        const agafainventari = await axios.get(`${apiUrl}inventory`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setInventari(agafainventari.data);

        const agafaordrerecepcio = await axios.get(`${apiUrl}orderreception`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setOrdrerecepcio(agafaordrerecepcio.data);

        const agafaordrelinerecepcio = await axios.get(`${apiUrl}orderlinereception`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setOrdrelinerecepcio(agafaordrelinerecepcio.data);

        const agafaincidencies = await axios.get(`${apiUrl}incident`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setIncidencies(agafaincidencies.data);

        const agafausuaris = await axios.get(`${apiUrl}users`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setUsers(agafausuaris.data);

        const agafaproductes = await axios.get(`${apiUrl}product`, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
        setProduct(agafaproductes.data);
      } catch (error) {
        console.error("Error al buscar datos:", error);
      }
    };
    cargarDatos();
  }, [apiUrl]);

  // Intercambiar ID del usuario por su nombre
  const usuari = (operatorId) => {
    const user = users.find(user => user.id === operatorId);
    return user ? user.name : "No funciona";
  };

  const nomProducte = (productId) => {
    const product = producte.find(product => product.id === productId);
    return product ? product.name : "No funciona";
  };

  const handleFilter = (activarfiltres) => {
    setCurrentPage(1);

    if (Object.keys(activarfiltres).length === 0) {
      setFilteredMoviments(moviments);
      return;
    }
    const noufiltre = moviments.filter(mov => {
      let cumple = true;
      if (activarfiltres.magatzem) {
        if (!mov.storage_id.toString().toLowerCase().includes(activarfiltres.magatzem.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.carrer) {
        if (!mov.street_id.toString().toLowerCase().includes(activarfiltres.carrer.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.estanteria) {
        if (!mov.shelf_id.toString().toLowerCase().includes(activarfiltres.estanteria.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.espai) {
        if (!mov.space_id.toString().toLowerCase().includes(activarfiltres.espai.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.producte) {
        const prod = producte.find(p => p.id === mov.product_id);
        const prodName = prod ? prod.name : "";
        if (!prodName.toLowerCase().includes(activarfiltres.producte.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.data) {
        // Aquí también se formatea la fecha para la comparación si es necesario
        if (!formatDate(mov.movement_date).toLowerCase().includes(activarfiltres.data.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.operari) {
        const user = users.find(u => u.id === mov.operator_id);
        const userName = user ? user.name : "";
        if (!userName.toLowerCase().includes(activarfiltres.operari.toLowerCase()))
          cumple = false;
      }
      if (activarfiltres.origen) {
        if (!mov.origin.toLowerCase().includes(activarfiltres.origen.toLowerCase()))
          cumple = false;
      }
      return cumple;
    });
    setFilteredMoviments(noufiltre);
  };

  // Autocomplete
  const suggestions = useMemo(() => {
    return {
      magatzem: Array.from(new Set(moviments.map(m => m.storage_id.toString()))).sort(),
      carrer: Array.from(new Set(moviments.map(m => m.street_id.toString()))).sort(),
      espai: Array.from(new Set(moviments.map(m => m.space_id.toString()))).sort(),
      producte: producte.length > 0
        ? Array.from(new Set(producte.map(p => p.name))).sort()
        : [],
      data: Array.from(new Set(moviments.map(m => formatDate(m.movement_date)))).sort(),
      operari: users.length > 0
        ? Array.from(new Set(users.map(u => u.name))).sort()
        : [],
      origen: Array.from(new Set(moviments.map(m => m.origin))).sort()
    };
  }, [moviments, producte, users]);

  const indexOfLastItem = currentPage * pagina;
  const indexprimerItem = indexOfLastItem - pagina;
  const currentItems = filteredMoviments.slice(indexprimerItem, indexOfLastItem);
  const paginestotal = Math.ceil(filteredMoviments.length / pagina);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < paginestotal) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <div>
        <Header title="Moviments" />
        <FiltresMoviments onFilter={handleFilter} suggestions={suggestions} />

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
              <button type="button" className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
                <i className="bi bi-plus-circle text-white pe-1"></i>Crear
              </button>
            </div>
          </div>                                                    
        </div>
        <div className='row'> 
          <div className="col-12">
            <div>
              <table className="table table-striped text-center align-middle"> 
                <thead className="table-active border-bottom border-dark-subtle">
                  <tr>
                    <th className='align-middle' scope='col'>
                      <input className='form-check-input' type="checkbox" />
                    </th>
                    <th scope='col' className="align-middle">ID</th>
                    <th scope='col' className="align-middle">Id Producte</th>
                    <th scope='col' className="align-middle">Magatzem</th>
                    <th scope='col' className="align-middle">Carrer</th>
                    <th scope='col' className="align-middle">Estanteria</th>
                    <th scope='col' className="align-middle">Espai</th>
                    <th scope='col' className="align-middle">Quantitat</th>
                    <th scope='col' className="align-middle">Data</th>
                    <th scope='col' className="align-middle">Operari</th>
                    <th scope='col' className="align-middle">Origen</th>
                    <th scope='col' className="align-middle">Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="12">No hi han proveidors</td>
                    </tr>
                  ) : (
                    currentItems.map((valors) => (
                      <tr key={valors.id}>
                        <td data-cell="Seleccionar">
                          <input className="form-check-input" type="checkbox" />
                        </td>
                        <td data-cell="ID">
                          {valors.id}
                        </td>
                        <td data-cell="Producto">
                          {nomProducte(valors.product_id)}
                        </td>
                        <td data-cell="Magatzem">
                          {valors.storage_id}
                        </td>
                        <td data-cell="Carrer">
                          {valors.street_id}
                        </td>
                        <td data-cell="Estanteria">
                          {valors.shelf_id}
                        </td>
                        <td data-cell="Espai">
                          {valors.space_id}
                        </td>
                        <td data-cell="Quantitat">
                          {valors.quantity}
                        </td>
                        <td data-cell="Data">
                          {formatDate(valors.movement_date)}
                        </td>
                        <td data-cell="Operari">
                          {usuari(valors.operator_id)}
                        </td>
                        <td data-cell="Origen">
                          <a href="#" className="text-decoration-none text-dark" onClick={() => polsarorigin(valors.origin, valors.origin_id)}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }} >
                            {valors.origin}
                          </a>
                        </td>
                        <td data-cell="Visualitzar">
                          <i className="bi bi-eye px-2" style={{ cursor: 'pointer' }} onClick={() => handleShow(valors)}></i>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <nav aria-label="Page navigation example" className="d-block">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}>
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            
            {Array.from({ length: paginestotal }, (_, i) => i + 1).map((number) => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <a className="page-link text-light-blue" href="#" onClick={(e) => { e.preventDefault(); paginate(number); }}>
                  {number}
                </a>
              </li>
            ))}
            <li className={`page-item ${currentPage === paginestotal ? 'disabled' : ''}`}>
              <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={(e) => { e.preventDefault(); goToNextPage(); }}>
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Modal de Moviments */}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Detalls del Moviment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectMoviments ? (
              <div className="p-3">
                <p className="border-bottom pb-2"><span className="fw-bold">ID:</span> {selectMoviments.id}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">ID Producto:</span> {nomProducte(selectMoviments.product_id)}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Magatzem:</span> {selectMoviments.storage_id}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Carrer:</span> {selectMoviments.street_id}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Estanteria:</span> {selectMoviments.shelf_id}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Espai:</span> {selectMoviments.space_id}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Quantitat:</span> {selectMoviments.quantity}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Data:</span> {formatDate(selectMoviments.movement_date)}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Operari:</span> {usuari(selectMoviments.operator_id)}</p>
                <p className="border-bottom pb-2"><span className="fw-bold">Origen:</span> {selectMoviments.origin}</p>
              </div>
            ) : (
              <p className="text-muted text-center">No hay detalles disponibles.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Inventari */}
        <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Detalles de Inventario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {inventariseleccionat ? (
              <div>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID:</span> {inventariseleccionat.id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Date:</span> {inventariseleccionat.created_at}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Created By:</span> {inventariseleccionat.created_by}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Inventory Status:</span> {inventariseleccionat.inventory_status}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Storage ID:</span> {inventariseleccionat.storage_id}
                </p>
              </div>
            ) : (
              <p>No hay detalles disponibles.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInventoryModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Orden de Recepción */}
        <Modal show={showOrderReceptionModal} onHide={() => setShowOrderReceptionModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Detalles de Orden de Recepción</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {ordreRecepcioseleccionada ? (
              <div>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID:</span> {ordreRecepcioseleccionada.id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Supplier ID:</span> {ordreRecepcioseleccionada.supplier_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Estimated Reception Date:</span> {ordreRecepcioseleccionada.estimated_reception_date}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Created By:</span> {ordreRecepcioseleccionada.created_by}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Order Reception Status ID:</span> {ordreRecepcioseleccionada.orderreception_status_id}
                </p>
              </div>
            ) : (
              <p>No hay detalles disponibles.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowOrderReceptionModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Línea de Orden de Recepción */}
        <Modal show={showOrderLineModal} onHide={() => setShowOrderLineModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Detalles de Línea de Orden de Recepción</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {ordrelineaseleccionada ? (
              <div>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID:</span> {ordrelineaseleccionada.id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Order Reception ID:</span> {ordrelineaseleccionada.order_reception_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Product ID:</span> {ordrelineaseleccionada.product_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Quantity Ordered:</span> {ordrelineaseleccionada.quantity_ordered}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Quantity Received:</span> {ordrelineaseleccionada.quantity_received}
                </p>
              </div>
            ) : (
              <p>No hay detalles disponibles.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowOrderLineModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Incidencia */}
        <Modal show={showIncidentModal} onHide={() => setShowIncidentModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Detalles de Incidencia</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {incidencia_seleccionada ? (
              <div>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID:</span> {incidencia_seleccionada.id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Descripción:</span> {incidencia_seleccionada.description}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID del Operador:</span> {incidencia_seleccionada.operator_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Creado el:</span> {incidencia_seleccionada.created_at}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID del Proveedor:</span> {incidencia_seleccionada.supplier_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID de Recepción de Línea de Pedido:</span> {incidencia_seleccionada.orderlinereception_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID del Producto:</span> {incidencia_seleccionada.product_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">ID del Estado de la Línea de Pedido:</span> {incidencia_seleccionada.orderline_status_id}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Cantidad Pedida:</span> {incidencia_seleccionada.quantity_ordered}
                </p>
                <p className="border-bottom pb-2">
                  <span className="fw-bold">Cantidad Recibida:</span> {incidencia_seleccionada.quantity_received}
                </p>
              </div>
            ) : (
              <p>No hay detalles disponibles.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowIncidentModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default Moviments;
