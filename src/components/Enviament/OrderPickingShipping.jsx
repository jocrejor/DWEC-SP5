import { useState, useEffect } from "react";
import {
  url,
  postData,
  getData,
  // deleteData,
  // updateId,
} from "../../apiAccess/crud";
import { Button, Table, Modal } from "react-bootstrap";
import axios from "axios";

function OrderPickingShipping() {
  const [orderPickingShipping, setOrderPickingShipping] = useState([]);
  const [orderShipping, setOrderShipping] = useState([]);
  const [orderLineShipping, setOrderLineShipping] = useState([]);
  const [products, setProducts] = useState([]);
  const [temporalPickings, setTemporalPickings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentuser, setCurrentUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Alta");
  const [orderVisualitzar, setOrderVisualitzar] = useState(null);
  const [tabla, setTabla] = useState("CrearOrder");

  const [orderSelected, setOrderSelected] = useState([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    

    const fetchData = async () => {
      axios
      .get(`${apiUrl}orderpickingshipping`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setOrderPickingShipping(res.data);
      })
      .catch((error) => console.log(error));

      axios
      .get(`${apiUrl}ordershipping`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setOrderShipping(res.data);
      })
      .catch((error) => console.log(error));

      axios
      .get(`${apiUrl}orderlineshipping`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setOrderLineShipping(res.data);
      })
      .catch((error) => console.log(error));

      axios
      .get(`${apiUrl}product`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((error) => console.log(error));

      axios
      .get(`${apiUrl}space`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setSpaces(res.data);
      })
      .catch((error) => console.log(error));

      axios
      .get(`${apiUrl}users`, {
        headers: { "auth-token": token },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((error) => console.log(error));

      setCurrentUser(localStorage.getItem("currentuser"));

      //recorrer orden reception pendent (desempaquetada)
      const orderPendent = orderShipping.filter(
        (order) => order.ordershipping_status_id === 1
      );

      const tempPickings = [];
      orderPendent.map((order) => {
        //recorrer line reception de cada orden reception
        const lines = orderLine.filter(
          (line) => line.shipping_order_id === order.id
        );
        //obtindre product.name, product.quantitat, product.space
        lines.forEach((line) => {
          const space = spaces.find(
            (space) => space.product_id === line.product_id
          );
          if (space) {
            console.log(
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
              selft_id: space.selft_id,
              space_id: space.id,
            };
            tempPickings.push(objTemporal);
            setTemporalPickings(tempPickings);
          }
        });
      });
    };
    fetchData();
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

  const aceptarOrderPickingShipping = async () => {
    const operari = document.getElementById("operari").value;

    const newOrderPickingShipping = {
      user_id: operari,
      create_date: new Date().toISOString(),
      productos: orderSelected.map((orderLineId) => {
        const line = orderLineShipping.find((l) => l.id === orderLineId);
        return {
          product_id: line.product_id,
          quantity: line.quantity_received,
        };
      }),
    };

    await postData(url, "OrderPickingshipping", newOrderPickingShipping);
  };

  const mostrarOrder = (orderId) => {
    setOrderVisualitzar(orderId);
    setTipoModal("Visualitzar");
    setShowModal(true);
  };

  return (
    <>
      {tabla === "CrearOrder" ? (
        <>
          <div>
            <h2>Llistat Order Shipping</h2>
          </div>

          <Button
            variant="success"
            onClick={() => {
              crearOrderPickingShipping();
            }}
          >
            Crear Order Picking
          </Button>

          <Button
            variant="success"
            onClick={() => {
              setTabla("ListarOrder");
            }}
          >
            Llistar Order Picking
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID Order</th>
                <th>Producte</th>
                <th>Quantitat</th>
                <th>Magatzem / Carrer / Estantería / Espai</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {temporalPickings.map((temporalPicking) => {
                const product = products.find(
                  (p) => p.id === temporalPicking.product_id
                );
                return (
                  <tr key={temporalPicking.order_line_reception_id}>
                    <td>{temporalPicking.order_reception_id}</td>
                    <td>{product.name}</td>
                    <td>{temporalPicking.quantity}</td>
                    <td>
                      {temporalPicking.storage_id} / {temporalPicking.street_id}{" "}
                      / {temporalPicking.selft_id} / {temporalPicking.space_id}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        value={temporalPicking.order_line_reception_id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={canviEstatModal}>
            <Modal.Header closeButton>
              <Modal.Title>{tipoModal}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {tipoModal === "Alta" && (
                <>
                  <label htmlFor="operari"></label>
                  <select name="operari" id="operari">
                    <option
                      value={currentuser ? currentuser : ""}
                      selected
                      disabled
                    >
                      Operari Actual
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
                        <th>Magatzem / Carrer / Estantería / Espai</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderSelected.map((order) => {
                        const lines = orderLineShipping.find(
                          (line) => line.id === order
                        );
                        const product = products.find(
                          (p) => p.id === lines.product_id
                        );
                        const space = spaces.find(
                          (space) => space.product_id === lines.product_id
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
                      canviEstatModal();
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

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Operari</th>
              </tr>
            </thead>

            <tbody>
              {orderPickingShipping.map((order) => {
                const user = users.find((u) => u.id === order.user_id);
                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.create_date}</td>
                    <td>{user ? user.id : "Desconegut"}</td>
                    <td>
                      <Button
                        variant="success"
                        onClick={() => {
                          mostrarOrder(order.id);
                        }}
                      >
                        Visualizar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={canviEstatModal}>
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
                        <th>Magatzem / Carrer / Estantería / Espai</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderPickingShipping
                        .find((order) => order.id === orderVisualitzar)
                        .productos.map((producto) => {
                          const product = products.find(
                            (p) => p.id === producto.product_id
                          );
                          const space = spaces.find(
                            (s) => s.product_id === producto.product_id
                          );

                          return (
                            <tr key={producto.product_id}>
                              <td></td>
                              <td>{product.name}</td>
                              <td>{space.quantity}</td>
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
                      canviEstatModal();
                    }}
                  >
                    Tancar
                  </Button>
                </>
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
}

export default OrderPickingShipping;
