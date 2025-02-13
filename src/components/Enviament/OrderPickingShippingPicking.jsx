import { useState, useEffect } from "react";
import axios from "axios";
import { movMagatzem } from "../Magatzem/movMagatzem";
import { useNavigate, useLocation } from "react-router-dom";

// const [orderPickingShipping, setOrderPickingShipping] = useState([]);
// const [usuariFiltrar, setUsuariFiltrar] = useState("");
// const [shippingFiltered,setShippingFiltered]= useState([]);

// const [orderVisualitzar, setOrderVisualitzar] = useState(null);
// const [tabla, setTabla] = useState("CrearOrder");

// const apiUrl = url;

//   const completarOrderPicking = async (lineId, orderPickingId) => {
//     // filtrar la linea de la order picking
//     const lineActualitzar = orderLineShipping.find(
//       (line) => line.id === lineId
//     );

//     // Actualitzar estat a completada
//     const updatedLine = {
//       ...lineActualitzar,
//       orderline_status_id: 3,
//     };

//     //actualitzar order line
//     axios
//       .put(`${apiUrl}/orderlineshipping/${lineId}`, updatedLine, {
//         headers: { "auth-token": token },
//       })
//       .then((response) => {
//         console.log("Linea actualitzada correctament", response.data);
//       })
//       .catch((error) => {
//         console.error("Error en actualitzar", error.response.data);
//       });

//     // eliminar la order picking
//     await axios
//       .delete(`${apiUrl}/orderpickingshipping/${orderPickingId}`, {
//         headers: { "auth-token": token },
//       })
//       .then((response) => {
//         console.log("order picking esborrada", response.data);
//       })
//       .catch((error) => {
//         console.error("Error en esborra order picking", error.response.data);
//       });

//     //crear moviments
//     const space = spaces.find(
//       (space) => space.product_id === lineActualitzar.product_id
//     );
//     if (space) {
//       movMagatzem(
//         lineActualitzar.product_id,
//         lineActualitzar.operator_id,
//         lineActualitzar.quantity,
//         "General",
//         space.storage_id,
//         space.storage_id,
//         space.street_id,
//         space.shelf_id,
//         space.id
//       );
//       console.log("Moviment eixida realitzat");

//       movMagatzem(
//         lineActualitzar.product_id,
//         lineActualitzar.operator_id,
//         lineActualitzar.quantity,
//         "Enviament",
//         space.storage_id,
//         space.storage_id,
//         space.street_id,
//         space.shelf_id,
//         space.id
//       );
//       console.log("Moviment entrada realitzat");
//     }
//     alert("Order picking completada");
//   };

//   const mostrarOrder = (orderId) => {
//     setOrderVisualitzar(orderId);
//     setTipoModal("Visualitzar");
//     setShowModal(true);
//   };

//   const filtrarShipping = (e) =>{
//     setUsuariFiltrar(e.target.value )
//     const arrayTemporal = orderPickingShipping
//     const filtre = arrayTemporal.filter((item) => { parseInt(e.target.value)=== item.operator_id })
//       console.log(filtre)
//       setShippingFiltered(filtre)
//   }

// {/* <>
//                   <Button
//                     variant="success"
//                     onClick={() => {
//                       setTabla("CrearOrder");
//                     }}
//                   >
//                     Enrrere
//                   </Button>

//                   <select
//                     value={usuariFiltrar}
//                     onChange={(e) => filtrarShipping(e)}
//                   >
//                     <option value="" disabled>
//                       Selecciona un operari
//                     </option>
//                     {users.map((user) => (
//                       <option key={user.id} value={user.id}>
//                         {user.name}
//                       </option>
//                     ))}
//                   </select>

//                   <Table striped bordered hover>
//                     <thead>
//                       <tr>
//                         <th>Emmagatzemat</th>
//                         <th>Ordre ID</th>
//                         <th>Producte</th>
//                         <th>Fecha</th>
//                         <th>Operari</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {shippingFiltered.map((order) => {
//                         console.log(orderPickingShipping);
//                         const user = users.find(
//                           (u) => u.id === order.operator_id
//                         );
//                         const product = products.find(
//                           (p) => p.id === order.product_id
//                         );
//                         return (
//                           <tr key={order.id}>
//                             <td className="d-flex justify-content-center align-items-center">
//                               <i
//                                 className="bi bi-arrow-up"
//                                 onClick={() =>
//                                   completarOrderPicking(
//                                     order.order_line_shipping_id,
//                                     order.id
//                                   )
//                                 }
//                               ></i>
//                             </td>
//                             <td>{order.id}</td>
//                             <td>{product.name}</td>
//                             <td>{order.created_date}</td>
//                             <td>{user.name}</td>
//                             {/* <td>
//                                   <Button
//                                     variant="success"
//                                     onClick={() => {
//                                       mostrarOrder(order.id);
//                                     }}
//                                   >
//                                     Visualizar
//                                   </Button>
//                                 </td> */}
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </Table>

//                   {/* <Modal show={showModal} onHide={canviEstatModal}>
//                       <Modal.Header closeButton>
//                         <Modal.Title>{tipoModal}</Modal.Title>
//                       </Modal.Header>

//                       <Modal.Body>
//                         {tipoModal === "Visualitzar" && (
//                           <>
//                             <Table striped bordered hover>
//                               <thead>
//                                 <tr>
//                                   <th></th>
//                                   <th>Producte</th>
//                                   <th>Quantitat</th>
//                                   <th>
//                                     Magatzem / Carrer / Estantería / Espai
//                                   </th>
//                                 </tr>
//                               </thead>

//                               <tbody>
//                                 {orderPickingShipping
//                                   .find(
//                                     (order) => order.id === orderVisualitzar
//                                   )
//                                   .productos.map((producto) => {
//                                     const product = products.find(
//                                       (p) => p.id === producto.product_id
//                                     );

//                                     return (
//                                       <tr key={producto.product_id}>
//                                         <td></td>
//                                         <td>{product.name}</td>
//                                         <td>{producto.quantity}</td>
//                                         <td>
//                                           {producto.storage_id} /{" "}
//                                           {producto.street_id} /{" "}
//                                           {producto.selft_id} / {producto.id}
//                                         </td>
//                                       </tr>
//                                     );
//                                   })}
//                               </tbody>
//                             </Table>
//                             <Button
//                               variant="success"
//                               onClick={() => {
//                                 canviEstatModal();
//                               }}
//                             >
//                               Tancar
//                             </Button>
//                           </>
//                         )}
//                       </Modal.Body>
//                     </Modal> */}
//                 </> */}

const OrderPickingShipping = () => {
  const [orderPickingShipping, setOrderPickingShipping] = useState([]); //order picking shipping
  const [orderLineShipping, setOrderLineShipping] = useState([]); //order line shipping
  const [products, setProducts] = useState([]); //product
  const [spaces, setSpaces] = useState([]); //space
  const [users, setUsers] = useState([]); //user
  const [usuariFiltrar, setUsuariFiltrar] = useState(""); //usuari a filtrar en la taula order picking

  // Estats paginació
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderPickingPage, setOrderPickingPage] = useState([]);

  //url api, token, paginacio
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

  //navegate
  const navigate = useNavigate();
  const location = useLocation();
};

export default OrderPickingShipping;
