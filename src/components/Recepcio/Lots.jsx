import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import axios from "axios";

import Header from '../Header';
import Filtres from '../Filtres';
const apiUrl = import.meta.env.VITE_API_URL;
// const apiUrl = "http://node.daw.iesevalorpego.es:3001/";
const token = localStorage.getItem('token');

const LotSchema = Yup.object().shape({
  order_reception_id: Yup.string().required('Valor requerit'),
  orderlinereception_status_id: Yup.string().required('Valor requerit'),
  product_id: Yup.string().min(1, 'El valor ha de ser una cadena no vacía').required('Valor requerit'),
  quantity_ordered: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  quantity_received: Yup.number().min(0, 'El valor no pot ser negatiu').required('Valor requerit')
});

function Lots() {
  const [lot, setLot] = useState([]);
  const [products, setProduct] = useState([]);
  const [suppliers, setSupplier] = useState([]);
  // de momento no hay orderReception
  // const [orderReceptions, setOrderReception] = useState([]);
  const [orderreception_status, setOrderReceptionStatus] = useState([]);
  const [orderline_status, setOrderLineStatus] = useState([]);
  const [orderLineReceptions, setOrderLineReception] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({
    order_reception_id: '',
    orderlinereception_status_id: '',
    product_id: '',
    quantity_ordered: 0,
    quantity_received: 0
  });

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

      // axios.get(`${apiUrl}OrderReception`, { headers: { "auth-token": token } })
      //   // axios.get(`${apiUrl}orderreception`, { headers: { "auth-token": token } })
      //   .then(response => {
      //     setOrderReception(response.data)
      //   })
      //   .catch(error => {
      //     console.log(error)
      //   }
      //   )

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

  const eliminarLot = (id) => {
    try {
      axios.delete(`${apiUrl}lot/${id}`, {
        headers: { "auth-token": token }
      })
        .then(() => {
          setLot((prevLot) => prevLot.filter((item) => item.id !== id));
        })
        .catch(error => {
          console.error(error);
        });
    }
    catch (error) {
      console.log("Error al eliminar:", error);
    }
  }
  // const eliminarLot = (id) => {
  //   deleteData(url, 'Lot', id);
  //   const newLot = lot.filter((item) => item.id !== id);
  //   setLot(newLot);
  // };

  const modificarLot = (valors) => {
    console.log(valors.id);

    setTipoModal('Modificar');
    setValorsInicials(valors);
  };

  const visualitzarLot = (valors) => {
    setTipoModal('Visualitzar');
    setValorsInicials(valors);
  };

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
          <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
            {/* <div className="d-flex h-100 justify-content-xl-end">
              <Button
                type="button"
                className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                onClick={() => {
                  canviEstatModal();
                  setTipoModal('Crear');
                }}>
                <i className="bi bi-plus-circle text-white pe-1"></i>Crear
              </Button>
            </div> */}
          </div>
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
                    <th scope='col' className="align-middle">ID ordre recepció</th>
                    <th scope='col' className="align-middle">Estat ordre de línea recepció</th>
                    <th scope='col' className="align-middle">Producte</th>
                    <th scope='col' className="align-middle">Quantitat</th>
                    <th scope='col' className="align-middle">Lot/Serie</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLineReceptions.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center">
                        No hi han linies d&apos;ordre de recepció
                      </td>
                    </tr>
                  ) : (
                    orderLineReceptions
                      .filter((valors) => valors.orderline_status_id === 2)
                      .map((valors) => (
                        <tr key={`orderLineReceptions-${valors.id}`}>
                          <td scope='row' data-cell="Seleccionar">
                            <input className='form-check-input' type="checkbox" />
                          </td>
                          <td data-cell="ID">{valors.id}</td>

                          <td data-cell="Estat ordre línia recepció">{orderline_status.find((status) => status.id === valors.order_reception_id)?.name || "Estat no trobat"}</td>

                          <td data-cell="Estat ordre línia recepció">{orderreception_status.find((status) => status.id === valors.orderline_status_id)?.name || "Estat no trobat"}</td>
                          <td data-cell="Producte">{products.find((product) => product.id === valors.product_id)?.name || "Desconegut"}</td>
                          <td data-cell="Quantitat rebuda">{valors.quantity_received}</td>

                          <td data-no-colon="true">
                            <Button
                              type="button"
                              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                              onClick={() => {
                                modificarLot(valors);
                                canviEstatModal();
                              }}>
                              Crear
                            </Button>
                          </td>

                          {/* accions visualitzar, modificar, eliminar */}
                          {/* <td data-no-colon="true" className='fs-5'>
                            <div className="d-xl-flex flex-xl-column flex-xl-row">
                              <i
                                onClick={() => {
                                  visualitzarLot(valors);
                                  canviEstatModal();
                                }}
                                className="bi bi-eye icono"
                                role='button'>
                              </i>
                              <i
                                onClick={() => {
                                  modificarLot(valors);
                                  canviEstatModal();
                                }}
                                className="bi bi-pencil-square px-3 icono"
                                role='button'>
                              </i>
                              <i
                                onClick={() => {
                                  eliminarLot(valors.id);
                                }}
                                className="bi bi-trash icono"
                                role='button'>
                              </i>
                            </div>
                          </td> */}
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

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Lot/Serie</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Formik
            initialValues={
              tipoModal === 'Modificar' || tipoModal === 'Visualitzar'
                ? valorsInicials
                : {
                  order_reception_id: '',
                  orderlinereception_status_id: '',
                  product_id: '',
                  quantity_ordered: 0,
                  quantity_received: 0
                }
            }
            validationSchema={LotSchema}
            /** SE ACTUALIZA LA TABLA AL MODIFICAR O CREAR */
            onSubmit={(values) => {
              console.log(values);
              console.log(tipoModal);
              try {
                if (tipoModal === 'Crear') {
                  axios.post(`${apiUrl}lot`, values, {
                    headers: { "auth-token": token }
                  })
                    .then((response) => {
                      console.log("Response data", response.data);
                      console.log("Response data results", response.data.results);

                      // Usamos los 'values' (datos del formulario) para agregar el lote
                      const newLot = {
                        ...values,
                        id: response.data.results.insertId, // Asigna el ID generado por la base de datos

                        product_id: products.find((product) => product.id === values.product_id)?.name,
                        supplier_id: suppliers.find((supplier) => supplier.id === values.supplier_id)?.name
                      };

                      console.log("Valor producte", values.product_id)
                      console.log("Valor supplier", values.supplier_id)

                      console.log("Producte nom", products.find((product) => product.id === values.product_id)?.name);
                      console.log("Supplier nom", suppliers.find((supplier) => supplier.id === values.supplier_id)?.name);

                      setLot((prevLot) => {
                        const updatedLot = [...prevLot, newLot];
                        console.log("Updated Lot list:", updatedLot);
                        return updatedLot;
                      });

                      setShowModal(false);
                    })
                    .catch(error => {
                      console.error("Error al crear:", error);
                    });
                }

                else if (tipoModal === 'Modificar') {
                  axios.put(`${apiUrl}lot/${values.id}`, values, {
                    headers: { "auth-token": token }
                  })
                    .then((response) => {
                      // Actualizar el lote en el estado después de la modificación
                      // setLot((prevLot) =>
                      //   prevLot.map((lot) => (lot.id === values.id ? response.data : lot))
                      // );
                      console.log(response.data);

                      setLot((prevLot) =>
                        prevLot.map((lot) =>
                          lot.id === values.id ? { ...lot, ...response.data } : lot
                        )
                      );

                      console.log(lot);
                    })
                    .catch(error => {
                      console.error("Error al modificar:", error);
                    });

                  // Cerrar el modal
                  setShowModal(false);
                }
              }
              catch (error) {
                console.log("Error al crear o eliminar:", error);
              }
            }}
          >
            {({ values, errors, touched }) => (
              /**FORMULARIO CON SELECTS Y DEMÁS (CORRECTO) */
              <Form>
                {/* <div className="form-group">
                  <label htmlFor="name">Nom del lot</label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Nom del lot"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.name && touched.name && <div className="text-danger mt-1">{errors.name}</div>}
                </div> */}

                {/* ID Product */}
                {/* <div className="form-group">
                  <label htmlFor="product_id">ID del Producte</label>
                  <Field as="select" name="product_id" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona un producte</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Field>
                  {errors.product_id && touched.product_id && <div className="text-danger mt-1">{errors.product_id}</div>}
                </div> */}

                {/* producte */}
                <div className="form-group">
                  <label htmlFor="product_id">ID del Producte</label>
                  <Field as="select" name="product_id" className="form-control" disabled>
                    <option value="">Selecciona un producte</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Field>
                  {errors.product_id && touched.product_id && <div className="text-danger mt-1">{errors.product_id}</div>}
                </div>

                {/* ID Supplier */}
                {/* <div className="form-group">
                  <label htmlFor="supplier_id">ID del Proveïdor</label>
                  <Field as="select" name="supplier_id" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona un proveïdor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Field>
                  {errors.supplier_id && touched.supplier_id && <div className="text-danger mt-1">{errors.supplier_id}</div>}
                </div> */}

                {/* Quantitat */}
                {/* <div className="form-group">
                  <label htmlFor="quantity">Quantitat</label>
                  <Field
                    type="number"
                    name="quantity"
                    placeholder="Quantitat del lot"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.quantity && touched.quantity && <div className="text-danger mt-1">{errors.quantity}</div>}
                </div> */}

                {/* quantitat */}
                <div className="form-group">
                  <label htmlFor="quantity_received">Quantitat</label>
                  <Field
                    type="number"
                    name="quantity_received"
                    placeholder="Quantitat del lot"
                    className="form-control"
                    disabled
                  />
                  {errors.quantity_received && touched.quantity_received && <div className="text-danger mt-1">{errors.quantity_received}</div>}
                </div>

                {/* Production Date */}
                {/* <div className="form-group">
                  <label htmlFor="production_date">Data de producció</label>
                  <Field
                    type="date"
                    name="production_date"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.production_date && touched.production_date && <div className="text-danger mt-1">{errors.production_date}</div>}
                </div> */}

                {/* Expiration Date */}
                {/* <div className="form-group">
                  <label htmlFor="expiration_date">Data d&apos;expiració</label>
                  <Field
                    type="date"
                    name="expiration_date"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.expiration_date && touched.expiration_date && <div className="text-danger mt-1">{errors.expiration_date}</div>}
                </div> */}

                {/* Order Line Reception */}
                {/* <div className="form-group">
                  <label htmlFor="orderlinereception_id">ID Order Line Reception</label>
                  <Field as="select" name="orderlinereception_id" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona un id de línea de orden de recepció</option>
                    {orderLineReceptions.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.id}
                      </option>
                    ))}
                  </Field>
                  {errors.orderlinereception_id && touched.orderlinereception_id && <div className="text-danger mt-1">{errors.orderlinereception_id}</div>}
                </div> */}

                <div className="form-group d-flex justify-content-between mt-3">
                  <Button
                    variant="secondary"
                    onClick={canviEstatModal}
                    className="btn btn-secondary"
                  >
                    Tancar
                  </Button>
                  {tipoModal !== 'Visualitzar' && (
                    <Button
                      variant={tipoModal === 'Modificar' ? 'success' : 'info'}
                      type="submit"
                      className="btn"
                    >
                      {tipoModal}
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Lots