import { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table } from 'react-bootstrap';

const apiUrl = import.meta.env.VITE_API_URL;


const IncidenciaSchema = Yup.object().shape({
    quantity_received: Yup.number().positive().integer().required('Tens que introduïr una cantitat vàlida'),
    description: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(200, 'El valor màxim és de 200 caracters')
})

function IncidenciaGenerarModal({orderLineReceptionID,viewModal}) {
    const [orderReception, setOrderReception] = useState([]);
    const [orderLineReception, setOrderLineReception] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    /*Así comensa tot lo relacionat en les incidències (menos el UseState i boto de crear incidència)*/
    /*Incidències*/
    const [incidents, setIncident] = useState([])
    const [orderlineStatus, setOrderlineStatus] = useState([])
    const [valorsInicialsIncidents, setValorsInicialsIncidents] = useState({
        id: '',
        product: '',
        quantity_received: '',
        description: '',
    })
    setShowModal(viewModal)


  
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes, orderLineReceptionRes, usersRes] = await Promise.all([
                    axios.get(`${apiUrl}/orderreception`, { headers: { "auth-token": localStorage.getItem("token") } }),
                    axios.get(`${apiUrl}/orderlinereception/${orderLineReceptionID}`, { headers: { "auth-token": localStorage.getItem("token") } }),
                    axios.get(`${apiUrl}/products`, { headers: { "auth-token": localStorage.getItem("token") } }),
                    axios.get(`${apiUrl}/users`, { headers: { "auth-token": localStorage.getItem("token") } })
                                ]);
                setOrderReception(ordersRes.data);
                setProducts(productsRes.data);
                setOrderLineReception(orderLineReceptionRes.data);                
                setUsers(usersRes.data);
            } 
            catch (err) {
                console.error("Error carregant dades:", err);
            } 
        };
        fetchData();
    }, []);

    const handleInputChange = (event) => {
        setOperariSeleccionat(event.target.value);
    };

    const getDataIncident = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/incident`, { headers: { "auth-token": token } })
            .then(response => setIncident(response.data))
            .catch(error => console.log(error))
    }

    const handleSubmitIncident = (values) => {
        console.log("Datos a enviar en la incidencia:", values);
    
        postDataIncident(values);
    };

    const postDataIncident = async (newIncident) => {
        try {
            const apiURL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem("token");
    
            const response = await axios.post(`${apiURL}/incident`, newIncident, { 
                headers: { "auth-token": token }
            });
    
            setIncident(prevIncidents => [...prevIncidents, response.data]);
        } catch (error) {
            console.error("Error en postDataIncident:", error.response?.data || error.message);
        }
    };

    const updateDataIncident = (updatedData) => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")
        const id = updatedData.id;
        delete updatedData.id
        delete updatedData.created_at

        updatedData.orderline_status_id = Number(updatedData.orderline_status_id)

        axios.put(`${apiURL}incident/${id}`, updatedData, { headers: { "auth-token": token } })
            .then(response => setIncident(prevIncidents =>
                prevIncidents.map(incidents => incidents.id === updatedData.id ? response.data : incidents),
                getDataIncident()
            ))
            .catch(error => console.log(error)
            );
    }

    const getDataOrderLineStatus = () => {
        const apiURL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem("token")

        axios.get(`${apiURL}/orderline_status`, { headers: { "auth-token": token } })
            .then(response => setOrderlineStatus(response.data))
            .catch(error => console.log(error))
    }

    const getStatusId = (statusId) => {
        const status = orderlineStatus.find(s => Number(s.id) === Number(statusId));
        return status ? status.name : "Estat desconegut";
    }

    useEffect(() => {
        getDataIncident()
        getDataOrderLineStatus()
    }, [])

    return (
        <>
            {/* Modal per Crear incidència */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear incidència</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        
                        {/* Taula de productes associats a l'ordre */}
                        <h5>Producte:</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Producte</th>
                                    <th>Quantitat Estinada</th>
                                    <th>Quantitat Rebuda</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>                                        
                                    <td>{products.find((product) => product.id === orderLineReception.product_id)?.name}</td>
                                    <td>{linea.quantity_ordered}</td>
                                    <td><input type='number' /></td>
                                </tr>
                            </tbody>
                        </Table>
                        {/* Formulario de Creación de Incidència */}
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
                                    <div className="form-group">
                                        <label className='fw-bolder' htmlFor='description'>Descripció</label>
                                        <Field
                                            type="text"
                                            name="description"
                                            className="text-light-blue form-control"
                                            value={values.description || ''} />
                                        {errors.description && touched.description ? <div className="invalid-feedback">{errors.description}</div> : null}
                                    </div>
                                    <div className="form-group">
                                        <label className='fw-bolder' htmlFor='quantity_received'>Cantitat recibida</label>
                                        <Field
                                            type="number"
                                            name="quantity_received"
                                            className="text-light-blue form-control"
                                            value={values.quantity_received || ''} />
                                        {errors.quantity_received && touched.quantity_received ? <div className="invalid-feedback">{errors.quantity_received}</div> : null}
                                    </div>
                                    <div className="form-group">
                                        <label className="fw-bolder" htmlFor="orderline_status_id">Estat</label>
                                        <Field as="select" name="orderline_status_id" className="text-light-blue form-control">
                                            {orderlineStatus.map(status =>
                                                <option key={status.id} value={status.id}>{status.name}</option>
                                            )}
                                        </Field>
                                        {errors.status && touched.status ? (
                                            <div className="invalid-feedback">{errors.status}</div>
                                        ) : null}
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>                 
                </Modal.Body>
                <Modal.Footer>
                    <>
                        <Button variant="secondary">
                            Tancar
                        </Button>
                        <Button variant="success" onClick={() => handleSubmitIncident(valorsInicialsIncidents)}>
                            Crear incidència
                        </Button>
                    </>
                </Modal.Footer>
            </Modal>
        </>
    );
}
export default IncidenciaGenerarModal;