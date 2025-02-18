import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
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
    .min(1, "La quantitat ha de ser almenys 1")
    .required("Valor requerit"),
  // agregar condicionalmente las fechas si es un lot
  ...(lotOrSerial === "lot" && {
    production_date: Yup.date().required("La data de producció és requerida"),
    expiration_date: Yup.date()
      .required("La data d'expiració és requerida")
      .test(
        "is-expiration-after-production",
        "La data d'expiració ha de ser posterior a la data de producció",
        /**
         * funcion que valida si la fecha de produccion
         * está antes que la de expiración
         */
        function (value) {
          const { production_date } = this.parent;
          if (!production_date || !value) return true;
          return new Date(value) > new Date(production_date);
        })
  }),
});

function limpiarCampos(resetForm, lotOrSerial, setErrorAgregar) {
  resetForm({
    name: "",
    quantity: lotOrSerial === "serie" ? 1 : "",
    production_date: "",
    expiration_date: "",
  });
  setErrorAgregar("");
}

function LotsLotOSerie({
  setLot, products, canviEstatModal, showModal, valorsInicials, setValorsInicials, lotOrSerial, guardado,
  setGuardado, errorAgregar, setErrorAgregar, setLotYaCreados, tipoModal, suppliers, arrayVisualitzar, setArrayVisualitzar
}) {

  const cargarDatos = async () => {
    try {
      const response = await axios.get(`${apiUrl}lot`, { headers: { "auth-token": token } });
      setLot(response.data);
      // Si 'arrayVisualitzar' se deriva de 'lots', asegúrate de actualizarlo también:
      setArrayVisualitzar(response.data); // O realiza algún filtro si es necesario.
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={canviEstatModal}
        dialogClassName={tipoModal === "Visualitzar" ? "modal-50w" : ""}
      // dialogClassName="modal-50w"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {tipoModal} {lotOrSerial === "lot" ? "lot" : lotOrSerial === "serie" ? "serie" : "No definit"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={valorsInicials}
            validationSchema={LotSchema(lotOrSerial)}
          >
            {({ values, errors, touched, resetForm }) => {
              const handleSave = async () => {
                if (guardado.length === 0) {
                  setErrorAgregar("No hi ha registres per gravar");
                  return;
                }

                //verifica que la cantidad total guardada no supere el quantity_ordered
                const cantidadMaxima = Number(valorsInicials.quantity_ordered);
                console.log("Cantidad max:", cantidadMaxima)

                const totalGuardado = guardado.reduce(
                  (sum, item) => sum + Number(item.quantity),
                  0
                );
                console.log("Total guardado:", totalGuardado)

                if (totalGuardado !== cantidadMaxima) {
                  setErrorAgregar(`La quantitat total guardada no coincideix amb la quantitat rebuda, tens ${totalGuardado} unitats guardades i has de tindre ${cantidadMaxima}.`);
                  return;
                }
                else {
                  setErrorAgregar("");
                }

                try {
                  for (const lote of guardado) {
                    const saveResponse = await axios.post(`${apiUrl}lot`, lote, {
                      headers: { "auth-token": token }
                    });
                    console.log("Registres guardats correctament", saveResponse.data);
                  }

                  console.log("Funciona?", values)
                  console.log("FuncionaID?", values.orderlinereception_id)
                  console.log("FuncionaQuantityOrdered?", values.quantity_ordered)
                  // Actualizar la orderlinereception para que quantity_received tome el valor de quantity_ordered
                  await axios.put(`${apiUrl}orderlinereception/${values.orderlinereception_id}`, {
                    quantity_received: values.quantity_ordered  // Asegúrate de que 'quantity_ordered' esté definido en values
                  }, {
                    headers: { "auth-token": token }
                  });

                  await cargarDatos();

                  setGuardado([]);      // vacia la lista después de guardar
                  setValorsInicials({
                    name: "",
                    quantity: lotOrSerial === "serie" ? 1 : "",
                    production_date: "",
                    expiration_date: "",
                  });
                  canviEstatModal();

                  setErrorAgregar("");

                  console.log("ID order line reception: ", values.orderlinereception_id);
                  setLotYaCreados(prevIds => [...prevIds, values.orderlinereception_id]);
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
                else if (Object.keys(errors).length > 0) {
                  setErrorAgregar("");
                  return;
                }

                //comprueba que la cantidad sea exactamente quantity_ordered
                const cantidadMaxima = Number(valorsInicials.quantity_ordered);

                const totalActual = guardado.reduce(
                  (sum, guardado) => sum + Number(guardado.quantity), 0
                );

                const nuevaCantidadGuardada = Number(values.quantity);

                if (totalActual + nuevaCantidadGuardada > cantidadMaxima) {
                  setErrorAgregar("La quantitat total no pot superar la quantitat rebuda");
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

                setErrorAgregar("");
              };

              const handleDeleteRecord = (index) => {
                setGuardado(prevGuardado => prevGuardado.filter((_, i) => i !== index));
              };

              return (
                <Form>
                  {tipoModal === "Visualitzar" ? (
                    <>
                      <div className="table-responsive">
                        <table className="table table-striped text-center align-middle">
                          <thead className="table-active border-bottom border-dark-subtle">
                            <tr>
                              <th scope="col" className="align-middle">Nom</th>
                              <th scope="col" className="align-middle">Producte</th>
                              <th scope="col" className="align-middle">Proveïdor</th>
                              <th scope="col" className="align-middle">Quantitat</th>
                              {lotOrSerial === "lot" && (
                                <>
                                  <th scope="col" className="align-middle">Data de produccio</th>
                                  <th scope="col" className="align-middle">Data de caducitat</th>
                                </>
                              )}
                              <th scope="col" className="align-middle">ID d&apos;ordre de linea de recepció</th>
                              <th scope="col" className="align-middle">Quantitat rebuda</th>
                            </tr>
                          </thead>
                          <tbody>
                            {arrayVisualitzar.length === 0 ? (
                              <tr>
                                <td colSpan="10" className="text-center">
                                  No hay lotes disponibles.
                                </td>
                              </tr>
                            ) : (
                              arrayVisualitzar.map((lot, index) => (
                                <tr key={`lot-${index}`}>
                                  <td data-cell="Nom">
                                    {/* <span className='fw-bold'>Nom: </span> */}
                                    {lot.name}
                                  </td>
                                  <td data-cell="Producte">
                                    {/* <span className='fw-bold'>Producte: </span> */}
                                    {products.find((product) => product.id === lot.product_id)?.name || '-'}
                                  </td>
                                  <td data-cell="Proveïdor">
                                    {/* <span className='fw-bold'>Proveïdor: </span> */}
                                    {suppliers.find((supplier) => supplier.id === lot.supplier_id)?.name || '-'}
                                  </td>
                                  <td data-cell="Quantitat">
                                    {/* <span className='fw-bold'>Quantitat: </span> */}
                                    {lot.quantity}
                                  </td>
                                  {lotOrSerial === "lot" && (
                                    <>
                                      <td data-cell="Data de produccio">
                                        {/* <span className='fw-bold'>Data de produccio: </span> */}
                                        {lot.production_date}
                                      </td>
                                      <td data-cell="Data de caducitat">
                                        {/* <span className='fw-bold'>Data de caducitat: </span> */}
                                        {lot.expiration_date}
                                      </td>
                                    </>
                                  )}
                                  <td data-cell="ID Ordre de linea de recepció">
                                    {/* <span className='fw-bold'>ID Ordre de linea de recepció: </span> */}
                                    {lot.orderlinereception_id}
                                  </td>
                                  <td data-cell="Quantitat total rebuda">
                                    {/* <span className='fw-bold'>Quantitat total rebuda: </span> */}
                                    {lot.quantity_ordered}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <>
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
                        <label htmlFor="quantity_ordered">Quantitat de la ordre</label>
                        <Field type="number" name="quantity_ordered" className="form-control" disabled />
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
                        </>
                      )}
                      {errorAgregar && <div className="text-danger mt-2">{errorAgregar}</div>}

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
                                <td data-no-colon="true" colSpan={lotOrSerial === "lot" ? 5 : 3}>No hi han registres</td>
                              </tr>
                            ) : (
                              guardado.map((guardar, index) => (
                                <tr key={index}>
                                  <td className='text-break' data-cell="Quantitat">{guardar.quantity}</td>
                                  <td className='text-break' data-cell="Nom">{guardar.name}</td>
                                  {lotOrSerial === "lot" && (
                                    <>
                                      <td className='text-break' data-cell="Data producció">{guardar.production_date}</td>
                                      <td className='text-break' data-cell="Data expiració">{guardar.expiration_date}</td>
                                    </>
                                  )}
                                  <td data-no-colon="true">
                                    <i className="bi bi-trash icono" onClick={() => handleDeleteRecord(index)} role='button'></i>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  {/* Botones */}
                  <div className="form-group d-flex justify-content-between mt-3">
                    <Button className='me-auto' variant="secondary" onClick={() => canviEstatModal()}>
                      Tancar
                    </Button>
                    {tipoModal === "Crear" && (
                      <>
                        <Button className="btn btn-secondary ps-2 me-2 text-white" onClick={() => { setGuardado([]); limpiarCampos(resetForm, lotOrSerial, setErrorAgregar); }}>
                          <i className="bi bi-trash px-1 text-white"></i>
                          Netejar
                        </Button>
                        <Button className="btn text-white orange-button" onClick={handleSave}>Gravar</Button>
                      </>
                    )}
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
  setLot: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  lotOrSerial: PropTypes.string.isRequired,
  canviEstatModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  valorsInicials: PropTypes.object.isRequired,
  setValorsInicials: PropTypes.func.isRequired,
  guardado: PropTypes.array.isRequired,
  setGuardado: PropTypes.func.isRequired,
  errorAgregar: PropTypes.string.isRequired,
  setErrorAgregar: PropTypes.func.isRequired,
  setLotYaCreados: PropTypes.func.isRequired,
  tipoModal: PropTypes.string.isRequired,
  suppliers: PropTypes.array.isRequired,
  arrayVisualitzar: PropTypes.array.isRequired,
  setArrayVisualitzar: PropTypes.func.isRequired,
};

export default LotsLotOSerie;
