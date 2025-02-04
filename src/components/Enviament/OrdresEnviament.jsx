import { useState, useEffect } from 'react'
import { url, postData, getData, deleteData, updateId } from '../../apiAccess/crud'
import { Formik, Form, Field } from 'formik'
import * as yup from 'yup'
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header'
import Filter from '../FiltresOrdresEnviament'
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
  const [tipoModal, setTipoModal] = useState('Crear')
  const [valorsInicials, setValorsInicials] = useState({ client_id: '', shipping_date: '', ordershipping_status_id: '' })
  const [valorsLineInicials, setValorsLineInicials] = useState({ shipping_order_id: '', product_id: '', quantity: '', orderline_status_id: '' })
  const [clientes, setClientes] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [arrayProductos, setArray] = useState([])

  useEffect(() => {
    axios.get(`${apiUrl}ordershipping`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrder(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}client`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        console.log(response)
        setClientes(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )


    axios.get(`${apiUrl}users`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setUsers(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}product`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setProducts(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )

    axios.get(`${apiUrl}ordershipping_status`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setStatus(response.data)
      })
      .catch(e => {
        console.log(e)
      }
      )
  }, [])

  const crearOrdre = () => {
    setTipoModal('Crear')
    canviEstatModal()
  }

  const modificarOrdre = async (valors) => {
    setTipoModal('Modificar');
    canviEstatModal();
    console.log(valors);

    const fechaFormateada = formateaFecha(valors.shipping_date);
    setValorsInicials({ ...valors, shipping_date: fechaFormateada });

    const orderLinesData = await obtindreOrderLine(); // Espera los datos antes de filtrar

    const filteredOrders = orderLinesData.filter(order => order.shipping_order_id === valors.id);
    setOrderLine(filteredOrders);
    setValorsLineInicials(filteredOrders);

    console.log(filteredOrders);
    console.log(orderLine)
  };

  const eliminarOrder = (id) => {
    axios.get(`${apiUrl}orderlineshipping`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then((response) => {
        console.log(response);
        const responseData = response.data;
        console.log(responseData)
        const idOrderLine = responseData.id;
        console.log(idOrderLine);
        responseData.map(orderLine => {
          if (id === orderLine.shipping_order_id) {
            axios.delete(`${apiUrl}orderlineshipping/${orderLine.id}`, { headers: { "auth-token": localStorage.getItem("token") } })
          }
        })
        axios.delete(`${apiUrl}ordershipping/${id}`, { headers: { "auth-token": localStorage.getItem("token") } })
          .then(() => {
            const newOrders = orders.filter(order => order.id !== id)
            setOrder(newOrders)
          })
      })
  }

  const eliminarProducte = (id) => {
    setArray(prevProductos => prevProductos.filter(producto => producto.product_id !== id));
  }

  const afegirProducte = (producte) => {
    const array = [...arrayProductos]
    array.push(producte)
    setArray(array)
    console.log(arrayProductos)
  }

  const clientExistent = (id) => {
    const existe = clientes.find(client => client.id === id)
    if (existe) {
      return existe.name
    }
  }

  const estatExistent = (id) => {
    console.log(status)
    console.log(id)
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

  const visualitzarOrdre = (valors) => {
    setTipoModal("Visualitzar");
    const fechaFormateada = formateaFecha(valors.shipping_date);
    setValorsInicials({ ...valors, shipping_date: fechaFormateada });
    setValorsLineInicials(valors)
    canviEstatModalVisualitza();
  }

  const canviEstatModalVisualitza = () => {
    setShowModalVisualitza(!showModalVisualitza)
  }

  const grabar = (values) => {
    if (tipoModal === "Crear") {
      if (arrayProductos.length > 0) {
        axios.post(`${apiUrl}ordershipping`, values, { headers: { "auth-token": localStorage.getItem("token") } })
          .then(response => {
            const resultat = response.data;
            arrayProductos.map(line => {
              const novaId = resultat.results.insertId
              line.shipping_order_id = novaId

              console.log(novaId)
              console.log(line)
              axios.post(`${apiUrl}orderlineshipping`, line, { headers: { "auth-token": localStorage.getItem("token") } })
            })
          })
        actualitzaDades();
      }
      else {
        alert("Has d'afegir un producte a la ordre")
        return
      }
    }
    else {
      axios.put(`${apiUrl}ordershipping/${values.id}`, values, { headers: { "auth-token": localStorage.getItem("token") } })
      actualitzaDades();
    }
    actualitzaDades();
    canviEstatModal();
    setArray([]);
  }

  const actualitzaDades = () => {
    axios.get(`${apiUrl}ordershipping`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setOrder(response.data)
      })
  }

  const obtindreOrderLine = async () => {
    try {
      const response = await axios.get(`${apiUrl}orderlineshipping`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      return response.data; // Devolvemos los datos
    } catch (error) {
      console.error("Error al obtener las líneas de orden:", error);
      return []; // Retornamos un array vacío en caso de error
    }
  };

  return (
    <>
      <Header title="Ordres d'Enviament" />
      <Filter />
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
              <th scope='col'><input class="form-check-input" type="checkbox" name="" id="" /></th>
              <th scope='col' className='text-center'>ID</th>
              <th scope='col' className='text-center'>Client</th>
              <th scope='col' className='text-center'>Data Estimada</th>
              <th scope='col' className='text-center'>Estat</th>
              <th scope='col' className='text-center'>Accions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((valors) => (
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

                    <span onClick={() => modificarOrdre(valors)} className="mx-2" style= {{ cursor: "pointer" }}>
                      <i className="bi bi-pencil-square icono fs-5"></i>
                    </span>

                    <span onClick={() => eliminarOrder(valors.id)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-trash icono fs-5"></i>
                    </span>
                    </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        <nav aria-label="Page navigation example" class="d-block">
          <ul class="pagination justify-content-center">
            <li class="page-item">
              <a class="page-link text-light-blue" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li class="page-item"><a class="page-link activo-2" href="#">1</a></li>
            <li class="page-item"><a class="page-link text-light-blue" href="#">2</a></li>
            <li class="page-item"><a class="page-link text-light-blue" href="#">3</a></li>
            <li class="page-item">
              <a class="page-link text-light-blue" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
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
                  <Button variant={tipoModal === "Crear" ? "success" : "info"} type='submit'>{tipoModal}</Button>

                </div>

                <div className='pb-3'>
                  <label htmlFor='client_id' className='block text-sm font-medium text-gray-700 pe-2'>Client</label>
                  <Field as="select" name="client_id" values={values.client_id} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    })}
                  </Field>
                  {errors.client_id && touched.client_id ? <div className="text-red-500 text-sm">{errors.client_id}</div> : null}
                </div>

                <div className='pb-3'>
                  <label htmlFor='shipping_date' className='block text-sm font-medium text-gray-700 pe-2'>Data estimada</label>
                  <Field type="date" name="shipping_date" values={values.shipping_date} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" />
                  {errors.shipping_date && touched.shipping_date ? <div className="text-red-500 text-sm">{errors.shipping_date}</div> : null}
                </div>
              </Form>
            )}
          </Formik>

          <Formik
            initialValues={(tipoModal === 'Modificar' ? valorsLineInicials : {
              shipping_order_id: '',
              product_id: '',
              quantity: '',
              orderline_status_id: '',
            })}
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
                <div className='pb-3'>
                  <label htmlFor='product_id' className='block text-sm font-medium text-gray-700 pe-2'>Producte</label>
                  <Field as="select" name="product_id" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecciona un producte</option>
                    {products.map(product => {
                      return <option key={product.id} value={product.id}>{product.name}</option>
                    })}
                  </Field>
                  {errors.product_id && touched.product_id ? <div className="text-red-500 text-sm">{errors.product_id}</div> : null}
                </div>

                <div className='pb-3'>
                  <label htmlFor='quantity' className='block text-sm font-medium text-gray-700 pe-2'>Quantitat</label>
                  <Field
                    type="text"
                    name="quantity"
                    placeholder="Quantitat del producte"
                    value={values.quantity}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  >
                  </Field>
                  {errors.quantity && touched.quantity ? <div className="text-red-500 text-sm">{errors.quantity}</div> : null}
                </div>

                <div>
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
            initialValues={(tipoModal === 'Visualitzar' ? valorsInicials : {
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
                  <Button variant={tipoModal === "Crear" ? "success" : "info"} type='submit'>{tipoModal}</Button>

                </div>

                <div className='pb-3'>
                  <label htmlFor='client_id' className='block text-sm font-medium text-gray-700 pe-2'>Client</label>
                  <Field as="select" name="client_id" values={values.client_id} className="w-full border border-0 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" disabled>
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    })}
                  </Field>
                  {errors.client_id && touched.client_id ? <div className="text-red-500 text-sm">{errors.client_id}</div> : null}
                </div>

                <div className='pb-3'>
                  <label htmlFor='shipping_date' className='block text-sm font-medium text-gray-700 pe-2'>Data estimada</label>
                  <Field type="date" name="shipping_date" values={values.shipping_date} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" disabled />
                  {errors.shipping_date && touched.shipping_date ? <div className="text-red-500 text-sm">{errors.shipping_date}</div> : null}
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
