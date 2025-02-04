import React from 'react'
import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Row, Col, Modal, Table, Button, Tab } from 'react-bootstrap/'
import Header from '../Header'
import Filtres from '../Filtres'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const InventorySchema = Yup.object().shape({
  storage_id: Yup.string().required('Required'),
  street_id: Yup.string()
});

function Inventaris() {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));


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
  const [inputLocked, setInputLocked] = useState(false)
  

  useEffect(() => {
    axios.get(`${apiURL}inventory`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventory(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}inventory_status`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryStatus(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}storage`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setStorages(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}street`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setStreets(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}space`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setSpaces(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}product`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setProducts(response.data);
      })
      .catch(e => { console.log(e) })

    axios.get(`${apiURL}inventoryline`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryLines(response.data);
      })
      .catch(e => { console.log(e) })

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
      const orderedInventoryLines = filteredInventoryLines.sort((a,b) => {
        if(a.street_id < b.street_id) return -1;
        if(a.street_id > b.street_id) return 1;

        if(a.selft < b.selft_id) return -1;
        if(a.selft_id > b.selft_id) return 1;

        if(a.space_id < b.space_id) return -1;
        if(a.space_id > b.space_id) return 1;

        return 0;

      })
      setSelectedInventoryLines(filteredInventoryLines);
    } else {
      setSelectedInventoryLines([]);
    }
  }, [selectedInventory])
  /**************** CREAR INVENTARIO ****************/
  const createInventory = async (values) => {
    let filteredSpaces;
    if (!values.street_id) {
      filteredSpaces = spaces.filter(space => space.storage_id === values.storage_id);
    } else {
      filteredSpaces = spaces.filter(space => space.storage_id === values.street_id)
    };
    
    let newInventory = {
      created_by: 1,
      inventory_status: 1,
      storage_id: values.storage_id
    }

    axios.post(`${apiURL}inventory`, newInventory, { headers: { "auth-token": localStorage.getItem('token') } })
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
      axios.post(`${apiURL}inventoryline`, newInventoryLine, { headers: { "auth-token": localStorage.getItem('token') } })
    });
  
    await axios.get(`${apiURL}inventory`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        console.log(response)
        console.log(response.data)
        setInventory(response.data);

      })
      .catch(e => { console.log(e) })
  }

  /************* ELIMINAR INVENTARIO ***************/
  const deleteInventory = (id) => {
    if (confirm("¿Estàs segur de que vols esborrar aquest inventari?")) {
      axios.delete(`${apiURL}inventory/${id}`, { headers: { "auth-token": localStorage.getItem('token') } })

      axios.get(`${apiURL}inventory`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventory(response.data);

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
      <Filtres />
      <Row>
        <Col>
          <div className='px-3 pt-3'>
            {(user.name === 'Admin') ? 
              <Button variant='secondary' className='mb-3 btn btn-success' onClick={handleShow}>Crear</Button> : null}

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
                        <Button variant='secondary' onClick={changeModalStatus}>Cerrar</Button>
                        <Button type='submit' className='ms-2 orange-button'>Generar Inventari</Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Modal.Body>
            </Modal>

            <Table striped bordered hover>
              <thead>
                <tr >
                  <th>
                    <input type="checkbox" name="" id="" className='form-check-input' />
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
                    <tr><td colSpan={6}>No hay nada</td></tr>
                    : inventory.map((values) => {
                      return (
                        <tr key={values.id}>
                          <td>
                            <input type="checkbox" className='form-check-input' name="" id="" />
                          </td>
                          <td>{values.id}</td>
                          <td>{values.created_at}</td>
                          <td>{(inventoryStatus.find(inventory => inventory.id === values.inventory_status))?.name}</td>
                          <td>{(storages.find(storage => storage.id === values.storage_id))?.name}</td>
                          <td>
                            {
                              (values.inventory_status === inventoryStatus.find(status => status.name === 'Pendent')?.id) ?
                                <Button onClick={() => navigate(`/inventaris/inventariar/${values.id}`)} variant="outline-primary">Inventariar</Button>
                                :
                                (values.inventory_status === inventoryStatus.find(status => status.name === 'Fent-se')?.id) && (user.name === 'Admin') ?
                                  <Button onClick={() => navigate(`/inventaris/completarInventari/${values.id}`)} variant="outline-warning">Completar</Button> :
                                  ""
                            }
                          </td>
                          <td>
                            <Button variant='outline-secondary' onClick={() => { setSelectedInventory(values); changeModalStatus() }}><i className="bi bi-eye"></i></Button>
                            <Button variant='outline-danger mx-3' onClick={() => deleteInventory(values.id)}><i className="bi bi-trash"></i></Button>
                          </td>
                        </tr>
                      )
                    })
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
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th className='text-light-blue'>ID Inventari</th>
                          <th className='text-light-blue'>Data</th>
                          <th className='text-light-blue'>Estat</th>
                          <th className='text-light-blue'>Magatzem</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{selectedInventory.id}</td>
                          <td>{selectedInventory.created_at}</td>
                          <td>{inventoryStatus.find(status => status.id === selectedInventory.inventory_status)?.name}</td>
                          <td>{(storages.find(storage => storage.id === selectedInventory.storage_id))?.name}</td>
                        </tr>
                      </tbody>
                    </Table>

                   
                        <Table>
                          <thead>
                            <tr>
                              <th scope="col" className='text-light-blue'>Carrer</th>
                              <th scope="col" className='text-light-blue'>Estanteria</th>
                              <th scope="col" className='text-light-blue'>Espacio</th>
                              <th scope="col" className='text-light-blue'>Producte</th>
                              <th scope="col" className='text-light-blue'>Quantitat Estimada</th>
                              <th scope="col" className='text-light-blue'>Quantitat Real</th>
                            </tr>
                          </thead>
                          <tbody>


                            {
                              (selectedInventoryLines.length === 0) ?
                                <tr><td colSpan={5} className='text-center'>No hay nada</td></tr> :
                                selectedInventoryLines.map((value) => {
                                  return (
                                    <tr key={value.id}>
                                      <td>{value.street_id}</td>
                                      <td>{value.selft_id}</td>
                                      <td>{value.space_id}</td>
                                      <td>{(products.find(product => product.id === value.product_id))?.name}</td>
                                      <td>{value.quantity_estimated}</td>
                                      <td>{value.quantity_real}</td>
                                    </tr>)
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
          </div>
        </Col>
      </Row >
    </>
  )
}

export default Inventaris
