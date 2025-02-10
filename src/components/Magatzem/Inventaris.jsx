import React from 'react'
import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Row, Col, Modal, Table, Button, Tab } from 'react-bootstrap/'
import Header from '../Header'
import InventarisFiltres from './InventarisFiltres'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'



const InventorySchema = Yup.object().shape({
  storage_id: Yup.string().required('Required'),
  street_id: Yup.string()
});

function Inventaris() {
  const apiURL = import.meta.env.VITE_API_URL;
  const elementsPaginacio = import.meta.env.VITE_PAGINACIO;
  const navigate = useNavigate();
  var user = JSON.parse(localStorage.getItem('user'));


  const [inventory, setInventory] = useState([]);
  const [storages, setStorages] = useState([]);
  const [streets, setStreets] = useState([]);
  const [selectedStoragerId, setSelectedStorageId] = useState('');
  const [availableStreets, setAvailableStreets] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryLines, setInventoryLines] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedInventoryLines, setSelectedInventoryLines] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [users, setUsers] = useState([]);
  const [inventoryReasons, setInventoryReasons] = useState([]);
  const [filters, setFilters] = useState({});
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const lastIndex = currentPage * elementsPaginacio;
  const firstIndex = lastIndex - elementsPaginacio;
  const totalInventories = inventory.length;


  useEffect(() => {
    axios.get(`${apiURL}/inventory`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        const orderedInventories = response.data.sort((a, b) => {
          if(a.id > b.id) return 1;
          if(a.id < b.id) return 1;
          
          return 0
        })

        setInventory(orderedInventories);
        setDataToDisplay(orderedInventories);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/inventory_status`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryStatus(response.data);
      })
      .catch(e => { console.log(response.data) })

    axios.get(`${apiURL}/storage`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setStorages(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}/street`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setStreets(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}/space`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setSpaces(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}/product`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setProducts(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}/inventoryline`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryLines(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}/users`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setUsers(response.data);


      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}/inventory_reason`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryReasons(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    console.log("hola")
  }, []);

  useEffect(() => {
    if (selectedStoragerId) {
      const filteredStreets = streets.filter(street => street.storage_id === selectedStoragerId);
      setAvailableStreets(filteredStreets);
    } else {
      setAvailableStreets([]);
    }
  }, [selectedStoragerId, streets]);


  useEffect(() => {
    if (selectedInventory) {
      const filteredInventoryLines = inventoryLines.filter(line => line.inventory_id === selectedInventory.id);
      const orderedInventoryLines = filteredInventoryLines.sort((a, b) => {
        if (a.street_id < b.street_id) return -1;
        if (a.street_id > b.street_id) return 1;

        if (a.selft < b.selft_id) return -1;
        if (a.selft_id > b.selft_id) return 1;

        if (a.space_id < b.space_id) return -1;
        if (a.space_id > b.space_id) return 1;

        return 0;

      })
      setSelectedInventoryLines(orderedInventoryLines);
    } else {
      setSelectedInventoryLines([]);
    }
  }, [selectedInventory])

  /**************** FILTROS ****************/
  const handleFilter = (f) => {
    const filtered = dataToDisplay.filter(inv => {
      const inventoryDate = inv.created_at.split('T')[0];
      const dateFrom = f.dateFrom ? inventoryDate >= f.dateFrom : true;
      const dateTo = f.dateTo ? inventoryDate <= f.dateTo : true;
      const findStatus = inventoryStatus.find(status => status.name === f.status);
      const status = f.status ? inv.inventory_status === findStatus.id : true;
      const findStorage = storages?.find(storage => storage.name === f.storage);
      const storage = f.storage ? inv.storage_id === findStorage.id : true;

      return dateFrom && dateTo && status && storage;
    })
    setInventory(filtered);
    setFilters(f);
  }

  const handleClearFilters = () => {
    setInventory(dataToDisplay);
    setFilters({});
  }

  /**************** PAGINACIÓN ****************/
  const pageNumbers = [];
  const rounded = Math.ceil(totalInventories/elementsPaginacio);

  for (let i = 1; i <= rounded; i++){
    pageNumbers.push(i); 
  }

  const previuosPage = () => {
    setCurrentPage(currentPage - 1);
  }

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  }

  const specificPage = (page) => {
    setCurrentPage(page);
  }
  /**************** CREAR INVENTARIO ****************/
  const createInventory = async (values) => {
    let filteredSpaces;
    if (!values.street_id) {
      filteredSpaces = spaces.filter(space => space.storage_id === values.storage_id);
    } else {
      filteredSpaces = spaces.filter(space => space.storage_id === values.street_id)
    };

    let newInventory = {
      created_by: user.id,
      inventory_status: inventoryStatus?.find(status => status.name === 'Pendent').id,
      storage_id: values.storage_id
    }

    axios.post(`${apiURL}/inventory`, newInventory, { headers: { "auth-token": localStorage.getItem('token') } })
      .catch(e => { console.log(e.response.data) })

    filteredSpaces.map(space => {
      let newInventoryLine = {
        inventory_id: newInventory.id,
        product_id: space.product_id,
        quantity_estimated: space.quantity,
        storage_id: space.storage_id,
        street_id: space.street_id,
        selft_id: space.selft_id,
        space_id: space.id
      }
      axios.post(`${apiURL}/inventoryline`, newInventoryLine, { headers: { "auth-token": localStorage.getItem('token') } })
    });

    await axios.get(`${apiURL}/inventory`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        const orderedInventories = response.data.sort((a, b) => {
          if(a.id > b.id) return 1;
          if(a.id < b.id) return 1;
          
          return 0
        })

        setInventory(orderedInventories);

      })
      .catch(e => { console.log(e) })
  }

  /************* ELIMINAR INVENTARIO ***************/
  const deleteInventory = (id) => {
    if (confirm("¿Estàs segur de que vols esborrar aquest inventari?")) {
      axios.delete(`${apiURL}/inventory/${id}`, { headers: { "auth-token": localStorage.getItem('token') } })

      axios.get(`${apiURL}/inventory`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          const orderedInventories = response.data.sort((a, b) => {
            if(a.id > b.id) return 1;
            if(a.id < b.id) return 1;
            
            return 0
          })
  
          setInventory(orderedInventories);
        })
        .catch(e => { console.log(e) })
    }
  }

  //********* MODAL *********
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false)
  };

  const handleShow = () => setShow(true);

  const changeModalStatus = () => {
    setShowInventoryModal(!showInventoryModal);
  }


  return (
    <>
      <Header title='Inventaris'></Header>
      <InventarisFiltres onFilter={handleFilter} onClearFilters={handleClearFilters} storages={storages} />
      <Row className="d-flex mx-3 bg-secondary rounded-top mt-3">
        <div className="col-12 order-1 pb-2 col-md-6 order-md-0 col-xl-4 d-flex">
          <div className="d-flex rounded border mt-2 flex-grow-1 flex-xl-grow-0">
            <div className="form-floating bg-white">
              <select className="form-select" id="floatingSelect" aria-label="Seleccione una opción" defaultValue="">
                <option value="">Tria una opció</option>
                <option value="Eliminar">Eliminar</option>
              </select>
              <label htmlFor="floatingSelect">Accions en lot</label>
            </div>
            <button onClick={fecha} className="btn rounded-0 rounded-end-2 orange-button text-white px-2 flex-grow-1 flex-xl-grow-0" type="button" aria-label='Aplicar acciones en lote'><i className="bi bi-check-circle text-white px-1"></i>Aplicar</button>
          </div>
        </div>
        <div className="d-none d-xl-block col-xl-4 order-xl-1"></div>
        <div className="col-12 order-0 col-md-6 order-md-1 col-xl-4 oder-xl-2">
          <div className="d-flex h-100 justify-content-xl-end">
            {((users.find(u => u.id === user.id))?.userprofile_id === 1 || (users.find(u => u.id === user.id))?.userprofile_id === 2) ?
              <button type="button" className="btn btn-dark border-white text-white mt-2 my-md-2 flex-grow-1 flex-xl-grow-0" onClick={handleShow} aria-label="Crear inventario"><i className="bi bi-plus-circle text-white pe-1"></i>Crear</button> : null}
          </div>
        </div>
      </Row>
      <Row className="pt-0 px-3">
        <Col>
          <Modal show={show} onHide={handleClose} animation={true} >
            <Modal.Header closeButton>
              <Modal.Title className='text-light-blue'>Alta de Inventari</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Formik
                initialValues={{ storage_id: '', street_id: '' }}
                validationSchema={InventorySchema}
                onSubmit={values => {
                  createInventory(values);
                  handleClose();
                }}
              >
                {({ errors, touched, setFieldValue }) => (
                  <Form>
                    <div>
                      <label htmlFor="storage_" className='py-3 text-light-blue'>Magatzem:</label>
                      <Field
                        as='select'
                        name='storage_id'
                        className='form-control'
                        onChange={(e) => {
                          setSelectedStorageId(e.target.value);
                          setFieldValue('storage_id', e.target.value);
                        }}
                      >
                        <option value=''>Selecciona un magatzem</option>
                        {
                          storages.map((storage) => {
                            return (
                              <option key={storage.id} value={storage.id}>{storage.name}</option>
                            );
                          })
                        }
                      </Field>
                      {errors.storage_id && touched.storage_id ? <div>{errors.storage_id}</div> : null}
                    </div>
                    <div>
                      <label htmlFor="street_" className='py-3 text-light-blue'>Carrer:</label>
                      <Field
                        as='select'
                        name='street_id'
                        className='form-control'

                      >
                        <option value=''>Selecciona un carrer</option>
                        {
                          availableStreets.map((street) => {
                            return (
                              <option key={street.id} value={street.id} >{street.name}</option>
                            );
                          })
                        }
                      </Field>
                      {errors.street_id && touched.street_id ? <div>{errors.street_id}</div> : null}
                    </div>

                    <div className='py-3 text-end'>
                      <Button variant='secondary' onClick={handleClose}>Cerrar</Button>
                      <Button type='submit' className='ms-2 orange-button'>Generar Inventari</Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Modal.Body>
          </Modal>

          <Table className='table table-striped text-center'>
            <thead className="table-active border-bottom border-dark-subtle">
              <tr >
                <th>
                  <input type="checkbox" name="" id="" className='form-check-input' aria-label='Seleccione todas las filas' />
                </th>
                <th className='text-light-blue'>ID</th>
                <th className='text-light-blue'>Data</th>
                <th className='text-light-blue'>Estat</th>
                <th className='text-light-blue'>Magatzem</th>
                <th className='text-light-blue'>Inventariar</th>
                <th className='text-light-blue'>Accions</th>
              </tr>
            </thead>
            <tbody className='text-light-blue'>
              {
                (inventory.length === 0) ?
                  <tr><td colSpan={7}>No hay nada</td></tr>
                  : inventory.map((values) => {

                    return (
                      <tr key={values.id}>
                        <td scope="row" data-cell="Seleccionar: ">
                          <input type="checkbox" className='form-check-input' name="" id="" aria-label={`Selecione la fila del inventario ${values.id}`} />
                        </td>
                        <td data-cell="ID: ">{values.id}</td>
                        <td data-cell="Data: ">{values.created_at}</td>
                        <td data-cell="Estat: ">{(inventoryStatus.find(inventory => inventory.id === values.inventory_status))?.name}</td>
                        <td data-cell="Magatzem: ">{(storages.find(storage => storage.id === values.storage_id))?.name}</td>
                        <td>
                          {
                            (values.inventory_status === inventoryStatus.find(status => status.name === 'Pendent')?.id) ?
                              <Button onClick={() => navigate(`/inventaris/inventariar/${values.id}`)} className="outline-orange">Inventariar</Button>
                              :
                              (values.inventory_status === inventoryStatus.find(status => status.name === 'Fent-se')?.id) && ((users.find(u => u.id === user.id)?.userprofile_id === 1) || (users.find(u => u.id === user.id)?.userprofile_id === 2)) ?
                                <Button onClick={() => navigate(`/inventaris/completarInventari/${values.id}`)} className="outline-blue">Completar</Button> :
                                ""
                          }
                        </td>
                        <td>
                          <button className='btn' onClick={() => { setSelectedInventory(values); changeModalStatus() }}><i className="bi bi-eye text-light-blue fs-5"><span className="visually-hidden">Visualitzar</span></i></button>
                          <button className="btn" onClick={() => deleteInventory(values.id)}><i className="bi bi-trash text-light-blue fs-5"><span className="visually-hidden">Eliminar</span></i></button>
                        </td>
                      </tr>
                    )
                  }).slice(firstIndex, lastIndex)
              }

            </tbody>
          </Table>

          <Modal show={showInventoryModal} onHide={changeModalStatus} animation={true} size='xl'>
            <Modal.Header closeButton>
              <Modal.Title className='text-light-blue'>Detall Inventari</Modal.Title>
            </Modal.Header>
            <Modal.Body>


              {selectedInventory && (
                <>
                  <Table className='table table-striped text-center'>
                    <thead className="table-active border-bottom border-dark-subtle">
                      <tr>
                        <th className='text-light-blue'>ID Inventari</th>
                        <th className='text-light-blue'>Data</th>
                        <th className='text-light-blue'>Estat</th>
                        <th className='text-light-blue'>Magatzem</th>
                      </tr>
                    </thead>
                    <tbody className='text-light-blue'>
                      <tr>
                        <td data-cell="ID Inventari: " className='text-light-blue'>{selectedInventory.id}</td>
                        <td data-cell="Data: ">{selectedInventory.created_at}</td>
                        <td data-cell="Estat: ">{inventoryStatus.find(status => status.id === selectedInventory.inventory_status)?.name}</td>
                        <td data-cell="Magatzem: ">{(storages.find(storage => storage.id === selectedInventory.storage_id))?.name}</td>
                      </tr>
                    </tbody>
                  </Table>


                  <Table className='table table-striped text-center'>
                    <thead className="table-active border-bottom border-dark-subtle">
                      <tr>
                        <th scope="col" className='text-light-blue'>Carrer</th>
                        <th scope="col" className='text-light-blue'>Estanteria</th>
                        <th scope="col" className='text-light-blue'>Espacio</th>
                        <th scope="col" className='text-light-blue'>Producte</th>
                        <th scope="col" className='text-light-blue'>Quantitat Estimada</th>
                        <th scope="col" className='text-light-blue'>Quantitat Real</th>
                        <th scope="col" className='text-light-blue'>Justificació</th>
                      </tr>
                    </thead>
                    <tbody className='text-light-blue'>


                      {
                        (selectedInventoryLines.length === 0) ?
                          <tr><td colSpan={7} className='text-center'>No existix informació per a ser mostrat.</td></tr> :
                          selectedInventoryLines.map((value) => {
                            console.log(value)
                            return (
                              <tr key={value.id}>
                                <td data-cell="Carrer: ">{value.street_id}</td>
                                <td data-cell="Espacio: ">{value.shelf_id}</td>
                                <td data-cell="Estanteria: ">{value.space_id}</td>
                                <td data-cell="Producte: ">{(products.find(product => product.id === value.product_id))?.name}</td>
                                <td data-cell="Quantitat Estimada: ">{value.quantity_estimated}</td>
                                <td data-cell="Quantitat Real: ">{value.quantity_real}</td>
                                <td data-cell="Justificació: ">{(inventoryReasons.find(reason => reason.id === value.inventory_reason_id))?.name}</td>
                              </tr>
                            )
                          })
                      }
                    </tbody>

                  </Table>


                </>
              )}

              <div className='py-3 text-end'>
                <Button variant='secondary' onClick={() => changeModalStatus()}>Cerrar</Button>
              </div>

            </Modal.Body>
          </Modal>
          
          <nav aria-label="Page navigation example" className="d-block" id='pagination'>
            <ul className="pagination justify-content-center">
              <li className="page-item">
                <a className={`page-link text-light-blue ${currentPage === 1 ? 'disabled' : ''}`} onClick={previuosPage} aria-label="Página anterior">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              {pageNumbers.map(page => (
                <li className="page-item" key={page}>
                  <a className={`page-link text-light-blue ${page === currentPage ? 'activo-2' : ''}`} onClick={() => specificPage(page)}>{page}</a>
                </li>
              ))}
              <li className="page-item">
                <a className={`page-link text-light-blue ${currentPage >= pageNumbers.length ? 'disabled' : ''}`} onClick={nextPage} aria-label="Página siguiente">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </Col>
      </Row >
    </>
  )
}

export default Inventaris
