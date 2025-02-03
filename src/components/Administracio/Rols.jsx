import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import Header from '../Header';

const RoleSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'Valor mínim de 4 caràcters.')
    .max(50, 'El valor màxim és de 50 caràcters')
    .required('Valor requerit'),
});

function Rols() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('Crear');
  const [selectedRole, setSelectedRole] = useState(null);
  const [valorsInicials, setValorsInicials] = useState({ name: '' });
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${apiUrl}/userProfile`, { headers: { "auth-token": token } })
      .then((response) => {
        setRoles(response.data);
        setFilteredRoles(response.data);
        setTotalPages(Math.ceil(response.data.length / 10));  // Calcular total de pàgines
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  }, [apiUrl, token]);

  const handleFilterChange = () => {
    const filtered = roles.filter((role) => {
      return (
        role.name.toLowerCase().includes(filterName.toLowerCase()) &&
        role.email.toLowerCase().includes(filterEmail.toLowerCase()) &&
        role.role.toLowerCase().includes(filterRole.toLowerCase())
      );
    });
    setFilteredRoles(filtered);
  };

  const handleClearFilter = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterRole('');
    setFilteredRoles(roles);
  };

  const eliminarRole = async (id) => {
    const isConfirmed = window.confirm('Vols eliminar aquest rol?');
    if (isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/Role/${id}`, { headers: { "auth-token": token } });
        setRoles((prevRoles) => prevRoles.filter((item) => item.id !== id));
        setFilteredRoles((prevRoles) => prevRoles.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Error en suprimir el rol:', error);
      }
    }
  };

  const modificarRole = (valors) => {
    setModalType('Modificar');
    setValorsInicials(valors);
    setShowModal(true);
  };

  const visualitzarRole = (role) => {
    setSelectedRole(role);
    setModalType("Visualitzar");
    setShowModal(true);
  };

  const obrirModal = () => {
    setModalType('Crear');
    setValorsInicials({ name: '' });
    setShowModal(true);
  };

  const tancarModal = () => setShowModal(false);

  // Lógica per manejar el canvi de pàgina
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Funció per obtenir els rols de la pàgina actual
  const getCurrentPageRoles = () => {
    const startIndex = (currentPage - 1) * 10;  // Asumiendo que mostres 10 rols per pàgina
    const endIndex = startIndex + 10;
    return filteredRoles.slice(startIndex, endIndex);
  };

  return (
    <div>
      <Header title="Lista de rols" />
      <div className="row bg-grey pt-3 px-2 mx-0 d-flex justify-content">
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
      </div>
      <div className="row bg-grey pb-3">
        <div className="col-xl-4"></div>
        <div className="col-xl-4"></div>
        <div className="col-12 col-xl-4 text-end">
          <button className="btn btn-secondary ps-2 me-2 text-white"><i className="bi bi-trash px-1 text-white"></i>Netejar</button>
          <button className="btn btn-primary me-2 ps-2 orange-button text-white"><i className="bi bi-funnel px-1 text-white"></i>Filtrar</button>
        </div>
      </div>
      <Button variant="success" onClick={obrirModal} className="mb-3">
        Crear Rol
      </Button>
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
            <button type="button" className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"><i className="bi bi-plus-circle text-white pe-1"></i>Crear</button>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center text-light-blue">
        <Table className="table table-striped text-center">
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th>Id</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Modificar</th>
              <th>Eliminar</th>
              <th>Visualitzar</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageRoles().length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-light-blue">No hi ha rols</td>
              </tr>
            ) : (
              getCurrentPageRoles().map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                  <td>{role.email}</td>
                  <td>{role.role}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => modificarRole(role)}
                      className="btn-sm"
                    >
                      Modificar
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => eliminarRole(role.id)}
                      className="btn-sm"
                    >
                      Eliminar
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="info" onClick={() => visualitzarRole(role)} className="btn-sm">
                      Visualitzar
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
      {/* Modal */}
      <Modal show={showModal} onHide={tancarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType} Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'Visualitzar' ? (
            selectedRole ? (
              <div>
                <p><strong>Id:</strong> {selectedRole.id}</p>
                <p><strong>Nom:</strong> {selectedRole.name}</p>
                <p><strong>Email:</strong> {selectedRole.email}</p>
                <p><strong>Rol:</strong> {selectedRole.role}</p>
                <Button variant="secondary" onClick={tancarModal}>
                  Tancar
                </Button>
              </div>
            ) : (
              <p>Carregant dades del rol...</p>
            )
          ) : (
            <Formik
              initialValues={modalType === 'Modificar' ? valorsInicials : { name: '' }}
              validationSchema={RoleSchema}
              onSubmit={async (values) => {
                console.log("Formulari enviat:", values);
                try {
                  if (modalType === 'Crear') {
                    console.log("Creant rol: ", values);
                    const response = await axios.post(`${apiUrl}/Role`, values, { headers: { "auth-token": token } });
                    if (response.status === 200) {
                      setRoles(prevRoles => [...prevRoles, response.data]);
                      setShowModal(false);
                    }
                  } else if (modalType === 'Modificar') {
                    console.log("Modificant rol: ", values);
                  }
                } catch (error) {
                  console.error('Error en desar el rol:', error);
                }
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nom</label>
                    <Field name="name" type="text" className="form-control" placeholder="Nom del rol" />
                    {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                  </div>
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={tancarModal}>
                      Tancar
                    </Button>
                    <Button variant="primary" type="submit" disabled={Object.keys(errors).length > 0}>
                      {modalType === 'Crear' ? 'Crear' : 'Modificar'}
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
