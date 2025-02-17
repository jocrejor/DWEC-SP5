import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import FiltresEspai from './FiltresEspai';

const apiUrl = import.meta.env.VITE_API_URL;

const SpaceSchema = Yup.object().shape({
    name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
    product_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
    quantity: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
    maxVol: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
    maxWeight: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
    storage_id: Yup.string().required('Valor requerit'),
    street_id: Yup.string().required('Valor requerit'),
    shelf_id: Yup.string().required('Valor requerit'),
});

function Space() {
    const [spaces, setSpaces] = useState([]);
    const [filteredSpaces, setFilteredSpaces] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalType, setModalType] = useState("Crear");
    const [initialValues, setInitialValues] = useState({
        name: '', product_id: '', quantity: '', maxVol: '', maxWeight: '', storage_id: '', street_id: '', shelf_id: ''
    });
    const [selectedSpace, setSelectedSpace] = useState(null);
    const navigate = useNavigate();
    const { magatzem, carrer, estanteria } = useParams();
    const [filters, setFilters] = useState({
        storage_id: magatzem,
        street_id: carrer,
        shelf_id: estanteria
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        if (magatzem && carrer && estanteria) {
            axios.get(`${apiUrl}/space`, {
                headers: { "auth-token": localStorage.getItem("token") }
            })
                .then(response => {
                    const filteredSpaces = response.data.filter(space =>
                        space.storage_id === magatzem &&
                        space.street_id === carrer &&
                        space.shelf_id === estanteria
                    );
                    setSpaces(filteredSpaces);
                    setFilteredSpaces(filteredSpaces); // Set filtered spaces
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [magatzem, carrer, estanteria]);

    // Función para manejar la paginación
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Filtrar los espacios que se deben mostrar según la página actual
    const currentSpaces = filteredSpaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const deleteSpace = async (id) => {
        try {
            await axios.delete(`${apiUrl}/space/${id}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            });
            setSpaces(spaces.filter(item => item.id !== id));
            setFilteredSpaces(filteredSpaces.filter(item => item.id !== id)); // Actualizamos también los espacios filtrados
        } catch (error) {
            console.error('Error deleting space:', error);
        }
    };

    const editSpace = (values) => {
        setModalType("Modificar");
        setInitialValues(values);
        setShowModal(true);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
        setModalType("Crear");
    };

    const viewSpace = (space) => {
        setSelectedSpace(space); // Establecer el espacio seleccionado
        setShowViewModal(true); // Mostrar el modal
    };

    const modSuppliers = (valors) => {
        console.log("Modificando espacio:", valors);
        editSpace(valors);
    };

    const deleteSuppliers = (id) => {
        console.log("Eliminando espacio:", id);
        deleteSpace(id);
    };

    // Función para manejar el cambio de filtros
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters); // Actualizar los filtros con los nuevos valores
    };

    return (
        <>
            {/* Componente de filtros */}
            <FiltresEspai
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {spaces.length === 0 ? (
                <p>No hi han espais</p>
            ) : (
                <div className="table-responsive mt-3">
                    <table className="table table-striped text-center">
                        <thead className="table-active border-bottom border-dark-subtle">
                            <tr>
                                <th scope="col"><input className="form-check-input" type="checkbox" /></th>
                                <th scope="col">ID</th>
                                <th scope="col">Nom</th>
                                <th scope="col">ID Producte</th>
                                <th scope="col">Quantitat</th>
                                <th scope="col">Volumen</th>
                                <th scope="col">Pes</th>
                                <th scope="col">ID Magatzem</th>
                                <th scope="col">ID Carrer</th>
                                <th scope="col">ID Estanteria</th>
                                <th scope="col">Accions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSpaces.map((values) => (
                                <tr key={values.id}>
                                    <td><input className="form-check-input" type="checkbox" /></td>
                                    <td>{values.id}</td>
                                    <td>{values.name}</td>
                                    <td>{values.product_id}</td>
                                    <td>{values.quantity}</td>
                                    <td>{values.maxVol}</td>
                                    <td>{values.maxWeight}</td>
                                    <td>{values.storage_id}</td>
                                    <td>{values.street_id}</td>
                                    <td>{values.shelf_id}</td>
                                    <td data-no-colon="true">
                                        <span onClick={() => viewSpace(values)} style={{ cursor: "pointer" }}>
                                            <i className="bi bi-eye"></i>
                                        </span>

                                        <span onClick={() => modSuppliers(values)} className="mx-2" style={{ cursor: "pointer" }}>
                                            <i className="bi bi-pencil-square"></i>
                                        </span>

                                        <span onClick={() => deleteSuppliers(values.id)} style={{ cursor: "pointer" }}>
                                            <i className="bi bi-trash"></i>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <nav aria-label="Page navigation example" className="d-block">
                        <ul className="pagination justify-content-center">
                            <li className="page-item">
                                <a className="page-link text-light-blue" href="#" onClick={() => paginate(currentPage - 1)} aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            {Array.from({ length: Math.ceil(filteredSpaces.length / itemsPerPage) }).map((_, index) => (
                                <li key={index} className="page-item">
                                    <a
                                        className={`page-link ${currentPage === index + 1 ? 'activo-2' : 'text-light-blue'}`}
                                        href="#"
                                        onClick={() => paginate(index + 1)}
                                    >
                                        {index + 1}
                                    </a>
                                </li>
                            ))}
                            <li className="page-item">
                                <a className="page-link text-light-blue" href="#" onClick={() => paginate(currentPage + 1)} aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modal para Ver Espacio */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Visualitzar Espai</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSpace ? (
                        <div>
                            <p><strong>Nom:</strong> {selectedSpace.name}</p>
                            <p><strong>ID Producte:</strong> {selectedSpace.product_id}</p>
                            <p><strong>Quantitat:</strong> {selectedSpace.quantity}</p>
                            <p><strong>Volumen:</strong> {selectedSpace.maxVol}</p>
                            <p><strong>Pes:</strong> {selectedSpace.maxWeight}</p>
                            <p><strong>ID Magatzem:</strong> {selectedSpace.storage_id}</p>
                            <p><strong>ID Carrer:</strong> {selectedSpace.street_id}</p>
                            <p><strong>ID Estanteria:</strong> {selectedSpace.shelf_id}</p>
                        </div>
                    ) : (
                        <p>No se ha seleccionado ningún espacio.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Tancar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal para Crear/Modificar Espacio */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType} Espai</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={modalType === 'Modificar' ? initialValues : { name: '', product_id: '', quantity: '', maxVol: '', maxWeight: '', storage_id: '', street_id: '', shelf_id: '' }}
                        validationSchema={SpaceSchema}
                        onSubmit={async (values) => {
                            try {
                                if (modalType === "Crear") {
                                    await axios.post(`${apiUrl}/space`, values, { headers: { "auth-token": localStorage.getItem("token") } });
                                } else {
                                    await axios.put(`${apiUrl}/space/${values.id}`, values, { headers: { "auth-token": localStorage.getItem("token") } });
                                }
                                setShowModal(false);
                                window.location.reload();
                            } catch (error) {
                                console.error('Error on submit:', error);
                            }
                        }}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <Field type="text" name="name" placeholder="Nom de l'espai" className="form-control" />
                                {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                                <Button variant="primary" type="submit">{modalType === "Crear" ? "Crear" : "Modificar"}</Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Space;
