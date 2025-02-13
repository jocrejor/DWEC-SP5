import { useState, useEffect } from "react";
import {Modal } from "react-bootstrap";
import axios from "axios";
import { useNavigate,useLocation } from "react-router-dom";

function OrderPickingReception() {
    const [orderreception, setOrderReception] = useState([]); //order reception
    const [orderLineReception, setOrderLineReception] = useState([]); //order line reception
    const [products, setProducts] = useState([]); //product
    const [temporalPickings, setTemporalPickings] = useState([]); //temporal pickings
    const [spaces, setSpaces] = useState([]); //space
    const [users, setUsers] = useState([]); //user
    const [operariSeleccionat, setOperariSeleccionat] = useState(""); //operari seleccionat al crear order picking

    const [showModal, setShowModal] = useState(false); //mostrar modal
    const [tipoModal, setTipoModal] = useState("Alta"); //tipus de modal Alta/Visualitzar

    const [orderSelected, setOrderSelected] = useState([]); //order seleccionat per crear order picking

    //estats paginació
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [orderLinesPage,setOrderLinesPage]= useState([]);
    
    //dades .env
    const apiUrl = import.meta.env.VITE_API_URL; 
    const token = localStorage.getItem("token");
    const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

    // navigate
    const navigate =useNavigate();
    const location = useLocation();

    const dataFetch = async ()=>{
        try{
        //order line reception
        const orderLineReception = await axios.get(`${apiUrl}orderlinereception`, { headers: { "auth-token": token } 
        })
        setOrderLineReception(orderLineReception.data)
        }catch{(error) => {console.error('Error order line:', error);}};
        
        //order reception
        try{
        const orderReception = await axios.get(`${apiUrl}orderreception`, { headers: { "auth-token": token }})
        setOrderReception(orderReception.data)
        }
        catch{(error) => {console.error('Error order reception:', error);}};

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

    useEffect(()=>{
        const orderPendent = orderreception.filter((order) => order.orderreception_status_id === 3);
        const tempPickings = [];
        
        //recorrer orden reception pendent (desempaquetada)
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
        
    },[orderreception, orderLineReception,spaces])

    useEffect(() => {
        dataFetch()
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
            const product = products.find((p) => p.id === line.product_id);
            const space = spaces.find((s) => s.product_id === line.product_id);

            if (line.quantity_received * product.volume > space.volume_max) {
                // Buscar esopai buit
                const nouSpace = spaces.find((s) => s.product_id === null && s.volume_max >= line.quantity_received * product.volume);

                space = nouSpace;
                const spaceCanvi = true;

                if (spaceCanvi) {
                    alert(`El producte ${line.product_id} ha segut reubicat a un nou espai per falta de capacitat`);
                }
            }

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

    //funcions paginació
    useEffect (()=>{
        const totalPages = Math.ceil(temporalPickings.length / elementsPaginacio);
        setTotalPages(totalPages);
        console.log(totalPages)
    },[temporalPickings])

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
        const currentItems = temporalPickings.slice(indexOfFirstItem, indexOfLastItem);
        setOrderLinesPage(currentItems)
    },[currentPage,temporalPickings])

    return (
        <>
            <div className="container-fluid">
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
                                    navigate(`/orderpickingreception/picking`);
                                }}
                                type="button"
                                className="btn btn-dark ms-2 border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                                >
                                    Fer Picking
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
                                        {orderLinesPage.map(temporalPicking => {
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
  
                <Modal show={showModal} onHide={canviEstatModal}>
                    <Modal.Header closeButton className="bg-orange">
                        <Modal.Title className="text-white">{tipoModal}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                            <>
                                <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
                                    <div className="order-1 pb-2 col-6 order-md-0 d-flex">
                                        <div className="d-flex rounded border mt-2">
                                            <div className="form-floating bg-white">
                                                <select className="form-select" name="operari" id="operari" aria-label="Seleccione un operari" 
                                                    value= {operariSeleccionat} onChange={handleInputChange}
                                                >
                                                    <option value="" selected disabled>Tria una opció</option>
                                                    {users.map((user) => {
                                                        return (
                                                            <option value={user.id}>{user.name}</option>
                                                        );
                                                    })}
                                                </select>
                                                <label htmlFor="operari">Operari</label>
                                            </div>
                                        </div>
                                    </div> 

                                    <div className="col-6 order-0 order-md-1 oder-xl-2 pb-2 pb-md-0">
                                        <div className="d-flex h-100 justify-content-xl-end">
                                            <button onClick={() => {
                                                aceptarOrderPickingReception();
                                            }}
                                            type="button"
                                            className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
                                            >
                                                Aceptar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <table className="table table-striped text-center">
                                    <thead className="table-active border-bottom border-dark-subtle">
                                        <tr>
                                            <th scope="col">Producte</th>
                                            <th scope="col">Quantitat</th>
                                            <th scope="col">Magatzem / Carrer / Estantería / Espai</th>
                                        </tr>
                                    </thead>


                                    <tbody>
                                        {orderSelected.map(order => {
                                            const lines = orderLineReception.find(line => line.id === parseInt(order));
                                            const product = products.find(p => p.id === lines.product_id);
                                            const space = spaces.find((space) => space.product_id === lines.product_id);
                                            return (
                                                <tr key={order}>
                                                    <td data-cell="Producte">{product.name}</td>
                                                    <td data-cell="Quantitat">{lines.quantity_received}</td>
                                                    <td data-cell="Magatzem / Carrer / Estantería / Espai">
                                                        {space.storage_id} / {space.street_id} / {space.shelf_id} / {space.id}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </>
                    </Modal.Body>
                </Modal>
            </>
    )
}

export default OrderPickingReception;
