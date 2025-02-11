import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import axios from "axios";

import Header from '../Header';
import Filtres from '../Filtres';
import LotsLotOSerie from './LotsLotOSerie';
const apiUrl = import.meta.env.VITE_API_URL;
// const apiUrl = "http://node.daw.iesevalorpego.es:3001/";
const token = localStorage.getItem('token');

/* LOTS */
function Lots() {
  const [lot, setLot] = useState([]);
  const [products, setProduct] = useState([]);
  const [suppliers, setSupplier] = useState([]);
  // de momento no hay orderReception
  const [orderreception, setOrderReception] = useState([]);
  const [orderreception_status, setOrderReceptionStatus] = useState([]);
  const [orderline_status, setOrderLineStatus] = useState([]);
  const [orderlinereception, setOrderLineReception] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [valorsInicials, setValorsInicials] = useState({
    name: '',
    product_id: '',
    supplier_id: '',
    quantity: 0,
    production_date: '',
    expiration_date: '',
    orderlinereception: '',
    quantity_received: 0,
  });

  const [lotOrSerial, setLotOrSerial] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      axios.get(`${apiUrl}Lot`, { headers: { "auth-token": token } })
        // axios.get(`${apiUrl}lot`, { headers: { "auth-token": token } })
        .then(
          response => {
            setLot(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}Product`, { headers: { "auth-token": token } })
        // axios.get(`${apiUrl}product`, { headers: { "auth-token": token } })
        .then(
          response => {
            setProduct(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )
      axios.get(`${apiUrl}Supplier`, { headers: { "auth-token": token } })
        // axios.get(`${apiUrl}supplier`, { headers: { "auth-token": token } })
        .then(
          response => {
            setSupplier(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}OrderReception`, { headers: { "auth-token": token } })
        // axios.get(`${apiUrl}orderreception`, { headers: { "auth-token": token } })
        .then(response => {
          setOrderReception(response.data)
        })
        .catch(error => {
          console.log(error)
        }
        )

      axios.get(`${apiUrl}orderlinereception`, { headers: { "auth-token": token } })
        // axios.get(`${apiUrl}orderlinereception`, { headers: { "auth-token": token } })
        .then(
          response => {
            setOrderLineReception(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}orderreception_status`, { headers: { "auth-token": token } })
        .then(
          response => {
            setOrderReceptionStatus(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}orderline_status`, { headers: { "auth-token": token } })
        .then(
          response => {
            setOrderLineStatus(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

    }
    fetchData();
  }, []);

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <Header title="Llistat Lots" />
      <Filtres />

      <div className="container-fluid">
        <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
          <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
            <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
              <div className="form-floating bg-white">
                <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                  <option>Tria una opció</option>
                  <option value="1">Eliminar</option>
                </select>
                <label htmlFor="floatingSelect">Accions en lot</label>
              </div>
              <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button"><i className="bi bi-check-circle text-white px-1"></i>Aplicar</button>
            </div>
          </div>
          <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
          <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2"></div>
        </div>

        <div className="row">
          <div className="col-12">
            <div>
              <table className="table table-striped text-center align-middle">
                <thead className="table-active border-bottom border-dark-subtle">
                  <tr>
                    <th className='align-middle' scope='col'>
                      <input className='form-check-input' type="checkbox" />
                    </th>
                    <th scope='col' className="align-middle">ID</th>
                    <th scope='col' className="align-middle">Proveïdor</th>
                    <th scope='col' className="align-middle">Estat ordre línia de recepció</th>
                    <th scope='col' className="align-middle">Estat ordre de recepció</th>
                    <th scope='col' className="align-middle">Producte</th>
                    <th scope='col' className="align-middle">Quantitat</th>
                    {/* <th scope='col' className="align-middle">Lot</th>
                    <th scope='col' className="align-middle">Serie</th> */}
                    <th scope='col' className="align-middle">Lot/Serie</th>
                  </tr>
                </thead>
                <tbody>
                  {orderlinereception.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center">
                        No hi han linies d&apos;ordre de recepció
                      </td>
                    </tr>
                  ) : (
                    orderlinereception
                      .filter((valors) => valors.orderline_status_id === 2)
                      .map((valors) => (
                        <tr key={`orderlinereception-${valors.id}`}>
                          <td scope='row' data-cell="Seleccionar">
                            <input className='form-check-input' type="checkbox" />
                          </td>

                          <td data-cell="ID">{valors.id}</td>

                          <td data-cell="Proveïdor">
                            {(() => {
                              const orderReceptions = orderreception.find(
                                (or) => or.id === valors.order_reception_id
                              );
                              const supplier = suppliers.find((s) => s.id === orderReceptions?.supplier_id);
                              return supplier ? supplier.name : "Proveïdor no trobat";
                            })()}
                          </td>

                          <td data-cell="Estat ordre línia de recepció">
                            {orderline_status.find((status) => status.id === valors.order_reception_id)?.name || "Estat no trobat"}
                          </td>

                          <td data-cell="Estat ordre de recepció">
                            {orderreception_status.find((status) => status.id === valors.orderline_status_id)?.name || "Estat no trobat"}
                          </td>

                          <td data-cell="Producte">
                            {products.find((product) => product.id === valors.product_id)?.name || "Desconegut"}
                          </td>

                          <td data-cell="Quantitat rebuda">{valors.quantity_received}</td>

                          {/* <td data-no-colon="true">
                            <i
                              className="bi bi-plus-circle icono"
                              role='button'
                              onClick={() => {
                                canviEstatModal();
                                setLotOSerie('Lot')
                                setValorsInicials(valors);
                              }}>
                            </i>
                          </td>
                          <td>
                            <i className="bi bi-plus-circle icono"
                              role='button'
                              onClick={() => {
                                canviEstatModal();
                                setLotOSerie('Serie')
                                setValorsInicials(valors);
                              }}
                            >
                            </i>
                          </td> */}
                          <td data-no-colon="true">
                            <i className="bi bi-plus-circle icono"
                              role='button'
                              onClick={() => {
                                canviEstatModal();

                                const selectedProduct = products.find(p => p.id === valors.product_id);
                                const lotOSerie = selectedProduct ? selectedProduct.lotorserial : null;

                                if(lotOSerie === "Lot"){
                                  setLotOrSerial("lot");
                                }
                                else if(lotOSerie === "Serial"){
                                  setLotOrSerial("serie");
                                }

                                const orderReceptions = orderreception.find(
                                  (or) => or.id === valors.order_reception_id
                                );
                                const supplier = suppliers.find((s) => s.id === orderReceptions?.supplier_id);

                                setValorsInicials({
                                  name: "",
                                  product_id: valors.product_id,
                                  supplier_id: supplier ? supplier.id : "",
                                  quantity: lotOSerie === "Serial" ? 1 : "",
                                  production_date: "",
                                  expiration_date: "",
                                  orderlinereception: valors.id,
                                  quantity_received: valors.quantity_received,
                                });
                              }}
                            >
                            </i>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
              <nav aria-label="Page navigation example" className="d-block">
                <ul className="pagination justify-content-center">
                  <li className="page-item">
                    <a className="page-link text-light-blue" href="#" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li className="page-item"><a className="page-link activo-2" href="#">1</a></li>
                  <li className="page-item"><a className="page-link text-light-blue" href="#">2</a></li>
                  <li className="page-item"><a className="page-link text-light-blue" href="#">3</a></li>
                  <li className="page-item">
                    <a className="page-link text-light-blue" href="#" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>

            </div>
          </div>
        </div>
      </div>


      {/* MODAL CON FORMIK */}
      <LotsLotOSerie products={products} orderreception={orderreception} suppliers={suppliers} canviEstatModal={canviEstatModal} showModal={showModal} valorsInicials={valorsInicials} lotOrSerial={lotOrSerial} />
    </>
  );
}

export default Lots