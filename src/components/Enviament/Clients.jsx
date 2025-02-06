import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { Button, Modal } from "react-bootstrap";
import Header from "../Header";
import Filtres from "./FiltresClients";
import axios from "axios";

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

  const modificarClient = async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/client/${id}`, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      if (response.data) {
        setTipoModal("Modificar");
        setValorsInicials(response.data);

        const provincesData = await getData(
          "Province?state_id=" + response.data.state_id
        );
        setProvinces(provincesData);

        const citiesData = await getData(
          "City?province_id=" + response.data.province_id
        );
        setCities(citiesData);

        setSelectedState(response.data.state_id);
        setSelectedProvince(response.data.province_id);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error al obtener los datos del cliente", error);
    }
  };

  const canviEstatModal = () => {
    setShowModal(!showModal);
  };

  const visualizarClient = async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/client/${id}`, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });
  
      if (response.data) {
        setClientToView(response.data); 
        setTipoModal("Visualitzar");  
        setShowModal(true); 
      }
    } catch (error) {
      console.error("Error al obtener los datos del cliente", error);
    }
  };
  

  const actualizarClient = async (values) => {
    try {
      const response = await axios.put(
        `${apiUrl}/client/${values.id}`,
        values,
        {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (response.data) {
        setClients((prevClients) =>
          prevClients.map((client) =>
            client.id === values.id ? response.data : client
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error al actualizar el cliente", error);
    }
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
    setFieldValue("province_id", selectedProvinceId); 
    setSelectedProvince(selectedProvinceId); 

    if (selectedProvinceId) {
      const allCities = await getData("City"); 

      const filteredCities = allCities.filter(
        (city) => city.province_id === parseInt(selectedProvinceId)
      );

      setCities(filteredCities);
      setFieldValue("city_id", ""); 
    } else {
      setCities([]);
    }
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
    if (values.nif.length < 9) {
      alert("El NIF debe tener al menos 9 caracteres.");
      return; 
    }

    const clientData = {
      name: values.name,
      address: values.address,
      nif: values.nif,
      phone: values.phone,
      email: values.email,
      state_id: values.state_id,
      province: provinces.find((province) => province.id === parseInt(values.province_id))?.name || "", 
      city: cities.find((city) => city.id === parseInt(values.city_id))?.name || "", 
      cp: values.cp
    };
  
    console.log("Datos enviados para la creación del cliente:", clientData);
  
    try {
      const response = await axios.post("https://api.dwes.iesevalorpego.es/client", clientData, {
        headers: {
          "auth-token": localStorage.getItem("token"), 
          "Content-Type": "application/json"
        }
      });
  
      if (response.data) {
        console.log("Cliente creado con éxito:", response.data);
        setClients((prevClients) => [...prevClients, response.data]);
        setShowModal(false); 
      }
  
    } catch (error) {
      // Manejo de errores
      console.error("Error al crear el cliente:", error);
  
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        alert(`Error al crear el cliente: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error("Error en la solicitud:", error.request);
        alert("Error en la solicitud al servidor.");
      } else {
        console.error("Error inesperado:", error.message);
        alert("Error inesperado al crear el cliente.");
      }
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
              <select
                className="form-select"
                id="floatingSelect"
                aria-label="Seleccione una opción"
              >
                <option selected>Tria una opció</option>
                <option value="1">Eliminar</option>
              </select>
              <label htmlFor="floatingSelect">Accions en lot</label>
            </div>
            <button
              className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0"
              type="button"
            >
              <i className="bi bi-check-circle text-white px-1"></i>Aplicar
            </button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            <button
              className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0"
              onClick={canviEstatModal}
            >
              <i className="bi bi-plus-circle text-white pe-1"></i>Crear
            </button>
          </div>
        </div>
      </div>
      <div className="table-responsive mt-2">
        <table className="table table-hover table-striped">
          <thead className="table">
            <tr>
            <th scope="col" className="text-center">ID</th>
              <th scope="col" className="text-center">Nom</th>
              <th scope="col" className="text-center">Email</th>
              <th scope="col" className="text-center">Telèfon</th>
              <th scope="col" className="text-center">NIF</th> 
              <th scope="col" className="text-center">Adreça</th>
              <th scope="col" className="text-center">Accions</th>
            </tr>
          </thead>
          <tbody>
  {clients.map((client) => (
    <tr key={client.id}>
      <td data-cell="ID" className="text-center">{client.id}</td>
      <td data-cell="Nom" className="text-center">{client.name}</td>
      <td data-cell="Email" className="text-center">{client.email}</td>
      <td data-cell="Telèfon" className="text-center">{client.phone}</td>
      <td data-cell="NIF" className="text-center">{client.nif}</td>
      <td data-cell="Adreça" className="text-center">{client.address}</td>
      <td>
        <div className="d-flex">
          <span
            onClick={() => visualizarClient(client.id)} // Visualizar
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-eye"></i>
          </span>
          <span
            onClick={() => modificarClient(client.id)} // Modificar
            className="mx-2"
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-pencil-square"></i>
          </span>
          <span
            onClick={() => eliminarClient(client.id)} // Eliminar
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-trash"></i>
          </span>
        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      <Modal
        size="lg"
        show={showModal}
        onHide={canviEstatModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{tipoModal} Client</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={valorsInicials}
          validationSchema={ClientSchema}
          enableReinitialize
          onSubmit={tipoModal === "Crear" ? crearClient : actualizarClient}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            setFieldValue,
            errors,
            touched,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">
                    Nom del client
                  </label>
                  <Field
                    className="form-control"
                    type="text"
                    id="name"
                    name="name"
                    disabled={tipoModal === "Visualitzar"}
                  />
                  {errors.name && touched.name && (
                    <div className="text-danger">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">
                    Correu electrònic
                  </label>
                  <Field
                    className="form-control"
                    type="email"
                    id="email"
                    name="email"
                  />
                  {errors.email && touched.email && (
                    <div className="text-danger">{errors.email}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="phone">
                    Telèfon
                  </label>
                  <Field
                    className="form-control"
                    type="text"
                    id="phone"
                    name="phone"
                  />
                  {errors.phone && touched.phone && (
                    <div className="text-danger">{errors.phone}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="address">
                    Adreça
                  </label>
                  <Field
                    className="form-control"
                    type="text"
                    id="address"
                    name="address"
                  />
                  {errors.address && touched.address && (
                    <div className="text-danger">{errors.address}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="nif">
                    NIF
                  </label>
                  <Field
                    className="form-control"
                    type="text"
                    id="nif"
                    name="nif"
                  />
                  {errors.nif && touched.nif && (
                    <div className="text-danger">{errors.nif}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="state_id">
                    Estat
                  </label>
                  <Field
                    as="select"
                    className="form-control"
                    id="state_id"
                    name="state_id"
                    onChange={(e) => handleStateChange(e, setFieldValue)}
                  >
                    <option value="">Tria un estat</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </Field>
                  {errors.state_id && touched.state_id && (
                    <div className="text-danger">{errors.state_id}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="province_id">
                    Província
                  </label>
                  <Field
                    as="select"
                    className="form-control"
                    id="province_id"
                    name="province_id"
                    onChange={(e) => handleProvinceChange(e, setFieldValue)}
                  >
                    <option value="">Tria una província</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </Field>
                  {errors.province_id && touched.province_id && (
                    <div className="text-danger">{errors.province_id}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="city_id">
                    Ciutat
                  </label>
                  <Field
                    as="select"
                    className="form-control"
                    id="city_id"
                    name="city_id"
                  >
                    <option value="">Tria una ciutat</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Field>
                  {errors.city_id && touched.city_id && (
                    <div className="text-danger">{errors.city_id}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="cp">
                    Codi postal
                  </label>
                  <Field
                    className="form-control"
                    type="text"
                    id="cp"
                    name="cp"
                  />
                  {errors.cp && touched.cp && (
                    <div className="text-danger">{errors.cp}</div>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={canviEstatModal}>
                  Tancar
                </Button>
                <Button variant="primary" type="submit">
                  {tipoModal === "Modificar" ? "Modificar" : "Crear"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
      
    </>
  );
}

export default Client;
