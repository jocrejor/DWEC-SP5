import { useState, useEffect } from "react";
import {
  url,
  postData,
  // getData,
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

  const apiUrl = url;
  useEffect(() => {
    // const apiUrl = import.meta.env.VITE_API_URL;
    // const token = localStorage.getItem("token");

    const fetchData = async () => {
      axios
        .get(`${apiUrl}OrderPickingshipping`, {
          // headers: { "auth-token": token },
        })
        .then((res) => {
          setOrderPickingShipping(res.data);
        })
        .catch((error) => console.log(error));

      axios
        .get(`${apiUrl}OrderShipping`, {
          // headers: { "auth-token": token },
        })
        .then((res) => {
          setOrderShipping(res.data);
        })
        .catch((error) => console.log(error));

      const orderLine = axios
        .get(`${apiUrl}OrderLineShipping`, {
          // headers: { "auth-token": token },
        })
        .then((res) => {
          setOrderLineShipping(res.data);
        })
        .catch((error) => console.log(error));

      axios
        .get(`${apiUrl}Product`, {
          // headers: { "auth-token": token },
        })
        .then((res) => {
          setProducts(res.data);
        })
        .catch((error) => console.log(error));

      axios
        .get(`${apiUrl}Space`, {
          // headers: { "auth-token": token },
        })
        .then((res) => {
          setSpaces(res.data);
        })
        .catch((error) => console.log(error));

      axios
        .get(`${apiUrl}User`, {
          // headers: { "auth-token": token },
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
        const lines = orderLine.data.filter(
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
      <div>
        <h1 className="text-center py-4 fs-4 fw-bold m-0 text-white bg-title">
          Llistat Order Picking Shipping
        </h1>
        <p className="position-absolute top-0 end-0 me-4 m-customized mt-xl-4 fw-bold fs-5 text-white">
          <i className="bi bi-person-circle pe-2"></i>
          Usuari Admin
        </p>
        <div className="container-fluid">
          <div className="row bg-grey pt-3 px-2">
            <div className="col-12 col-md-6 col-xl-4">
              <div className="mb-3 text-light-blue">
                <label htmlFor="nom" className="form-label">
                  Nom
                </label>
                <input type="email" className="form-control" id="nom" />
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <div className="mb-3 text-light-blue">
                <label htmlFor="dni-nif" className="form-label">
                  DNI/NIF
                </label>
                <input type="email" className="form-control" id="dni-nif" />
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <div className="mb-3 text-light-blue">
                <label htmlFor="telefon" className="form-label">
                  Telèfon
                </label>
                <input type="email" className="form-control" id="telefon" />
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <div className="mb-3 text-light-blue">
                <label htmlFor="correo" className="form-label">
                  Correu
                </label>
                <input type="email" className="form-control" id="correo" />
              </div>
            </div>
            <div className="col-xl-4"></div>
            <div className="col-xl-4"></div>
          </div>
          <div className="row bg-grey pb-3">
            <div className="col-xl-4"></div>
            <div className="col-xl-4"></div>
            <div className="col-12 col-xl-4 text-end">
              <button className="btn btn-secondary me-2 ps-2 text-white">
                <i className="bi bi-trash px-1 text-white"></i>Netejar
              </button>
              <button className="btn btn-primary me-2 ps-2 orange-button text-white">
                <i className="bi bi-funnel px-1 text-white"></i>Filtrar
              </button>
            </div>
          </div>
          <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
            <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
              <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
                <div className="form-floating bg-white">
                  <select
                    className="form-select"
                    id="floatingSelect"
                    aria-label="Seleccione una opción"
                  >
                    <option selected>Tria una opció</option>
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
                              <td>{temporalPicking.order_reception_id}</td>
                              <td>{product.name}</td>
                              <td>{temporalPicking.quantity}</td>
                              <td>
                                {temporalPicking.storage_id} /{" "}
                                {temporalPicking.street_id} /{" "}
                                {temporalPicking.selft_id} /{" "}
                                {temporalPicking.space_id}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                                  <th>
                                    Magatzem / Carrer / Estantería / Espai
                                  </th>
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
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {tabla === "CrearOrder" ? (
        <>
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
      )} */}
    </>
  );
}

export default OrderPickingShipping;
