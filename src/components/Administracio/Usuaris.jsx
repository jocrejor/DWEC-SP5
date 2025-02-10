import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import Header from '../Header';

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'Valor mínim de 4 caràcters.')
    .max(50, 'El valor màxim és de 50 caràcters')
    .required('Valor requerit'),
  email: Yup.string()
    .min(8, 'Valor mínim de 8 caràcters.')
    .max(40, 'El valor màxim és de 40 caràcters')
    .required('Valor requerit'),
  password: Yup.string()
    .min(8, 'Valor mínim de 8 caràcters.')
    .max(20, 'El valor màxim és de 20 caràcters')
    .required('Valor requerit'),
  role: Yup.string().required('Valor requerit'),
  image: Yup.string().required('Valor requerit')
});

function Usuaris() {
  const [user, setUser] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Crear");
  const [valorsInicials, setValorsInicials] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    image: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${apiUrl}/users`, { headers: { "auth-token": token } })
      .then((response) => {
        setUser(response.data);
        setFilteredUsers(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  }, [apiUrl, token]);

  const eliminarUsuari = async (id) => {
    const confirmacio = window.confirm("Vols eliminar aquest usuari?");
    if (confirmacio) {
      try {
        await axios.delete(`${apiUrl}/users/${id}`);
        setUser(user.filter((user) => user.id !== id));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const modificarUsuari = (valors) => {
    setTipoModal("Modificar");
    setValorsInicials(valors);
    setShowModal(true);
  };

  const obrirModal = () => {
    setTipoModal("Crear");
    setValorsInicials({
      name: '',
      email: '',
      password: '',
      role: '',
      image: ''
    });
    setShowModal(true);
  };

  const tancarModal = () => setShowModal(false);

  const visualitzarUsuari = (user) => {
    setSelectedUser(user);
    setTipoModal("Visualitzar");
    setShowModal(true);
  };

  const handleFilterChange = () => {
    const filtered = user.filter((user) => {
      return (
        user.name.toLowerCase().includes(filterName.toLowerCase()) &&
        user.email.toLowerCase().includes(filterEmail.toLowerCase()) &&
        user.role.toLowerCase().includes(filterRole.toLowerCase())
      );
    });
    setFilteredUsers(filtered);
  };

  const handleClearFilter = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterRole('');
    setFilteredUsers(user);
  };

  return (
    <div>
      <Header title="Usuaris" />
      <div className="row bg-grey pt-3 px-2 mx-0">
        <div className="col-12 col-md-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="nombre" className="form-label">Nom</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyUp={handleFilterChange}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="dni-nif" className="form-label">Email</label>
            <input
              type="text"
              className="form-control"
              id="dni-nif"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              onKeyUp={handleFilterChange}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="mb-3 text-light-blue">
            <label htmlFor="telefono" className="form-label">Rol</label>
            <input
              type="text"
              className="form-control"
              id="telefono"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              onKeyUp={handleFilterChange}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary ps-2 me-2 text-white" onClick={handleClearFilter}>
              <i className="bi bi-trash px-1 text-white"></i>Netejar
            </button>
            <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={handleFilterChange}>
              <i className="bi bi-funnel px-1 text-white"></i>Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                <option selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label htmlFor="floatingSelect">Accions en lot</label>
            </div>
            <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button"><i className="bi bi-check-circle text-white px-1"></i>Aplicar</button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            <button
              type="button"
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              onClick={obrirModal}
            >
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center text-light-blue">
        <Table className="table table-striped text-light-blue" borderless>
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th>Id</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Password</th>
              <th>Rol</th>
              <th>Image</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-light-blue">No hi ha perfils d'usuaris</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.password}</td>
                  <td>{user.role}</td>
                  <td>{user.image}</td>
                  <td>
                    <Button style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => modificarUsuari(user)} className="btn-sm">
                      <i style={{ color: 'gray' }} className="bi bi-pencil-square"></i>
                    </Button>
                    <Button style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => eliminarUsuari(user.id)} className="btn-sm">
                      <i className="bi bi-trash" style={{ color: 'gray' }}></i>
                    </Button>
                    <Button style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => visualitzarUsuari(user)} className="btn-sm">
                      <i className="bi bi-eye px-3" style={{ color: 'gray' }}></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      {/* Paginació */}
      <nav aria-label="Page navigation example" className="d-block">
        <ul className="pagination justify-content-center">
          <li className="page-item">
            <a className="page-link text-light-blue" href="#" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li className="page-item"><a className="page-link activo-2" href="#">1</a></li>
          <li className="page-item"><a className="page-link text-light-blue" href="#">2</a></li>
          <li className="page-item"><a className="page-link text-light-blue" href="#">3</a></li>
          <li className="page-item">
            <a className="page-link text-light-blue" href="#" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
      <Modal show={showModal} onHide={tancarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Usuari</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tipoModal === 'Visualitzar' ? (
            <div>
              <h5>Nom: {selectedUser?.name}</h5>
              <p>Email: {selectedUser?.email}</p>
              <p>Password: {selectedUser?.password}</p>
              <p>Rol: {selectedUser?.role}</p>
              <p>Imatge: {selectedUser?.image}</p>
            </div>
          ) : (
            <Formik
              initialValues={tipoModal === 'Modificar' ? valorsInicials : { name: '', email: '', password: '', role: '', image: '' }}
              validationSchema={UserSchema}
              onSubmit={async (values) => {
                console.log("Enviar valors:", values);
                try {
                  if (tipoModal === "Crear") {
                    await axios.post(`${apiUrl}/users`, values);
                  } else {
                    await axios.put(`${apiUrl}/users/${values.id}`, values);
                  }
                  tancarModal();
                  axios.get(`${apiUrl}/users`, { headers: { "auth-token": token } })
                    .then((response) => {
                      setUser(response.data);
                    });
                } catch (error) {
                  console.error("Error submitting form:", error);
                }
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nom</label>
                    <Field name="name" type="text" className="form-control" placeholder="Nom de l'usuari" />
                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correu Electrònic</label>
                    <Field name="email" type="email" className="form-control" placeholder="Correu Electrònic" />
                    {errors.email && touched.email && <div className="text-danger">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contrasenya</label>
                    <Field name="password" type="password" className="form-control" placeholder="Contrasenya" />
                    {errors.password && touched.password && <div className="text-danger">{errors.password}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Rol</label>
                    <Field name="role" type="text" className="form-control" placeholder="Rol de l'usuari" />
                    {errors.role && touched.role && <div className="text-danger">{errors.role}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">Imatge</label>
                    <Field name="image" type="text" className="form-control" placeholder="URL de la imatge" />
                    {errors.image && touched.image && <div className="text-danger">{errors.image}</div>}
                  </div>
                  <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={tancarModal}>
                      Tancar
                    </Button>
                    <Button variant="primary orange-button" type="submit">
                      {tipoModal}
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

export default Usuaris;
