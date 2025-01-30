import {useState, useEffect} from 'react'
import {url, postData, getData, deleteData, updateId}  from '../../apiAccess/crud'
import {Formik, Form, Field} from 'formik'
import * as yup from 'yup'
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header'
import Filter from '../Filtres'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL;


const OrderShippingSchema = yup.object().shape({
  client_id: yup.string().required('Valor requerit'),
  carrier_id: yup.string().required('Valor requerit'),
  prepared_by: yup.string().required('Valor requerit'),
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
  const [valorsInicials, setValorsInicials] = useState({client_id: '', carrier_id: '', prepared_by: '', shipping_date: '',ordershipping_status_id:''})
  const [valorsLineInicials, setValorsLineInicials] = useState({shipping_order_id: '',product_id: '', quantity: ''})
  const [clientes, setClientes] = useState([])
  const [carriers, setCarriers] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [arrayProductos,setArray] = useState([])
  

  useEffect(async () => {
    axios.get(`${apiUrl}/ordershipping`, {headers: {"auth-token": localStorage.getItem("token")}})
    .then(response => {
      setOrder(response.data)
    })
    .catch(e => {
      console.log(e)
    }
    )

    axios.get(`${apiUrl}/client`, {headers: {"auth-token": localStorage.getItem("token")}})
    .then(response => {
      setClientes(response.data)
    })
    .catch(e => {
      console.log(e)
    }
    )

    axios.get(`${apiUrl}/carrier`, {headers: {"auth-token": localStorage.getItem("token")}})
    .then(response => {
      setCarriers(response.data)
    })
    .catch(e => {
      console.log(e)
    }
    )

    axios.get(`${apiUrl}/users`, {headers: {"auth-token": localStorage.getItem("token")}})
    .then(response => {
      setUsers(response.data)
    })
    .catch(e => {
      console.log(e)
      }
    )

    axios.get(`${apiUrl}/product`, {headers: {"auth-token": localStorage.getItem("token")}})
    .then(response => {
      setProducts(response.data)
    })
    .catch(e => {
      console.log(e)
      }
    )

    axios.get(`${apiUrl}/ordershipping_status`, {headers: {"auth-token": localStorage.getItem("token")}})
    .then(response => {
      setStatus(response.data)
    })
    .catch(e => {
      console.log(e)
      }
    )
  }, [])

  const eliminarOrder = (id) => {
    axios.delete(`${apiUrl}ordershipping/${id}`,{headers: {"auth-token": localStorage.getItem("token")}})
    .then(()=> {
      alert("Orden eliminada");
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
    if(existe){
      return existe.name
    }
  }

  const transportistaExistente = (id) => {
    const existe = carriers.find(carrier => carrier.id === id)
    if(existe){
      return existe.name
    }
  }

  const estatExistent = (id) => {
    console.log(status)
    console.log(id)
    const existe = status.find(estat => estat.id === String(id))
    if(existe){
      return existe.name
    }
  } 

  const canviEstatModal = () => {
      setShowModal(!showModal)
  }

  const grabar = async (values) => {
      if (tipoModal === "Crear") {
        if(arrayProductos.length > 0){
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
        }else{
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
  
  return (
    <>
    <Header title="Ordres d'Enviament" />
    <Filter />
    <div>
  <Button variant="success" onClick={() => { canviEstatModal(); setTipoModal("Crear"); }}>
    Alta Ordre
  </Button>
  
  <div className="table-responsive mt-3">
    <table className="table table-bordered table-striped table-hover text-center">
      <thead className="table-secondary">
        <tr>
          <th>ID</th>
          <th>Client</th>
          <th>Data Estimada</th>
          <th>Estat</th>
          <th>Visualitzar</th>
          <th>Modificar</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((valors) => (
          <tr key={valors.id}>
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
  </div>
</div>

   <Modal show = {showModal} >
        <Modal.Header closeButton onHide={canviEstatModal}>
          <Modal.Title>{tipoModal} Ordre Enviament</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          
          <Formik
            initialValues={(tipoModal === 'Modificar' ? valorsInicials : {
              client_id: '', 
              carrier_id: '', 
              prepared_by: '', 
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

              /* and other goodies */
          }) => (
              <Form>
                <div>
                    <Button onClick={() => canviEstatModal()} variant="secondary">Tancar</Button>
                    
                    <Button variant={tipoModal=== "Crear" ? "success" : "info"} type='submit'>{tipoModal}</Button>                  
                </div>
                {/* NOM PRODUCTE */}
                <div>
                  <label htmlFor='client_id'>Client</label>
                  <Field as="select" name="client_id" values = {values.client_id}>
                    <option value="">Selecciona un client:</option>
                    {clientes.map(cliente => {
                      return <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                    }) }
                  </Field>
                    {errors.client_id && touched.client_id ? <div>{errors.client_id}</div> : null}
                </div>

                <div>
                  <label htmlFor='carrier_id'>Transportista</label>
                  <Field as="select" name="carrier_id" values = {values.carrier_id}>
                    <option value="">Selecciona un transportista:</option>
                    {carriers.map(carrier => {
                      return <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                    }) }
                  </Field>
                    {errors.carrier_id && touched.carrier_id ? <div>{errors.carrier_id}</div> : null}
                </div>

                <div>
                  <label htmlFor='shipping_date'>Data estimada</label>
                  <Field type="date" name="shipping_date" values = {values.shipping_date} />
                    {errors.shipping_date && touched.shipping_date ? <div>{errors.shipping_date}</div> : null}
                </div>              
              </Form>
            )}
          </Formik>

          <Formik
            initialValues={(tipoModal === 'Modificar' ? valorsLineInicials : {
              shipping_order_id: '', 
              product_id: '', 
              quantity: '' 
            })}
            validationSchema={OrderLineSchema}
            onSubmit={(values, { resetForm }) => {
              // Agregar el producto al arrayProductos
              afegirProducte({
                product_id: values.product_id,
                quantity: values.quantity,
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
                    }) }
                  </Field>
                    {errors.product_id && touched.product_id ? <div>{errors.product_id}</div> : null}
                </div>

                <div>
                  <label htmlFor='quantity'>Quantitat</label>
                  <Field 
                    type="text" 
                    name="quantity"
                    placeholder="Quantitat del producte"
                    value = {values.quantity}
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
