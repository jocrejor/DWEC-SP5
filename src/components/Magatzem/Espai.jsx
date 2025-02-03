import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Filtres from '../Filtres';

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

const apiUrl = import.meta.env.VITE_API_URL;

function Space() {
    const [spaces, setSpace] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tipoModal, setTipoModal] = useState("Crear");
    const [valorsInicials, setValorsInicials] = useState({ name: '', product_id: '', quantity: '', maxVol: '', maxWeight: '', storage_id: '', street_id: '', selft_id: '' });
    const navigate = useNavigate();
    const { magatzem, carrer, estanteria } = useParams();

    useEffect(() => {
        // Solo hacer la llamada si magatzem, carrer y estanteria están disponibles
        if (magatzem && carrer && estanteria) {
            axios.get(`${apiUrl}/space?storage_id=${magatzem}&street_id=${carrer}&selft_id=${estanteria}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            })
                .then((response) => {
                    setSpace(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [magatzem, carrer, estanteria]);

    const eliminarSpace = async (id) => {
        try {
            await axios.delete(`${apiUrl}/space/${id}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            });
            setSpace(spaces.filter(item => item.id !== id)); // Actualizar el estado sin recargar la página
        } catch (error) {
            console.error('Error deleting space:', error);
        }
    };

    const modificarSpace = (valors) => {
        setTipoModal("Modificar");
        setValorsInicials(valors);
        setShowModal(true);
    };

    const canviEstatModal = () => {
        setShowModal(!showModal);
    };

    const handleEspaiClick = (id) => {
        navigate(`../espai/${magatzem}/${carrer}/${estanteria}/${id}`);
    };

    return (
        <>
            <Filtres />
            <h2>Magatzem: {magatzem}</h2>
            <h2>Carrer: {carrer}</h2>
            <h2>Estanteria: {estanteria}</h2>
            <Button variant="success" onClick={() => { canviEstatModal(); setTipoModal("Crear"); }}>Alta Espai</Button>
            
            {/* Indicador de si no hay espacios */}
            {spaces.length === 0 ? (
                <p>No hi han espais</p>
            ) : (
                <table className="table table-striped text-center align-middle">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Nom</th>
                            <th>ID Producte</th>
                            <th>Quantitat</th>
                            <th>Volumen</th>
                            <th>Pes</th>
                            <th>ID Magatzem</th>
                            <th>ID Carrer</th>
                            <th>ID Estanteria</th>
                            <th>Modificar</th>
                            <th>Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {spaces.map((valors) => (
                            <tr key={valors.id}>
                                <td>{valors.id}</td>
                                <td>{valors.name}</td>
                                <td>{valors.product_id}</td>
                                <td>{valors.quantity}</td>
                                <td>{valors.maxVol}</td>
                                <td>{valors.maxWeight}</td>
                                <td>{valors.storage_id}</td>
                                <td>{valors.street_id}</td>
                                <td>{valors.selft_id}</td>
                                <td><Button variant="warning" onClick={() => modificarSpace(valors)}>Modificar</Button></td>
                                <td><Button variant="danger" onClick={() => eliminarSpace(valors.id)}>Eliminar</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal show={showModal} onHide={canviEstatModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{tipoModal} Espai</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Formik
                        initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '', product_id: '', quantity: '', maxVol: '', maxWeight: '', storage_id: '', street_id: '', selft_id: '' }}
                        validationSchema={SpaceSchema}
                        onSubmit={async (values) => {
                            try {
                                if (tipoModal === "Crear") {
                                    await axios.post(`${apiUrl}/space`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                } else {
                                    await axios.put(`${apiUrl}/space/${values.id}`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                }
                                setShowModal(false);

                                // Actualizar la lista sin recargar la página
                                const response = await axios.get(`${apiUrl}/space?storage_id=${magatzem}&street_id=${carrer}&selft_id=${estanteria}`, {
                                    headers: { "auth-token": localStorage.getItem("token") }
                                });
                                setSpace(response.data);
                            } catch (error) {
                                console.error('Error on submit:', error);
                            }
                        }}
                    >
                        {({ values, errors, touched }) => (
                            <Form>
                                <div>
                                    <label htmlFor="name">Nom</label>
                                    <Field type="text" name="name" placeholder="Nom de l'espai" autoComplete="off" value={values.name} className="form-control" />
                                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="product_id">ID Producte</label>
                                    <Field type="text" name="product_id" placeholder="Id del producte" autoComplete="off" value={values.product_id} className="form-control" />
                                    {errors.product_id && touched.product_id && <div className="text-danger">{errors.product_id}</div>}
                                </div>

                                <div>
                                    <label htmlFor="quantity">Quantitat</label>
                                    <Field type="number" name="quantity" placeholder="Quantitat" autoComplete="off" value={values.quantity} className="form-control" />
                                    {errors.quantity && touched.quantity && <div className="text-danger">{errors.quantity}</div>}
                                </div>

                                <div>
                                    <label htmlFor="maxVol">Volum</label>
                                    <Field type="number" name="maxVol" placeholder="Volum" autoComplete="off" value={values.maxVol} className="form-control" />
                                    {errors.maxVol && touched.maxVol && <div className="text-danger">{errors.maxVol}</div>}
                                </div>

                                <div>
                                    <label htmlFor="maxWeight">Pes</label>
                                    <Field type="number" name="maxWeight" placeholder="Pes" autoComplete="off" value={values.maxWeight} className="form-control" />
                                    {errors.maxWeight && touched.maxWeight && <div className="text-danger">{errors.maxWeight}</div>}
                                </div>

                                <div>
                                    <label htmlFor="storage_id">ID Magatzem</label>
                                    <Field type="text" name="storage_id" placeholder="Id del magatzem" autoComplete="off" value={values.storage_id} className="form-control" />
                                    {errors.storage_id && touched.storage_id && <div className="text-danger">{errors.storage_id}</div>}
                                </div>

                                <div>
                                    <label htmlFor="street_id">ID Carrer</label>
                                    <Field type="text" name="street_id" placeholder="Id del carrer" autoComplete="off" value={values.street_id} className="form-control" />
                                    {errors.street_id && touched.street_id && <div className="text-danger">{errors.street_id}</div>}
                                </div>

                                <div>
                                    <label htmlFor="selft_id">ID Estanteria</label>
                                    <Field type="text" name="selft_id" placeholder="Id de la estanteria" autoComplete="off" value={values.selft_id} className="form-control" />
                                    {errors.selft_id && touched.selft_id && <div className="text-danger">{errors.selft_id}</div>}
                                </div>

                                <div>
                                    <Button variant="secondary" onClick={canviEstatModal}>Close</Button>
                                    <Button variant={tipoModal === "Modificar" ? "success" : "info"} type="submit">{tipoModal}</Button>
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
