import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import { Link }   from 'react-router-dom'
import * as Yup from 'yup'
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header'
import Filtres from './IncidenciesResoldreFiltres'
import axios from 'axios'

const IncidenciaSchema = Yup.object().shape({
    quantity_received: Yup.number().positive().integer().required('Tens que introduïr una cantitat vàlida'),
    description: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(200, 'El valor màxim és de 200 caracters')
})

function IncidenciesResoldre() {

    const [incidents, setIncident] = useState([])
    const [products, setProducts] = useState([])
    const [orderlineStatus, setOrderlineStatus] = useState([])
    const [statuses, setStatus] = useState([])
    const [userProfile, setUserProfile] = useState([])
    const [suppliers, setSupplier] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [tipoModal, setTipoModal] = useState("Crear")
    //Paginació
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [incidentsPage, setIncidentsPage] = useState([])
    //Acaba paginació
    const [valorsInicials, setValorsInicials] = useState({
        product: '',
        quantity_received: '',
        description: '',
        supplier: '',
        operator: '',
        quantity_ordered: '',
        created_at: '',
        orderline_status_id: '', // Se llena con el estado de la base de datos
    })
    

    // Paginació
    const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

    // Obtindreels index. 
    useEffect(() => {
        const totalPages = Math.ceil(incidents.length / elementsPaginacio);
        setTotalPages(totalPages);
        console.log(totalPages)
    }, [incidents])

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
        const currentItems = incidents.slice(indexOfFirstItem, indexOfLastItem);
        setIncidentsPage(currentItems)
    }, [currentPage, incidents])

    const getStatusNames = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/orderreception_status`, { headers: { "auth-token": token } })
            .then(response => setStatus(response.data))
            .catch(error => console.log(error))
    }

    const getDataIncident = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/incident`, { headers: { "auth-token": token } })
            .then(response => setIncident(response.data))
            .catch(error => console.log(error))
    }

    const getDataProduct = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/product`, { headers: { "auth-token": token } })
            .then(response => setProducts(response.data))
            .catch(error => console.log(error))
    }

    const getDataOrderLineStatus = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/orderline_status`, { headers: { "auth-token": token } })
            .then(response => setOrderlineStatus(response.data))
            .catch(error => console.log(error))
    }

    const getOrderReceptionStatus = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/orderreception_status`, { headers: { "auth-token": token } })
            .then(response => setOrderReceptionStatus(response.data))
            .catch(error => console.log(error))
    }

    const getDataUserProfile = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/userProfile`, { headers: { "auth-token": token } })
            .then(response => {
                setUserProfile(response.data)
            })
            .catch(error => console.log(error))
    }

    const getSupplier = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/supplier`, { headers: { "auth-token": token } })
            .then(response => {
                setSupplier(response.data)
            })
            .catch(error => console.log(error))
    }

    const postDataIncident = (newIncident) => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.post(`${apiURL}/incident`, newIncident, { headers: { "auth-token": token } })
            .then(response => {
                setIncident(prevIncidents => [...prevIncidents, response.data])
            })
            .catch(error => console.log(error));
    }

    const updateDataIncident = (updatedData) => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")
        const id = updatedData.id; 
        delete updatedData.id
        delete updatedData.created_at

        updatedData.orderline_status_id = Number(updatedData.orderline_status_id)        

        axios.put(`${apiURL}incident/${id}`, updatedData, { headers: { "auth-token": token } })
            .then(response => setIncident(prevIncidents =>
                prevIncidents.map(incidents => incidents.id === updatedData.id ? response.data : incidents)
            ))
            .catch(error => console.log(error)
        );
    }

    /*Aso así no es gasta*/
    const deleteIncident = (id) => {
        const apiURL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        axios.delete(`${apiURL}/incident/${id}`, { headers: { "auth-token": token } })
            .then(() => {
                // Filtrar incidencia eliminada y actualitzar l'estat
                setIncident(prevIncidents => prevIncidents.filter(item => item.id !== id));
            })
            .catch(error => console.error("Error al eliminar la incidencia:", error)
        );
    };

    useEffect(() => {
        getDataProduct();
        getDataIncident();
        getDataOrderLineStatus();
        getDataUserProfile();
        getSupplier();
        getStatusNames();
    }, []);

    const visualitzarIncident = (valors) => {
        setTipoModal("Visualitzar");
        console.log(valors)
        setValorsInicials(valors);
        setShowModal(true);
    };

    const resoldreIncident = (valors) => {
        setTipoModal("Resol");
        console.log(valors)
        setValorsInicials({
            ...valors,
        });
        setShowModal(true);
    }
    
    const canviEstatModal = () => {
        setShowModal(!showModal)
    }

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : "Producte desconegut";
    };

    const getStatusId = (statusId) => {
        const status = orderlineStatus.find(s => Number(s.id) === Number(statusId));
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
            <Filtres />
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
                            <Link to="/incidencies/incidenciesGenerar" className="text-reset text-decoration-none">
                                Generar Incidències
                            </Link>
                        </button>
                        <button type="button" onClick={() => console.log("Prova Crear incident")} className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0">
                            <Link to="/incidencies/incidenciesResoldre" className="text-reset text-decoration-none">
                                Resoldre Incidències
                            </Link>
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
                        {incidentsPage.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No hi ha incidències</td>
                            </tr>
                        ) : (
                            incidentsPage.map((valors) => (
                                <tr key={valors.id}>
                                    <td data-cell="Data de creació" className='text-center'>
                                        {valors.created_at ? new Date(valors.created_at).toISOString().split('T')[0] : "Data no disponible"}
                                    </td>
                                    <td data-cell="Descripció" className='text-center'>{valors.description}</td>
                                    <td data-cell="Producte" className='text-center'>{getProductName(valors.product_id)}</td>
                                    <td data-cell="Unitats demanades" className='text-center'>{valors.quantity_ordered}</td>
                                    <td data-cell="Unitats rebudes" className='text-center'>{valors.quantity_received}</td>
                                    <td data-cell="Estat" className='text-center'>{getStatusId(valors.orderline_status_id)}</td>
                                    <td data-no-colon="true" className='text-center'>
                                        <div className="d-lg-flex justify-content-lg-center">
                                            <span onClick={() => visualitzarIncident(valors)} role='button'>
                                                <i className="bi bi-eye icono fs-5"></i>
                                            </span>
                                            <span onClick={() => resoldreIncident(valors)} className="mx-2" role='button'>
                                                <i title="Resoldre incidència" className="bi bi-check icono fs-5 mx-2"></i>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/*Menú de paginació (proves)*/}
            <nav aria-label="Page navigation example" className="d-block">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}>
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
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

            <Modal className='text-light-blue'
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
                        onSubmit={values => {
                            console.log("Valores enviados a updateDataIncident:", values);
                            updateDataIncident(values);
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
                                 </div>

                                {/* Descripció */}
                                <div className="form-group">
                                    <label className='fw-bolder' htmlFor='description'>Descripció</label>
                                    <Field
                                        type="text"
                                        name="description"
                                        disabled = {tipoModal == "Visualitzar"}
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
                                </div>

                                {/* Cantidad recibida */}
                                <div className="form-group">
                                    <label className='fw-bolder' htmlFor='quantity_received'>Cantitat recibida</label>
                                    <Field
                                        type="number"
                                        name="quantity_received"
                                        disabled = {tipoModal == "Visualitzar"}
                                        className="text-light-blue form-control"
                                        value={values.quantity_received} />
                                    {errors.quantity_received && touched.quantity_received ? <div className="invalid-feedback">{errors.quantity_received}</div> : null}
                                </div>

                                {/* Estat */}
                                <div className="form-group">
                                    <label className="fw-bolder" htmlFor="orderline_status_id">Estat</label>
                                    {tipoModal === "Visualitzar" ? (
                                        <Field
                                            type="text"
                                            name="orderline_status_id"
                                            className="text-light-blue form-control"
                                            disabled
                                            value={getStatusId(values.orderline_status_id)}
                                        />
                                    ) : (
                                        <Field
                                            as="select"
                                            name="orderline_status_id"
                                            className="text-light-blue form-control"
                                        >                                           
                                            {orderlineStatus.map(status => 
                                                <option key={status.id} value={status.id}>
                                                    {status.name}
                                                </option>
                                            )}
                                        </Field>
                                    )}
                                    {errors.status && touched.status ? (
                                        <div className="invalid-feedback">{errors.status}</div>
                                    ) : null}
                                </div>

                                {/* Botones */}
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={canviEstatModal}>Tancar</Button>
                                    {tipoModal === "Resol" && (
                                        <Button className="orange-button" type="submit" variant="success">Resoldre</Button>
                                    )}
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

