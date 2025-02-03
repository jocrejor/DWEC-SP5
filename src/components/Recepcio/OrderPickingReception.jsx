import { useState, useEffect } from "react";
//import { Formik, Form, Field } from "formik";
import { url, postData, getData, deleteData, updateId } from "../../apiAccess/crud";
import { Button, Table, Modal } from "react-bootstrap";
import axios from "axios";
import Filtres from "../Filtres";
import Header from "../Header";

function OrderPickingReception() {
    const [orderPickingReception, setOrderPickingReception] = useState([]); //order picking reception
    const [orderreception, setOrderReception] = useState([]); //order reception
    const [orderLineReception, setOrderLineReception] = useState([]); //order line reception
    const [products, setProducts] = useState([]); //product
    const [temporalPickings, setTemporalPickings] = useState([]); //temporal pickings
    const [spaces, setSpaces] = useState([]); //space
    const [users, setUsers] = useState([]); //user
    const [operariSeleccionat, setOperariSeleccionat] = useState(""); //operari seleccionat al crear order picking
    const [usuariFiltrar, setUsuariFiltrar] = useState(""); //usuari a filtrar en la taula order picking 

    const [showModal, setShowModal] = useState(false); //mostrar modal
    const [tipoModal, setTipoModal] = useState("Alta"); //tipus de modal Alta/Visualitzar
    const [orderVisualitzar, setOrderVisualitzar] = useState(null); //order a visualitzar
    const [tabla, setTabla] = useState("CrearOrder"); //taula CrearOrder/ListarOrder

    const [orderSelected, setOrderSelected] = useState([]); //order seleccionat per crear order picking
    
    //const apiUrl = url;
    const apiUrl = import.meta.env.VITE_API_URL; 
    const token = localStorage.getItem("token");

    useEffect(() => {
        //order line reception
        axios.get(`${apiUrl}orderlinereception`, { headers: { "auth-token": token } 
        })
        .then((response) => {setOrderLineReception(response.data);})
        .catch((error) => {console.error('Error order line:', error);});

        //order picking reception
        axios.get(`${apiUrl}orderpickingreception`, { headers: { "auth-token": token } 
        })
        .then((response) => {setOrderPickingReception(response.data);})
        .catch((error) => {console.error('Error order picking:', error);});

        //order reception
        axios.get(`${apiUrl}orderreception`, { headers: { "auth-token": token } 
        })
        .then((response) => {setOrderReception(response.data);})
        .catch((error) => {console.error('Error order reception:', error);});
    
        //product
        axios.get(`${apiUrl}product`, { headers: { "auth-token": token } 
        })
        .then((response) => {setProducts(response.data);})
        .catch((error) => {console.error('Error product:', error);});

        //space
        axios.get(`${apiUrl}space`, { headers: { "auth-token": token } 
        })
        .then((response) => {setSpaces(response.data);})
        .catch((error) => {console.error('Error space:', error);});
        
        //user
        axios.get(`${apiUrl}users`, { headers: { "auth-token": token } 
        })
        .then((response) => {setUsers(response.data);})
        .catch((error) => {console.error('Error user:', error);});

        //recorrer orden reception pendent (desempaquetada)
        const orderPendent = orderreception.filter((order) => order.orderreception_status_id === 1);

        const tempPickings = [];
        orderPendent.map((order) => {
            //filtrar lines en estat pendent o forçosa
            const lines = orderLineReception.filter((line) =>
                line.order_reception_id === order.id &&
                (line.orderline_status_id === 1 || line.orderline_status_id === 4)
            );

            //obtindre product.name, product.quantitat, product.space
            lines.forEach((line) => {
                const space = spaces.find((space) => space.product_id === line.product_id);
                if (space) {
                    console.log(order.id, line.id, line.product_id, line.quantity_received, space.storage_id, space.street_id, space.shelf_id, space.id);
                    const objTemporal = {
                        order_reception_id: order.id,
                        order_line_reception_id: line.id,
                        product_id: line.product_id,
                        quantity_received: line.quantity_received,
                        storage_id: space.storage_id,
                        street_id: space.street_id,
                        shelf_id: space.shelf_id,
                        space_id: space.id
                    }
                    tempPickings.push(objTemporal);
                }
            });
        });
        setTemporalPickings(tempPickings);
    }, []);

    const canviEstatModal = () => {
        setShowModal(!showModal);
    }

    const crearOrderPickingReception = () => {
        //obtindre els productes seleccionats
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert("No has seleccionat cap producte");
            return;
        } else {
            canviEstatModal();
            setTipoModal("Alta");

            const seleccio = [];
            checkboxes.forEach((checkbox) => {
                seleccio.push(checkbox.value);
            });

            console.log(seleccio);
            setOrderSelected(seleccio);
        }
    }

    const handleInputChange = (event) => {
        setOperariSeleccionat(event.target.value);
    };
    
    const aceptarOrderPickingReception = async () => {
        orderSelected.forEach((order) => {
            const line = orderLineReception.find((l) => l.id === parseInt(order));
            const space = spaces.find((s) => s.product_id === line.product_id);

            const newOrderPickingReception = {
                order_line_reception_id: line.id,
                product_id: line.product_id,
                quantity: line.quantity_received,
                storage_id: space.storage_id,
                street_id: space.street_id,
                shelf_id: space.shelf_id,
                space_id: space.id,
                operator_id: parseInt(operariSeleccionat)
            };

            axios.post(`${apiUrl}orderpickingreception`, newOrderPickingReception, { headers: { "auth-token": localStorage.getItem("token") }})
                .then((response) => {
                    console.log(response.data);
                    alert("Order picking reception creat correctament");
                }
                ).catch((error) => {        
                console.error('Error order picking reception:', error.response.data);
            }); 
        });
        canviEstatModal();
    }

    const mostrarOrder = (orderId) => {
        setOrderVisualitzar(orderId);
        setTipoModal("Visualitzar");
        setShowModal(true);
    }

    return (
        <>
            <Header title="Order picking Reception" />
            <Filtres />
            {tabla === "CrearOrder" ? (
                <>
                    <div>
                        <h2>Llistat Order Reception</h2>
                    </div>

                    <Button variant="success" onClick={() => {
                        crearOrderPickingReception();
                    }}>Crear Order Picking</Button>

                    <Button variant="success" onClick={() => {
                        setTabla("ListarOrder");
                    }}>Llistar Order Picking</Button>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID Order</th>
                                <th>Producte</th>
                                <th>Quantitat</th>
                                <th>Magatzem / Carrer / Estantería / Espai</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {temporalPickings.map(temporalPicking => {
                                const product = products.find(p => p.id === temporalPicking.product_id);
                                return (
                                    <tr key={temporalPicking.order_reception_id}>
                                        <td>{temporalPicking.order_reception_id}</td>
                                        <td>{product.name}</td>
                                        <td>{temporalPicking.quantity_received}</td>
                                        <td>{temporalPicking.storage_id} / {temporalPicking.street_id} / {temporalPicking.shelf_id} / {temporalPicking.space_id}</td>
                                        <td><input type="checkbox" value={temporalPicking.order_line_reception_id} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>

                    <Modal show={showModal} onHide={canviEstatModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{tipoModal}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {tipoModal === "Alta" && (
                                <>
                                    <label htmlFor="operari"></label>
                                    <select name="operari" id="operari" value= {operariSeleccionat} onChange={handleInputChange}>
                                        <option value="" selected disabled>Selecciona un operari</option>
                                        {users.map((user) => {
                                            return (
                                                <option value={user.id}>{user.name}</option>
                                            );
                                        })}
                                    </select>

                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Producte</th>
                                                <th>Quantitat</th>
                                                <th>Magatzem / Carrer / Estantería / Espai</th>
                                            </tr>
                                        </thead>


                                        <tbody>
                                            {orderSelected.map(order => {
                                                const lines = orderLineReception.find(line => line.id === parseInt(order));
                                                const product = products.find(p => p.id === lines.product_id);
                                                const space = spaces.find((space) => space.product_id === lines.product_id);
                                                return (
                                                    <tr key={order}>
                                                        <td>{product.name}</td>
                                                        <td>{lines.quantity_received}</td>
                                                        <td>{space.storage_id} / {space.street_id} / {space.shelf_id} / {space.id}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    <Button variant="success" onClick={() => {
                                        
                                        aceptarOrderPickingReception();
                                    }}>Aceptar</Button>
                                </>
                            )}
                        </Modal.Body>
                    </Modal>
                </>
            ) : (
                <>
                    <Button variant="success" onClick={() => {
                        setTabla("CrearOrder");
                    }}>Enrrere</Button>

                    <select
                        value={usuariFiltrar}
                        onChange={(e) => setUsuariFiltrar(e.target.value)}
                    >
                    <option value="" disbled selected>Selecciona un operari</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                    </select>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Emmagatzemat</th>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Operari</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orderPickingReception
                                .filter(order => order.operator_id === parseInt(usuariFiltrar))
                                .map(order => {
                                    const user = users.find(u => u.id === order.operator_id);
                                        return (
                                            <tr key={order.id}>
                                                <td class="d-flex justify-content-center align-items-center">
                                                    <i class="bi bi-arrow-down"></i>
                                                </td>
                                                <td>{order.id}</td>
                                                <td>{order.create_date}</td>
                                                <td>{user.name}</td>
                                            </tr>
                                        );
                                })}
                        </tbody>
                    </Table>

                    <Modal show={showModal} onHide={canviEstatModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{tipoModal}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            {tipoModal === "Visualitzar" && (
                                <>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Producte</th>
                                                <th>Quantitat</th>
                                                <th>Magatzem / Carrer / Estantería / Espai</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {orderPickingReception.find(order => order.id === orderVisualitzar)?.productos.map(producto => {
                                                const product = products.find(p => p.id === producto.product_id);
                                                
                                                return (
                                                    <tr key={producto.product_id}>
                                                        <td> </td>
                                                        <td>{product.name}</td>
                                                        <td>{producto.quantity}</td>
                                                        <td>
                                                           {producto.storage_id} / {producto.street_id} / {producto.shelf_id} / {producto.space_id}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    <Button variant="success" onClick={() => {
                                        canviEstatModal();
                                    }}>Tancar</Button>
                                </>
                            )}
                        </Modal.Body>
                    </Modal>
                </>
            )}

        </>
    );
}

export default OrderPickingReception;
