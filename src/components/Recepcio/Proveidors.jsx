import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header';
import Filtres from '../Filtres';
import axios from 'axios';
import '../../App.css';
const apiUrl = import.meta.env.VITE_API_URL;

const supplierschema = Yup.object().shape({
  name: Yup.string().min(3, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  address: Yup.string().min(10, 'Valor mínim de 10 caracters.').max(100, 'El valor màxim és de 100 caracters').required('Valor requerit'),
  nif: Yup.string().matches(/^\w{9}$/, 'El NIF ha de tenir 9 caracters').required('Valor requerit'),
  phone: Yup.string().matches(/^(\+\d{1,3}\s?)?(\d{9}|\d{3}\s\d{3}\s\d{3})$/,'El telèfon ha de ser correcte (ex: +34 911234567, 621121124, 932 123 456)').required('Valor requerit'),
  email: Yup.string().email('Email no vàlid').required('Valor requerit'),
  state_id: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  province: Yup.string().required('Valor requerit'),
  city: Yup.string().required('Valor requerit'),
  cp: Yup.string().matches(/^\d{5}$/, 'El codi postal ha de tenir 5 dígits').required('Valor requerit'),
});

function Proveidors() {
  const [suppliers, setSuppliers] = useState([]);
  const [pais, setPais] = useState([]);
  const [provincia, setProvince] = useState([]);
  const [ciutat, setCity] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]); // Filtros Ciudades
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [valorsInicials, setValorsInicials] = useState({
    name: '',
    address: '',
    nif: '',
    phone: '',
    email: '',
    state_id: 0,
    province: '',
    city: '',
    cp: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [suppliersResponse, paisResponse, provinciaResponse, ciutatResponse] = await Promise.all([
        axios.get(`${apiUrl}/supplier`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/state`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/province`, { headers: { "auth-token": localStorage.getItem("token") } }),
        axios.get(`${apiUrl}/city`, { headers: { "auth-token": localStorage.getItem("token") } }),
      ]);

      setSuppliers(suppliersResponse.data);
      setPais(paisResponse.data);
      setProvince(provinciaResponse.data);
      setCity(ciutatResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
   // Filtrar ciudades según la provincia seleccionada
   useEffect(() => {
    if (valorsInicials.province) {
      const citiesFiltered = ciutat.filter(city => city.province_id === parseInt(valorsInicials.province));
      setFilteredCities(citiesFiltered);
    } else {
      setFilteredCities([]);
    }
  }, [valorsInicials.province, ciutat]);

  const deleteSuppliers = async (id) => {
    const confirmDelete = window.confirm("Segur que vols eliminar aquest proveidor?");
    
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${apiUrl}/supplier/${id}`, { 
        headers: { "auth-token": localStorage.getItem("token") } 
      });
      const newSuppliers = suppliers.filter((item) => item.id !== id);
      setSuppliers(newSuppliers);
    } catch (error) {
      console.error('Error eliminat el proveidor:', error);
    }
  };
  

  const modSuppliers = (valors) => {
    setTipoModal('Modificar');
    setValorsInicials(valors);
    setShowModal(true);
  };

  const viewSupplier = (valors) => {
    setValorsInicials(valors);
    setShowViewModal(true);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  const gravar = async (values) => {
    try {
      console.log("Valores recibidos:", values);
  
      const provinciaSeleccionada = provincia.find(p => p.id === parseInt(values.province));
  
      if (!provinciaSeleccionada) {
        console.error("ERROR: La provincia seleccionada no es válida.");
        return;
      }
  
      const dataToSend = {
        ...values,
        province: provinciaSeleccionada.name, // Enviar el nombre de la provincia, no el ID
      };
  
      console.log("Datos enviados al backend:", dataToSend);
  
      if (tipoModal === 'Crear') {
        await axios.post(`${apiUrl}/supplier`, dataToSend, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
      } else if (tipoModal === 'Modificar') {
        const { id, ...valuesWithoutId } = dataToSend;
        await axios.put(`${apiUrl}/supplier/${id}`, valuesWithoutId, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
      }
  
      const updatedSuppliers = await axios.get(`${apiUrl}/supplier`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setSuppliers(updatedSuppliers.data);
      canviEstatModal();
    } catch (error) {
      console.error('Error guardant proveidors:', error.response ? error.response.data : error);
    }
  };
  
  
  return (
    <>
      <Header title="Llistat de proveidors" />
      <Filtres />

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
            <Button
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              onClick={() => {
                canviEstatModal();
                setTipoModal('Crear');
                setValorsInicials({
                  name: '',
                  address: '',
                  nif: '',
                  phone: '',
                  email: '',
                  state_id: 0,
                  province: '',
                  city: '',
                  cp: '',
                });
              }}
            >
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear
            </Button>
          </div>
        </div>
      </div>

      <div className='container-fluid pt-3'>

        <table className='table table-striped border m-2 text-center'>
          <thead className="table-active border-bottom border-dark-subtle">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nom</th>
              <th scope="col">Adreça</th>
              <th scope="col">NIF</th>
              <th scope="col">Telèfon</th>
              <th scope="col">Email</th>
              <th scope="col">Accions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="13">No hi han proveidors</td>
              </tr>
            ) : (
              suppliers.map((valors) => (
                <tr key={valors.id}>
                  <td data-cell="ID">{valors.id}</td>
                  <td data-cell="Nom">{valors.name}</td>
                  <td data-cell="Adreça">{valors.address}</td>
                  <td data-cell="NIF">{valors.nif}</td>
                  <td data-cell="Telèfon">{valors.phone}</td>
                  <td data-cell="Email">{valors.email}</td>
                  <td data-no-colon="true">
                    <span onClick={() => viewSupplier(valors)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-eye"></i>
                    </span>

                    <span onClick={() => modSuppliers(valors)} className="mx-2" style= {{ cursor: "pointer" }}>
                      <i className="bi bi-pencil-square"></i>
                    </span>

                    <span onClick={() => deleteSuppliers(valors.id)} style={{ cursor: "pointer" }}>
                      <i className="bi bi-trash"></i>
                    </span>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Visualitzar */}
      <Modal className='text-light-blue' show={showViewModal} onHide={() => setShowViewModal(false)}>
      <Modal.Header className='text-center py-4 fs-4 fw-bold m-0 text-white bg-title' closeButton>
        <Modal.Title>Visualitzar Proveidors</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p><b>Nom:</b> {valorsInicials.name}</p>
          <p><b>Adreça:</b> {valorsInicials.address}</p>
          <p><b>NIF:</b> {valorsInicials.nif}</p>
          <p><b>Telèfon:</b> {valorsInicials.phone}</p>
          <p><b>Email:</b> {valorsInicials.email}</p>
          <p><b>Estat:</b> {
            // Buscar el nombre del estado
            pais.find((state) => state.id === valorsInicials.state_id)?.name
          }</p>
          <p><b>Província:</b> {valorsInicials.province}</p>
          <p><b>Ciutat:</b> {valorsInicials.city}</p>
          <p><b>Codi Postal:</b> {valorsInicials.cp}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowViewModal(false)}>
          Tancar
        </Button>
      </Modal.Footer>
    </Modal>


      {/* Modal Crear/Modificar */}
      <Modal className='text-light-blue' show={showModal} onHide={canviEstatModal}>
        <Modal.Header className='text-center py-4 fs-4 fw-bold m-0 text-white bg-title' closeButton>
          <Modal.Title>{tipoModal} proveidors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={
              tipoModal === 'Modificar'
                ? (console.log("Valores Iniciales:", valorsInicials), valorsInicials)
                : {
                  name: '',
                  address: '',
                  nif: '',
                  phone: '',
                  email: '',
                  state_id: 0,
                  province: '',
                  city: '',
                  cp: '',
                }
            }
            validationSchema={supplierschema}
            onSubmit={(values) => {
              gravar(values);
            }}
          >
            {({ values, errors, touched, handleChange }) => (
              <Form>
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="name">Nom</label>
                  <Field
                    id="name"
                    name="name"
                    className={`text-light-blue form-control ${touched.name && errors.name ? 'is-invalid' : ''
                      }`}
                  />
                  {touched.name && errors.name ? (
                    <div className="invalid-feedback">{errors.name}</div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="address">Adreça</label>
                  <Field
                    id="address"
                    name="address"
                    className={`text-light-blue form-control ${touched.address && errors.address ? 'is-invalid' : ''
                      }`}
                  />
                  {touched.address && errors.address ? (
                    <div className="invalid-feedback">{errors.address}</div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="nif">NIF</label>
                  <Field
                    id="nif"
                    name="nif"
                    className={`text-light-blue form-control ${touched.nif && errors.nif ? 'is-invalid' : ''
                      }`}
                  />
                  {touched.nif && errors.nif ? (
                    <div className="invalid-feedback">{errors.nif}</div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="phone">Telèfon</label>
                  <Field
                    id="phone"
                    name="phone"
                    className={`text-light-blue form-control ${touched.phone && errors.phone ? 'is-invalid' : ''
                      }`}
                  />
                  {touched.phone && errors.phone ? (
                    <div className="invalid-feedback">{errors.phone}</div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="email">Email</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={`text-light-blue form-control ${touched.email && errors.email ? 'is-invalid' : ''
                      }`}
                  />
                  {touched.email && errors.email ? (
                    <div className="invalid-feedback">{errors.email}</div>
                  ) : null}
                </div>

                <div className="form-group">
                  <label className='fw-bolder' htmlFor="state_id">Estat</label>
                  <Field
                    as="select"
                    name="state_id"
                    className={`text-light-blue form-control ${touched.state_id && errors.state_id ? 'is-invalid' : ''
                      }`}
                  >
                    <option value="">Selecciona un estat</option>
                    {pais.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </Field>
                  {touched.state_id && errors.state_id ? (
                    <div className="invalid-feedback">{errors.state_id}</div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="province">Província</label>
                  {String(values.state_id) === '194' ? (
                    <>
                      <Field
                        as="select"
                        id="province"
                        name="province"
                        className={`text-light-blue form-control ${touched.province && errors.province ? 'is-invalid' : ''
                          }`}
                        onChange={(e) => {
                          handleChange(e);
                          setValorsInicials(prev => ({ ...prev, province: e.target.value, city: '' })); // Reinicia ciudad
                        }}
                      >
                        <option value="">Selecciona una província</option>
                        {provincia.length > 0 ? (
                          provincia.sort((a, b) => a.name.localeCompare(b.name)).map((prov) => (
                            <option key={prov.id} value={prov.id}>
                              {prov.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No hi han províncies</option>
                        )}
                      </Field>
                      {touched.province && errors.province && (
                        <div className="invalid-feedback">{errors.province}</div>
                      )}

                    </>
                  ) : (
                    <>
                      <Field
                        type="text"
                        id="province"
                        name="province"
                        placeholder="Escribe la provincia"
                        className={`text-light-blue form-control ${touched.province && errors.province ? 'is-invalid' : ''
                          }`}
                      />
                      {touched.province && errors.province && (
                        <div className="invalid-feedback">{errors.province}</div>
                      )}

                    </>
                  )}
                </div>
                {String(values.state_id) === '194' && values.province ? (
                  <div className="form-group">
                    <label className='fw-bolder' htmlFor="city">Ciutat</label>
                    <Field
                      as="select"
                      id="city"
                      name="city"
                      className={`text-light-blue form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                    >
                      <option value="">Selecciona una ciutat</option>
                      {filteredCities.map((ciudad) => (
                        <option key={ciudad.id} value={ciudad.name}>
                          {ciudad.name}
                        </option>
                      ))}
                    </Field>
                    {touched.city && errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="city">Ciutat</label>
                    <Field
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Escriu la ciutat"
                      className={`form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                    />
                    {touched.city && errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label className='fw-bolder' htmlFor="cp">Codi Postal</label>
                  <Field
                    id="cp"
                    name="cp"
                    className={`text-light-blue form-control ${touched.cp && errors.cp ? 'is-invalid' : ''
                      }`}
                  />
                  {touched.cp && errors.cp ? (
                    <div className="invalid-feedback">{errors.cp}</div>
                  ) : null}
                </div>
                <Modal.Footer>
                <div className="form-group text-right">
                  <Button className='orange-button' type="submit" variant="success">
                    {tipoModal === 'Crear' ? 'Crear' : 'Modificar'}
                  </Button>
                </div>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
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
    </>
  );
}

export default Proveidors;