import { useState, useEffect } from "react";
import { url, postData, getData, deleteData, updateId } from "../../apiAccess/crud";
import { Button, Table, Modal } from "react-bootstrap";
import axios from "axios";
import { movMagatzem } from "../Magatzem/movMagatzem"; 
import { useNavigate,useLocation } from "react-router-dom";

function OrderPickingReception() {
    const [orderPickingReception, setOrderPickingReception] = useState([]); //order picking reception
    const [orderLineReception, setOrderLineReception] = useState([]); //order line reception
    const [products, setProducts] = useState([]); //product
    const [spaces, setSpaces] = useState([]); //space
    const [users, setUsers] = useState([]); //user
    const [usuariFiltrar, setUsuariFiltrar] = useState(""); //usuari a filtrar en la taula order picking 

    const [showModal, setShowModal] = useState(false); //mostrar modal

    //const apiUrl = url;
    const apiUrl = import.meta.env.VITE_API_URL; 
    const token = localStorage.getItem("token");

    //navegate
    const navigate =useNavigate();
    const location = useLocation();

    const dataFetch = async ()=>{
        try{
        //order line reception
        const orderLineReception = await axios.get(`${apiUrl}orderlinereception`, { headers: { "auth-token": token } 
        })
        setOrderLineReception(orderLineReception.data)
        }catch{(error) => {console.error('Error order line:', error);}};

        //order picking reception
        try {
        const orderpickingreception = await axios.get(`${apiUrl}orderpickingreception`, { headers: { "auth-token": token } 
        })
        setOrderPickingReception(orderpickingreception.data);
        }
        catch{(error) => {console.error('Error order picking:', error);}};

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
    }

    useEffect(() => {
        dataFetch()
    }, []);

    const canviEstatModal = () => {
        setShowModal(!showModal);
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

    return (
        <>
            <div className="container-fluid">
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
                                navigate(`/orderpickingreception/ordes`);
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
                                        })
                                    }
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
            </div>
        </>
    );
}

export default OrderPickingReception;
