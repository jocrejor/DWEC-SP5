import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from "react";
import * as Yup from 'yup';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');


const LotSchema = (lotOrSerial) => Yup.object().shape({
  name: Yup.string().required("El nom és requerit"),
  product_id: Yup.string()
    .min(1, "El valor ha de ser una cadena no buida")
    .required("Valor requerit"),
  quantity: Yup.number()
    .min(0, "El valor no pot ser negatiu")
    .required("Valor requerit"),
  // Agregar condicionalmente las fechas si es un lot
  ...(lotOrSerial === "lot" && {
    production_date: Yup.date().required("La data de producció és requerida"),
    expiration_date: Yup.date().required("La data d'expiració és requerida"),
  }),
});



function LotsLotOSerie({ products, canviEstatModal, showModal, valorsInicials, setValorsInicials, lotOrSerial }) {
  const [lotes, setLotes] = useState([]);
  const [series, setSeries] = useState([]);
  const [errorAgregar, setErrorAgregar] = useState("");

  const [guardado, setGuardado] = useState([]);

  useEffect(() => {
    const storedLotes = JSON.parse(localStorage.getItem("lotsTemporal")) || [];
    const storedSeries = JSON.parse(localStorage.getItem("serieTemporal")) || [];
    setLotes(storedLotes);
    setSeries(storedSeries);
  }, []);

  return (
    <>
      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Formik
            initialValues={valorsInicials}
            validationSchema={LotSchema(lotOrSerial)}
          >
            {({ values }) => {
              console.log(values)
              const selectedProduct = products.find(p => p.id === values.product_id);
              const lotOrSerial = selectedProduct ? selectedProduct.lotorserial : null;
              return (
                <Modal.Title>
                  Crear {lotOrSerial === "Lot" ? "lot" : lotOrSerial === "Serial" ? "serie" : "No definit"}
                </Modal.Title>
              );
            }}
          </Formik>
        </Modal.Header>

        <Modal.Body>
          <Formik
            initialValues={valorsInicials}
            validationSchema={LotSchema(lotOrSerial)}
          >
            {({ values, errors, touched }) => {
              const selectedProduct = products.find(p => p.id === values.product_id);
              const lotOrSerial = selectedProduct ? selectedProduct.lotorserial : null;
              const nombreTipo = lotOrSerial === "Lot" ? "lot" : lotOrSerial === "Serial" ? "serie" : "No definit";

              const handleAddRecord = () => {
                if (!values.name || !values.quantity || (lotOrSerial === "Lot" && (!values.production_date || !values.expiration_date))) {
                  setErrorAgregar("Debes llenar todos los campos");
                  return;
                }
                const newGuardado = {
                  name: values.name,
                  product_id: values.product_id,
                  supplier_id: values.supplier_id,
                  quantity: values.quantity,
                  production_date: lotOrSerial === "Lot" ? values.production_date : "",
                  expiration_date: lotOrSerial === "Lot" ? values.expiration_date : "",
                  orderlinereception_id: values.orderlinereception_id,
                };

                setGuardado(prevGuardado => [...prevGuardado, newGuardado]);

                setValorsInicials(prevValues => ({
                  ...prevValues,
                  name: "",
                  quantity: lotOrSerial === "Serial" ? 1 : "",
                  production_date: "",
                  expiration_date: "",
                }));


                if (lotOrSerial === "Lot") {
                  const updatedLotes = [...lotes, newGuardado];
                  localStorage.setItem("lotsTemporal", JSON.stringify(updatedLotes));
                  setLotes(updatedLotes);
                } else if (lotOrSerial === "Serial") {
                  const updatedSeries = [...series, newGuardado];
                  localStorage.setItem("serieTemporal", JSON.stringify(updatedSeries));
                  setSeries(updatedSeries);
                }
              };
              
              const handleDeleteRecord = (index) => {
                setGuardado(prevGuardado => prevGuardado.filter((_, i) => i !== index));
              };             

              return (
                <Form>
                  {/* Producto */}
                  <div className="form-group">
                    <label htmlFor="product_id">Producte</label>
                    <Field as="select" name="product_id" className="form-control" disabled>
                      <option value="">Selecciona un producte</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </Field>
                  </div>

                  {/* Cantidad */}
                  <div className="form-group">
                    <label htmlFor="quantity_received">Quantitat de la ordre</label>
                    <Field type="number" name="quantity_received" className="form-control" disabled />
                  </div>

                  {/* Inputs para lot o serie */}
                  <div className="form-group d-flex mt-3">
                    <div>
                      <div className="text-center fs-4">
                        <span className="text-capitalize">{nombreTipo}</span>
                      </div>
                      <div className="input-group flex-nowrap mt-3">
                        <Field
                          type="number" name="quantity"
                          className="form-control w-25"
                          disabled={lotOrSerial === "Serial"}
                        />
                        <Field
                          type="text" name="name"
                          placeholder={`Nom ${lotOrSerial === "Lot" ? "del" : "de la"} ${nombreTipo}`}
                          className="form-control w-100"
                        />
                        <button className="btn text-white orange-button" type="button" onClick={handleAddRecord}>
                          <i className='bi bi-plus-circle'></i>
                        </button>
                      </div>
                      {errors.quantity && touched.quantity && <div className="text-danger">{errors.quantity}</div>}
                      {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                    </div>
                  </div>

                  {/* Campos adicionales solo para "Lot" */}
                  {lotOrSerial === "Lot" && (
                    <>
                      <div className="form-group d-flex gap-2 mt-3">
                        <div className="w-100">
                          <label htmlFor="production_date">Data de producció</label>
                          <Field type="date" name="production_date" className="form-control" />
                          {errors.production_date && touched.production_date && <div className="text-danger">{errors.production_date}</div>}
                        </div>
                        <div className="w-100">
                          <label htmlFor="expiration_date">Data d&apos;expiració</label>
                          <Field type="date" name="expiration_date" className="form-control" />
                          {errors.expiration_date && touched.expiration_date && <div className="text-danger">{errors.expiration_date}</div>}
                        </div>
                      </div>
                      {errorAgregar && <div className="text-danger mt-2">{errorAgregar}</div>}
                    </>
                  )}

                  {/* Tabla de registros */}
                  <div className='mt-4'>
                    <table className="table table-striped text-center align-middle">
                      <thead className="table-active border-bottom border-dark-subtle">
                        <tr>
                          <th>Quantitat</th>
                          <th>Nom</th>
                          {lotOrSerial === "Lot" && (
                            <>
                              <th>Fecha de producció</th>
                              <th>Fecha de expiració</th>
                            </>
                          )}
                          <th>Accions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guardado.length === 0 ? (
                          <tr>
                            <td colSpan={lotOrSerial === "lot" ? 5 : 3}>No hi han registres</td>
                          </tr>
                        ) : (
                          guardado.map((guardar, index) => (
                            <tr key={index}>
                              <td>{guardar.quantity}</td>
                              <td>{guardar.name}</td>
                              {lotOrSerial === "Lot" && (
                                <>
                                  <td>{guardar.production_date}</td>
                                  <td>{guardar.expiration_date}</td>
                                </>
                              )}
                              <td>
                                  <i className="bi bi-trash icono" onClick={() => handleDeleteRecord(index)} role='button'></i>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="form-group d-flex justify-content-between mt-3">
                    <Button variant="secondary" onClick={canviEstatModal}>Tancar</Button>
                    <Button className="btn text-white orange-button">Gravar</Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </Modal.Body>

      </Modal>
    </>
  );
}

LotsLotOSerie.propTypes = {
  products: PropTypes.array.isRequired,
  lotOrSerial: PropTypes.string.isRequired,
  // orderreception: PropTypes.array.isRequired,
  // suppliers: PropTypes.array.isRequired,
  canviEstatModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  valorsInicials: PropTypes.object.isRequired,
  setValorsInicials: PropTypes.func.isRequired,
  // LotSchema: PropTypes.func.isRequired,
};

export default LotsLotOSerie;
