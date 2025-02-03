import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Filtres from '../Filtres';

const apiUrl = import.meta.env.VITE_API_URL;

const StreetSchema = Yup.object().shape({
    name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
    storage_id: Yup.number().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
});

function Street() {
    const [streets, setStreet] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tipoModal, setTipoModal] = useState("Crear");
    const [valorsInicials, setValorsInicials] = useState({ name: '', storage_id: '' });
    const [loading, setLoading] = useState(true); // Nueva variable de estado para el estado de carga
    const navigate = useNavigate();
    let { magatzem } = useParams();

    useEffect(() => {
        setLoading(true); // Al inicio de la carga
        axios.get(`${apiUrl}/street?storage_id=${magatzem}`, {
            headers: { "auth-token": localStorage.getItem("token") }
        })
            .then(response => {
                setStreet(response.data);
                setLoading(false); // Carga finalizada
            })
            .catch(error => {
                console.log('Error fetching data:', error);
                setLoading(false); // Carga fallida
            });
    }, [magatzem]);

    const eliminarStreet = async (id) => {
        try {
            await axios.delete(`${apiUrl}/street/${id}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            });
            setStreet(streets.filter(item => item.id !== id));  
        } catch (e) {
            console.log('Error deleting street:', e);
        }
    };

    const modificarStreet = (valors) => {
        setTipoModal("Modificar");
        setValorsInicials(valors);
        setShowModal(true);
    };

    const handleCarrerClick = (id) => {
        navigate(`../estanteria/${magatzem}/${id}`);
    };

    return (
        <>
            <Filtres />
            <h1>Magatzem: {magatzem}</h1>
            <Button variant='success' onClick={() => { setShowModal(true); setTipoModal("Crear"); }}>Alta Carrer</Button>
            
            {/* Condicional para mostrar un mensaje mientras cargan los datos */}
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <table className="table table-striped text-center align-middle">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Nom</th>
                            <th>ID Magatzem</th>
                            <th>Estanteria</th>
                            <th>Modificar</th>
                            <th>Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streets.length === 0 ? (
                            <tr><td colSpan="6">No hi han carrers</td></tr>
                        ) : (
                            streets.map((valors) => (
                                <tr key={valors.id}>
                                    <td>{valors.id}</td>
                                    <td>{valors.name}</td>
                                    <td>{valors.storage_id}</td>
                                    <td><Button onClick={() => handleCarrerClick(valors.id)}>Estanteria</Button></td>
                                    <td><Button variant="warning" onClick={() => modificarStreet(valors)}>Modificar</Button></td>
                                    <td><Button variant="danger" onClick={() => eliminarStreet(valors.id)}>Eliminar</Button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{tipoModal} Carrer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '', storage_id: '' }}
                        validationSchema={StreetSchema}
                        onSubmit={async (values) => {
                            try {
                                if (tipoModal === "Crear") {
                                    await axios.post(`${apiUrl}/street`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                } else {
                                    await axios.put(`${apiUrl}/street/${values.id}`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                }
                                setShowModal(false);

                                // Actualizar la lista de calles después de crear o modificar
                                const response = await axios.get(`${apiUrl}/street?storage_id=${magatzem}`, {
                                    headers: { "auth-token": localStorage.getItem("token") }
                                });
                                setStreet(response.data);
                            } catch (e) {
                                console.log('Error on submit:', e);
                            }
                        }}
                    >
                        {({ values, errors, touched }) => (
                            <Form>
                                <div>
                                    <label htmlFor='name'>Nom</label>
                                    <Field type="text" name="name" placeholder="Nom del carrer" autoComplete="off" value={values.name} className="form-control" />
                                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                                </div>
                                <div>
                                    <label htmlFor='storage_id'>ID Magatzem</label>
                                    <Field type="text" name="storage_id" placeholder="Id del magatzem" autoComplete="off" value={values.storage_id} className="form-control" />
                                    {errors.storage_id && touched.storage_id && <div className="text-danger">{errors.storage_id}</div>}
                                </div>
                                <Button type="submit" variant="primary">{tipoModal === "Crear" ? "Crear" : "Modificar"}</Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Street;
