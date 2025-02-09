import { useState, useEffect }  from 'react'
import { Formik, Form, Field }  from 'formik'
import * as Yup                 from 'yup'
import { Button, Modal }        from 'react-bootstrap';
import Header                   from '../Header'
import Filtres                  from '../Filtres'
import axios                    from 'axios'

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
    const [userProfile, setUserProfile]                     = useState ([])
    const [suppliers, setSupplier]                           = useState ([])
    const [showModal, setShowModal]                         = useState(false)
    const [tipoModal, setTipoModal]                         = useState("Crear")
    const [visualitzar, setVisualitzar]                     = useState(false)
    const [valorsInicials, setValorsInicials]               = useState({
        product: '',
        quantity_received: '',
        description: '',
        supplier: '',
        operator: '',
        quantity_ordered: '',
        created_at: '',
        orderlineStatus: ''
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
            .then(response => setProducts(response.data))
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

    const getDataUserProfile = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")
        
        axios.get(`${apiURL}/userProfile`, {headers: {"auth-token" : token}})
            .then(response => {
                setUserProfile(response.data)
            })
            .catch(error => console.log(error))
    }

    const getSupplier = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")
        
        axios.get(`${apiURL}/supplier`, {headers: {"auth-token" : token}})
            .then(response => {
                setSupplier(response.data)
            })
            .catch(error => console.log(error))
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

    /*Aso así no es gasta*/
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
        getDataUserProfile();
        getSupplier();
    },  []);

    const visualitzarIncident = (valors) => {
        setTipoModal("Visualitzar");
        setValorsInicials(valors);
        setVisualitzar(true);
        setShowModal(true);
    };

    const resoldreIncident = (valors) => {
        setTipoModal("Resol");
        setValorsInicials({
            ...valors,
            
        });
        setShowModal(true);
    };

    const canviEstatModal = () => {
        setShowModal(!showModal)
    }

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : "Producte desconegut";
    }; 

    const getStatusId = (statusId) => {
        const status = orderlineStatus.find(s => s.id === statusId);
        return status ? status.name : "Estat desconegut";
    }

    const getUserProfileName = (operatorId) => {
        const operador = userProfile.find(o => o.id === operatorId);
        return operador ? operador.name : "Operari no trobat";
    }

    const getSupplierName = (supplierId) => {
        const supplier = suppliers.find(sup => sup.id === supplierId);
        return supplier ? supplier.name : "Proveïdor no trobat";
    }

    const getOrderReceptionStatusName = (statusId) => {
        const status = orderlineStatus.find(s => s.id === statusId);
        return status ? status.name : "Estat desconegut";
    }

    return (
        <>
        <Filtres/>
        {/*Botó per a fer un alta <Button variant='success' onClick={()=>{canviEstatModal(); setTipoModal("Crear")}}>Llistat ordres de recepció</Button>*/}
        <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
            <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
                <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
                <div className="form-floating bg-white">
                    <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                    <option defaultValue="0">Tria una opció</option>
                    <option value="1">Eliminar</option>
                    </select>
                    <label htmlFor="floatingSelect">Accions en lot</label>
                </div>
                <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button">
                    <i className="bi bi-check-circle text-white px-1"></i>Aplicar
                </button>
                </div>
            </div>
            <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
            <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 order-xl-2">
                <div className="d-flex h-100 justify-content-xl-end">
                <button type="button" onClick={() => console.log("Prova Crear incident")} className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
                    <i className="bi bi-plus-circle text-white pe-1"></i>Crear
                </button>
                </div>
            </div>
            </div>

            <div className="container-fluid">
            <table className="table table-striped border m-2">
                <thead className="table-active border-bottom border-dark-subtle">
                <tr>
                    <th scope="col" className='text-center'>Data de creació</th>
                    <th scope="col" className='text-center'>Descripció</th>
                    <th scope="col" className='text-center'>Producte</th>
                    <th scope="col" className='text-center'>Unitats demanades</th>
                    <th scope="col" className='text-center'>Unitats rebudes</th>
                    <th scope="col" className='text-center'>Estat</th>
                    <th scope="col" className='text-center'>Accions</th>
                </tr>
                </thead>
                <tbody>
                {incidents.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center">No hi ha incidències</td>
                    </tr>
                ) : (
                    incidents.map((valors) => (
                    <tr key={valors.id}>
                        <td data-cell="Data de creació" className='text-center'>
                            {valors.created_at ? new Date(valors.created_at).toISOString().split('T')[0] : "Data no disponible"}
                        </td>
                        <td data-cell="Descripció" className='text-center'>{valors.description}</td>
                        <td data-cell="Producte" className='text-center'>{getProductName(valors.product_id)}</td>
                        <td data-cell="Unitats demanades" className='text-center'>{valors.quantity_ordered}</td>
                        <td data-cell="Unitats rebudes" className='text-center'>{valors.quantity_received}</td>
                        <td data-cell="Estat" className='text-center'>{getStatusId(valors.id)}</td>
                        <td data-no-colon="true" className='text-center'>
                        <div className="d-lg-flex justify-content-lg-center">
                            <span onClick={() => visualitzarIncident(valors)} role='button'>
                                <i className="bi bi-eye icono fs-5"></i>
                            </span>
                            <span onClick={() => resoldreIncident(valors)} className="mx-2" role='button'>
                                <i className="bi bi-check icono fs-5 mx-2"></i>
                            </span>
                            <span onClick={() => console.log("Asi eliminarem")} role='button'>
                                <i className="bi bi-trash icono fs-5"></i>
                            </span>
                        </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>

        <Modal  className='text-light-blue'
                show={showModal} 
                onHide={canviEstatModal}
        >
            <Modal.Header className='text-center py-4 fs-4 fw-bold m-0 text-white bg-title' closeButton>
                <Modal.Title>{tipoModal} Incidència</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <Formik
                    initialValues={valorsInicials}
                    validationSchema={IncidenciaSchema}
                    enableReinitialize
                    onSubmit={values => {
                        console.log("onSubmit se está ejecutando"); // Verifica si `onSubmit` se llama
                        console.log("Valores enviados:", values); // Muestra los valores enviados
                        console.log("Valors enviats: ", values);
                        updateDataIncident(values.id, values);
                        canviEstatModal();
                    }}
                >
                {({ values, errors, touched }) => (
                <Form>
                    {/* ID Incidència */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='id'>ID Incidència</label>
                        <Field
                            type="number"
                            name="id"
                            disabled
                            className="text-light-blue form-control"
                            value={values.id} />
                        {errors.id && touched.id ? <div className="invalid-feedback">{errors.id}</div> : null}
                    </div>

                    {/* ID Ordre de Recepció -- Este camp no és el correcte*/}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='orderline_status_id'>ID Ordre de Recepció</label>
                        <Field
                            type="number"
                            name="orderline_status_id"
                            disabled
                            className="text-light-blue form-control"
                            value={values.orderline_status_id} />
                        {errors.orderReception_id && touched.orderReception_id ? <div className="invalid-feedback">{errors.orderReception_id}</div> : null}
                    </div>

                    {/* Descripció */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='description'>Descripció</label>
                        <Field
                            type="text"
                            name="description"
                            disabled
                            className="text-light-blue form-control"
                            value={values.description} />
                        {errors.description && touched.description ? <div className="invalid-feedback">{errors.description}</div> : null}
                    </div>

                    {/* Data creació */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='created_at'>Data creació</label>
                        <Field
                            type="date"
                            name="created_at"
                            disabled
                            className="text-light-blue form-control"
                            value={values.created_at ? values.created_at.split('T')[0] : ""} />
                        {errors.created_at && touched.created_at ? <div className="invalid-feedback">{errors.created_at}</div> : null}
                    </div>
                    
                    {/* Producte */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='product'>Producte</label>
                        <Field
                            type="text"
                            name="product"
                            disabled
                            className="text-light-blue form-control"
                            value={getProductName(values.product_id)} />
                        {errors.product && touched.product ? <div className="invalid-feedback">{errors.product}</div> : null}
                    </div>

                    {/* Proveedor */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='supplier_id'>Proveedor</label>
                        <Field
                            type="text"
                            name="supplier_id"
                            disabled
                            className="text-light-blue form-control"
                            value={getSupplierName(values.supplier_id)} />
                        {errors.supplier && touched.supplier ? <div className="invalid-feedback">{errors.supplier}</div> : null}
                    </div>

                    {/* Operador */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='operator_id'>Operador</label>
                        <Field
                            type="text"
                            name="operator_id"
                            disabled
                            className="text-light-blue form-control"
                            value={getUserProfileName(values.operator_id)} />
                        {errors.operator && touched.operator ? <div className="invalid-feedback">{errors.operator}</div> : null}
                    </div>

                    {/* Estat */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='orderline_status_id'>Estat</label>
                        <Field 
                            as='select' 
                            name="orderline_status_id"
                            className="text-light-blue form-control"
                            disabled = {tipoModal == "Visualitzar"}
                        >
                            <option value="Pendent">Pendent</option>
                            <option value="Rebutjada">Rebutjada</option>
                            <option value="Completada">Completada</option>
                            <option value="Forçada">Forçada</option>
                        </Field>
                        {errors.status && touched.status ? <div className="invalid-feedback">{errors.status}</div> : null}
                    </div>

                    {/* Cantidad pedida */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='quantity_ordered'>Cantitat demanada</label>
                        <Field
                            type="number"
                            name="quantity_ordered"
                            disabled
                            className="text-light-blue form-control"
                            value={values.quantity_ordered} />
                        {errors.quantity_ordered && touched.quantity_ordered ? <div className="invalid-feedback">{errors.quantity_ordered}</div> : null}
                    </div>

                    {/* Cantidad recibida */}
                    <div className="form-group">
                        <label className='fw-bolder' htmlFor='quantity_received'>Cantitat recibida</label>
                        <Field
                            type="number"
                            name="quantity_received"
                            disabled
                            className="text-light-blue form-control"
                            value={values.quantity_received} />
                        {errors.quantity_received && touched.quantity_received ? <div className="invalid-feedback">{errors.quantity_received}</div> : null}
                    </div>
                    
                    {/* Botones */}
                    <Modal.Footer>
                        <Button variant="secondary" onClick={canviEstatModal}>Tancar</Button>
                        <Button className='orange-button' type="submit" variant="success">Resoldre</Button>
                    </Modal.Footer>
                </Form>
                )}
                </Formik>
            </Modal.Body>
        </Modal>
        </>
    )
}

export default IncidenciesResoldre

