import { useState, useEffect } from "react";
//import { Formik, Form, Field } from "formik";
import { url, postData, getData, deleteData, updateId } from "../../apiAccess/crud";
import { Button, Table, Modal } from "react-bootstrap";
import axios from "axios";
import Filtres from "../Filtres";
import Header from "../Header";
import { movMagatzem } from "../Magatzem/movMagatzem"; 

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

    const completarOrderPicking = async (lineId, orderPickingId) => {
         // filtrar la linea de la order picking
        const lineActualitzar = orderLineReception.find((line) => line.id === lineId);
    
        // Actualitzar estat a completada
        const updatedLine = {
            ...lineActualitzar,
            orderline_status_id: 3,
        };
        
        //actualitzar order line
        axios.put(`${apiUrl}orderlinereception/${lineId}`, updatedLine, {headers: { "auth-token": token }})
            .then((response) => {
                console.log("Linea actualitzada correctament", response.data);
            })
            .catch((error) => {
                console.error("Error en actualitzar",error.response.data);
            });
        
        // eliminar la order picking
        await axios.delete(`${apiUrl}orderpickingreception/${orderPickingId}`, {headers: { "auth-token": token }})
            .then((response) => {
                console.log("order picking esborrada", response.data);
            })
            .catch((error) => {
                console.error("Error en esborra order picking",error.response.data);
            });

        //crear moviments
        const space = spaces.find(space => space.product_id === lineActualitzar.product_id);
        if (space) {
            movMagatzem(lineActualitzar.product_id, lineActualitzar.operator_id, lineActualitzar.quantity_received, "Recepcio", space.storage_id, space.storage_id, space.street_id, space.shelf_id, space.id);
            console.log("Moviment eixida realitzat");

            movMagatzem(lineActualitzar.product_id, lineActualitzar.operator_id, lineActualitzar.quantity_received, "General", space.storage_id, space.storage_id, space.street_id, space.shelf_id, space.id);
            console.log("Moviment entrada realitzat");
        }
        alert("Order picking completada");
    };

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
                    {/*<div>
                        <h2>Llistat Order Reception</h2>
                    </div>

                    <Button variant="success" onClick={() => {
                        crearOrderPickingReception();
                    }}>Crear Order Picking</Button>

                    <Button variant="success" onClick={() => {
                        setTabla("ListarOrder");
                    }}>Llistar Order Picking</Button>*/}

                    <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
                        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
                            <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
                                <div className="form-floating bg-white">
                                    <select
                                        className="form-select"
                                        id="floatingSelect"
                                        aria-label="Seleccione una opción"
                                    >
                                        <option selected>Tria una opció</option>
                                        <option value="1">Eliminar</option>
                                    </select>
                                    <label htmlFor="floatingSelect">Accions en lot</label>
                                </div>
                                <button
                                    className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0"
                                    type="button"
                                >
                                    <i className="bi bi-check-circle text-white px-1"></i>Aplicar
                                </button>
                            </div>
                        </div>
                        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
                        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
                            <div className="d-flex h-100 justify-content-xl-end">
                                <button onClick={() => {
                                    crearOrderPickingReception();
                                }}
                                type="button"
                                className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                                >
                                    <i className="bi bi-plus-circle text-white pe-1"></i>Crear
                                </button>
                                <button onClick={() => {
                                    setTabla("ListarOrder");
                                }}
                                type="button"
                                className="btn btn-dark ms-2 border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                                >
                                    Llistar Orders Picking
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12">
                            <div>
                                <table className="table table-striped text-center">
                                    <thead className="table-active border-bottom border-dark-subtle">
                                        <tr>
                                            <th scope="col">
                                                <input className="form-check-input" type="checkbox"/>
                                            </th>
                                            <th scope="col">ID Order</th>
                                            <th scope="col">Producte</th>
                                            <th scope="col">Quantitat</th>
                                            <th scope="col">Magatzem / Carrer / Estantería / Espai</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {temporalPickings.map(temporalPicking => {
                                            const product = products.find(p => p.id === temporalPicking.product_id);
                                            return (
                                                <tr key={temporalPicking.order_reception_id}>
                                                    <td scope="row" data-cell="Seleccionar">
                                                        <input className="form-check-input" type="checkbox" value={temporalPicking.order_line_reception_id}/>
                                                    </td>
                                                    <td data-cell="Ordre ID">{temporalPicking.order_reception_id}</td>
                                                    <td data-cell="Producte">{product.name}</td>
                                                    <td data-cell="Quantitat">{temporalPicking.quantity_received}</td>
                                                    <td data-cell="Magatzem / Carrer / Estantería / Espai">
                                                        {temporalPicking.storage_id} / {temporalPicking.street_id} / {temporalPicking.shelf_id} / {temporalPicking.space_id}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                        </div>
                    </div>

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
                    {/*<Button variant="success" onClick={() => {
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
                    </select>*/}

                    <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
                        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
                            <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
                                <div className="form-floating bg-white">
                                    <select className="form-select" id="floatingSelect" aria-label="Seleccione un operari" value={usuariFiltrar} onChange={(e) => setUsuariFiltrar(e.target.value)}>
                                        <option value="" disbled selected>Tria un operari</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label htmlFor="floatingSelect">Operari</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
                        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
                            <div className="d-flex h-100 justify-content-xl-end">
                                <button onClick={() => {
                                    setTabla("CrearOrder");
                                }}
                                type="button"
                                className="btn btn-dark ms-2 border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                                >
                                    Enrrere
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12">
                            <div>
                                <table className="table table-striped text-center">
                                    <thead className="table-active border-bottom border-dark-subtle">
                                        <tr>
                                            <th scope="col">Emmagatzemat</th>
                                            <th scope="col">Ordre ID</th>
                                            <th scope="col">Producte</th>
                                            <th scope="col">Data</th>
                                            <th scope="col">Operari</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {orderPickingReception
                                            .filter(order => order.operator_id === parseInt(usuariFiltrar))
                                            .map(order => {
                                                const user = users.find(u => u.id === order.operator_id);
                                                const product = products.find(p => p.id === order.product_id);
                                                return (
                                                    <tr key={order.id}>
                                                        <td class="d-flex justify-content-center align-items-center">
                                                            <i class="bi bi-arrow-down" onClick={() => completarOrderPicking(order.order_line_reception_id, order.id)}></i>
                                                        </td>
                                                        <td data-cell="Ordre ID">{order.id}</td>
                                                        <td data-cell="Producte">{product.name}</td>
                                                        <td data-cell="Data">{order.create_date}</td>
                                                        <td data-cell="Operari">{user.name}</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

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
