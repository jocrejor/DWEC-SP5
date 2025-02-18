import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import Header from '../Header';
import Filtres from './proveidorsFiltres';	
import axios from 'axios';
import Papa from 'papaparse';
import '../../App.css';

const apiUrl = import.meta.env.VITE_API_URL;
const elementsPaginacio = import.meta.env.VITE_PAGINACIO;

const supplierschema = Yup.object().shape({
  name: Yup.string().min(3, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 50 caracters').required('Valor requerit'),
  address: Yup.string().min(10, 'Valor mínim de 10 caracters.').max(100, 'El valor màxim és de 100 caracters').required('Valor requerit'),
  nif: Yup.string().matches(/^\w{9}$/, 'El NIF ha de tenir 9 caracters i ha de ser únic.´').required('Valor requerit'),
  phone: Yup.string().matches(/^(\+\d{1,3}\s?)?(\d{9}|\d{3}\s\d{3}\s\d{3})$/,'El telèfon ha de ser correcte (ex: +34 911234567, 621121124, 932 123 456)').required('Valor requerit'),
  email: Yup.string().email('Email no vàlid').required('Valor requerit'),
  state_id: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  province: Yup.string().required('Valor requerit'),
  city: Yup.string().required('Valor requerit'),
  cp: Yup.string().matches(/^\d{5}$/, 'El codi postal ha de tenir 5 dígits').required('Valor requerit'),
});

function Proveidors() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [pais, setPais] = useState([]);
  const [provincia, setProvince] = useState([]);
  const [ciutat, setCity] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Crear');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [suppliersPage,setSuppliersPage]= useState([]);
  const [csvData, setCsvData] = useState([]);
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
  const displayedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * elementsPaginacio,
    currentPage * elementsPaginacio
  );

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setFilteredSuppliers(suppliers);
    setCurrentPage(1);
  }, [suppliers]);

    // Obtindreels index. 
    useEffect (()=>{
      const totalPages = Math.ceil(suppliers.length / elementsPaginacio);
      setTotalPages(totalPages);
      console.log(totalPages)
    },[suppliers])
  
    // Función para cambiar de página
    const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
  
    // Funciones para "anterior" y "siguiente"
    const goToPreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
  
    const goToNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };
  
    useEffect(()=> {
      const indexOfLastItem = currentPage * elementsPaginacio;
      const indexOfFirstItem = indexOfLastItem - elementsPaginacio;
      const currentItems = suppliers.slice(indexOfFirstItem, indexOfLastItem);
      setSuppliersPage(currentItems)
    },[currentPage,suppliers])

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
    const provinceId = provincia.find((prov) => prov.name === valors.province)?.id || '';

    setTipoModal('Modificar');
    setValorsInicials({
        ...valors,
        province: valors.state_id === 194 ? provinceId : valors.province, 
    });

    console.log('Valors Modificar:', valors);  
    setShowModal(true);
};

  
  const viewSupplier = (valors) => {
    setValorsInicials(valors);
    setShowViewModal(true);
  };

  const importSuppliers = () => {
    setShowImportModal(true);
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
        values.province = values.isModal ? selectedProvince.id : selectedProvince.name;
      }
    }
    return values;
  };
  

  const gravar = async (values) => {
    try {
      const transformedValues = transformProvince(values);

      let dataToSend = tipoModal === 'Modificar' ? { ...transformedValues } : transformedValues;
  
      if (tipoModal === 'Modificar' && dataToSend.id) {
        delete dataToSend.id; 
      }
  
      if (tipoModal === 'Crear') {
        await axios.post(`${apiUrl}/supplier`, dataToSend, { 
          headers: { "auth-token": localStorage.getItem("token") } 
        });
      } else {
        if (!values.id) {
          console.error('Error: El id del proveedor es necesario para la modificación');
          return;
        }
        await axios.put(`${apiUrl}/supplier/${values.id}`, dataToSend, {
          headers: { "auth-token": localStorage.getItem("token") }
        });
      }
      
      const updatedSuppliers = await axios.get(`${apiUrl}/supplier`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });
      setSuppliers(updatedSuppliers.data);
      canviEstatModal();
  
    } catch (error) {
      console.error('Error guardando proveedores:', error);
      if (error.response && error.response.data) {
        console.error('Respuesta de la API:', error.response.data);
      }
    }
  };
  
  const handleFilterChange = (filters) => {
    const filtered = suppliers.filter((supplier) => {
      if (filters.name && !supplier.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.nif && !supplier.nif.toLowerCase().includes(filters.nif.toLowerCase())) return false;
      if (filters.phone && !supplier.phone.includes(filters.phone)) return false;
      if (filters.email && !supplier.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      return true;
    });
    setFilteredSuppliers(filtered);
    setCurrentPage(1);
  };

  const handleFilterRestart = () => {
    setFilteredSuppliers(suppliers);
    setCurrentPage(1);
  };

// Maneja el cambio del archivo CSV
const handleImportChange = (event) => {
  const file = event.target.files[0];

  if (file) {
    Papa.parse(file, {
      complete: (result) => {
        console.log("CSV Parsed Result:", result); 
        // Guardar los datos del CSV
        setCsvData(result.data); 
      },
      header: true,
      skipEmptyLines: true,
    });
  }
};

const handleImport = async () => {
  if (csvData && csvData.length > 0) {
    try {
      console.log("Datos CSV antes del filtrado:", csvData);

      // Verificar si hay datos válidos antes de enviar
      if (csvData.length === 0) {
        console.error("Error: No hay datos válidos para importar.");
        return;
      }

      for (let i = 0; i < csvData.length; i++) {
        const provider = csvData[i];

        // Asegúrate de que el objeto tenga los campos correctos antes de enviarlo
        if (provider.name && provider.address && provider.nif && provider.phone && provider.email) {
          const response = await fetch(`${apiUrl}/supplier`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "auth-token": localStorage.getItem("token")
            },
            body: JSON.stringify(provider)
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log("Proveedor importado exitosamente:", responseData);
          } else {
            console.error("Error al importar proveedor:", provider.name);
          }
        } else {
          console.error("Datos incompletos para el proveedor:", provider);
        }
      }

      // Después de importar todos los proveedores, recarga la lista actualizada
      const updatedSuppliers = await axios.get(`${apiUrl}/supplier`, {
        headers: { "auth-token": localStorage.getItem("token") }
      });

      // Actualiza el estado con la nueva lista de proveedores
      setSuppliers(updatedSuppliers.data);

      // Cerrar el modal de importación si todo fue bien
      setShowImportModal(false);
    } catch (error) {
      console.error("Error al importar:", error);
    }
  } else {
    console.error("Error: No se encontraron datos válidos en el CSV.");
  }
};


  return (
    <>
      <Header title="Llistat de proveidors" />
      <Filtres onFilter={handleFilterChange} onClear={handleFilterRestart}/>
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
            className='btn btn-success border-white text-white mt-2 my-md-2 me-3 flex-grow-1 flex-xl-grow-0'
            onClick={() => importSuppliers()} style={{ cursor: "pointer" }}
            >
            <i className="bi bi-box-arrow-down text-white pe-1"></i>Importar
            </Button>
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
            {filteredSuppliers.length === 0 && suppliersPage.length === 0 ? (
              <tr>
                <td colSpan="13">No hi han proveidors</td>
              </tr>
            ) : (
              displayedSuppliers.map((valors) => (
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

      {/* Modal Importar */}
      <Modal className='text-light-blue' show={showImportModal} onHide={() => setShowImportModal(false)}>
      <Modal.Header className='text-center py-4 fs-4 fw-bold m-0 text-white bg-title' closeButton>
        <Modal.Title>Importa Proveidors</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          {/* Input para importar CSV */}
          <div className="mt-3 mb-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportChange}
              className="form-control"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className='orange-button' type="submit" variant="success" onClick={handleImport}>
          Importar
        </Button>
      </Modal.Footer>
    </Modal>

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
            validationSchema={supplierschema}
            onSubmit={(values) => {
              gravar(values);
            }}
          >
            {({ values, errors, touched }) => (
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
                    {pais.sort((a, b) => a.name.localeCompare(b.name)).map((state) => (
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
                        className={`text-light-blue form-control ${touched.province && errors.province ? 'is-invalid' : ''}`}
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
                      {ciutat
                        .filter((ciudad) => ciudad.province_id === Number(values.province))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((ciudad) => (
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
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link text-light-blue" href="#" aria-label="Previous" onClick={(e) => { e.preventDefault(); goToPreviousPage(); }}>
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <li key={number} className={`page-item ${currentPage === number ? 'activo-2' : ''}`}>
              <a className="page-link text-light-blue" href="#" onClick={(e) => { e.preventDefault(); paginate(number); }}>
                {number}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link text-light-blue" href="#" aria-label="Next" onClick={(e) => {e.preventDefault(); goToNextPage(); }}>
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Proveidors;