import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from "react";

function LotsLotOSerie({ products, lotOSerie, orderreception, suppliers, canviEstatModal, showModal, LotSchema }) {
  const [lotes, setLotes] = useState([]);
  const [series, setSeries] = useState([]);
  const [errorAgregar, setErrorAgregar] = useState("");

  const records = lotOSerie === "Lot" ? lotes : series;



  const [valorsInicials, setValorsInicials] = useState({
    name: '',
    product_id: '',
    supplier_id: '',
    quantity: lotOSerie === "Serie" ? 1 : 0,
    // quantity: 0,
    production_date: '',
    expiration_date: '',
    orderlinereception: '',
    // product_id: '',
    // quantity: lotOSerie === "Serie" ? "1" : "",
  });






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
            validationSchema={LotSchema(lotOSerie)}
          >
            {({ values }) => {
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
            validationSchema={LotSchema(lotOSerie)}
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
                } else if (lotOSerie === "Serial") {
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
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={lotOrSerial === "Lot" ? 4 : 2}>No hi han registres</td>
                          </tr>
                        ) : (
                          records.map((record, index) => (
                            <tr key={index}>
                              <td>{record.quantity}</td>
                              <td>{record.name}</td>
                              {lotOrSerial === "Lot" && (
                                <>
                                  <td>{record.production_date}</td>
                                  <td>{record.expiration_date}</td>
                                </>
                              )}
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
  lotOSerie: PropTypes.string.isRequired,
  orderreception: PropTypes.array.isRequired,
  suppliers: PropTypes.array.isRequired,
  canviEstatModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  // valorsInicials: PropTypes.object.isRequired,
  LotSchema: PropTypes.func.isRequired,
};

export default LotsLotOSerie;
