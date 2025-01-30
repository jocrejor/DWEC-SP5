import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import { url, postData, getData, deleteData, updateId } from '../../apiAccess/crud';
import Header from '../Header';
import axios from 'axios';

const UserProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'Valor mínim de 4 caràcters.')
    .max(50, 'El valor màxim és de 50 caràcters')
    .required('Valor requerit'),
});

function Rols() {
  const [userProfiles, setUserProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalType, setModalType] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({ name: '' });

  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        const data = await getData(url, 'UserProfile');
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        console.log(token);

        // Realitzant totes les crides a l'API
        const requests = [
          axios.get(`${apiUrl}/OrderLine_Status`, { headers: { "auth-token": token } }),
          axios.get(`${apiUrl}/Ordershipping`, { headers: { "auth-token": token } }),
          axios.get(`${apiUrl}/Client`, { headers: { "auth-token": token } }),
          axios.get(`${apiUrl}/Carrier`, { headers: { "auth-token": token } }),
          axios.get(`${apiUrl}/Users`, { headers: { "auth-token": token } }),
          axios.get(`${apiUrl}/Product`, { headers: { "auth-token": token } }),
        ];

        // Esperem a que totes les crides finalitzin
       //wait Promise.all(requests);
        const [orderLineStatusResponse] = await Promise.all(requests);

        // Ara pots utilitzar les dades de `orderLineStatusResponse` si ho necessites
        const orderLineStatus = orderLineStatusResponse.data;  // Accedeix a les dades
  
        console.log(orderLineStatus); // Fes alguna cosa amb les dades obtingudes
  
        // Actualitzant els estats amb les respostes
        setUserProfiles(data);
        setFilteredProfiles(data);
      } catch (error) {
        console.error('Error en obtenir els perfils d\'usuari', error);
      }
    };
    fetchUserProfiles();
  }, []);

  const eliminarUserProfile = async (id) => {
    try {
      await deleteData(url, 'UserProfile', id);
      setUserProfiles((prevProfiles) => prevProfiles.filter((item) => item.id !== id));
      setFilteredProfiles((prevProfiles) => prevProfiles.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error en suprimir el perfil de usuari:', error);
    }
  };

  const modificarUserProfile = (valors) => {
    setTipoModal('Modificar');
    setValorsInicials(valors);
    setShowModal(true);
  };

  const visualitzarUserProfile = async (id) => {
    try {
      const profile = await getData(url, `UserProfile/${id}`);
      setSelectedProfile(profile);
      setModalType('Visualitzar');
      setShowModal(true);
    } catch (error) {
      console.error('Error en obtenir els detalls del perfil de usuari:', error);
    }
  };

  const obrirModal = () => {
    setTipoModal('Crear');
    setValorsInicials({ name: '' });
    setShowModal(true);
  };

  const tancarModal = () => setShowModal(false);

  return (
    <div>
      <Header title="Lista de rols" />
      <Button variant="success" onClick={obrirModal} className="mb-3">
        Alta Perfil d'usuaris
      </Button>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nom</th>
            <th>Modificar</th>
            <th>Eliminar</th>
            <th>Visualitzar</th>
          </tr>
        </thead>
        <tbody>
          {userProfiles.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No hi ha perfils d'usuaris</td>
            </tr>
          ) : (
            filteredProfiles.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => modificarUserProfile(user)}
                    className="btn-sm"
                  >
                    Modificar
                  </Button>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => eliminarUserProfile(user.id)}
                    className="btn-sm"
                  >
                    Eliminar
                  </Button>
                </td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => visualitzarUserProfile(user.id)}
                    className="btn-sm"
                  >
                    Visualitzar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal show={showModal} onHide={tancarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Perfil de Usuari</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'Visualitzar' ? (
            selectedProfile ? (
              <div>
                <p><strong>Id:</strong> {selectedProfile.id}</p>
                <p><strong>Nom:</strong> {selectedProfile.name}</p>
                <Button variant="secondary" onClick={tancarModal}>
                  Tancar
                </Button>
              </div>
            ) : (
              <p>Carregant dades del perfil...</p>
            )
          ) : (
            <Formik
              initialValues={modalType === 'Modificar' ? valorsInicials : { name: '' }}
              validationSchema={UserProfileSchema}
              onSubmit={async (values) => {
                try {
                  if (modalType === 'Crear') {
                    await postData(url, 'UserProfile', values);
                  } else {
                    await updateId(url, 'UserProfile', values.id, values);
                  }
                  tancarModal();
                  const updatedProfiles = await getData(url, 'UserProfile');
                  setUserProfiles(updatedProfiles);
                  setFilteredProfiles(updatedProfiles);
                } catch (error) {
                  console.error('Error en desar el perfil de usuari:', error);
                }
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nom</label>
                    <Field name="name" type="text" className="form-control" placeholder="Nom del perfil d'usuari" />
                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                  </div>
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={tancarModal}>
                      Tancar
                    </Button>
                    <Button variant="primary" type="submit">
                      {modalType}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Rols;
