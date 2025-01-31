import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { url, postData, getData, deleteData, updateId } from '../../apiAccess/crud';
import { Button, Modal } from 'react-bootstrap';
import axios from "axios";

import Header from '../Header';
import Filtres from '../Filtres';

const LotSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caràcters.').max(50, 'El valor màxim és de 50 caràcters').required('Valor requerit'),
  product_id: Yup.string().min(1, 'El valor ha de ser una cadena no vacía').required('Valor requerit'),
  supplier_id: Yup.string().min(1, 'El valor ha de ser una cadena no vacía').required('Valor requerit'),
  quantity: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  production_date: Yup.string().required('Valor requerit'),
  expiration_date: Yup.string().required('Valor requerit'),
  orderReception: Yup.string().required('Valor requerit'),
  orderLineReception: Yup.string().required('Valor requerit'),
});



const Lots = () => {
  const [lot, setLot] = useState([]);
  const [products, setProduct] = useState([]);
  const [suppliers, setSupplier] = useState([]);
  const [orderReceptions, setOrderReception] = useState([]);
  const [orderLineReceptions, setOrderLineReception] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({
    name: '',
    product_id: '',
    supplier_id: '',
    quantity: '',
    production_date: '',
    expiration_date: '',
    orderReception: '',
    orderLineReception: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {

        // const apiUrl = import.meta.env.VITE_API_URL;
        const apiUrl = "http://node.daw.iesevalorpego.es:3001/";
        const token = localStorage.getItem('token');

        const lot = await axios.get(`${apiUrl}/lot`, { headers: { "auth-token": token } })
          .then(response => {
            setLot(response.data)
          })
          .catch(error => {
            console.log(error)
          })

        // // const lot = axios.get(`${apiUrl}/lot`, { headers: {"auth-token" : JSON.parse(localStorage.getItem("token"))}});
        // const lot = axios.get(`http://node.daw.iesevalorpego.es:3001/lot`, { headers: {"auth-token" : token}})
        //   .then(response => {
        //     setLot(response.data)
        //   })
        //   .catch(error => {
        //     console.log(error)
        //   })


        // const product = await axios.get("http://node.daw.iesevalorpego.es:3001/Product");
        // const supplier = await axios.get("http://node.daw.iesevalorpego.es:3001/Supplier");
        // const orderReception = await axios.get("http://node.daw.iesevalorpego.es:3001/OrderReception");
        // const orderLineReception = await axios.get("http://node.daw.iesevalorpego.es:3001/OrderLineReception");

        setLot(lot.data);
        // setProduct(product.data);
        // setSupplier(supplier.data);
        // setOrderReception(orderReception.data);
        // setOrderLineReception(orderLineReception.data);
      }
      catch (error) {
        console.log("Error:", error);
      }
    }

    // async function fetchData() {
    //   const data = await getData(url, 'Lot');
    //   const product = await getData(url, 'Product');
    //   const supplier = await getData(url, 'Supplier');
    //   const orderReceptionData = await getData(url, 'OrderReception');  // Obtener las órdenes de recepción
    //   const orderLineReceptionData = await getData(url, 'OrderLineReception');  // Obtener las líneas de orden de recepción
    //   setLot(data);
    //   setProducts(product);
    //   setSuppliers(supplier);
    //   setOrderReceptions(orderReceptionData);
    //   setOrderLineReceptions(orderLineReceptionData);
    // }


    fetchData();
  }, []);

  const eliminarLot = async (id) => {
    try {
      await axios.delete(`http://node.daw.iesevalorpego.es:3001/Lot/${id}`);
      setLot((prevLot) => prevLot.filter((item) => item.id !== id));
    }
    catch (error) {
      console.log("Error:", error);
    }
  }
  // const eliminarLot = (id) => {
  //   deleteData(url, 'Lot', id);
  //   const newLot = lot.filter((item) => item.id !== id);
  //   setLot(newLot);
  // };

  const modificarLot = (valors) => {
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

      <div className="d-flex justify-content-end mt-3 me-3">
        <Button
          variant="success"
          className="btn btn-primary"
          onClick={() => {
            canviEstatModal();
            setTipoModal('Crear');
          }}
        >
          Alta Lots
        </Button>
      </div>
      <div className="table-responsive mx-2 mt-4">
        <table className="table table-striped table-bordered table-hover text-center align-middle">
          <thead className="thead-dark">
            <tr>
              <th className="align-middle">ID</th>
              <th className="align-middle">Nom</th>
              <th className="align-middle">ID Product</th>
              <th className="align-middle">ID Supplier</th>
              <th className="align-middle">Quantitat</th>
              <th className="align-middle">Data producció</th>
              <th className="align-middle">Data caducitat</th>
              <th className="align-middle">Order Reception</th>
              <th className="align-middle">Order Line Reception</th>
              <th className="align-middle">Visualitzar</th>
              <th className="align-middle">Modificar</th>
              <th className="align-middle">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {lot.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center">
                  No hi han lots
                </td>
              </tr>
            ) : (
              lot.map((valors) => (
                <tr key={valors.id}>
                  <td>{valors.id}</td>
                  <td>{valors.name}</td>
                  <td>{products.find((product) => product.id === valors.product_id)?.name}</td>
                  <td>{suppliers.find((supplier) => supplier.id === valors.supplier_id)?.name}</td>
                  <td>{valors.quantity}</td>
                  <td>{valors.production_date}</td>
                  <td>{valors.expiration_date}</td>
                  <td>{valors.orderReception}</td>
                  <td>{valors.orderLineReception}</td>
                  <td>
                    <Button
                      variant="primary"
                      className="btn-sm"
                      onClick={() => {
                        visualitzarLot(valors);
                        canviEstatModal();
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      className="btn-sm"
                      onClick={() => {
                        modificarLot(valors);
                        canviEstatModal();
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => {
                        eliminarLot(valors.id);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Lot</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Formik
            initialValues={
              tipoModal === 'Modificar' || tipoModal === 'Visualitzar'
                ? valorsInicials
                : {
                  name: '',
                  product_id: '',
                  supplier_id: '',
                  quantity: '',
                  production_date: '',
                  expiration_date: '',
                  orderReception: '',
                  orderLineReception: '',
                }
            }
            validationSchema={LotSchema}
            /** SE ACTUALIZA LA TABLA AL MODIFICAR O CREAR */
            onSubmit={async (values) => {
              if (tipoModal === 'Crear') {
                const response = await axios.post("https://api.dwes.iesevalorpego.es/lot", values);
                setLot((prevLot) => [...prevLot, response.data]);
              }
              else {
                await axios.put(`https://api.dwes.iesevalorpego.es/lot/${values.id}`, values);
              }
              // if (tipoModal === 'Crear') {
              //   axios.post("https://api.dwes.iesevalorpego.es/lot", values)
              //     .then((response) => {
              //       setLot((prevLot) => [...prevLot, response.data]);
              //     })
              //     .catch((error) => console.error("Error al crear el lote:", error));
              // } else {
              //   // updateId(url, 'Lot', values.id, values).then(() => {
              //   //   setLot(prevLot => prevLot.map(lot => (lot.id === values.id ? values : lot)));
              //   // });
              // }
              // canviEstatModal();
            }}
          /** SIN ACTUALIZAR (VERSIÓN ANTERIOR) */
          // onSubmit={(values) => {
          //   tipoModal === 'Crear'
          //     ? postData(url, 'Lot', values)
          //     : updateId(url, 'Lot', values.id, values);
          //   canviEstatModal();
          // }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Nom del lot</label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Nom del lot"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.name && touched.name ? (
                    <div className="text-danger mt-1">{errors.name}</div>
                  ) : null}
                </div>

                {/* <div className="form-group">
                  <label htmlFor="product_id">ID del Producte</label>
                  <Field
                    type="number"
                    name="product_id"
                    placeholder="ID del producte"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.product_id && touched.product_id ? (
                    <div className="text-danger mt-1">{errors.product_id}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="supplier_id">ID del Proveïdor</label>
                  <Field
                    type="number"
                    name="supplier_id"
                    placeholder="ID del proveïdor"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.supplier_id && touched.supplier_id ? (
                    <div className="text-danger mt-1">{errors.supplier_id}</div>
                  ) : null}
                </div> */}
                <div className="form-group">
                  <label htmlFor="product_id">ID del Producte</label>
                  <Field as="select" name="product_id" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona un producte</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Field>
                  {errors.product_id && touched.product_id ? (
                    <div className="text-danger mt-1">{errors.product_id}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="supplier_id">ID del Proveïdor</label>
                  <Field as="select" name="supplier_id" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona un proveïdor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Field>
                  {errors.supplier_id && touched.supplier_id ? (
                    <div className="text-danger mt-1">{errors.supplier_id}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Quantitat</label>
                  <Field
                    type="number"
                    name="quantity"
                    placeholder="Quantitat del lot"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.quantity && touched.quantity ? (
                    <div className="text-danger mt-1">{errors.quantity}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="production_date">Data de producció</label>
                  <Field
                    type="date"
                    name="production_date"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.production_date && touched.production_date ? (
                    <div className="text-danger mt-1">{errors.production_date}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="expiration_date">Data d&apos;expiració</label>  {/* &apos; es ' */}
                  <Field
                    type="date"
                    name="expiration_date"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.expiration_date && touched.expiration_date ? (
                    <div className="text-danger mt-1">{errors.expiration_date}</div>
                  ) : null}
                </div>

                {/* <div className="form-group">
                  <label htmlFor="orderReception">Order Reception</label>
                  <Field
                    type="text"
                    name="orderReception"
                    placeholder="Order Reception"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.orderReception && touched.orderReception ? (
                    <div className="text-danger mt-1">{errors.orderReception}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="orderLineReception">Order Line Reception</label>
                  <Field
                    type="text"
                    name="orderLineReception"
                    placeholder="Order Line Reception"
                    className="form-control"
                    disabled={tipoModal === 'Visualitzar'}
                  />
                  {errors.orderLineReception && touched.orderLineReception ? (
                    <div className="text-danger mt-1">{errors.orderLineReception}</div>
                  ) : null}
                </div> */}

                <div className="form-group">
                  <label htmlFor="orderReception">Order Reception</label>
                  <Field as="select" name="orderReception" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona una orden de recepció</option>
                    {orderReceptions.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.name}
                      </option>
                    ))}
                  </Field>
                  {errors.orderReception && touched.orderReception ? (
                    <div className="text-danger mt-1">{errors.orderReception}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor="orderLineReception">Order Line Reception</label>
                  <Field as="select" name="orderLineReception" className="form-control" disabled={tipoModal === 'Visualitzar'}>
                    <option value="">Selecciona una línea de orden de recepció</option>
                    {orderLineReceptions.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name}
                      </option>
                    ))}
                  </Field>
                  {errors.orderLineReception && touched.orderLineReception ? (
                    <div className="text-danger mt-1">{errors.orderLineReception}</div>
                  ) : null}
                </div>

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