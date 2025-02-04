import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import axios from "axios";

/* LOTS */
function LotsLotOSerie({ products, errors, touched, nombre }) {
  return (
    <>
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

      <div className="form-group d-flex mt-3">
        <div>
          <div className='text-center fs-4'>
            <label htmlFor={nombre}>Lot</label>
          </div>
          <div className="input-group flex-nowrap">
            <Field
              type="number"
              name={`${nombre}"_quantity`}
              className="form-control w-25"
            />

            <Field
              type="text"
              name={`${nombre}"_name`}
              placeholder={nombre === "lot" ? `Nom del ${nombre}` : `Nom de la ${nombre}`}
              className="form-control w-100"
            />
          </div>
        </div>
      </div>
      <div className="form-group d-flex gap-2">
        {/* Production Date */}
        <div className='w-100'>
          <label htmlFor="production_date">Data de producció</label>
          <Field
            type="date"
            name="production_date"
            className="form-control"
          />
          {errors.production_date && touched.production_date && <div className="text-danger mt-1">{errors.production_date}</div>}
        </div>
        {/* Expiration Date */}

        <div className='w-100'>
          <label htmlFor="expiration_date">Data d&apos;expiració</label>
          <Field
            type="date"
            name="expiration_date"
            className="form-control"
          />
          {errors.expiration_date && touched.expiration_date && <div className="text-danger mt-1">{errors.expiration_date}</div>}
        </div>




      </div>
    </>
  );
}

export default LotsLotOSerie