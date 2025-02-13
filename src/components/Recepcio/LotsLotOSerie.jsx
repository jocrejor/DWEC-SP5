import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from "react";
import * as Yup from 'yup';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');


const LotSchema = (lotOrSerial) => Yup.object().shape({
  name: Yup.string()
    .required("El nom és requerit")
    .min(3, "El nom ha de tindre mínim 3 caracters"),
  product_id: Yup.string()
    .required("Quantitat requerida"),
  quantity: Yup.number()
    .min(0, "La quantitat no pot ser negativa")
    .required("Valor requerit"),
  // Agregar condicionalmente las fechas si es un lot
  ...(lotOrSerial === "lot" && {
    production_date: Yup.date().required("La data de producció és requerida"),
    expiration_date: Yup.date()
      .required("La data d'expiració és requerida")
      .test(
        "is-expiration-after-production",
        "La data d'expiració ha de ser posterior a la data de producció",
        function (value) {
          const { production_date } = this.parent; // Obtén la fecha de producción
          if (!production_date || !value) return true; // Si cualquiera de las fechas está vacía, no validamos
          return new Date(value) > new Date(production_date); // Compara las fechas
        })
  }),
});

function LotsLotOSerie({ products, canviEstatModal, showModal, valorsInicials, setValorsInicials, lotOrSerial }) {
  const [errorAgregar, setErrorAgregar] = useState("");
  const [guardado, setGuardado] = useState([]);

  return (
    <>
      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Crear {lotOrSerial === "lot" ? "lot" : lotOrSerial === "serie" ? "serie" : "No definit"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={valorsInicials}
            validationSchema={LotSchema(lotOrSerial)}
          >
            {({ values, errors, touched }) => {
              const handleSave = async () => {
                if (guardado.length === 0) {
                  setErrorAgregar("No hi ha registres per gravar");
                  return;
                }

                try {
                  for (const lote of guardado) {
                    const saveResponse = await axios.post(`${apiUrl}lot`, lote, {
                      headers: { "auth-token": token }
                    });

                    console.log("Registres guardats correctament", saveResponse.data);
                  }

                  setGuardado([]);      // Vaciar la lista después de guardar
                  setValorsInicials({
                    name: "",
                    quantity: lotOrSerial === "serie" ? 1 : "",
                    production_date: "",
                    expiration_date: "",
                  });
                  canviEstatModal();

                  setErrorAgregar("");
                }
                catch (error) {
                  console.error("Error al guardar:", error);
                }
              };

              const handleAddRecord = () => {
                if (!values.name || !values.quantity || (lotOrSerial === "lot" && (!values.production_date || !values.expiration_date))) {
                  setErrorAgregar("No pots deixar camps buits");
                  return;
                }
                const newGuardado = {
                  name: values.name,
                  product_id: values.product_id,
                  supplier_id: values.supplier_id,
                  quantity: values.quantity,
                  production_date: lotOrSerial === "lot" ? values.production_date : "",
                  expiration_date: lotOrSerial === "lot" ? values.expiration_date : "",
                  orderlinereception_id: values.orderlinereception_id,
                };

                setGuardado(prevGuardado => [...prevGuardado, newGuardado]);

                setValorsInicials(prevValues => ({
                  ...prevValues,
                  name: "",
                  quantity: lotOrSerial === "serie" ? 1 : "",
                  production_date: "",
                  expiration_date: "",
                }));

                setErrorAgregar("");
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
                        <span className="text-capitalize">{lotOrSerial}</span>
                      </div>
                      <div className="input-group flex-nowrap mt-3">
                        <Field
                          type="number" name="quantity"
                          className="form-control w-25"
                          disabled={lotOrSerial === "serie"}
                        />
                        <Field
                          type="text" name="name"
                          placeholder={`Nom ${lotOrSerial === "lot" ? "del" : "de la"} ${lotOrSerial}`}
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
                  {lotOrSerial === "lot" && (
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
                          {lotOrSerial === "lot" && (
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
                              {lotOrSerial === "lot" && (
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
                    <Button className="btn text-white orange-button" onClick={handleSave}>Gravar</Button>
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
  canviEstatModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  valorsInicials: PropTypes.object.isRequired,
  setValorsInicials: PropTypes.func.isRequired,
};

export default LotsLotOSerie;
