import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import * as yup from 'yup'
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header'
import Filter from './OrdreEnviamentFIltres'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL;

const OrderShippingSchema = yup.object().shape({
  client_id: yup.string().required('Valor requerit'),
  shipping_date: yup.date().required('Data obligatoria'),
  ordershipping_status_id: yup.string().required('Valor requerit')
})

const OrderLineSchema = yup.object().shape({
  product_id: yup.string().required('Valor requerit'),
  quantity: yup.number().required('Valor requerit'),
})

function OrdresEnviament() {
  const [orders, setOrder] = useState([])
  const [status, setStatus] = useState([])
  const [orderLine, setOrderLine] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showModalVisualitza, setShowModalVisualitza] = useState(false)
  const [showModalEnviament, setShowModalEnviament] = useState(false)
  const [tipoModal, setTipoModal] = useState('Crear')
  const [valorsInicials, setValorsInicials] = useState({ client_id: '', shipping_date: '', ordershipping_status_id: '' })
  const [valorsLineInicials, setValorsLineInicials] = useState({ shipping_order_id: '', product_id: '', quantity: '', orderline_status_id: '' })
  const [clientes, setClientes] = useState([])
  const [carriers, setCarriers] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [arrayProductos, setArray] = useState([])
  const [productosEliminados, setArrayEliminados] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState([]);

  // Paginació
  const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

  // Obtindreels index. 
  useEffect(() => {
    const totalPages = Math.ceil(orders.length / elementsPaginacio);
    setTotalPages(totalPages);
    console.log(totalPages)
  }, [orders])

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Funciones para "anterior" y "siguiente"
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    const indexOfLastItem = currentPage * elementsPaginacio;
    const indexOfFirstItem = indexOfLastItem - elementsPaginacio;
    const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
    setOrderPage(currentItems)
  }, [currentPage, orders])

  useEffect(() => {
    axios.get(`${apiUrl}/ordershipping`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrder(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}/client`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        console.log(response)
        setClientes(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}/users`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setUsers(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}/product`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setProducts(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}/ordershipping_status`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setStatus(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}/carrier`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setCarriers(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )
  }, [valorsLineInicials])

  const crearOrdre = () => {
    setTipoModal('Crear')
    canviEstatModal()
  }

  const modificarOrdre = async (valors) => {
    setTipoModal('Modificar');
    canviEstatModal();
    const fechaFormateada = formateaFecha(valors.shipping_date);
    setValorsInicials({ ...valors, shipping_date: fechaFormateada });
    axios.get(`${apiUrl}/orderlineshipping/order/${valors.id}`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrderLine(response.data)
        setValorsLineInicials(response.data);
        setArray(response.data);
      })
      .catch(e => {
        console.log(e)
      }
      )
  };

  const ordrePreparada = async (valors) => {
    setTipoModal("Preparada");
    const fechaFormateada = formateaFecha(valors.shipping_date);
    setValorsInicials({ ...valors, shipping_date: fechaFormateada });
    axios.get(`${apiUrl}/orderlineshipping/order/${valors.id}`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrderLine(response.data)
        setValorsLineInicials(response.data);
        setArray(response.data);
      })
      .catch(e => {
        console.log(e)
      }
      )

    canviEstatModalVisualitza();
  }

  const visualitzarOrdre = async (valors) => {
    setTipoModal("Visualitzar");
    const fechaFormateada = formateaFecha(valors.shipping_date);
    setValorsInicials({ ...valors, shipping_date: fechaFormateada });
    axios.get(`${apiUrl}/orderlineshipping/order/${valors.id}`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrderLine(response.data)
        setValorsLineInicials(response.data);
        setArray(response.data);
      })
      .catch(e => {
        console.log(e)
      }
      )
    canviEstatModalVisualitza();
  }

  const enviarOrdre = async (valors) => {
    setTipoModal("Enviar");
    const fechaFormateada = formateaFecha(valors.shipping_date);
    setValorsInicials({ ...valors, shipping_date: fechaFormateada });
    axios.get(`${apiUrl}/orderlineshipping/order/${valors.id}`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrderLine(response.data)
        setValorsLineInicials(response.data);
        setArray(response.data);
      })
      .catch(e => {
        console.log(e)
      }
      )
    canviEstatModalEnviament();
  }

  const eliminarOrder = (id) => {
    axios.get(`${apiUrl}/orderlineshipping`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then((response) => {
        const responseData = response.data;
        const idOrderLine = responseData.id;
        responseData.map(orderLine => {
          if (id === orderLine.shipping_order_id) {
            axios.delete(`${apiUrl}/orderlineshipping/${orderLine.id}`, { headers: { "auth-token": localStorage.getItem("token") } })
          }
        })
        axios.delete(`${apiUrl}/ordershipping/${id}`, { headers: { "auth-token": localStorage.getItem("token") } })
          .then(() => {
            const newOrders = orders.filter(order => order.id !== id)
            setOrder(newOrders)
          })
      })
  }

  const eliminarProducte = (idProducto) => {
    const productoAEliminar = arrayProductos.find(producto => producto.product_id === idProducto);
    if (productoAEliminar) {
      setArrayEliminados(prevEliminados => [...prevEliminados, productoAEliminar.id]);
      setArray(prevProductos => prevProductos.filter(producto => producto.product_id !== idProducto));
    }
  };

  const afegirProducte = (producte) => {
    setArray(prevProductos => {
      const newArray = [...prevProductos, producte];
      return newArray;
    });
  }

  const clientExistent = (id) => {
    const existe = clientes.find(client => client.id === id)
    if (existe) {
      return existe.name
    }
  }

  const estatExistent = (id) => {
    const existe = status.find(estat => estat.id === id)
    if (existe) {
      return existe.name
    }
  }

  const formateaFecha = (fecha) => {
    const fechaFormateada = fecha.split('T')[0];
    return fechaFormateada;
  }

  const producteExistent = (id) => {
    const existe = products.find(estat => estat.id === Number(id))
    if (existe) {
      return existe.name
    }
  }

  const canviEstatModal = () => {
    setShowModal(!showModal)
    setArray([])
  }

  const canviEstatModalVisualitza = () => {
    setShowModalVisualitza(!showModalVisualitza)
  }

  const canviEstatModalEnviament = () => {
    setShowModalEnviament(!showModalEnviament)
  }

  const grabar = (values) => {
    if (tipoModal === "Crear") {
      if (arrayProductos.length > 0) {
        axios.post(`${apiUrl}/ordershipping`, values, { headers: { "auth-token": localStorage.getItem("token") } })
          .then(response => {
            const resultat = response.data;
            arrayProductos.map(line => {
              const novaId = resultat.results.insertId
              line.shipping_order_id = novaId
              axios.post(`${apiUrl}/orderlineshipping`, line, { headers: { "auth-token": localStorage.getItem("token") } })
            })
          })
        canviEstatModal();
        actualitzaDades();
      }
      else {
        alert("Has d'afegir un producte a la ordre")
        return
      }
    }
    else if (tipoModal === "Modificar") {
      for (const idOrderLine of productosEliminados) {
        axios.delete(`${apiUrl}/orderlineshipping/${idOrderLine}`, { headers: { "auth-token": localStorage.getItem("token") } });
      }
      axios.put(`${apiUrl}/ordershipping/${values.id}`, values, { headers: { "auth-token": localStorage.getItem("token") } })
        .then(response => {
          arrayProductos.map(line => {
            if (line.id) {
              axios.put(`${apiUrl}/orderlineshipping/${line.id}`, line, { headers: { "auth-token": localStorage.getItem("token") } })
            }
            else {
              const newProduct = { ...line, shipping_order_id: values.id };
              axios.post(`${apiUrl}/orderlineshipping`, newProduct, { headers: { "auth-token": localStorage.getItem("token") } });
            }
          })
        })
      canviEstatModal();
      actualitzaDades();
    }
    else if (tipoModal === "Enviar") {
      values.ordershipping_status_id = 4;
      axios.put(`${apiUrl}/ordershipping/${values.id}`, values, { headers: { "auth-token": localStorage.getItem("token") } })
      canviEstatModalEnviament();
      actualitzaDades();
    }
    else if (tipoModal === "Preparada") {
      console.log(values)
      values.ordershipping_status_id = 3;
      axios.put(`${apiUrl}/ordershipping/${values.id}`, values, { headers: { "auth-token": localStorage.getItem("token") } })
      canviEstatModalVisualitza();
      actualitzaDades();
    }
    actualitzaDades();
    setArray([]);
  }

  const actualitzaDades = () => {
    axios.get(`${apiUrl}/ordershipping`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrder(response.data)
      })
  }

  const actualitzaFiltres = async (clients, identificador, estats, dataMinima, dataMaxima) => {
    let ordersFiltradas = orders;
    ordersFiltradas = ordersFiltradas.filter((order) => {
      const matchesClient = clients ? parseInt(order.client_id) === parseInt(clients) : true;
      const matchesId = identificador ? parseInt(order.id) === parseInt(identificador) : true;
      const matchesStatus = estats ? parseInt(order.ordershipping_status_id) === parseInt(estats) : true;
      console.log(dataMinima)
      console.log(order)
      const orderDate = new Date(order.shipping_date);
      console.log(orderDate)
      const matchesDateMin = dataMinima ? new Date(dataMinima) <= orderDate : true;
      const matchesDateMax = dataMaxima ? new Date(dataMaxima) >= orderDate : true;
      setCurrentPage(1)

      return matchesClient && matchesId && matchesStatus && matchesDateMin && matchesDateMax;
    });
    setOrder(ordersFiltradas);
  }

  const netejaFiltres = () => {
    actualitzaDades();
    document.getElementById("client").value = "";
    document.getElementById("id").value = "";
    document.getElementById("status").value = "";
    document.getElementById("date_min").value = "";
    document.getElementById("date_max").value = "";
  }

  return (
    <>
      <Header title="Ordres d'Enviament" />
      <Filter onFilterChange={actualitzaFiltres} onFilterRestart={netejaFiltres} />
      <div class="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div class="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div class="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div class="form-floating bg-white">
              <select class="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                <option selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label for="floatingSelect">Accions en lot</label>
            </div>
            <button class="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button"><i class="bi bi-check-circle text-white px-1"></i>Aplicar</button>
          </div>
        </div>
        <div class="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div class="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div class="d-flex h-100 justify-content-xl-end">
            <button type="button" onClick={() => crearOrdre()} class="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"><i class="bi bi-plus-circle text-white pe-1"></i>Crear</button>
          </div>
        </div>
      </div>
      <div className='container-fluid'>
        <table className='table table-striped border m-2'>
          <thead class="table-active border-bottom border-dark-subtle">
            <tr>
              <th scope='col' class="text-center"><input class="form-check-input" type="checkbox" name="" id="" /></th>
              <th scope='col' className='text-center'>ID</th>
              <th scope='col' className='text-center'>Client</th>
              <th scope='col' className='text-center'>Data Estimada</th>
              <th scope='col' className='text-center'>Estat</th>
              <th scope='col' className='text-center'>Accions</th>
            </tr>
          </thead>
          <tbody>
            {orderPage.map((valors) => (
              <tr key={valors.id}>
                <td scope="row" data-cell="Seleccionar" className='text-center'>
                  <input class="form-check-input" type="checkbox" name="" id="" />
                </td>
                <td data-cell="ID" className='text-center'>{valors.id}</td>
                <td data-cell="Client" className='text-center'>{clientExistent(valors.client_id)}</td>
                <td data-cell="Data Estimada" className='text-center'>{formateaFecha(valors.shipping_date)}</td>
                <td data-cell="Estat" className='text-center'>{estatExistent(valors.ordershipping_status_id)}</td>
                <td data-no-colon="true" className='text-center'>
                  <div className="d-lg-flex justify-content-lg-center">
                    <span onClick={() => visualitzarOrdre(valors)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-eye icono fs-5"></i>
                    </span>
                    {estatExistent(valors.ordershipping_status_id) === "Pendent" && (
                      <>
                        <span onClick={() => modificarOrdre(valors)} className="mx-2" style={{ cursor: "pointer" }}>
                          <i className="bi bi-pencil-square icono fs-5"></i>
                        </span>

                        <span onClick={() => eliminarOrder(valors.id)} style={{ cursor: "pointer" }}>
                          <i className="bi bi-trash icono fs-5"></i>
                        </span>
                      </>
                    )}
                    {estatExistent(valors.ordershipping_status_id) === "Preparant-se" && (
                      <>
                        <span onClick={() => ordrePreparada(valors)} className="mx-2" style={{ cursor: "pointer" }}>
                          <i class="bi bi-check fs-5"></i>
                        </span>
                      </>
                    )}
                    {estatExistent(valors.ordershipping_status_id) === "Preparada" && (
                      <>
                        <span onClick={() => enviarOrdre(valors)} className="mx-2" style={{ cursor: "pointer" }}>
                          <i class="bi bi-send icono fs-5"></i>
                        </span>
                      </>
                    )}


                  </div>
                </td>
              </tr>
            ))}
            {orderPage.length <= 0 && (
              <tr>No se encontraron órdenes.</tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (      
        <nav aria-label="Page navigation example" className="d-block">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}>
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <li key={number} className={`page-item ${currentPage === number ? 'activo-2' : ''}`}>
                <a className="page-link text-light-blue" href="#" onClick={(e) => { e.preventDefault(); paginate(number); }}>
                  {number}
                </a>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={(e) => { e.preventDefault(); goToNextPage(); }}>
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
        )}
      </div>

      <Modal show={showModal} >
        <Modal.Header closeButton onHide={canviEstatModal} className='bg-gray-200 border-b'>
          <Modal.Title className='text-lg font-semibold text-gray-800'>{tipoModal} Ordre Enviament</Modal.Title>
        </Modal.Header>

        <Modal.Body className='p-4 bg-white rounded-lg shadow-md'>
          <Formik
            initialValues={(tipoModal === 'Modificar' ? valorsInicials : {
              client_id: '',
              shipping_date: '',
              ordershipping_status_id: 1
            })}
            validationSchema={OrderShippingSchema}
            onSubmit={values => {
              grabar(values)
            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit
            }) => (
              <Form>
                <div>

                  <Button className='mb-4' variant={tipoModal === "Crear" ? "btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0" : "info"} type='submit'>
                    {tipoModal === "Crear" && (
                      <i className="bi bi-plus-circle text-white pe-1"></i>
                    )}
                    {tipoModal === "Modificar" && (
                      <i className="bi bi-pencil-square icono pe-1"></i>
                    )}

                    {tipoModal}
                  </Button>

                </div>

                <div className='form-group pb-3'>
                  <label htmlFor='client_id'>Client</label>
                  <Field as="select" name="client_id" values={values.client_id} className="form-control">
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    })}
                  </Field>
                  {errors.client_id && touched.client_id ? <div className="text-red-500 text-sm">{errors.client_id}</div> : null}
                </div>

                <div className='form-group'>
                  <label htmlFor='shipping_date'>Data estimada</label>
                  <Field type="date" name="shipping_date" values={values.shipping_date} className="form-control" />
                  {errors.shipping_date && touched.shipping_date ? <div>{errors.shipping_date}</div> : null}
                </div>
              </Form>
            )}
          </Formik>

          <Formik
            enableReinitialize={true}
            initialValues={{
              product_id: valorsLineInicials?.product_id || '',
              quantity: valorsLineInicials?.quantity || '',
              orderline_status_id: valorsLineInicials?.orderline_status_id || 1
            }}
            validationSchema={OrderLineSchema}
            onSubmit={(values, { resetForm }) => {
              afegirProducte({
                product_id: values.product_id,
                quantity: values.quantity,
                orderline_status_id: 1,
              });
              resetForm();
            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit
            }) => (
              <Form>
                <h4>Afegeix productes a la ordre:</h4>
                <div className='form-group'>
                  <label htmlFor='product_id'>Producte</label>
                  <Field as="select" name="product_id" className="form-control">
                    <option value="">Selecciona un producte</option>
                    {products.map(product => {
                      return <option key={product.id} value={product.id}>{product.name}</option>
                    })}
                  </Field>
                  {errors.product_id && touched.product_id ? <div>{errors.product_id}</div> : null}
                </div>

                <div className='form-group'>
                  <label htmlFor='quantity'>Quantitat</label>
                  <Field
                    type="text"
                    name="quantity"
                    placeholder="Quantitat del producte"
                    value={values.quantity}
                    className="form-control"
                  >
                  </Field>
                  {errors.quantity && touched.quantity ? <div>{errors.quantity}</div> : null}
                </div>

                <div className='mt-3'>
                  <table class="table table-striped text-center">
                    <thead className="table-active border-bottom border-dark-subtle">
                      <tr>
                        <th>Producte</th>
                        <th>Quantitat</th>
                        <th>Accions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrayProductos.map((producto) => (
                        <tr key={producto.product_id}>
                          <td>{producteExistent(producto.product_id)}</td>
                          <td>{producto.quantity}</td>
                          <td>
                            <Button
                              variant="outline-secondary"
                              onClick={() => {
                                eliminarProducte(producto.product_id);
                              }}
                            >
                              <i className="bi bi-trash p-2"></i>
                            </Button>
                          </td>
                        </tr>

                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <Button variant="primary" type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    Afegir
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      <Modal show={showModalVisualitza}>
        <Modal.Header closeButton onHide={canviEstatModalVisualitza} className='bg-gray-200 border-b'>
          <Modal.Title className='text-lg font-semibold text-gray-800'>{tipoModal} Ordre Enviament</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={(tipoModal === 'Visualitzar' || "Preparada" ? valorsInicials : {
              client_id: '',
              shipping_date: '',
              ordershipping_status_id: 1
            })}
            validationSchema={OrderShippingSchema}
            onSubmit={values => {
              console.log(values)
              grabar(values)
            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit
            }) => (
              <Form>
                <div>
                  {tipoModal === "Preparada" && (
                    <button type='submit' className='btn btn-secondary'>Preparada</button>
                  )}
                </div>
                <div className='form-group'>
                  <label htmlFor='client_id'>Client</label>
                  <Field as="select" name="client_id" values={values.client_id} className="form-control" disabled>
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    })}
                  </Field>
                  {errors.client_id && touched.client_id ? <div>{errors.client_id}</div> : null}
                </div>

                <div className='form-group'>
                  <label htmlFor='shipping_date'>Data estimada</label>
                  <Field type="date" name="shipping_date" values={values.shipping_date} className="form-control" disabled />
                  {errors.shipping_date && touched.shipping_date ? <div>{errors.shipping_date}</div> : null}
                </div>

                <div className='mt-3'>
                  <table class="table table-striped text-center">
                    <thead className="table-active border-bottom border-dark-subtle">
                      <tr>
                        <th>Producte</th>
                        <th>Quantitat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrayProductos.map((producto) => (
                        <tr key={producto.product_id}>
                          <td>{producteExistent(producto.product_id)}</td>
                          <td>{producto.quantity}</td>
                        </tr>

                      ))}
                    </tbody>
                  </table>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal show={showModalEnviament}>
        <Modal.Header closeButton onHide={canviEstatModalEnviament} className='bg-gray-200 border-b'>
          <Modal.Title className='text-lg font-semibold text-gray-800'>{tipoModal} Ordre Enviament</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={(tipoModal === 'Enviar' ? valorsInicials : {
              client_id: '',
              shipping_date: '',
              ordershipping_status_id: 1
            })}
            validationSchema={OrderShippingSchema}
            onSubmit={values => {
              grabar(values)
            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit
            }) => (
              <Form>
                <div>
                  <Button className='mb-4' variant={"info"} type='submit'>{tipoModal}</Button>
                </div>
                <div className='form-group'>
                  <label htmlFor='client_id'>Client</label>
                  <Field as="select" name="client_id" values={values.client_id} className="form-control" disabled>
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    })}
                  </Field>
                  {errors.client_id && touched.client_id ? <div>{errors.client_id}</div> : null}
                </div>

                <div className='form-group'>
                  <label htmlFor='shipping_date'>Data estimada</label>
                  <Field type="date" name="shipping_date" values={values.shipping_date} className="form-control" disabled />
                  {errors.shipping_date && touched.shipping_date ? <div>{errors.shipping_date}</div> : null}
                </div>

                <div className='form-group'>
                  <label htmlFor='carrier_id'>Transportista</label>
                  <Field as="select" name="carrier_id" values={values.client_id} className="form-control">
                    <option value="">Selecciona un transportista:</option>
                    {carriers.map(carrier => {
                      return <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                    })}
                  </Field>
                  {errors.carrier_id && touched.carrier_id ? <div>{errors.carrier_id}</div> : null}
                </div>

                <div className='mt-3'>
                  <table class="table table-striped text-center">
                    <thead className="table-active border-bottom border-dark-subtle">
                      <tr>
                        <th>Producte</th>
                        <th>Quantitat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrayProductos.map((producto) => (
                        <tr key={producto.product_id}>
                          <td>{producteExistent(producto.product_id)}</td>
                          <td>{producto.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default OrdresEnviament
