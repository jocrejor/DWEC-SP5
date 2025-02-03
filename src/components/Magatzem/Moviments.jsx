import { useState, useEffect } from 'react';
import Header from "../Header";
import Filtres from "../Filtres";
import { Button, Modal } from 'react-bootstrap';
import axios from "axios";

function Moviments() {
  const [moviments, setMoviments] = useState([]);
  const [producte, setProduct] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectMoviments, setSelectedMoviment] = useState(null);
  const [show, setShow] = useState(false);
  
  const [inventari, setInventari] = useState([]);
  const [Orderreception, setOrdrerecepcio] = useState([]);
  const [Orderlinereception, setOrdrelinerecepcio] = useState([]);
  const [incidencies, setIncidencies] = useState([]);
  
  // Estats modal de origin
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  
  const [showOrderReceptionModal, setShowOrderReceptionModal] = useState(false);
  const [selectedOrderReception, setSelectedOrderReception] = useState(null);
  
  const [showOrderLineModal, setShowOrderLineModal] = useState(false);
  const [selectedOrderLine, setSelectedOrderLine] = useState(null);
  
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Modal de moviments
  const handleClose = () => setShow(false);
  const handleShow = (product) => {
    setSelectedMoviment(product);
    setShow(true);
  };

  // Función que maneja el clic en el enlace del origen
  const polsarorigin = (origin, id) => {
    console.log("Polsar origin", { origin, id });
    
    switch (origin) {
      case 'inventoryl': {
        console.log("inventari array:", inventari);
        const inventariDetails = inventari.find(item => item.id === id);
        console.log("inventariDetails found:", inventariDetails);
        if (inventariDetails) {
          setSelectedInventory(inventariDetails);
          setShowInventoryModal(true);
        } else {
          alert('No se encontró el inventario con ese ID.');
        }
        break;
      }
      case 'ordrerecep': {  
        console.log("Orderreception array:", Orderreception);
        const orderReceptionDetails = Orderreception.find(item => item.id === id);
        console.log("orderReceptionDetails found:", orderReceptionDetails);
        if (orderReceptionDetails) {
          setSelectedOrderReception(orderReceptionDetails);
          setShowOrderReceptionModal(true);
        } else {
          alert('No se encontró la orden de recepción con ese ID.');
        }
        break;
      }
      case 'orderliner': {
        console.log("Orderlinerecepcio array:", Orderlinereception);
        const orderLineReceptionDetails = Orderlinereception.find(item => item.id === id);
        console.log("orderLineReceptionDetails found:", orderLineReceptionDetails);
        if (orderLineReceptionDetails) {
          setSelectedOrderLine(orderLineReceptionDetails);
          setShowOrderLineModal(true);
        } else {
          alert('No se encontró la línea de orden de recepción con ese ID.');
        }
        break;
      }
      case 'incidencies': {
        console.log("incidencies array:", incidencies);
        const incidenciesDetails = incidencies.find(item => item.id === id);
        console.log("incidenciesDetails found:", incidenciesDetails);
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

  const usuari = (operatorId) => {
    const user = users.find(user => user.id === operatorId);
    return user ? user.name : "No funciona";
  };

  const nomProducte = (productId) => {
    const product = producte.find(product => product.id === productId);
    return product ? product.name : "No funciona";
  };

  return (
    <>
      <div>
        <Header title="Moviments" />
        <Filtres />
        <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
          <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">  
            <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
              <div className="form-floating bg-white">
                <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                  <option selected>Tria una opció</option>
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
        <div className="mb-3"></div>
        <div className="table-responsive">
          <table className='table table-striped text-center'>
            <thead className='table-active border-bottom border-dark-subtle'>
              <tr>
                <th className="d-none d-md-table-cell">
                  <input className="form-check-input" type="checkbox" />
                </th>
                <th className="d-none d-md-table-cell">ID</th>
                <th className="d-none d-md-table-cell">Id Producte</th>
                <th className="d-none d-md-table-cell">Magatzem</th>
                <th className="d-none d-md-table-cell">Carrer</th>
                <th className="d-none d-md-table-cell">Estanteria</th>
                <th className="d-none d-md-table-cell">Espai</th>
                <th className="d-none d-md-table-cell">Quantitat</th>
                <th className="d-none d-md-table-cell">Data</th>
                <th className="d-none d-md-table-cell">Operari</th>
                <th className="d-none d-md-table-cell">Origen</th>
                <th className="d-none d-md-table-cell">Accions</th>
              </tr>
            </thead>
            <tbody>
              {moviments.length === 0 ? (
                <tr>
                  <td colSpan="12">No hi han proveidors</td>
                </tr>
              ) : (
                moviments.map((valors) => (
                  <tr key={valors.id}>
                    <td className='d-block d-md-table-cell'>
                      <input className="form-check-input" type="checkbox" />
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">ID:</p> {valors.id}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Producto:</p> {nomProducte(valors.product_id)}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Magatzem:</p> {valors.storage_id}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Carrer:</p> {valors.street_id}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Estanteria:</p> {valors.shelf_id}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Espai:</p> {valors.space_id}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Quantitat:</p> {valors.quantity}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Data:</p> {valors.movement_date}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Operari:</p> {usuari(valors.operator_id)}
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <p className="d-sm-inline d-md-none">Origen:</p>
                      <a
                        href="#"
                        className="text-decoration-none text-dark"
                        onClick={() => polsarorigin(valors.origin, valors.origin_id)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {valors.origin}
                      </a>
                    </td>
                    <td className='d-block d-md-table-cell'>
                      <i className="bi bi-eye px-2" style={{ cursor: 'pointer' }} onClick={() => handleShow(valors)}></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Modal de Detalles del Movimiento */}
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
                  <p className="border-bottom pb-2"><span className="fw-bold">Data:</span> {selectMoviments.movement_date}</p>
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

          {/* Modal  Inventari */}
          <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detalles de Inventario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedInventory ? (
                <div>
                  <p><strong>ID:</strong> {selectedInventory.id}</p>
                  <p><strong>Date:</strong> {selectedInventory.created_at}</p>
                  <p><strong>Created By:</strong> {selectedInventory.created_by}</p>
                  <p><strong>Inventory Status:</strong> {selectedInventory.inventory_status}</p>
                  <p><strong>Storage ID:</strong> {selectedInventory.storage_id}</p>
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

          {/* Modal  Ordre de Recepción */}
          <Modal show={showOrderReceptionModal} onHide={() => setShowOrderReceptionModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detalles de Orden de Recepción</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedOrderReception ? (
                <div>
                  <p><strong>ID:</strong> {selectedOrderReception.id}</p>
                  <p><strong>Supplier ID:</strong> {selectedOrderReception.supplier_id}</p>
                  <p><strong>Estimated Reception Date:</strong> {selectedOrderReception.estimated_reception_date}</p>
                  <p><strong>Created By:</strong> {selectedOrderReception.created_by}</p>
                  <p><strong>Order Reception Status ID:</strong> {selectedOrderReception.orderreception_status_id}</p>
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
              {selectedOrderLine ? (
                <div>
                  <p><strong>ID:</strong> {selectedOrderLine.id}</p>
                  <p><strong>Order Reception ID:</strong> {selectedOrderLine.order_reception_id}</p>
                  <p><strong>Product ID:</strong> {selectedOrderLine.product_id}</p>
                  <p><strong>Quantity Ordered:</strong> {selectedOrderLine.quantity_ordered}</p>
                  <p><strong>Quantity Received:</strong> {selectedOrderLine.quantity_received}</p>
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
              {selectedIncident ? (
                <div>
                  <p><strong>ID:</strong> {selectedIncident.id}</p>
                  <p>{JSON.stringify(selectedIncident)}</p>
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
      </div>
    </>
  );
}

export default Moviments;
