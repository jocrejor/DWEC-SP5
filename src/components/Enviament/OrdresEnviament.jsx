import {useState, useEffect} from 'react'
import {url, postData, getData, deleteData, updateId}  from '../../apiAccess/crud'
import {Formik, Form, Field} from 'formik'
import * as yup from 'yup'
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header'
import Filter from '../Filtres'


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
    const data = await getData(url,'OrderShipping')
    setOrder(data)
    const dataClient = await getData(url,'Client')
    setClientes(dataClient)
    const dataCarrier = await getData(url,'Carriers')
    setCarriers(dataCarrier)
    const dataUsers = await getData(url,'User')
    setUsers(dataUsers)
    const dataProducts = await getData(url,'Product')
    setProducts(dataProducts)
    const dataStatus = await getData(url,'OrderShipping_Status')
    console.log(dataStatus)
    setStatus(dataStatus)
  }, [])

  const eliminarOrder = (id) => {
    deleteData(url,'OrderShipping', id)
    const newOrders = orders.filter(order => order.id !== id)
    setOrder(newOrders)
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
    Alta Orden
  </Button>
  
  <div className="table-responsive mt-3">
    <table className="table table-bordered table-striped table-hover text-center">
      <thead className="table-secondary">
        <tr>
          <th>ID</th>
          <th>Client</th>
          <th>Transportista</th>
          <th>Preparado</th>
          <th>Data Estimada</th>
          <th>Estat</th>
          <th>Modificar</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((valors) => (
          <tr key={valors.id}>
            <td>{valors.id}</td>
            <td>{clientExistent(valors.client_id)}</td>
            <td>{transportistaExistente(valors.carrier_id)}</td>
            <td>{valors.prepared_by}</td>
            <td>{valors.shipping_date}</td>
            <td>{estatExistent(valors.ordershipping_status_id)}</td>
            <td>
              <Button
                variant="warning"
                onClick={() => { modificarOrdre(valors); canviEstatModal(); }}
              >
                Modificar
              </Button>
            </td>
            <td>
              <Button
                className="btn btn-danger"
                onClick={() => eliminarOrder(valors.id)}
              >
                Eliminar
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
                <h2>Capçalera</h2>
                  <label htmlFor='client_id'>Cliente</label>
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
                  <label htmlFor='prepared_by'>Preparado por</label>
                  <Field as="select" name="prepared_by" values = {values.prepared_by}>
                    <option value="">Selecciona un usuari:</option>
                    {users.map(user => {
                      return <option key={user.id} value={user.id}>{user.name}</option>
                    }) }
                  </Field>
                    {errors.prepared_by && touched.prepared_by ? <div>{errors.prepared_by}</div> : null}
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
                <h2>Detall</h2>              
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
