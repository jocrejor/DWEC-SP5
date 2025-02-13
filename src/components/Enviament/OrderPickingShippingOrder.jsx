import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Modal } from "react-bootstrap";

function OrderPickingShipping() {
  const [orderShipping, setOrderShipping] = useState([]);
  const [orderLineShipping, setOrderLineShipping] = useState([]);
  const [products, setProducts] = useState([]);
  const [temporalPickings, setTemporalPickings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [operariSeleccionat, setOperariSeleccionat] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Alta");

  const [orderSelected, setOrderSelected] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderLinesPage, setOrderLinesPage] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

  const navigate = useNavigate();
  const location = useLocation();

  const dataFetch = async () => {
    try {
      const orderLineShipping = await axios.get(`${apiUrl}/orderlineshipping`, {
        headers: { "auth-token": token },
      });
      setOrderLineShipping(orderLineShipping.data);
    } catch (error) {
      console.log("Error order line: ", error);
    }

    try {
      const orderShipping = await axios.get(`${apiUrl}/ordershipping`, {
        headers: { "auth-token": token },
      });
      setOrderShipping(orderShipping.data);
    } catch (error) {
      console.log("Error order shipping: ", error);
    }

    try {
      const product = await axios.get(`${apiUrl}/product`, {
        headers: { "auth-token": token },
      });
      setProducts(product.data);
    } catch (error) {
      console.log("Error product: ", error);
    }

    try {
      const space = await axios.get(`${apiUrl}/space`, {
        headers: { "auth-token": token },
      });
      setSpaces(space.data);
    } catch (error) {
      console.log("Error space: ", error);
    }

    try {
      const user = await axios.get(`${apiUrl}/users`, {
        headers: { "auth-token": token },
      });
      setUsers(user.data);
    } catch (error) {
      console.log("Error order line: ", error);
    }
  };

  useEffect(() => {
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
            order_shipping_id: order.id,
            order_line_shipping_id: line.id,
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
  }, [orderShipping, orderLineShipping, spaces]);

  useEffect(() => {
    dataFetch();
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
        order_line_shipping_id: line.id,
        product_id: line.product_id,
        quantity: line.quantity,
        storage_id: space.storage_id,
        street_id: space.street_id,
        shelf_id: space.shelf_id,
        space_id: space.id,
        operator_id: parseInt(operariSeleccionat),
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

  useEffect(() => {
    const totalPages = Math.ceil(temporalPickings.length / elementsPaginacio);
    setTotalPages(totalPages);
    console.log(totalPages);
  }, [temporalPickings]);

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
    const currentItems = temporalPickings.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    setOrderLinesPage(currentItems);
  }, [currentPage, temporalPickings]);

  return (
    <>
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
                  navigate(`orderpickingshipping/picking`);
                }}
                type="button"
                className="btn btn-dark ms-2 border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              >
                Fer Picking
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div>
              <table className="table table-striped text-center">
                <thead className="table-active border-bottom border-dark-subtle">
                  <tr>
                    <th scope="col">
                      <input className="form-check-input" type="checkbox" />
                    </th>
                    <th scope="col">ID Order</th>
                    <th scope="col">Producte</th>
                    <th scope="col">Quantitat</th>
                    <th scope="col">Magatzem / Carrer / Estantería / Espai</th>
                  </tr>
                </thead>

                <tbody>
                  {orderLinesPage.map((temporalPicking) => {
                    const product = products.find(
                      (p) => p.id === temporalPicking.product_id
                    );
                    return (
                      <tr key={temporalPicking.order_shipping_id}>
                        <td scope="row" data-cell="Seleccionar">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={temporalPicking.order_line_shipping_id}
                          />
                        </td>
                        <td data-cell="Ordre Id">
                          {temporalPicking.order_shipping_id}
                        </td>
                        <td data-cell="Producte">{product.name}</td>
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

              <nav aria-label="Page navigation example" className="d-block">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link text-light-blue"
                      href="#"
                      aria-label="Previous"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPreviousPage();
                      }}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <li
                        key={number}
                        className={`page-item ${
                          currentPage === number ? "active" : ""
                        }`}
                      >
                        <a
                          className="page-link text-light-blue"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            paginate(number);
                          }}
                        >
                          {number}
                        </a>
                      </li>
                    )
                  )}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link text-light-blue"
                      href="#"
                      aria-label="Next"
                      onClick={(e) => {
                        e.preventDefault();
                        goToNextPage();
                      }}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton className="bg-orange">
          <Modal.Title className="text-white">{tipoModal}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <>
            <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
              <div className="order-1 pb-2 col-6 order-md-0 d-flex">
                <div className="d-flex rounded border mt-2">
                  <div className="form-floating bg-white">
                    <select
                      className="form-select"
                      name="operari"
                      id="operari"
                      aria-label="Seleccione un operari"
                      value={operariSeleccionat}
                      onChange={handleInputChange}
                    >
                      <option value="" selected disabled>
                        Tria una opció
                      </option>
                      {users.map((user) => {
                        return <option value={user.id} key={user.id}>{user.name}</option>;
                      })}
                    </select>
                    <label htmlFor="operari">Operari</label>
                  </div>
                </div>
              </div>

              <div className="col-6 order-0 order-md-1 oder-xl-2 pb-2 pb-md-0">
                <div className="d-flex h-100 justify-content-xl-end">
                  <button
                    onClick={() => {
                      aceptarOrderPickingShipping();
                    }}
                    type="button"
                    className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>

            <table className="table table-striped text-center">
              <thead className="table-active border-bottom border-dark-subtle">
                <tr>
                  <th scope="col">Producte</th>
                  <th scope="col">Quantitat</th>
                  <th scope="col">Magatzem / Carrer / Estantería / Espai</th>
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
                    (space) => space.product_id === lines.product_id
                  );
                  return (
                    <tr key={order}>
                      <td data-cell="Producte">{product.name}</td>
                      <td data-cell="Quantitat">{lines.quantity}</td>
                      <td data-cell="Magatzem / Carrer / Estantería / Espai">
                        {space.storage_id} / {space.street_id} /{" "}
                        {space.shelf_id} / {space.id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default OrderPickingShipping;
