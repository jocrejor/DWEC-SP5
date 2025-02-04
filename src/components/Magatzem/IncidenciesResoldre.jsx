import { useState, useEffect }                          from 'react'
import { Formik, Form, Field }                          from 'formik'
import * as Yup                                         from 'yup'
import { Button, Modal }                                from 'react-bootstrap';
import Header                                           from '../Header'
import axios                                            from 'axios'

const IncidenciaSchema = Yup.object().shape({
    //Aso es té que llevar quan estiga ben fet, es soles un formulari de alta de prova perque Crespo no m'ha explicat on és fa l'alta i quins camps tinc que posar
    product:            Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 60 caracters').required('Valor requerit'),
    supplier:           Yup.string().min(1, 'Valor mínim de 1 caracter.').max(50, 'El valor màxim és de 60 caracters').required('Valor requerit'),
    operator:           Yup.string().min(1, 'Valor mínim de 1 caracter.').max(50, 'El valor màxim és de 60 caracters').required('Valor requerit'),
    quantity_ordered:   Yup.number().positive().integer().required('Tens que introduïr una cantitat vàlida'),
    created_at:         Yup.date().min('2024/01/22', 'No pot ser abans del 22 de gener del 2024').max('2025/01/23').required("Introdueïx una data vàlida", 'No pot ser després del 23 de gener del 2025'),

    //Estos dos camos eb teoria están be per a quan modifiquem la incidència
    quantity_received: Yup.number().positive().integer().required('Tens que introduïr una cantitat vàlida'),
    description: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(200, 'El valor màxim és de 60 caracters')
})

function IncidenciesResoldre() {

    const [incidents, setIncident]                          = useState([])
    const [products, setProducts]                           = useState([])
    const [orderlineStatus, setOrderlineStatus]             = useState([])
    const [orderReceptionStatus, setOrderReceptionStatus]   = useState([])
    const [showModal, setShowModal]                         = useState(false)
    const [tipoModal, setTipoModal]                         = useState("Crear")
    const [valorsInicials, setValorsInicials]               = useState({
        product: '',
        quantity_received: '',
        description: '',
        supplier: '',
        operator: '',
        quantity_ordered: '',
        created_at: ''
    });

    const getDataIncident = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")
        console.log(token)
        axios.get(`${apiURL}/incident`, {headers: {"auth-token" : token}})
            .then(response => setIncident(response.data))
            .catch(error => console.log(error))
    }

    const getDataProduct = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")
        
        axios.get(`${apiURL}/product`, {headers: {"auth-token" : token}})
            .then(response => {
                setProducts(response.data),
                console.log("Productos obtenidos:", response.data)
            })
            .catch(error => console.log(error))
    }

    const getDataOrderLineStatus = () => {
        const apiURL    = import.meta.env.VITE_API_URL
        const token     = localStorage.getItem("token")

        axios.get(`${apiURL}/orderline_status`, {headers: {"auth-token" : token}})
            .then(response  => setOrderlineStatus(response.data))
            .catch(error    => console.log(error))
    }

    const getOrderReceptionStatus = () => {
        const apiURL    = import.meta.env.VITE_API_URL
        const token     = localStorage.getItem("token")

        axios.get(`${apiURL}/orderreception_status`, {headers: {"auth-token" : token}})
            .then(response  => setOrderReceptionStatus(response.data))
            .catch(error    => console.log(error))
    }

    const postDataIncident = (newIncident) => {
        const apiURL    = import.meta.env.VITE_API_URL
        const token     = localStorage.getItem("token")

        axios.post(`${apiURL}/incident`,newIncident, {headers: {"auth-token" : token}})
            .then(response => {
                setIncident(prevIncidents => [...prevIncidents, response.data])
            })
            .catch(error => console.log(error));
    }

    const updateDataIncident = (id, updatedData) => {
        const apiURL    = import.meta.env.VITE_API_URL
        const token     = localStorage.getItem("token")

        axios.put(`${apiURL}/incident/${id}`, updatedData, {headers: {"auth-token" : token}})
            .then(response => setIncident(prevIncidents =>
                prevIncidents.map(incidents => incidents.id === id ? response.data : incidents)
            ))
            .catch(error => console.log(error));
    }

    const deleteIncident = (id) => {
        const apiURL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
    
        axios.delete(`${apiURL}/incident/${id}`, {
            headers: { "auth-token": token }
        })
        .then(() => {
            // Filtrar incidencia eliminada y actualitzar l'estat
            setIncident(prevIncidents => prevIncidents.filter(item => item.id !== id));
        })
        .catch(error => console.error("Error al eliminar la incidencia:", error));
    };

    useEffect(() => {
        getDataProduct();
        getDataIncident();
        getDataOrderLineStatus();
    },  []);

    const modificarIncident = (valors) => {
        setTipoModal("Modificar")
        setValorsInicials(valors);
    }

    const canviEstatModal = () => {
        setShowModal(!showModal)
    }

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : "Producte desconegut";
    }; 

    const getStatusName = (statusId) => {
        const status = orderlineStatus.find(s => s.id === statusId);
        return status ? status.name : "Estat desconegut";
    }

    const getOrderReceptionStatusName = (statusId) => {
        const status = orderlineStatus.find(s => s.id === statusId);
        return status ? status.name : "Estat desconegut";
    }

    return (
        <>
        <Header title="Incidències"/>
        <Button variant='success' onClick={()=>{canviEstatModal(); setTipoModal("Crear")}}>Llistat ordres de recepció</Button>
        <table className="table table-striped table-bordered table-hover table-responsive">
            <thead>
                <tr>
                    <th>Data de creació</th>
                    <th>Descripció</th>
                    <th>Producte</th>
                    <th>Unitats demanades</th>
                    <th>Unitats rebudes</th>
                    <th>Estat</th>
                    <th>Accions</th>
                </tr>
            </thead>
            <tbody>
                {products.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center">No hi ha incidències</td>
                    </tr>
                ) : (
                    incidents.map((valors) => {
                        console.log("Iterando incidente:", valors);
                        return (
                            <tr key={valors.id}>
                                <td>{valors.created_at}</td>
                                <td>{valors.description}</td>
                                <td>{getProductName(valors.product)}</td>
                                <td>{valors.quantity_ordered}</td>
                                <td>{valors.quantity_received}</td>          
                                <td>{getStatusName(valors.status)}</td>
                                {/*<td>{getOrderReceptionStatusName(valors.name)}</td>*/}
                                <td>
                                    <Button variant="outline-success"><i className="bi bi-eye p-2"></i></Button>
                                    <Button variant="outline-success" onClick={()   => { modificarIncident(valors); canviEstatModal(); }}><i className="bi bi-pencil-square p-2"></i></Button>
                                    <Button variant="outline-danger" onClick={()    => { deleteIncident(valors.id) }}><i className='bi bi-trash p-2'></i></Button>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>

        {/*<div class="row d-flex mx-0 bg-secondary mt-3 rounded-top">
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
                <td>{formateaFecha(valors.shipping_date)}</td>
                <td>{estatExistent(valors.ordershipping_status_id)}</td>
                <td>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      visualitzarOrdre(valors);
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
      </div>*/}

            <Modal show={showModal} onHide={canviEstatModal}>
                <Modal.Header closeButton >
                    <Modal.Title>{tipoModal} Incidència</Modal.Title>
                </Modal.Header>
            <Modal.Body>
            
            <Formik
                initialValues= {(tipoModal==='Modificar'?valorsInicials: {product: '', quantity_received: '', description: '', supplier: '', operator: '', quantity_ordered: '', created_at: '', orderReception_id: '', })}
                validationSchema={IncidenciaSchema}
                onSubmit={values => {
                    console.log(values)
                    //(Utilitza la API del crud anterior) tipoModal==="Crear"?postData(url,"Incident", values):updateId(url,"Incident",values.id,values)
                    tipoModal==="Crear"?postDataIncident(values):updateDataIncident(values.id, values)
                    canviEstatModal()         
                }}
            >
            {({
                values,
                errors,
                touched
                /* and other goodies */
            }) => (
            <Form>
                {/*ID Ordre de Recepció*/}
                <div>
                    <label htmlFor='id_ordre_recepcio'>ID Ordre de Recepció</label>
                    <Field
                        type="text" 
                        name="id_ordre_recepcio"
                        placeholder="ID ordre de recepció"
                        autoComplete="off"
                        disabled

                        value={values.orderReception_id}
                    />
                    {errors.orderReception_id && touched.orderReception_id ? <div>{errors.orderReception_id}</div> : null}
                </div>
                {/*Data creació*/}
                <div>
                    <label htmlFor='created_at'>Data creació</label>
                    <Field
                        type="date" 
                        name="created_at"
                        placeholder="Data de creació"
                        autoComplete="off"
                        disabled={tipoModal === "Modificar"}

                        value={values.created_at}
                    />
                    {errors.created_at && touched.created_at ? <div>{errors.created_at}</div> : null}
                </div>
                {/*Producte*/}
                <div>
                    <label htmlFor='product'>Producte</label>
                    <Field
                        type="text" 
                        name="product"
                        placeholder="Nom del producte"
                        autoComplete="off"
                        disabled={tipoModal === "Modificar"}

                        value={tipoModal === "Modificar" ? getProductName(values.product) : values.product}
                    />
                    {/*{errors.getProductName(values.product) && touched.getProductName(values.product) ? <div>{errors.getProductName(values.product)}</div> : null}*/}
                    {errors.product && touched.product ? <div>{errors.product}</div> : null}
                </div>
                {/*Proveïdor*/}
                <div>
                    <label htmlFor='name'>Proveïdor</label>
                    <Field
                        type="text" 
                        name="supplier"
                        placeholder="Nom del proveïdor"
                        autoComplete="off"
                        disabled={tipoModal === "Modificar"}

                        value={values.supplier}
                    />
                    {errors.supplier && touched.supplier ? <div>{errors.supplier}</div> : null}
                </div>
                {/*Operari*/}
                <div>
                    <label htmlFor='name'>Operari</label>
                    <Field
                        type="text" 
                        name="operator"
                        placeholder="Operari"
                        autoComplete="off"
                        disabled={tipoModal === "Modificar"}

                        value={values.operator}
                    />
                    {errors.operator && touched.operator ? <div>{errors.operator}</div> : null}
                </div>
                {/*Quantitat demanada*/}
                <div>
                    <label htmlFor='name'>Quantitat demanada</label>
                    <Field
                        type="text" 
                        name="quantity_ordered"
                        placeholder="Quantiat demanada"
                        autoComplete="off"
                        disabled={tipoModal === "Modificar"}

                        value={values.quantity_ordered}
                    />
                    {errors.quantity_ordered && touched.quantity_ordered ? <div>{errors.quantity_ordered}</div> : null}
                </div>
                {/*Quantitat rebuda*/}
                <div>
                    <label htmlFor='name'>Quantitat rebuda</label>
                    <Field
                        type="text" 
                        name="quantity_received"
                        placeholder="Quantitat rebuda"
                        autoComplete="off"

                        value={values.quantity_received}
                    />
                    {errors.quantity_received && touched.quantity_received ? <div>{errors.quantity_received}</div> : null}
                </div>
                {/*Em senc atacat -- Descripcio*/}
                <div>
                    <label htmlFor='description'>Descripció</label>
                    <Field
                        as='textarea'
                        type="text"
                        name="description"
                        placeholder="Descripció"
                        autoComplete="off"

                        value={values.description}
                    />
                    {errors.description && touched.description ? <div>{errors.description}</div> : null}
                </div>

                <div>
                <Button variant="secondary" onClick={canviEstatModal}>Close</Button>

                    <Button variant={tipoModal==="Modificar"?"success":"info"} type="submit">{tipoModal}</Button>             
            
                </div>
            </Form>
            )}

        </Formik>
        </Modal.Body>
        </Modal>
        </>
    )
}

export default IncidenciesResoldre

