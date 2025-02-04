import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Filtres from '../Filtres';

const apiUrl = import.meta.env.VITE_API_URL;

const SpaceSchema = Yup.object().shape({
    name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
    product_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
    quantity: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
    maxVol: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
    maxWeight: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
    storage_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
    street_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
    selft_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
});

function Space() {
    const [spaces, setSpaces] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("Crear");
    const [initialValues, setInitialValues] = useState({
        name: '', product_id: '', quantity: '', maxVol: '', maxWeight: '', storage_id: '', street_id: '', selft_id: ''
    });

    const navigate = useNavigate();
    const { magatzem, carrer, estanteria } = useParams();

    useEffect(() => {
        if (magatzem && carrer && estanteria) {
            axios.get(`${apiUrl}/space?storage_id=${magatzem}&street_id=${carrer}&selft_id=${estanteria}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            })
                .then(response => setSpaces(response.data))
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [magatzem, carrer, estanteria]);

    const deleteSpace = async (id) => {
        try {
            await axios.delete(`${apiUrl}/space/${id}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            });
            setSpaces(spaces.filter(item => item.id !== id));
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

    return (
        <>
            <Filtres />

            <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
                <div className="col-12 col-md-6 col-xl-4 d-flex">
                    <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
                        <div className="form-floating bg-white">
                            <select className="form-select">
                                <option selected>Tria una opció</option>
                                <option value="1">Eliminar</option>
                            </select>
                            <label>Accions en lot</label>
                        </div>
                        <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0">
                            <i className="bi bi-check-circle text-white px-1"></i>Aplicar
                        </button>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4 d-flex justify-content-xl-end">
                    <Button onClick={toggleModal} className="btn btn-dark border-white text-white mt-2 flex-grow-1 flex-xl-grow-0">
                        <i className="bi bi-plus-circle text-white pe-1"></i>Crear
                    </Button>
                </div>
            </div>

            <h2>Magatzem: {magatzem}</h2>
            <h2>Carrer: {carrer}</h2>
            <h2>Estanteria: {estanteria}</h2>

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
                                <th scope="col">Visualitzar</th>
                                <th scope="col">Modificar</th>
                                <th scope="col">Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spaces.map((values) => (
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
                                    <td>{values.selft_id}</td>
                                    <td>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                // Visualitzar Logic (e.g., navigate to a detailed view)
                                                console.log("Viewing", valors);
                                            }}
                                        >
                                            <i className="bi bi-eye p-2"></i>
                                        </Button>
                                    </td>
                                    <td><Button variant="outline-success" onClick={() => editSpace(values)}><i className="bi bi-pencil-square"></i></Button></td>
                                    <td><Button variant="outline-danger" onClick={() => deleteSpace(values.id)}><i className="bi bi-trash"></i></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType} Espai</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={modalType === 'Modificar' ? initialValues : { name: '', product_id: '', quantity: '', maxVol: '', maxWeight: '', storage_id: '', street_id: '', selft_id: '' }}
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
