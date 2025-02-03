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
  carrier_id: yup.string().required('Valor requerit'),
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
  const [showModal, setShowModal] = useState(false)
  const [tipoModal, setTipoModal] = useState('Crear')
  const [valorsInicials, setValorsInicials] = useState({ client_id: '', carrier_id: '', shipping_date: '', ordershipping_status_id: '' })
  const [valorsLineInicials, setValorsLineInicials] = useState({ shipping_order_id: '', product_id: '', quantity: '', orderline_status_id: ''})
  const [clientes, setClientes] = useState([])
  const [carriers, setCarriers] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [arrayProductos, setArray] = useState([])


  useEffect(async () => {
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

    axios.get(`${apiUrl}carrier`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(response => {
        setCarriers(response.data)
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

  const eliminarOrder = (id) => {
    axios.delete(`${apiUrl}ordershipping/${id}`, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(() => {
        const newOrders = orders.filter(order => order.id !== id)
        setOrder(newOrders)
      })
  }

  const afegirProducte = (producte) => {
    const array = [...arrayProductos]
    array.push(producte)
    setArray(array)
    console.log(arrayProductos)
  }

  const modificarOrdre = (valors) => {
    setTipoModal('Modificar')
    console.log(valors)
    setValorsInicials(valors)
    setValorsLineInicials(valors)
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
    const existe = status.find(estat => estat.id === String(id))
    if (existe) {
      return existe.name
    }
  }

  const canviEstatModal = () => {
    setShowModal(!showModal)
  }


  const grabar = (values) => {
    if (tipoModal === "Crear") {
      if (arrayProductos.length > 0) {
        axios.post(`${apiUrl}ordershipping`, values, { headers: { "auth-token": localStorage.getItem("token") } })
          .then(response => {
            const resultat = response.data;
            console.log(response)
            console.log(resultat.results.insertId)
            arrayProductos.map(line => {
              const novaId = resultat.results.insertId
              line.shipping_order_id = novaId
              
              console.log(novaId)
              console.log(line)
              axios.post(`${apiUrl}orderlineshipping`, line, { headers: { "auth-token": localStorage.getItem("token") } })
            })
        })
      }
    }
    else{
      axios.put(`${apiUrl}ordershipping`, values.id, values, { headers: { "auth-token": localStorage.getItem("token") } })
    }
    canviEstatModal();
    setArray([]);
  }

 /**  const grabar2 = async (values) => {
    if (tipoModal === "Crear") {
      if (arrayProductos.length > 0) {
        const data = await postData(url, "OrderShipping", values);
        const newOrderId = data.id;

        const linesWithOrderId = arrayProductos.map((line) => ({
          ...line,
          shipping_order_id: newOrderId,
        }));

        await Promise.all(
          linesWithOrderId.map((line) =>
            postData(url, "OrderLineShipping", line)
          )
        );
      } else {
        alert("Error, has d'afegir un Order Line")
        return;
      }
    }
    else {
      await updateId(url, "OrderShipping", values.id, values);
    }
    const updatedOrders = await getData(url, "OrderShipping");
    setOrder(updatedOrders);

    canviEstatModal();
    setArray([]);
  };
  */

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
            <button type="button" onClick={() => canviEstatModal()} class="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"><i class="bi bi-plus-circle text-white pe-1"></i>Crear</button>
          </div>
        </div>
      </div>
      <div className="table-responsive mt-3">
        <table class="table table-striped text-center">
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th scope='col'><input class="form-check-input" type="checkbox" name="" id="" /></th>
              <th scope='col'>ID</th>
              <th scope='col'>Client</th>
              <th scope='col'>Data Estimada</th>
              <th scope='col'>Estat</th>
              <th scope='col'>Visualitzar</th>
              <th scope='col'>Modificar</th>
              <th scope='col'>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((valors) => (
              <tr key={valors.id}>
                <td scope="row" data-cell="Seleccionar">
                  <input class="form-check-input" type="checkbox" name="" id="" />
                </td>
                <td>{valors.id}</td>
                <td>{clientExistent(valors.client_id)}</td>
                <td>{valors.shipping_date}</td>
                <td>{estatExistent(valors.ordershipping_status_id)}</td>
                <td>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      visualitzaOrder(valors);
                    }}
                  >
                    <i className="bi bi-eye p-2"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outline-success"
                    onClick={() => { modificarOrdre(valors); canviEstatModal(); }}
                  >
                    <i className="bi bi-pencil-square p-2"></i>
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    onClick={() => eliminarOrder(valors.id)}
                  >
                    <i className='bi bi-trash p-2'></i>
                  </Button>
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
        <Modal.Header closeButton onHide={canviEstatModal}>
          <Modal.Title>{tipoModal} Ordre Enviament</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Formik
            initialValues={(tipoModal === 'Modificar' ? valorsInicials : {
              client_id: '',
              carrier_id: '',
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

              /* and other goodies */
            }) => (
              <Form>
                <div>
                  <Button onClick={() => canviEstatModal()} variant="secondary">Tancar</Button>

                  <Button variant={tipoModal === "Crear" ? "success" : "info"} type='submit'>{tipoModal}</Button>
                </div>
                {/* NOM PRODUCTE */}
                <div>
                  <label htmlFor='client_id'>Client</label>
                  <Field as="select" name="client_id" values={values.client_id}>
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    })}
                  </Field>
                  {errors.client_id && touched.client_id ? <div>{errors.client_id}</div> : null}
                </div>

                <div>
                  <label htmlFor='carrier_id'>Transportista</label>
                  <Field as="select" name="carrier_id" values={values.carrier_id}>
                    <option value="">Selecciona un transportista:</option>
                    {carriers.map(carrier => {
                      return <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                    })}
                  </Field>
                  {errors.carrier_id && touched.carrier_id ? <div>{errors.carrier_id}</div> : null}
                </div>

                <div>
                  <label htmlFor='shipping_date'>Data estimada</label>
                  <Field type="date" name="shipping_date" values={values.shipping_date} />
                  {errors.shipping_date && touched.shipping_date ? <div>{errors.shipping_date}</div> : null}
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
              // Agregar el producto al arrayProductos
              afegirProducte({
                product_id: values.product_id,
                quantity: values.quantity,
                orderline_status_id: 1,
              });
              resetForm(); // Limpiar el formulario después de agregar
            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit

              /* and other goodies */
            }) => (
              <Form>

                {/* NOM PRODUCTE */}
                <div>
                  <h4>Afegeix productes a la ordre:</h4>
                  <label htmlFor='product_id'>Producte</label>
                  <Field as="select" name="product_id">
                    <option value="">Selecciona un producte</option>
                    {products.map(product => {
                      return <option key={product.id} value={product.id}>{product.name}</option>
                    })}
                  </Field>
                  {errors.product_id && touched.product_id ? <div>{errors.product_id}</div> : null}
                </div>

                <div>
                  <label htmlFor='quantity'>Quantitat</label>
                  <Field
                    type="text"
                    name="quantity"
                    placeholder="Quantitat del producte"
                    value={values.quantity}
                  >
                  </Field>
                  {errors.quantity && touched.quantity ? <div>{errors.quantity}</div> : null}
                </div>

                <div>
                  <Button variant="primary" type="submit">
                    Afegir
                  </Button>
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
