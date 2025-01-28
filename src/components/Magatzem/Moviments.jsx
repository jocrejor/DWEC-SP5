import { useState, useEffect } from 'react'
import Header from "../Header"
import Filtres from "../Filtres"

import { Button,Modal,ModalBody,ModalFooter } from 'react-bootstrap';
import axios from "axios";

function Moviments() {
  const [moviments, setMoviments] = useState([]);
  const [selectMoviments, setSelectedMoviment] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = (product) => {
    console.log(product);
    setSelectedMoviment(product);
    setShow(true);
};

useEffect(() => {
  const agafarmoviments = async () => {
    try {
      const response = await axios.get("http://node.daw.iesevalorpego.es:3001/Moviment");
      const canviorigin = response.data.map(item => ({
        ...item,
      }));
      setMoviments(canviorigin);
    } catch (error) {
      console.error("Error al buscar moviments:", error);
    }
  };

  agafarmoviments();
}, []);

  return (
    <>
      <div>
   <Header  title="Moviments" />

<Filtres></Filtres>
<div className="table-responsive " style={{ marginTop: 70 }}>
  
</div>

<table className='table table-striped'>
        <thead>
          <tr>
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
        <th className="d-none d-md-table-cell">Visualitzar</th>
          </tr>
        </thead>
        <tbody>
          {moviments.length === 0 ? (
            <tr>
              <td colSpan="13">No hi han proveidors</td>
            </tr>
          ) : (
            moviments.map((valors) => (
              <tr key={valors.id}>
                 <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">ID:</p> {valors.id}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">ID Producte:</p> {valors.product_id}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Magatzem:</p> {valors.storage_id}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Carrer:</p> {valors.street_id}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Estanteria:</p> {valors.shelf_id}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Espai:</p> {valors.space_id}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Quantitat:</p> {valors.quantity}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Data:</p> {valors.date}
          </td>
          <td className="d-block d-md-table-cell">
            <p className="d-sm-inline d-md-none">Operari:</p> {valors.operator_id}
          </td>
          <td className="d-block d-md-table-cell ">
            <p className="d-sm-inline d-md-none ">Origen:</p> {valors.orgin}
          </td>
                <td>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      handleShow(valors);
                    }}
                  >
                    <i className="bi bi-eye p-2"></i>
                  </Button>
                </td>
          
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Detalls del Moviment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectMoviments ? (
            <div>
              <p >ID  {selectMoviments.id}</p>
              <p>ID Producto: {selectMoviments.product_id}</p>
              <p><b>Magatzem:</b> {selectMoviments.storage_id}</p>
              <p><b>Carrer:</b> {selectMoviments.street_id}</p>
              <p><b>Estanteria:</b> {selectMoviments.shelf_id}</p>
              <p><b>Espai:</b> {selectMoviments.space_id}</p>
              <p><b>Quantitat:</b> {selectMoviments.quantity}</p>
              <p><b>Data:</b> {selectMoviments.date}</p>
              <p><b>Operari:</b> {selectMoviments.operator_id}</p>
              <p><b>Origen:</b> {selectMoviments.orgin}</p>
            </div>
          ) : (
            <p>No hay detalles disponibles.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </>
  );
}

export default Moviments