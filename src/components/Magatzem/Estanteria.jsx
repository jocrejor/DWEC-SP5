import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios'; 
import { Button, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Filtres from '../Filtres';

const ShelfSchema = Yup.object().shape({
    name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
    storage_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
    steet_id: Yup.string().min(3, 'Valor mínim de 3 caracters.').max(30, 'El valor màxim és de 30 caracters').required('Valor requerit'),
});

const apiUrl = import.meta.env.VITE_API_URL;

function Shelf() {
    const [shelfs, setShelf] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tipoModal, setTipoModal] = useState("Crear");
    const [valorsInicials, setValorsInicials] = useState({ name: '', storage_id: '', steet_id: '' });
    const navigate = useNavigate();
    let { magatzem, carrer } = useParams();

    useEffect(() => {
        // Solo hacer la llamada si magatzem y carrer están disponibles
        if (magatzem && carrer) {
            axios.get(`${apiUrl}/shelf?storage_id=${magatzem}&street_id=${carrer}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            })
            .then((response) => {
                setShelf(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        }
    }, [magatzem, carrer]); // Dependencias ajustadas para recargar cuando cambian

    const eliminarShelf = async (id) => {
        try {
            await axios.delete(`${apiUrl}/shelf/${id}`, {
                headers: { "auth-token": localStorage.getItem("token") }
            });
            setShelf(shelfs.filter(item => item.id !== id)); // Actualizar el estado sin recargar la página
        } catch (error) {
            console.error('Error deleting shelf:', error);
        }
    };

    const modificarShelf = (valors) => {
        setTipoModal("Modificar");
        setValorsInicials(valors);
        setShowModal(true);
    };

    const canviEstatModal = () => {
        setShowModal(!showModal);
    };

    const handleCarrerClick = (id) => {
        navigate(`../espai/${magatzem}/${carrer}/${id}`);
    };

    return (
        <>
            <Filtres />
            <h2>Magatzem: {magatzem}</h2>
            <h2>Carrer: {carrer}</h2>
            <Button variant="success" onClick={() => { canviEstatModal(); setTipoModal("Crear"); }}>Alta Estanteria</Button>
            
            {/* Indicador de si no hay estanterías */}
            {shelfs.length === 0 ? (
                <p>No hi han estanteries</p>
            ) : (
                <table className="table table-striped text-center align-middle">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Nom</th>
                            <th>ID Magatzem</th>
                            <th>ID Carrer</th>
                            <th>Espai</th>
                            <th>Modificar</th>
                            <th>Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shelfs.map((valors) => (
                            <tr key={valors.id}>
                                <td>{valors.id}</td>
                                <td>{valors.name}</td>
                                <td>{valors.storage_id}</td>
                                <td>{valors.steet_id}</td>
                                <td><Button onClick={() => handleCarrerClick(valors.id)}>Espai</Button></td>
                                <td><Button variant="warning" onClick={() => modificarShelf(valors)}>Modificar</Button></td>
                                <td><Button variant="danger" onClick={() => eliminarShelf(valors.id)}>Eliminar</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal show={showModal} onHide={canviEstatModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{tipoModal} Estanteria</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Formik
                        initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '', storage_id: '', steet_id: '' }}
                        validationSchema={ShelfSchema}
                        onSubmit={async (values) => {
                            try {
                                if (tipoModal === "Crear") {
                                    await axios.post(`${apiUrl}/shelf`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                } else {
                                    await axios.put(`${apiUrl}/shelf/${values.id}`, values, {
                                        headers: { "auth-token": localStorage.getItem("token") }
                                    });
                                }
                                setShowModal(false);

                                // Actualizar la lista sin recargar la página
                                const response = await axios.get(`${apiUrl}/shelf?storage_id=${magatzem}&street_id=${carrer}`, {
                                    headers: { "auth-token": localStorage.getItem("token") }
                                });
                                setShelf(response.data);
                            } catch (error) {
                                console.error('Error on submit:', error);
                            }
                        }}
                    >
                        {({ values, errors, touched }) => (
                            <Form>
                                <div>
                                    <label htmlFor="name">Nom</label>
                                    <Field type="text" name="name" placeholder="Nom de l'estanteria" autoComplete="off" value={values.name} className="form-control" />
                                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="storage_id">ID Magatzem</label>
                                    <Field type="text" name="storage_id" placeholder="Id del magatzem" autoComplete="off" value={values.storage_id} className="form-control" />
                                    {errors.storage_id && touched.storage_id && <div className="text-danger">{errors.storage_id}</div>}
                                </div>

                                <div>
                                    <label htmlFor="steet_id">ID Carrer</label>
                                    <Field type="text" name="steet_id" placeholder="Id del carrer" autoComplete="off" value={values.steet_id} className="form-control" />
                                    {errors.steet_id && touched.steet_id && <div className="text-danger">{errors.steet_id}</div>}
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

export default Shelf;
