import { useState, useEffect } from "react";
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

    // Estats paginació
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [orderPickingPage,setOrderPickingPage]= useState([]); 

    //url api, token, paginacio
    const apiUrl = import.meta.env.VITE_API_URL; 
    const token = localStorage.getItem("token");
    const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

    //navegate
    const navigate =useNavigate();
    const location = useLocation();

    const dataFetch = async ()=>{
        try{
        //order line reception
            const orderLineReception = await axios.get(`${apiUrl}orderlinereception`, { headers: { "auth-token": token }})
            setOrderLineReception(orderLineReception.data)
        }catch{(error) => {console.error('Error order line:', error);}};

        //order picking reception
        try {
            const orderpickingreception = await axios.get(`${apiUrl}orderpickingreception`, { headers: { "auth-token": token } })
            setOrderPickingReception(orderpickingreception.data);
        }
        catch{(error) => {console.error('Error order picking:', error);}};

        //product
        try {
            const product = await axios.get(`${apiUrl}product`, { headers: { "auth-token": token } })
            setProducts(product.data);
        }
        catch{(error) => {console.error('Error product:', error);}};

        //space
        try {
            const space = await axios.get(`${apiUrl}space`, { headers: { "auth-token": token } })
            setSpaces(space.data);
        }
        catch{(error) => {console.error('Error space:', error);}};

        //user
        try {
            const user = await axios.get(`${apiUrl}users`, { headers: { "auth-token": token } })
            setUsers(user.data);
        }
        catch{(error) => {console.error('Error user:', error);}};
    }

    useEffect(() => {
        dataFetch()
    }, []);

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
                console.error("Error en actualitzar estat linea",error.response.data);
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
            // Actualitzar quantitat space
            const updatedSpace = {
                ...space,
                quantity: space.quantity + lineActualitzar.quantity_received,
            };

            axios.put(`${apiUrl}space/${space.storage_id}/${space.street_id}/${space.shelf_id}/${space.id}`, updatedSpace, {headers: { "auth-token": token }})
                .then((response) => {
                    console.log("Quantitat space actialitzada", response.data);
                })
                .catch((error) => {
                    console.error("Error en actualitzar quantitat space", error.response.data);
                });

            movMagatzem(lineActualitzar.product_id, lineActualitzar.operator_id, lineActualitzar.quantity_received, "Recepcio", space.storage_id, space.storage_id, space.street_id, space.shelf_id, space.id);
            console.log("Moviment eixida realitzat");

            movMagatzem(lineActualitzar.product_id, lineActualitzar.operator_id, lineActualitzar.quantity_received, "General", space.storage_id, space.storage_id, space.street_id, space.shelf_id, space.id);
            console.log("Moviment entrada realitzat");
        }
        alert("Order picking completada");
    };

    //funcions paginació
    useEffect (()=>{
        const totalPages = Math.ceil(orderPickingReception.length / elementsPaginacio);
        setTotalPages(totalPages);
        console.log(totalPages)
    },[orderPickingReception])

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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

    useEffect(()=> {
        const indexOfLastItem = currentPage * elementsPaginacio;
        const indexOfFirstItem = indexOfLastItem - elementsPaginacio;
        const currentItems = orderPickingReception.slice(indexOfFirstItem, indexOfLastItem);
        setOrderPickingPage(currentItems)
    },[currentPage,orderPickingReception])

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
                                        <th scope="col">Ubicació</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orderPickingPage
                                        .filter(order => order.operator_id === parseInt(usuariFiltrar))
                                        .map(order => {
                                            const user = users.find(u => u.id === order.operator_id);
                                            const product = products.find(p => p.id === order.product_id);
                                            return (
                                                <tr key={order.id}>
                                                    <td className="d-flex justify-content-center align-items-center">
                                                        <i className="bi bi-arrow-down" onClick={() => completarOrderPicking(order.order_line_reception_id, order.id)}></i>
                                                    </td>
                                                    <td data-cell="Ordre ID">{order.id}</td>
                                                    <td data-cell="Producte">{product.name}</td>
                                                    <td data-cell="Data">{order.create_date}</td>
                                                    <td data-cell="Operari">{order.storage_id} / {order.street_id} / {order.shelf_id} / {order.space_id}</td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                            
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
                                    <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={(e) => {e.preventDefault(); goToNextPage(); }}>
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
