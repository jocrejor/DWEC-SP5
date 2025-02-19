import { useState, useEffect } from 'react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
import PropTypes from 'prop-types';

function Filtres({ onFilterChange, onFilterRestart }) {
  const [suppliers, setSuppliers] = useState([]);
//   const [statuses, setStatuses] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Carregar proveïdors
    axios.get(`${apiUrl}/Supplier`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => setSuppliers(response.data))
      .catch(e => console.log(e));

    // Carregar estat de l'ordre de línia de recepció
    // axios.get(`${apiUrl}orderline_status`, { headers: { "auth-token": localStorage.getItem("token") } })
    //   .then(response => setStatuses(response.data))
    //   .catch(e => console.log(e));

    // Carregar productes
    axios.get(`${apiUrl}/Product`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => setProducts(response.data))
      .catch(e => console.log(e));
  }, []);

  const filtrar = () => {
    const supplierValue = document.getElementById('supplier').value;
    // const statusValue = document.getElementById('status').value;
    const productValue = document.getElementById('product').value;
    const quantityValue = document.getElementById('quantity').value;
    onFilterChange(supplierValue, productValue, quantityValue);
  };

  const netejaFiltre = () => {
    onFilterRestart();
    // Reinicia els camps del filtre (opcional)
    document.getElementById("supplier").value = "";
    // document.getElementById("status").value = "";
    document.getElementById("product").value = "";
    document.getElementById("quantity").value = "";
  };

  return (
    <>
      <div className="row bg-grey pt-3 px-2 mx-0">
        {/* Proveïdor */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="supplier" className="form-label">Proveïdor</label>
            <select className="form-control" id="supplier">
              <option value="">Selecciona un proveïdor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Estat ordre de línia de recepció */}
        {/* <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="status" className="form-label">Estat ordre de línia de recepció</label>
            <select className="form-control" id="status">
              <option value="">Selecciona un estat</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div> */}
        {/* Producte */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="product" className="form-label">Producte</label>
            <select className="form-control" id="product">
              <option value="">Selecciona un producte</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Quantitat */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="quantity" className="form-label">Quantitat</label>
            <input type="number" className="form-control" id="quantity" placeholder="Ex: 10" />
          </div>
        </div>
      </div>

      <div className="row bg-grey pb-3 mx-0">
        <div className="col-12 col-xl-4 offset-xl-8 text-end">
          <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejaFiltre}>
            <i className="bi bi-trash px-1 text-white"></i> Netejar
          </button>
          <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={filtrar}>
            <i className="bi bi-funnel px-1 text-white"></i> Filtrar
          </button>
        </div>
      </div>
    </>
  );
}

Filtres.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    onFilterRestart: PropTypes.func.isRequired,
};


export default Filtres;
