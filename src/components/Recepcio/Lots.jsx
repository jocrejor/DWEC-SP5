import { useState, useEffect } from 'react';
import axios from "axios";
import Header from '../Header';
import Filtres from '../OrdreLiniesRecepcioFiltres';
import LotsLotOSerie from './LotsLotOSerie';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

/* LOTS */
function Lots() {
  const [lots, setLot] = useState([]);
  const [products, setProduct] = useState([]);
  const [suppliers, setSupplier] = useState([]);
  const [orderreception, setOrderReception] = useState([]);
  const [orderreception_status, setOrderReceptionStatus] = useState([]);
  const [orderline_status, setOrderLineStatus] = useState([]);
  const [orderlinereception, setOrderLineReception] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear')
  const [valorsInicials, setValorsInicials] = useState({
    name: '',
    product_id: '',
    supplier_id: '',
    quantity: 0,
    production_date: '',
    expiration_date: '',
    orderlinereception: '',
    /* sirve para pasar la cantidad total de la orden al modal,
    * esta informacion no se añadirá a la base de datos */
    quantity_ordered: 0,
  });
  //estado que determina si un producto será serie o lote
  const [lotOrSerial, setLotOrSerial] = useState("");
  const [guardado, setGuardado] = useState([]);
  const [errorAgregar, setErrorAgregar] = useState("");
  const [lotYaCreados, setLotYaCreados] = useState([]);
  const [filteredOrderLineReception, setFilteredOrderLineReception] = useState([]);   // filtros
  // array para guardar los lotes para visualizar
  const [arrayVisualitzar, setArrayVisualitzar] = useState([]);

  /**
   * estados de la paginacion
   */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // número de ordenes por página

  // Calcular el total de páginas en base a los datos filtrados (o totales si prefieres)
  const totalPages = Math.ceil(filteredOrderLineReception.length / itemsPerPage);

  // Configuración para mostrar un bloque de páginas
  const pagesToShow = 3;
  const currentBlock = Math.floor((currentPage - 1) / pagesToShow);
  const blockStart = currentBlock * pagesToShow + 1;
  const blockEnd = Math.min(totalPages, (currentBlock + 1) * pagesToShow);

  useEffect(() => {
    const fetchData = async () => {
      axios.get(`${apiUrl}/lot`, { headers: { "auth-token": token } })
        .then(
          response => {
            setLot(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}/Product`, { headers: { "auth-token": token } })
        .then(
          response => {
            setProduct(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}/Supplier`, { headers: { "auth-token": token } })
        .then(
          response => {
            setSupplier(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}/OrderReception`, { headers: { "auth-token": token } })
        .then(response => {
          setOrderReception(response.data)
        })
        .catch(error => {
          console.log(error)
        }
        )

      axios.get(`${apiUrl}/orderlinereception`, { headers: { "auth-token": token } })
        .then(
          response => {
            setOrderLineReception(response.data)
            setFilteredOrderLineReception(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}/orderreception_status`, { headers: { "auth-token": token } })
        .then(
          response => {
            setOrderReceptionStatus(response.data)
          })
        .catch(
          error => {
            console.log(error)
          }
        )

      axios.get(`${apiUrl}/orderline_status`, { headers: { "auth-token": token } })
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

  const canviEstatModal = () => {
    setGuardado([]);
    setErrorAgregar("");
    setShowModal(!showModal);
  };

  const hayLotOSerie = (valors) =>
    lots.some((lot) => lot.orderlinereception_id === valors.id);

  const hayLotOSerie2 = (valors) =>
    lotYaCreados.includes(valors.id);

  const actualitzaFiltres = (supplierValue, productValue, quantityValue) => {
    let filtered = orderlinereception; // datos originales
    if (supplierValue) {
      filtered = filtered.filter(valors => {
        const orderRec = orderreception.find(or => or.id === valors.order_reception_id);
        return orderRec && parseInt(orderRec.supplier_id) === parseInt(supplierValue);
      });
    }
    if (productValue) {
      filtered = filtered.filter(valors => parseInt(valors.product_id) === parseInt(productValue));
    }
    if (quantityValue) {
      filtered = filtered.filter(valors => parseInt(valors.quantity_ordered) === parseInt(quantityValue));
    }

    setFilteredOrderLineReception(filtered);
  };

  const netejaFiltres = () => {
    setFilteredOrderLineReception(orderlinereception);
  };

  /**
   * funciones de la paginacion 
   */
  const prevBlock = (e) => {
    e.preventDefault();
    if (currentBlock > 0) {
      setCurrentPage((currentBlock - 1) * pagesToShow + 1);
    }
  };

  const nextBlock = (e) => {
    e.preventDefault();
    if (blockEnd < totalPages) {
      setCurrentPage((currentBlock + 1) * pagesToShow + 1);
    }
  };

  return (
    <>
      <Header title="Llistat Lots" />
      <Filtres onFilterChange={actualitzaFiltres} onFilterRestart={netejaFiltres} />

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
          <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2"></div>
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
                    <th scope='col' className="align-middle">Proveïdor</th>
                    <th scope='col' className="align-middle">Estat ordre línia de recepció</th>
                    <th scope='col' className="align-middle">Estat ordre de recepció</th>
                    <th scope='col' className="align-middle">Producte</th>
                    <th scope='col' className="align-middle">Quantitat</th>
                    <th scope='col' className="align-middle">Accions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderLineReception.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No hi han linies d&apos;ordre de recepció
                      </td>
                    </tr>
                  ) : (
                    filteredOrderLineReception
                      // filtra por orderlinestatus
                      .filter((valors) => valors.orderline_status_id === 1)
                      // filtra por orderreception_status_id
                      .filter((valors) => {
                        const orderRec = orderreception.find(
                          (or) => or.id === valors.order_reception_id
                        );
                        return orderRec && orderRec.orderreception_status_id === 2;
                      })
                      .map((valors) => (
                        <tr key={`filteredOrderLineReception-${valors.id}`}>
                          <td scope='row' data-cell="Seleccionar">
                            <input className='form-check-input' type="checkbox" />
                          </td>

                          <td data-cell="ID">{valors.id}</td>

                          <td data-cell="Proveïdor">
                            {(() => {
                              const orderReceptions = orderreception.find(
                                (or) => or.id === valors.order_reception_id
                              );
                              const supplier = suppliers.find((s) => s.id === orderReceptions?.supplier_id);
                              return supplier ? supplier.name : "Proveïdor no trobat";
                            })()}
                          </td>

                          <td data-cell="Estat ordre línia de recepció">
                            {orderline_status.find((status) => status.id === valors.orderline_status_id)?.name || "Estat no trobat"}
                          </td>

                          <td data-cell="Estat ordre de recepció">
                            {(() => {
                              const orderRec = orderreception.find(or => or.id === valors.order_reception_id);
                              if (orderRec) {
                                const status = orderreception_status.find(s => s.id === orderRec.orderreception_status_id);
                                return status ? status.name : "Estat no trobat";
                              }
                              return "Orden no trobada";
                            })()}
                          </td>

                          <td data-cell="Producte">
                            {products.find((product) => product.id === valors.product_id)?.name || "Desconegut"}
                          </td>

                          <td data-cell="Quantitat rebuda">
                            {valors.quantity_ordered}
                          </td>

                          <td data-no-colon="true">
                            <div className="d-lg-flex justify-content-lg-center gap-3">
                              {(hayLotOSerie(valors) || hayLotOSerie2(valors)) ? (
                                <i className="bi bi-eye icono"
                                  role='button'
                                  onClick={() => {
                                    console.log(`Visualitzar ${valors.id}`);

                                    const selectedProduct = products.find(p => p.id === valors.product_id);
                                    const lotOSerie = selectedProduct ? selectedProduct.lotorserial : null;

                                    if (lotOSerie === "Lot") {
                                      setLotOrSerial("lot");
                                    }
                                    else if (lotOSerie === "Serial") {
                                      setLotOrSerial("serie");
                                    }

                                    canviEstatModal();
                                    setTipoModal("Visualitzar");

                                    const filteredLots = lots.filter((lot) => lot.orderlinereception_id === valors.id);

                                    console.log("Lotes filtrados: ", filteredLots);

                                    const transformedLots = filteredLots.map((lot) => ({
                                      name: lot.name,
                                      product_id: lot.product_id,
                                      supplier_id: lot.supplier_id,
                                      quantity: lot.quantity,
                                      production_date: lot.production_date.split("T")[0],
                                      expiration_date: lot.expiration_date.split("T")[0],
                                      orderlinereception_id: lot.orderlinereception_id,
                                      quantity_ordered: valors.quantity_ordered, // suponiendo que este dato se mantiene igual para todos
                                    }));

                                    console.log("Todos los lotes: ", transformedLots);

                                    setArrayVisualitzar(transformedLots);
                                  }}
                                >
                                </i>
                              ) : (
                                <i className="bi bi-plus-circle icono"
                                  role='button'
                                  onClick={() => {
                                    console.log("Lot ya creados: ", lotYaCreados)

                                    const selectedProduct = products.find(p => p.id === valors.product_id);
                                    const lotOSerie = selectedProduct ? selectedProduct.lotorserial : null;

                                    if (lotOSerie === "Lot") {
                                      setLotOrSerial("lot");
                                    }
                                    else if (lotOSerie === "Serial") {
                                      setLotOrSerial("serie");
                                    }

                                    canviEstatModal();
                                    setTipoModal("Crear");

                                    const orderReceptions = orderreception.find(
                                      (or) => or.id === valors.order_reception_id
                                    );
                                    const supplier = suppliers.find((s) => s.id === orderReceptions?.supplier_id);

                                    setValorsInicials({
                                      name: "",
                                      product_id: valors.product_id,
                                      supplier_id: supplier ? supplier.id : "",
                                      quantity: lotOSerie === "Serial" ? 1 : "",
                                      production_date: "",
                                      expiration_date: "",
                                      orderlinereception_id: valors.id,
                                      //cantidad total de la orden de linea de recepcion
                                      quantity_ordered: valors.quantity_ordered,
                                    });
                                  }}
                                >
                                </i>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
              {/* <nav aria-label="Page navigation example" className="d-block">
                <ul className="pagination justify-content-center">
                  <li className="page-item">
                    <a className="page-link text-light-blue" href="#" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li className="page-item"><a className="page-link activo-2" href="#">1</a></li>
                  <li className="page-item">
                    <a className="page-link text-light-blue" href="#" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav> */}
              {totalPages > 0 && (
                <nav aria-label="Page navigation example" className="d-block">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentBlock === 0 ? 'disabled' : ''}`}>
                      <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={prevBlock}>
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>
                    {Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i).map((page) => (
                      <li key={page} className="page-item">
                        <a
                          className={`page-link ${currentPage === page ? 'activo-2' : 'text-light-blue'}`}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </a>
                      </li>
                    ))}
                    <li className={`page-item ${blockEnd === totalPages ? 'disabled' : ''}`}>
                      <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={nextBlock}>
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* MODAL CON FORMIK */}
      <LotsLotOSerie setLot={setLot} products={products} canviEstatModal={canviEstatModal} showModal={showModal} valorsInicials={valorsInicials} setValorsInicials={setValorsInicials} lotOrSerial={lotOrSerial} guardado={guardado} setGuardado={setGuardado} errorAgregar={errorAgregar} setErrorAgregar={setErrorAgregar} setLotYaCreados={setLotYaCreados} tipoModal={tipoModal} suppliers={suppliers} arrayVisualitzar={arrayVisualitzar} setArrayVisualitzar={setArrayVisualitzar} />
    </>
  );
}

export default Lots