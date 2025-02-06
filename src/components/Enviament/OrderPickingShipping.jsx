import { useState, useEffect } from "react";
// import {
//   url,
//   postData,
//   getData,
//   deleteData,
//   updateId,
// } from "../../apiAccess/crud";
import { Button, Table, Modal } from "react-bootstrap";
import Header from "../Header";
import Filtres from "../Filtres";
import axios from "axios";
import { movMagatzem } from "../Magatzem/movMagatzem";

function OrderPickingShipping() {
  const [orderPickingShipping, setOrderPickingShipping] = useState([]);
  const [orderShipping, setOrderShipping] = useState([]);
  const [orderLineShipping, setOrderLineShipping] = useState([]);
  const [products, setProducts] = useState([]);
  const [temporalPickings, setTemporalPickings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [operariSeleccionat, setOperariSeleccionat] = useState("");
  const [usuariFiltrar, setUsuariFiltrar] = useState("");
  const [shippingFiltered,setShippingFiltered]= useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Alta");
  const [orderVisualitzar, setOrderVisualitzar] = useState(null);
  const [tabla, setTabla] = useState("CrearOrder");

  const [orderSelected, setOrderSelected] = useState([]);

  // const apiUrl = url;
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${apiUrl}/orderpickingshipping`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setOrderPickingShipping(res.data);
      })
      .catch((error) => console.error(error));

    axios
      .get(`${apiUrl}/ordershipping`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setOrderShipping(res.data);
      })
      .catch((error) => console.error(error));

    axios
      .get(`${apiUrl}/orderlineshipping`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setOrderLineShipping(res.data);
      })
      .catch((error) => console.error(error));

    axios
      .get(`${apiUrl}/product`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((error) => console.error(error));

    axios
      .get(`${apiUrl}/space`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setSpaces(res.data);
      })
      .catch((error) => console.error(error));

    axios
      .get(`${apiUrl}/users`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((error) => console.error(error));

    //recorrer orden reception pendent (desempaquetada)
    const orderPendent = orderShipping.filter(
      (order) => order.ordershipping_status_id === 1
    );

    const tempPickings = [];
    orderPendent.map((order) => {
      //filtrar lines en estat pendent
      const lines = orderLineShipping.filter(
        (line) =>
          line.shipping_order_id === order.id && line.orderline_status_id === 1
      );

      //obtindre product.name, product.quantitat, product.space
      lines.forEach((line) => {
        const space = spaces.find(
          (space) => space.product_id === line.product_id
        );
        if (space) {
          console.log(
            "objTemporal",
            order.id,
            line.id,
            line.product_id,
            line.quantity_received,
            space.storage_id,
            space.street_id,
            space.selft_id,
            space.id
          );
          const objTemporal = {
            order_reception_id: order.id,
            order_line_reception_id: line.id,
            product_id: line.product_id,
            quantity: line.quantity,
            storage_id: space.storage_id,
            street_id: space.street_id,
            shelf_id: space.shelf_id,
            space_id: space.id,
          };
          tempPickings.push(objTemporal);
        }
      });
    });
    setTemporalPickings(tempPickings);
  }, []);

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  const crearOrderPickingShipping = () => {
    //obtindre els productes seleccionats
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    if (checkboxes.length === 0) {
      alert("No has seleccionat cap producte");
      return;
    } else {
      canviEstatModal();
      setTipoModal("Alta");

      const seleccio = [];
      checkboxes.forEach((checkbox) => {
        seleccio.push(checkbox.value);
      });

      console.log(seleccio);
      setOrderSelected(seleccio);
    }
  };

  const handleInputChange = (event) => {
    setOperariSeleccionat(event.target.value);
  };

  const aceptarOrderPickingShipping = async () => {
    orderSelected.forEach((order) => {
      const line = orderLineShipping.find((l) => l.id === parseInt(order));
      const space = spaces.find((s) => s.product_id === line.product_id);

      const newOrderPickingShipping = {
        product_id: line.product_id,
        quantity: line.quantity,
        storage_id: space.storage_id,
        street_id: space.street_id,
        shelf_id: space.shelf_id,
        space_id: space.id,
        operator_id: parseInt(operariSeleccionat),
        order_line_shipping_id: line.id,
      };

      axios
        .post(`${apiUrl}/orderpickingshipping`, newOrderPickingShipping, {
          headers: { "auth-token": token },
        })
        .then((res) => {
          console.log(res.data);
          alert("Order Picking Shipping creat correctament");
        })
        .catch((error) => {
          console.error(error.response.data);
        });
    });
    canviEstatModal();
  };

  const completarOrderPicking = async (lineId, orderPickingId) => {
    // filtrar la linea de la order picking
    const lineActualitzar = orderLineShipping.find(
      (line) => line.id === lineId
    );

    // Actualitzar estat a completada
    const updatedLine = {
      ...lineActualitzar,
      orderline_status_id: 3,
    };
 
    //actualitzar order line
    axios
      .put(`${apiUrl}/orderlineshipping/${lineId}`, updatedLine, {
        headers: { "auth-token": token },
      })
      .then((response) => {
        console.log("Linea actualitzada correctament", response.data);
      })
      .catch((error) => {
        console.error("Error en actualitzar", error.response.data);
      });

    // eliminar la order picking
    await axios
      .delete(`${apiUrl}/orderpickingshipping/${orderPickingId}`, {
        headers: { "auth-token": token },
      })
      .then((response) => {
        console.log("order picking esborrada", response.data);
      })
      .catch((error) => {
        console.error("Error en esborra order picking", error.response.data);
      });

    //crear moviments
    const space = spaces.find(
      (space) => space.product_id === lineActualitzar.product_id
    );
    if (space) {
      movMagatzem(
        lineActualitzar.product_id,
        lineActualitzar.operator_id,
        lineActualitzar.quantity,
        "General",
        space.storage_id,
        space.storage_id,
        space.street_id,
        space.shelf_id,
        space.id
      );
      console.log("Moviment eixida realitzat");

      movMagatzem(
        lineActualitzar.product_id,
        lineActualitzar.operator_id,
        lineActualitzar.quantity,
        "Enviament",
        space.storage_id,
        space.storage_id,
        space.street_id,
        space.shelf_id,
        space.id
      );
      console.log("Moviment entrada realitzat");
    }
    alert("Order picking completada");
  };

  const mostrarOrder = (orderId) => {
    setOrderVisualitzar(orderId);
    setTipoModal("Visualitzar");
    setShowModal(true);
  };
 
  const filtrarShipping = (e) =>{
    setUsuariFiltrar(e.target.value )
    const arrayTemporal = orderPickingShipping
    const filtre = arrayTemporal.filter((item) => { parseInt(e.target.value)=== item.operator_id })
      console.log(filtre)
      setShippingFiltered(filtre)
  } 
 
  return (
    <>
      <div>
        <Header title="Order picking Shipping" />
        <Filtres />
        <div className="container-fluid">
          <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
            <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
              <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
                <div className="form-floating bg-white">
                  <select
                    className="form-select"
                    id="floatingSelect"
                    aria-label="Seleccione una opción"
                  >
                    <option>Tria una opció</option>
                    <option value="1">Eliminar</option>
                  </select>
                  <label htmlFor="floatingSelect">Accions en lot</label>
                </div>
                <button
                  className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0"
                  type="button"
                >
                  <i className="bi bi-check-circle text-white px-1"></i>Aplicar
                </button>
              </div>
            </div>
            <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
            <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
              <div className="d-flex h-100 justify-content-xl-end">
                <button
                  onClick={() => {
                    crearOrderPickingShipping();
                  }}
                  type="button"
                  className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                >
                  <i className="bi bi-plus-circle text-white pe-1"></i>Crear
                </button>
                <button
                  onClick={() => {
                    setTabla("ListarOrder");
                  }}
                  type="button"
                  className="btn btn-dark ms-2 border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                >
                  Llistar Orders Picking
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div>
                {tabla === "CrearOrder" ? (
                  <>
                    <table className="table table-striped text-center">
                      <thead className="table-active border-bottom border-dark-subtle">
                        <tr>
                          <th scope="col">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name=""
                              id=""
                            />
                          </th>
                          <th scope="col">ID Order</th>
                          <th scope="col">Producte</th>
                          <th scope="col">Quantitat</th>
                          <th scope="col">
                            Magatzem / Carrer / Estantería / Espai
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {temporalPickings.map((temporalPicking) => {
                          const product = products.find(
                            (p) => p.id === temporalPicking.product_id
                          );
                          return (
                            <tr key={temporalPicking.order_line_reception_id}>
                              <td scope="row" data-cell="Seleccionar">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value={
                                    temporalPicking.order_line_reception_id
                                  }
                                />
                              </td>
                              <td data-cell="Id">
                                {temporalPicking.order_reception_id}
                              </td>
                              <td data-cell="Nom">{product.name}</td>
                              <td data-cell="Quantitat">
                                {temporalPicking.quantity}
                              </td>
                              <td data-cell="Ubicació">
                                {temporalPicking.storage_id} /{" "}
                                {temporalPicking.street_id} /{" "}
                                {temporalPicking.shelf_id} /{" "}
                                {temporalPicking.space_id}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <nav>
                      <ul className="pagination justify-content-center">
                        <li className="page-item">
                          <a className="page-link text-light-blue" href="#">
                            <span aria-hidden="true">&laquo;</span>
                          </a>
                        </li>

                        <li className="page-item" aria-current="page">
                          <a className="page-link activo-2" href="#">
                            1
                          </a>
                        </li>

                        <li className="page-item">
                          <a className="page-link text-light-blue" href="#">
                            2
                          </a>
                        </li>
                        <li className="page-item">
                          <a className="page-link text-light-blue" href="#">
                            3
                          </a>
                        </li>

                        <li className="page-item">
                          <a className="page-link text-light-blue" href="#">
                            <span aria-hidden="true">&raquo;</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                    <Modal show={showModal} onHide={canviEstatModal}>
                      <Modal.Header closeButton>
                        <Modal.Title>{tipoModal}</Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        {tipoModal === "Alta" && (
                          <>
                            <label htmlFor="operari"></label>
                            <select
                              name="operari"
                              id="operari"
                              value={operariSeleccionat}
                              onChange={handleInputChange}
                            >
                              <option value="" disabled>
                                Selecciona un operari
                              </option>
                              {users.map((user) => {
                                return (
                                  <option key={user.id} value={user.id}>
                                    {user.name}
                                  </option>
                                );
                              })}
                            </select>

                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>Producte</th>
                                  <th>Quantitat</th>
                                  <th>
                                    Magatzem / Carrer / Estantería / Espai
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {orderSelected.map((order) => {
                                  const lines = orderLineShipping.find(
                                    (line) => line.id === parseInt(order)
                                  );
                                  const product = products.find(
                                    (p) => p.id === lines.product_id
                                  );
                                  const space = spaces.find(
                                    (space) =>
                                      space.product_id === lines.product_id
                                  );
                                  return (
                                    <tr key={order}>
                                      <td>{product.name}</td>
                                      <td>{lines.quantity}</td>
                                      <td>
                                        {space.storage_id} / {space.street_id} /{" "}
                                        {space.selft_id} / {space.id}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                            <Button
                              variant="success"
                              onClick={() => {
                                aceptarOrderPickingShipping();
                              }}
                            >
                              Aceptar
                            </Button>
                          </>
                        )}
                      </Modal.Body>
                    </Modal>
                  </>
                ) : (
                  <>
                    <Button
                      variant="success"
                      onClick={() => {
                        setTabla("CrearOrder");
                      }}
                    >
                      Enrrere
                    </Button>

                    <select
                      value={usuariFiltrar}
                      onChange={(e) => filtrarShipping(e)}
                    >
                      <option value="" disabled>
                        Selecciona un operari
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>

                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Emmagatzemat</th>
                          <th>Ordre ID</th>
                          <th>Producte</th>
                          <th>Fecha</th>
                          <th>Operari</th>
                        </tr>
                      </thead>

                      <tbody>
                       
                          {shippingFiltered.map((order) => {
                            console.log(orderPickingShipping)
                            const user = users.find(
                              (u) => u.id === order.operator_id
                            );
                            const product = products.find(
                              (p) => p.id === order.product_id
                            );
                            return (
                              <tr key={order.id}>
                                <td className="d-flex justify-content-center align-items-center">
                                  <i
                                    className="bi bi-arrow-up"
                                    onClick={() =>
                                      completarOrderPicking(
                                        order.order_line_shipping_id,
                                        order.id
                                      )
                                    }
                                  ></i>
                                </td>
                                <td>{order.id}</td>
                                <td>{product.name}</td>
                                <td>{order.created_date}</td>
                                <td>{user.name}</td>
                                {/* <td>
                                  <Button
                                    variant="success"
                                    onClick={() => {
                                      mostrarOrder(order.id);
                                    }}
                                  >
                                    Visualizar
                                  </Button>
                                </td> */}
                              </tr>
                            );
                          })}
                      </tbody>
                    </Table>

                    {/* <Modal show={showModal} onHide={canviEstatModal}>
                      <Modal.Header closeButton>
                        <Modal.Title>{tipoModal}</Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        {tipoModal === "Visualitzar" && (
                          <>
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th></th>
                                  <th>Producte</th>
                                  <th>Quantitat</th>
                                  <th>
                                    Magatzem / Carrer / Estantería / Espai
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {orderPickingShipping
                                  .find(
                                    (order) => order.id === orderVisualitzar
                                  )
                                  .productos.map((producto) => {
                                    const product = products.find(
                                      (p) => p.id === producto.product_id
                                    );

                                    return (
                                      <tr key={producto.product_id}>
                                        <td></td>
                                        <td>{product.name}</td>
                                        <td>{producto.quantity}</td>
                                        <td>
                                          {producto.storage_id} /{" "}
                                          {producto.street_id} /{" "}
                                          {producto.selft_id} / {producto.id}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </Table>
                            <Button
                              variant="success"
                              onClick={() => {
                                canviEstatModal();
                              }}
                            >
                              Tancar
                            </Button>
                          </>
                        )}
                      </Modal.Body>
                    </Modal> */}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderPickingShipping;
