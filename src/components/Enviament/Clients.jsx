import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { Button, Modal } from "react-bootstrap";
import Header from "../Header";
import Filtres from "./FiltresClients";
import axios from "axios";

// Validación de esquema con Yup
const ClientSchema = yup.object().shape({
  name: yup
    .string()
    .min(4, "Valor mínim de 4 caracters")
    .max(50, "Valor màxim de 50 caracters")
    .required("Valor Requerit."),
  email: yup.string().email("Email no vàlid").required("Valor Requerit."),
  phone: yup
    .string()
    .min(10, "El número de telèfon ha de tindre almenys 10 digits")
    .required("Valor Requerit."),
  address: yup
    .string()
    .min(10, "L’adreça ha de tindre almenys 10 caracters")
    .required("Valor Requerit."),
  nif: yup.string().required("Valor Requerit."),
  state_id: yup.number().required("Valor Requerit."),
  province_id: yup.number().required("Valor Requerit."),
  city_id: yup.number().required("Valor Requerit."),
  cp: yup
    .string()
    .matches(/^\d{5}$/, "Codi postal no vàlid")
    .required("Valor Requerit."),
});

const apiUrl = import.meta.env.VITE_API_URL;

function Client() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("Crear");
  const [valorsInicials, setValorsInicials] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nif: "",
    state_id: "",
    province_id: "",
    city_id: "",
    cp: "",
  });

  const [clientToView, setClientToView] = useState(null);
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const clientsData = await getData("client");
      setClients(clientsData);

      const statesData = await getData("State");
      setStates(statesData);

      if (statesData.length > 0) {
        const provincesData = await getData(
          "Province?state_id=" + statesData[0].id
        );
        setProvinces(provincesData);
      }

      if (statesData.length > 0 && provinces.length > 0) {
        const citiesData = await getData("City?province_id=" + provinces[0].id);
        setCities(citiesData);
      }
    };

    fetchData();
  }, []);

  const getData = async (endpoint) => {
    try {
      const response = await axios.get(`${apiUrl}/${endpoint}`, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const eliminarClient = async (id) => {
    try {
      await axios.delete(`${apiUrl}/client/${id}`, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      const clientsData = await getData("client");
      setClients(clientsData);
    } catch (error) {
      console.error("Error al eliminar el client", error);
    }
  };

  const modificarClient = (valors) => {
    setTipoModal("Modificar");
    setValorsInicials(valors);
    setShowModal(true);
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  const visualizarClient = (client) => {
    setClientToView(client);
    setTipoModal("Visualitzar");
    setShowModal(true);
  };

  const handleStateChange = async (e, setFieldValue) => {
    const selectedStateId = e.target.value;
    setFieldValue("state_id", selectedStateId); 
    setSelectedState(selectedStateId);

    const provincesData = await getData("Province?state_id=" + selectedStateId);
    setProvinces(provincesData);
    setSelectedProvince("");
    setCities([]);
  };

  const handleProvinceChange = async (e, setFieldValue) => {
    const selectedProvinceId = e.target.value;
    setFieldValue("province_id", selectedProvinceId); // Actualizamos el valor en Formik
    setSelectedProvince(selectedProvinceId);

    const citiesData = await getData("City?province_id=" + selectedProvinceId);
    setCities(citiesData);
  };

  const postData = async (endpoint, data) => {
    try {
      const response = await axios.post(`${apiUrl}/${endpoint}`, data, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error posting data", error);
    }
  };

  const crearClient = async (values) => {
    const clientData = {
      name: values.name,
      address: values.address,
      nif: values.nif,
      phone: values.phone,
      email: values.email,
      state_id: values.state_id,
      province: provinces.find((prov) => prov.id === parseInt(values.province_id))?.name, 
      city: cities.find((city) => city.id === parseInt(values.city_id))?.name, 
      cp: values.cp,
    };
  
    try {
      const response = await axios.post(`${apiUrl}/client`, clientData, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });
  
      if (response.data) {
        setClients((prevClients) => [...prevClients, response.data]);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error al crear el cliente", error);
    }
  };
  
  

  return (
    <>
      <Header title="Clients" />
      <Filtres />

      <div className="row d-flex mx-0 bg-secondary mt-3 rounded-top">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción">
                <option selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label for="floatingSelect">Accions en lot</label>
            </div>
            <button className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button"><i className="bi bi-check-circle text-white px-1"></i>Aplicar</button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            <Button
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              variant="success"
              onClick={() => {
                setValorsInicials({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  nif: "",
                  state_id: "",
                  province_id: "",
                  city_id: "",
                  cp: "",
                });
                setTipoModal("Crear");
                setShowModal(true);
              }}
            >
              <i class="bi bi-plus-circle text-white pe-1"></i>Crear
            </Button>
          </div>
        </div>
      </div>
      <div className="container-fluid pt-3">
        <table className="table table-striped border mt-2">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Telèfon</th>
              <th>Adreça</th>
              <th>NIF</th>
              <th className="text-center ps-5">Accions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{valors.name}</td>
                <td>{valors.email}</td>
                <td>{valors.phone}</td>
                <td>{valors.address}</td>
                <td>{valors.nif}</td>
                <td className="text-center ps-5">
                  <Button
                    variant="info"
                    onClick={() => visualizarClient(valors)}
                  >
                    <i className="bi bi-eye"></i>
                  </Button>
                  <Button
                    variant="warning mx-2"
                    onClick={() => modificarClient(valors)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button
                    className="btn btn-danger"
                    onClick={() => eliminarClient(valors.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {tipoModal === "Modificar"
              ? "Modificar Client"
              : tipoModal === "Crear"
              ? "Alta Client"
              : "Visualitzar Client"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {tipoModal === "Visualitzar" ? (
            clientToView ? (
              <>
                <p>
                  <strong>Nom:</strong> {clientToView.name}
                </p>
                <p>
                  <strong>Email:</strong> {clientToView.email}
                </p>
                <p>
                  <strong>Telèfon:</strong> {clientToView.phone}
                </p>
                <p>
                  <strong>Adreça:</strong> {clientToView.address}
                </p>
                <p>
                  <strong>NIF:</strong> {clientToView.nif}
                </p>
                <p>
                  <strong>Estat:</strong> {clientToView.state_id}
                </p>
                <p>
                  <strong>Província:</strong> {clientToView.province}
                </p>
                <p>
                  <strong>Ciutat:</strong> {clientToView.city}
                </p>
                <p>
                  <strong>Codi Postal:</strong> {clientToView.cp}
                </p>
              </>
            ) : (
              <p>No s'ha seleccionat cap client per visualitzar.</p>
            )
          ) : (
            <Formik
            initialValues={valorsInicials}
            validationSchema={ClientSchema}
            onSubmit={async (values, { resetForm }) => {
              await crearClient(values);
              resetForm();
            }}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <div>
                  <label htmlFor="name">Nom del client</label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Nom del client"
                    autoComplete="off"
                    value={values.name}
                  />
                  {errors.name && touched.name ? (
                    <div>{errors.name}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="email">Email del client</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email del client"
                    autoComplete="off"
                    value={values.email}
                  />
                  {errors.email && touched.email ? (
                    <div>{errors.email}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="phone">Telèfon del client</label>
                  <Field
                    type="text"
                    name="phone"
                    placeholder="Telèfon del client"
                    autoComplete="off"
                    value={values.phone}
                  />
                  {errors.phone && touched.phone ? (
                    <div>{errors.phone}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="address">Adreça</label>
                  <Field
                    type="text"
                    name="address"
                    placeholder="Adreça"
                    autoComplete="off"
                    value={values.address}
                  />
                  {errors.address && touched.address ? (
                    <div>{errors.address}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="nif">NIF</label>
                  <Field
                    type="text"
                    name="nif"
                    placeholder="NIF"
                    autoComplete="off"
                    value={values.nif}
                  />
                  {errors.nif && touched.nif ? <div>{errors.nif}</div> : null}
                </div>
          
                <div>
                  <label htmlFor="state_id">Estat</label>
                  <select
                    name="state_id"
                    value={values.state_id}
                    onChange={(e) => handleStateChange(e, setFieldValue)}
                  >
                    <option value="">Selecciona un estat</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {errors.state_id && touched.state_id ? (
                    <div>{errors.state_id}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="province_id">Província</label>
                  <select
                    name="province_id"
                    value={values.province_id}
                    onChange={(e) => handleProvinceChange(e, setFieldValue)}
                  >
                    <option value="">Selecciona una província</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province_id && touched.province_id ? (
                    <div>{errors.province_id}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="city_id">Ciutat</label>
                  <Field as="select" name="city_id" value={values.city_id}>
                    <option value="">Selecciona una ciutat</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Field>
                  {errors.city_id && touched.city_id ? (
                    <div>{errors.city_id}</div>
                  ) : null}
                </div>
          
                <div>
                  <label htmlFor="cp">Codi Postal</label>
                  <Field
                    type="text"
                    name="cp"
                    placeholder="Codi Postal"
                    autoComplete="off"
                    value={values.cp}
                  />
                  {errors.cp && touched.cp ? <div>{errors.cp}</div> : null}
                </div>
          
                <div>
                  <Button type="submit">Guardar</Button>
                </div>
              </Form>
            )}
          </Formik>
          
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Client;