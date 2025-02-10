// Moviments.js
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
  const [selectedInventory, setSelectedInventory] = useState(null);
  
  const [showOrderReceptionModal, setShowOrderReceptionModal] = useState(false);
  const [selectedOrderReception, setSelectedOrderReception] = useState(null);
  
  const [showOrderLineModal, setShowOrderLineModal] = useState(false);
  const [selectedOrderLine, setSelectedOrderLine] = useState(null);
  
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleClose = () => setShow(false);
  const handleShow = (product) => {
    setSelectedMoviment(product);
    setShow(true);
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

  // Intercambiar ID en nombre del producto
  const nomProducte = (productId) => {
    const product = producte.find(product => product.id === productId);
    return product ? product.name : "No funciona";
  };

  const handleFilter = (activeFilters) => {
    setCurrentPage(1);

    if (Object.keys(activeFilters).length === 0) {
      setFilteredMoviments(moviments);
      return;
    }
    const newFiltered = moviments.filter(mov => {
      let cumple = true;
      if (activeFilters.magatzem) {
        if (!mov.storage_id.toString().toLowerCase().includes(activeFilters.magatzem.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.carrer) {
        if (!mov.street_id.toString().toLowerCase().includes(activeFilters.carrer.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.estanteria) {
        if (!mov.shelf_id.toString().toLowerCase().includes(activeFilters.estanteria.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.espai) {
        if (!mov.space_id.toString().toLowerCase().includes(activeFilters.espai.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.producte) {
        const prod = producte.find(p => p.id === mov.product_id);
        const prodName = prod ? prod.name : "";
        if (!prodName.toLowerCase().includes(activeFilters.producte.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.data) {
        if (!mov.movement_date.toLowerCase().includes(activeFilters.data.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.operari) {
        const user = users.find(u => u.id === mov.operator_id);
        const userName = user ? user.name : "";
        if (!userName.toLowerCase().includes(activeFilters.operari.toLowerCase()))
          cumple = false;
      }
      if (activeFilters.origen) {
        if (!mov.origin.toLowerCase().includes(activeFilters.origen.toLowerCase()))
          cumple = false;
      }
      return cumple;
    });
    setFilteredMoviments(newFiltered);
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
      data: Array.from(new Set(moviments.map(m => m.movement_date))).sort(),
      operari: users.length > 0
        ? Array.from(new Set(users.map(u => u.name))).sort()
        : [],
      origen: Array.from(new Set(moviments.map(m => m.origin))).sort()
    };
  }, [moviments, producte, users]);


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMoviments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMoviments.length / itemsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Funcion para "anterior" y "siguiente"
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
                    <td data-cell="Seleccionar" >
                      <input className="form-check-input" type="checkbox" />
                    </td>
                    <td  data-cell="ID">
                     {valors.id}
                    </td>
                    <td  data-cell="Producto">
                    {nomProducte(valors.product_id)}
                    </td>
                    <td  data-cell="Magatzem">
                    {valors.storage_id}
                    </td>
                    <td  data-cell="Carrer">
                    {valors.street_id}
                    </td>
                    <td  data-cell="Estanteria">
                     {valors.shelf_id}
                    </td>
                    <td  data-cell="Espai">
                     {valors.space_id}
                    </td>
                    <td  data-cell="Quantitat">
                      {valors.quantity}
                    </td>
                    <td  data-cell="Data">
                      {valors.movement_date}
                    </td>
                    <td  data-cell="Operari">
                     {usuari(valors.operator_id)}
                    </td>
                    <td  data-cell="Origen">
                     
                      <a
                        href="#"
                        className="text-decoration-none text-dark"
                        onClick={() => polsarorigin(valors.origin, valors.origin_id)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {valors.origin}
                      </a>
                    </td>
                    <td data-cell="Visualitzar">
                      <i  className="bi bi-eye px-2" style={{ cursor: 'pointer' }} onClick={() => handleShow(valors)}></i>
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
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
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

      {/* Modal de  Moviments */}
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

{/* Modal Inventari */}
<Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Detalles de Inventario</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedInventory ? (
      <div>
        <p className='fw-bold'>ID: {selectedInventory.id}</p>
        <p className='fw-bold'>Date:{selectedInventory.created_at}</p>
        <p className='fw-bold'>Created By: {selectedInventory.created_by}</p>
        <p className='fw-bold'>Inventory Status:{selectedInventory.inventory_status}</p>
        <p className='fw-bold'>Storage ID: {selectedInventory.storage_id}</p>
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

{/* Modal Orden de Recepción */}
<Modal show={showOrderReceptionModal} onHide={() => setShowOrderReceptionModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Detalles de Orden de Recepción</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedOrderReception ? (
      <div>
        <p className='fw-bold'>ID:{selectedOrderReception.id}</p>
        <p className='fw-bold'>Supplier ID:{selectedOrderReception.supplier_id}</p>
        <p className='fw-bold'>Estimated Reception Date: {selectedOrderReception.estimated_reception_date}</p>
        <p className='fw-bold'>Created By: {selectedOrderReception.created_by}</p>
        <p className='fw-bold'>Order Reception Status ID: {selectedOrderReception.orderreception_status_id}</p>
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

{/* Modal Línea de Orde de Recepció */}
<Modal show={showOrderLineModal} onHide={() => setShowOrderLineModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Detalles de Línea de Orden de Recepción</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedOrderLine ? (
      <div>
        <p className='fw-bold'>ID: {selectedOrderLine.id}</p>
        <p className='fw-bold' >Order Reception ID:{selectedOrderLine.order_reception_id}</p>
        <p className='fw-bold'>Product ID: {selectedOrderLine.product_id}</p>
        <p className='fw-bold'>Quantity Ordered: {selectedOrderLine.quantity_ordered}</p>
        <p className='fw-bold'>Quantity Received: {selectedOrderLine.quantity_received}</p>
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

{/* Modal Incidencia */}
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
    </>
  );
}

export default Moviments;
