import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Table } from 'react-bootstrap';

const apiUrl = import.meta.env.VITE_API_URL;


function IncidenciaGenerarModal({orderLineReceptionID,viewModal,handleModal}) {
    const [orderLineReception, setOrderLineReception] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [dataForm, setDataForm] = useState({
        quantity_ordered: 0,
        description: ''
    })
   

    const fetchData = async () => {
       
        try {
            const [ orderLineReceptionRes,productsRes] = await Promise.all([
               
                axios.get(`${apiUrl}/orderlinereception/${orderLineReceptionID}`, { headers: { "auth-token": localStorage.getItem("token") } }),
                axios.get(`${apiUrl}/product`, { headers: { "auth-token": localStorage.getItem("token") } }),
                            ]);
            setProducts(productsRes.data);
            setOrderLineReception(orderLineReceptionRes.data);               
        } 
        catch (err) {
            console.error("Error carregant dades:", err);
        } 
    };
  


    useEffect(() => {
        fetchData();

    }, []);

    useEffect(() => {

    }, [error]);



    const handleInputChange = (event) => {
        setDataForm({
            ...dataForm,
            [event.target.name]: event.target.value
        })
    };


    const handleSubmitIncident = (e) => {
        e.preventDefault();

        console.log("Datos a enviar en la incidencia:");
       // Validar errors
       setError("")
       dataForm.quantity_ordered < 0 ? setError("El valor ha de ser positiu."):    
       (dataForm.description.length< 4 || dataForm.description.length> 250) ?   setError("La descripció ha de tindre entre 4 i 250 caracters."):
       postDataIncident();
    };

    const postDataIncident = async () => {
        const apiURL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        try {
          
            const orderReceptionRes = await axios.get(`${apiUrl}/orderreception/${orderLineReception.order_reception_id}`, { headers: { "auth-token": localStorage.getItem("token") } })
            console.log(orderReceptionRes)
            const dataSend = {
                'description' : dataForm.description,
                'operator_id' : JSON.parse(localStorage.getItem("user")).id,
                'supplier_id' :  orderReceptionRes.supplier_id,
                'orderReception_id' : orderLineReceptionID,
                'product_id' :orderLineReception.product_id, 
                'status' : 1 ,
                'quantity_ordered':orderLineReception.quantity_ordered,
                'quantity_received': dataForm.quantity_received
             }   
             console.log(dataSend)
            const response = await axios.post(`${apiURL}/incident`, dataSend,{ 
                headers: { "auth-token": token }
            });
        
        // Actualitzar dades de linea de ordre de recepció
                try {
                    const dataUpdate = {
                        'quantity_received': dataForm.quantity_received,
                    }
                    const response = await axios.put(`${apiURL}/orderlinereception/${orderLineReceptionID}`, dataUpdate,{ 
                        headers: { "auth-token": token }
                    });
                }catch (error){
                    console.error("Error actualitzant la linia d'ordre de recepció", error.response?.data || error.message);
                }

        } catch (error) {
            console.error("Error en postDataIncident:", error.response?.data || error.message);
        }
    };

    /*
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

    
    */
    

    
    return (
        <>
            {/* Modal per Crear incidència */}
            <Modal show={viewModal} onHide={() => handleModal()}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear incidència</Modal.Title>
                </Modal.Header>
                <form>
                <Modal.Body>
                    <div>
                        {/* Taula de productes associats a l'ordre */}
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
                                    <td>{orderLineReception.quantity_ordered}</td>
                                    <td><input 
                                            type='number' 
                                            className='form-control'
                                            name="quantity_ordered"
                                            onChange={handleInputChange}
                                            /></td>
                                </tr>
                                <tr>
                                    <td colSpan={3}>
                                        <label>Descripció</label>
                                        <textarea 
                                        name= "description"
                                        className='form-control'
                                        onChange={handleInputChange}
                                        >

                                        </textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        
                        <div><span className='text-danger' >{error} </span></div>
                       
                        
                    </div>                 
                </Modal.Body>
                <Modal.Footer>
                    <>
                        <Button 
                            variant="secondary"
                            onClick={() => handleModal()}>
                            Tancar
                        </Button>
                        <Button variant="success" onClick={handleSubmitIncident}>
                            Crear incidència
                        </Button>

                    </>
                </Modal.Footer>
                </form>
            </Modal>
            
        </>
    );
}
export default IncidenciaGenerarModal;