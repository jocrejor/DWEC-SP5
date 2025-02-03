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
                .then(response => {
                    setSpaces(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
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

    const openModal = () => {
        setShowModal(!showModal);
        setModalType("Crear");
    };

    const handleSpaceClick = (id) => {
        navigate(`../espai/${magatzem}/${carrer}/${estanteria}/${id}`);
    };

    return (
        <>
            <Filtres />
            <h2>Magatzem: {magatzem}</h2>
            <h2>Carrer: {carrer}</h2>
            <h2>Estanteria: {estanteria}</h2>
            <Button variant="success" onClick={openModal}>Alta Espai</Button>
            
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
                                    await axios.post(`${apiUrl}/space`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                } else {
                                    await axios.put(`${apiUrl}/space/${values.id}`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                }
                                setShowModal(false);
                                window.location.reload();
                            } catch (error) {
                                console.error('Error on submit:', error);
                            }
                        }}
                    >
                        {({ values, errors, touched }) => (
                            <Form>
                                <div>
                                    <label htmlFor="name">Nom</label>
                                    <Field type="text" name="name" placeholder="Nom de l'espai" className="form-control" />
                                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                                </div>
                                <div>
                                    <label htmlFor="product_id">ID Producte</label>
                                    <Field type="text" name="product_id" placeholder="Id del producte" className="form-control" />
                                    {errors.product_id && touched.product_id && <div className="text-danger">{errors.product_id}</div>}
                                </div>
                                <div>
                                    <label htmlFor="quantity">Quantitat</label>
                                    <Field type="number" name="quantity" placeholder="Quantitat" className="form-control" />
                                    {errors.quantity && touched.quantity && <div className="text-danger">{errors.quantity}</div>}
                                </div>
                                <div>
                                    <label htmlFor="maxVol">Volumen</label>
                                    <Field type="number" name="maxVol" placeholder="Volumen" className="form-control" />
                                    {errors.maxVol && touched.maxVol && <div className="text-danger">{errors.maxVol}</div>}
                                </div>
                                <div>
                                    <label htmlFor="maxWeight">Pes</label>
                                    <Field type="number" name="maxWeight" placeholder="Pes" className="form-control" />
                                    {errors.maxWeight && touched.maxWeight && <div className="text-danger">{errors.maxWeight}</div>}
                                </div>
                                <div>
                                    <label htmlFor="storage_id">ID Magatzem</label>
                                    <Field type="text" name="storage_id" placeholder="Id del magatzem" className="form-control" />
                                    {errors.storage_id && touched.storage_id && <div className="text-danger">{errors.storage_id}</div>}
                                </div>
                                <div>
                                    <label htmlFor="street_id">ID Carrer</label>
                                    <Field type="text" name="street_id" placeholder="Id del carrer" className="form-control" />
                                    {errors.street_id && touched.street_id && <div className="text-danger">{errors.street_id}</div>}
                                </div>
                                <div>
                                    <label htmlFor="selft_id">ID Estanteria</label>
                                    <Field type="text" name="selft_id" placeholder="Id de l'estanteria" className="form-control" />
                                    {errors.selft_id && touched.selft_id && <div className="text-danger">{errors.selft_id}</div>}
                                </div>
                                <div className="mt-3">
                                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel·lar</Button>
                                    <Button variant="primary" type="submit">{modalType === "Crear" ? "Crear" : "Modificar"}</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Space;
