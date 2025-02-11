import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from "react";
import * as Yup from 'yup';


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



function LotsLotOSerie({ products, orderreception, suppliers, canviEstatModal, showModal, valorsInicials, lotOrSerial }) {
  const [lotes, setLotes] = useState([]);
  const [series, setSeries] = useState([]);
  const [errorAgregar, setErrorAgregar] = useState("");
  // const [lotOSerie, setLotOSerie] = useState('Lot');



  // const [valorsInicials, setValorsInicials] = useState({
  //   name: '',
  //   product_id: '',
  //   supplier_id: '',
  //   quantity: 0,
  //   production_date: '',
  //   expiration_date: '',
  //   orderlinereception: '',
  // });

  useEffect(() => {
    // if (showModal) {
      // setValorsInicials({
        // name: "",
        // product_id: '',
        // supplier_id: '',
        // quantity: 0,
        // production_date: '',
        // expiration_date: '',
        // orderlinereception: '',
      // });
    // }

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

                const orderReception = orderreception.find(or => or.id === values.order_reception_id);
                const supplierId = orderReception ? orderReception.supplier_id : "";
                const supplierRecord = suppliers.find(s => s.id === supplierId);

                const newRecord = {
                  name: values.name,
                  product_id: values.product_id,
                  supplier_id: supplierRecord ? supplierRecord.id : "",
                  quantity: lotOrSerial === "Serial" ? 1 : values.quantity_received,
                  production_date: lotOrSerial === "Lot" ? values.production_date : "",
                  expiration_date: lotOrSerial === "Lot" ? values.expiration_date : "",
                  orderlinereception_id: values.id,
                };

                if (lotOrSerial === "Lot") {
                  const updatedLotes = [...lotes, newRecord];
                  localStorage.setItem("lotsTemporal", JSON.stringify(updatedLotes));
                  setLotes(updatedLotes);
                } else if (lotOrSerial === "Serial") {
                  const updatedSeries = [...series, newRecord];
                  localStorage.setItem("serieTemporal", JSON.stringify(updatedSeries));
                  setSeries(updatedSeries);
                }
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
                        </tr>
                      </thead>
                      <tbody>
                        {/* {records.length === 0 ? (
                          <tr>
                            <td colSpan={lotOrSerial === "Lot" ? 4 : 2}>No hi han registres</td>
                          </tr>
                        ) : (
                          records.map((record, index) => ( */}
                            <tr>
                              <td>{}</td>
                              <td>{}</td>
                              {lotOrSerial === "Lot" && (
                                <>
                                  <td>{}</td>
                                  <td>{}</td>
                                </>
                              )}
                            </tr>
                          {/* ))
                        )} */}
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
  orderreception: PropTypes.array.isRequired,
  suppliers: PropTypes.array.isRequired,
  canviEstatModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  valorsInicials: PropTypes.object.isRequired,
  // LotSchema: PropTypes.func.isRequired,
};

export default LotsLotOSerie;
