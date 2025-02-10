import { Field, useFormikContext } from 'formik';
import PropTypes from 'prop-types';


import { useState, useEffect } from "react";


function LotsLotOSerie({ products, nombre, lotOSerie, orderreception, suppliers }) {
  const [lotes, setLotes] = useState([]);
  const [series, setSeries] = useState([]);
  const [errorAgregar, setErrorAgregar] = useState("");

  const { values, errors, touched } = useFormikContext();
  const records = lotOSerie === "Lot" ? lotes : series;

  useEffect(() => {
    const storedLotes = JSON.parse(localStorage.getItem("lotsTemporal")) || [];
    const storedSeries = JSON.parse(localStorage.getItem("serieTemporal")) || [];
    setLotes(storedLotes);
    setSeries(storedSeries);
  }, []);

  const handleAddRecord = () => {
    if (!values.name ||
      !values.quantity ||
      lotOSerie === "Lot" && (
        !values.production_date ||
        !values.expiration_date)) {
      setErrorAgregar("Debes llenar todos los campos");
      return;
    }
    const orderReception = orderreception.find(
      (or) => or.id === values.order_reception_id
    );


    const supplierId = orderReception ? orderReception.supplier_id : "";
    const supplierRecord = suppliers.find((s) => s.id === supplierId);

    const newRecord = {
      name: values.name,
      product_id: values.product_id,
      supplier_id: supplierRecord ? supplierRecord.id : "", // asignado automáticamente
      quantity: lotOSerie === "Serie" ? 1 : values.quantity_received,
      production_date: lotOSerie === "Lot" ? values.production_date : "",
      expiration_date: lotOSerie === "Lot" ? values.expiration_date : "",
      orderlinereception_id: values.id, // asignado automáticamente
    };

    if (lotOSerie === "Lot") {
      const updatedLotes = [...lotes, newRecord];
      localStorage.setItem("lotsTemporal", JSON.stringify(updatedLotes));
      setLotes(updatedLotes);
    } else if (lotOSerie === "Serie") {
      const updatedSeries = [...series, newRecord];
      localStorage.setItem("serieTemporal", JSON.stringify(updatedSeries));
      setSeries(updatedSeries);
    }
  };

  return (
    <>
      {/* Producte */}
      <div className="form-group">
        <label htmlFor="product_id">Producte</label>
        <Field as="select" name="product_id" className="form-control" disabled>
          <option value="">Selecciona un producte</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Field>
        {/* {errors.product_id && touched.product_id && (
          <div className="text-danger mt-1">{errors.product_id}</div>
        )} */}
      </div>

      {/* Quantitat */}
      <div className="form-group">
        <label htmlFor="quantity_received">Quantitat de la ordre</label>
        <Field
          type="number"
          name="quantity_received"
          placeholder="Quantitat del lot"
          className="form-control"
          disabled
        />
        {/* {errors.quantity_received && touched.quantity_received && (
          <div className="text-danger mt-1">{errors.quantity_received}</div>
        )} */}
      </div>

      {/* Inputs para lot o serie */}
      <div className="form-group d-flex mt-3">
        <div>
          <div className="text-center fs-4">
            <label className="text-capitalize" htmlFor={nombre}>{nombre}</label>
          </div>
          <div className="input-group flex-nowrap">
            <Field
              type="number"
              name="quantity"
              className="form-control w-25"
              disabled={lotOSerie === "Serie"}
            />
            {errors.quantity && touched.quantity && (
              <div className="text-danger mt-1">{errors.quantity}</div>
            )}
            <Field
              type="text"
              name="name"
              placeholder={nombre === "lot" ? `Nom del ${nombre}` : `Nom de la ${nombre}`}
              className="form-control w-100"
            />
            {errors.name && touched.name && (
              <div className="text-danger mt-1">{errors.name}</div>
            )}
            <button className="btn text-white orange-button" type="button" onClick={handleAddRecord}>
              <i
                className='bi bi-plus-circle'
              >
              </i>
            </button>
            {console.log(values)}
          </div>
        </div>
      </div>

      {/* Campos adicionales solo para "Lot" */}
      {lotOSerie === "Lot" && (
        <>
          <div className="form-group d-flex gap-2 mt-3">
            {/* Production Date */}
            <div className="w-100">
              <label htmlFor="production_date">Data de producció</label>
              <Field
                type="date"
                name="production_date"
                className="form-control"
              />
              {errors.production_date && touched.production_date && (
                <div className="text-danger mt-1">{errors.production_date}</div>
              )}
            </div>
            {/* Expiration Date */}
            <div className="w-100">
              <label htmlFor="expiration_date">Data d&apos;expiració</label>
              <Field
                type="date"
                name="expiration_date"
                className="form-control"
              />
              {errors.expiration_date && touched.expiration_date && (
                <div className="text-danger mt-1">{errors.expiration_date}</div>
              )}
            </div>
          </div>
          {errorAgregar && <div className="text-danger mt-2">{errorAgregar}</div>}
        </>
      )}

      <div className='mt-4'>
        <table className="table table-striped text-center align-middle">
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th scope='col' className="align-middle">Quantitat</th>
              <th scope='col' className="align-middle">Nom</th>
              {lotOSerie === "Lot" && (
                <>
                  <th scope='col' className="align-middle">Fecha de producció</th>
                  <th scope='col' className="align-middle">Fecha de expiració</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={lotOSerie === "Lot" ? 4 : 2}>No hi han registres</td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={index}>
                  <td>{record.quantity}</td>
                  <td>{record.name}</td>
                  {lotOSerie === "Lot" && (
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
    </>
  );
}

LotsLotOSerie.propTypes = {
  products: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  nombre: PropTypes.string.isRequired,
  lotOSerie: PropTypes.string.isRequired,
};

export default LotsLotOSerie;
