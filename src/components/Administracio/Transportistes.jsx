import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header';
import Filtres from './FiltresTransportistes';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const carrierschema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  address: Yup.string().min(10, 'Valor mínim de 10 caracters.').max(100, 'El valor màxim és de 100 caracters').required('Valor requerit'),
  nif: Yup.string().matches(/^\w{9}$/, 'El NIF ha de tenir 9 caracters').required('Valor requerit'),
  phone: Yup.string().matches(/^\d{9}$/, 'El telèfon ha de ser correcte (ex: 911234567, 621121124)').required('Valor requerit'),
  email: Yup.string().email('Email no vàlid').required('Valor requerit'),
  state_id: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  province: Yup.string().required('Valor requerit'),
  city: Yup.string().required('Valor requerit'),
  cp: Yup.string().matches(/^\d{5}$/, 'El codi postal ha de tenir 5 dígits').required('Valor requerit'),
});

function Transportistes() {
  const [carriers, setCarriers] = useState([]);
  const [carriersFiltrats, setCarriersFiltrats] = useState([]);
  const [pais, setPais] = useState([]);
  const [provincia, setProvince] = useState([]);
  const [ciutat, setCity] = useState([]);
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

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(carriersFiltrats.length / pageSize);
  const displayedCarriers = carriersFiltrats.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const canviPag = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCarriersFiltrats(carriers);
    setCurrentPage(1);
  }, [carriers]);

  const fetchData = async () => {
    try {
      const [carriersResponse, paisResponse, provinciaResponse, ciutatResponse] =
        await Promise.all([
          axios.get(`${apiUrl}/carrier`, {
            headers: { 'auth-token': localStorage.getItem('token') },
          }),
          axios.get(`${apiUrl}/state`, {
            headers: { 'auth-token': localStorage.getItem('token') },
          }),
          axios.get(`${apiUrl}/province`, {
            headers: { 'auth-token': localStorage.getItem('token') },
          }),
          axios.get(`${apiUrl}/city`, {
            headers: { 'auth-token': localStorage.getItem('token') },
          }),
        ]);

      setCarriers(carriersResponse.data);
      setPais(paisResponse.data);
      setProvince(provinciaResponse.data);
      setCity(ciutatResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const delCarrier = async (id) => {
    try {
      await axios.delete(`${apiUrl}/carrier/${id}`, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
      const newCarriers = carriers.filter((item) => item.id !== id);
      setCarriers(newCarriers);
    } catch (error) {
      console.error('Error eliminant transportista:', error);
    }
  };

  const modCarriers = (valors) => {
    setTipoModal('Modificar');
    setValorsInicials(valors);
    setShowModal(true);
  };

  const verCarrier = (valors) => {
    setValorsInicials(valors);
    setShowViewModal(true);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  const transformProvince = (values) => {
    if (Number(values.state_id) === 194) {
      const selectedProvince = provincia.find(
        (p) => Number(p.id) === Number(values.province)
      );
      if (selectedProvince) {
        values.province = selectedProvince.name;
      }
    }
    return values;
  };

  const gravar = async (values) => {
    try {
      const valuesToSend = transformProvince({ ...values });
      if (tipoModal === 'Crear') {
        await axios.post(
          `${apiUrl}/carrier`,
          valuesToSend,
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
      } else {
        await axios.put(
          `${apiUrl}/carrier/${values.id}`,
          valuesToSend,
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
      }
      const updatedCarriers = await axios.get(`${apiUrl}/carrier`, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
      setCarriers(updatedCarriers.data);
      canviEstatModal();
    } catch (error) {
      console.error('Error guardant transportista:', error);
    }
  };

  const gravar2 = async (values) => {
    try {
      const valuesToSend = transformProvince({ ...values });
      const { id, ...dataToSend } = valuesToSend;

      if (tipoModal === 'Crear') {
        await axios.post(
          `${apiUrl}/carrier`,
          dataToSend,
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
      } else {
        await axios.put(
          `${apiUrl}/carrier/${id}`,
          dataToSend,
          { headers: { 'auth-token': localStorage.getItem('token') } }
        );
      }

      const updatedCarriers = await axios.get(`${apiUrl}/carrier`, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
      setCarriers(updatedCarriers.data);
      canviEstatModal();
    } catch (error) {
      console.error('Error guardant transportista:', error);
    }
  };

  const botoFiltrar = (filters) => {
    const filtered = carriers.filter((carrier) => {
      if (filters.name && !carrier.name.toLowerCase().includes(filters.name.toLowerCase()))
        return false;
      if (filters.nif && !carrier.nif.toLowerCase().includes(filters.nif.toLowerCase()))
        return false;
      if (filters.state_id && carrier.state_id !== parseInt(filters.state_id, 10))
        return false;
      if (filters.province && !carrier.province.toLowerCase().includes(filters.province.toLowerCase()))
        return false;
      if (filters.city && !carrier.city.toLowerCase().includes(filters.city.toLowerCase()))
        return false;
      return true;
    });
    setCarriersFiltrats(filtered);
    setCurrentPage(1);
  };

  const botoNetejaFiltres = () => {
    setCarriersFiltrats(carriers);
    setCurrentPage(1);
  };

  return (
    <>
      <Header title="Llistat de transportistes" />
      <Filtres
        carriers={carriers}
        pais={pais}
        provincia={provincia}
        ciutat={ciutat}
        onFilter={botoFiltrar}
        onClear={botoNetejaFiltres}
      />

      <div className="container-fluid">
        <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
          <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
            <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
              <div className="form-floating bg-white">
                <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                  <option defaultValue>Tria una opció</option>
                  <option value="1">Eliminar</option>
                </select>
                <label htmlFor="floatingSelect">Accions en lot</label>
              </div>
              <button
                className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0"
                type="button"
                aria-label="Aplicar accions en lot"
              >
                <i className="bi bi-check-circle text-white px-1"></i>Aplicar
              </button>
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
                aria-label="Crear nou transportista"
              >
                <i className="bi bi-plus-circle text-white pe-1"></i>Crear
              </Button>
            </div>
          </div>
        </div>

        <table className="table table-striped border">
          <thead className="table-active border-bottom border-dark-subtle">
            <tr className="text-center">
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
            {carriersFiltrats.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No hi han transportistes
                </td>
              </tr>
            ) : (
              displayedCarriers.map((valors) => (
                <tr key={valors.id} className="text-center">
                  <td data-cell="ID">{valors.id}</td>
                  <td data-cell="Nom">{valors.name}</td>
                  <td data-cell="Adreça">{valors.address}</td>
                  <td data-cell="NIF">{valors.nif}</td>
                  <td data-cell="Telèfon">{valors.phone}</td>
                  <td data-cell="Email">{valors.email}</td>
                  <td data-no-colon="true">
                    <div className="d-lg-flex justify-content-lg-center">
                      <span onClick={() => verCarrier(valors)} role="button" aria-label="Veure detalls del transportista">
                        <i className="bi bi-eye icono fs-5"></i>
                      </span>
                      <span onClick={() => modCarriers(valors)} className="mx-2" role="button" aria-label="Modificar transportista">
                        <i className="bi bi-pencil-square icono fs-5 mx-2"></i>
                      </span>
                      <span onClick={() => delCarrier(valors.id)} role="button" aria-label="Eliminar transportista">
                        <i className="bi bi-trash icono fs-5"></i>
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Visualitzar Transportista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>
              <b>Nom:</b> {valorsInicials.name}
            </p>
            <p>
              <b>Adreça:</b> {valorsInicials.address}
            </p>
            <p>
              <b>NIF:</b> {valorsInicials.nif}
            </p>
            <p>
              <b>Telèfon:</b> {valorsInicials.phone}
            </p>
            <p>
              <b>Email:</b> {valorsInicials.email}
            </p>
            <p>
              <b>Estat:</b>{' '}
              {pais.find((state) => state.id === valorsInicials.state_id)?.name || 'No disponible'}
            </p>
            <p>
              <b>Província:</b> {valorsInicials.province}
            </p>
            <p>
              <b>Ciutat:</b> {valorsInicials.city}
            </p>
            <p>
              <b>Codi Postal:</b> {valorsInicials.cp}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="orange-button" onClick={() => setShowViewModal(false)} aria-label="Tancar modal de visualització">
            Tancar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} transportista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={
              tipoModal === 'Crear'
                ? valorsInicials
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
            validationSchema={carrierschema}
            onSubmit={(values) => {
              gravar(values);
            }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Nom</label>
                  <Field
                    id="name"
                    name="name"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  />
                  {touched.name && errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="address">Adreça</label>
                  <Field
                    id="address"
                    name="address"
                    className={`form-control ${touched.address && errors.address ? 'is-invalid' : ''}`}
                  />
                  {touched.address && errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="nif">NIF</label>
                  <Field
                    id="nif"
                    name="nif"
                    className={`form-control ${touched.nif && errors.nif ? 'is-invalid' : ''}`}
                  />
                  {touched.nif && errors.nif && <div className="invalid-feedback">{errors.nif}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telèfon</label>
                  <Field
                    id="phone"
                    name="phone"
                    className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                  />
                  {touched.phone && errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  />
                  {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="state_id">Estat</label>
                  <Field
                    as="select"
                    name="state_id"
                    className={`form-control ${touched.state_id && errors.state_id ? 'is-invalid' : ''}`}
                  >
                    <option value="">Selecciona un estat</option>
                    {pais.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </Field>
                  {touched.state_id && errors.state_id && <div className="invalid-feedback">{errors.state_id}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="province">Província</label>
                  {values.state_id === '194' ? (
                    <>
                      <Field
                        as="select"
                        id="province"
                        name="province"
                        className={`form-control ${touched.province && errors.province ? 'is-invalid' : ''}`}
                      >
                        <option value="">Selecciona una província</option>
                        {Array.isArray(provincia) && provincia.length > 0 ? (
                          provincia
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((prov) => (
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
                        placeholder="Escriu la província"
                        className={`form-control ${touched.province && errors.province ? 'is-invalid' : ''}`}
                      />
                      {touched.province && errors.province && (
                        <div className="invalid-feedback">{errors.province}</div>
                      )}
                    </>
                  )}
                </div>
                {values.state_id === '194' && values.province ? (
                  <div className="form-group">
                    <label htmlFor="city">Ciutat</label>
                    <Field
                      as="select"
                      id="city"
                      name="city"
                      className={`form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                    >
                      <option value="">Selecciona una ciutat</option>
                      {ciutat
                        .filter((item) => item.province_id === Number(values.province))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                    </Field>
                    {touched.city && errors.city && <div className="invalid-feedback">{errors.city}</div>}
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
                    {touched.city && errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="cp">Codi Postal</label>
                  <Field
                    id="cp"
                    name="cp"
                    className={`form-control ${touched.cp && errors.cp ? 'is-invalid' : ''}`}
                  />
                  {touched.cp && errors.cp && <div className="invalid-feedback">{errors.cp}</div>}
                </div>
                <div className="form-group text-right">
                  <Button type="submit" variant="success">
                    {tipoModal === 'Crear' ? 'Alta Transportista' : 'Modificar Transportista'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} transportista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={
              tipoModal === 'Modificar'
                ? valorsInicials
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
            validationSchema={carrierschema}
            onSubmit={(values) => {
              gravar2(values);
            }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Nom</label>
                  <Field
                    id="name"
                    name="name"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  />
                  {touched.name && errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="address">Adreça</label>
                  <Field
                    id="address"
                    name="address"
                    className={`form-control ${touched.address && errors.address ? 'is-invalid' : ''}`}
                  />
                  {touched.address && errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="nif">NIF</label>
                  <Field
                    id="nif"
                    name="nif"
                    className={`form-control ${touched.nif && errors.nif ? 'is-invalid' : ''}`}
                  />
                  {touched.nif && errors.nif && <div className="invalid-feedback">{errors.nif}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telèfon</label>
                  <Field
                    id="phone"
                    name="phone"
                    className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                  />
                  {touched.phone && errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  />
                  {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="state_id">Estat</label>
                  <Field
                    as="select"
                    name="state_id"
                    className={`form-control ${touched.state_id && errors.state_id ? 'is-invalid' : ''}`}
                  >
                    <option value="">Selecciona un estat</option>
                    {pais.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </Field>
                  {touched.state_id && errors.state_id && <div className="invalid-feedback">{errors.state_id}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="province">Província</label>
                  {values.state_id === '194' ? (
                    <>
                      <Field
                        as="select"
                        id="province"
                        name="province"
                        className={`form-control ${touched.province && errors.province ? 'is-invalid' : ''}`}
                      >
                        <option value="">Selecciona una província</option>
                        {provincia.length > 0 ? (
                          provincia.map((prov) => (
                            <option key={prov.id} value={prov.id}>
                              {prov.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No hi han províncies</option>
                        )}
                      </Field>
                      {touched.province && errors.province && <div className="invalid-feedback">{errors.province}</div>}
                    </>
                  ) : (
                    <>
                      <Field
                        type="text"
                        id="province"
                        name="province"
                        placeholder="Escriu la província"
                        className={`form-control ${touched.province && errors.province ? 'is-invalid' : ''}`}
                      />
                      {touched.province && errors.province && <div className="invalid-feedback">{errors.province}</div>}
                    </>
                  )}
                </div>
                {values.state_id === '194' && values.province ? (
                  <div className="form-group">
                    <label htmlFor="city">Ciutat</label>
                    <Field
                      as="select"
                      id="city"
                      name="city"
                      className={`form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                    >
                      <option value="">Selecciona una ciutat</option>
                      {ciutat
                        .filter((item) => item.province_id === Number(values.province))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                    </Field>
                    {touched.city && errors.city && <div className="invalid-feedback">{errors.city}</div>}
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
                    {touched.city && errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="cp">Codi Postal</label>
                  <Field
                    id="cp"
                    name="cp"
                    className={`form-control ${touched.cp && errors.cp ? 'is-invalid' : ''}`}
                  />
                  {touched.cp && errors.cp && <div className="invalid-feedback">{errors.cp}</div>}
                </div>
                <div className="form-group d-flex justify-content-end">
                  <Button type="submit" className="orange-button mt-2">
                    {tipoModal === 'Modificar' ? 'Modificar Transportista' : 'Alta Transportista'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <nav aria-label="Page navigation" className="d-block mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`} >
            <button className="page-link" onClick={() => canviPag(currentPage - 1)} aria-label="Anterior">
              <span aria-hidden="true" className='text-white'>&laquo;</span>
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => canviPag(page)}>
                  {page}
                </button>
              </li>
            );
          })}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => canviPag(currentPage + 1)} aria-label="Següent">
              <span aria-hidden="true" className='text-white'>&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Transportistes;
