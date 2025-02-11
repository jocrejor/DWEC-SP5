import React from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Row, Col, Table, Button, Modal } from 'react-bootstrap/'
import Header from '../Header'
import axios from 'axios';
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const InventoryLineSchema = Yup.object().shape({
  street_id: Yup.string().required('Valor requerit'),
  shelf_id: Yup.string().required('Valor requerit'),
  space_id: Yup.string().required('Valor requerit'),
  product_id: Yup.string().required('Valor requerit'),
  quantity_real: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  inventory_reason_id: Yup.string()
});


function Inventariar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem('user'));

  const [storages, setStorages] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryLines, setInventoryLines] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedInventoryLines, setSelectedInventoryLines] = useState([]);
  const [updatedInventoryLines, setUpdatedInventoryLines] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [inventoryReasons, setInventoryReasons] = useState([]);
  const [inputLocked, setInputLocked] = useState(false);
  const [streets, setStreets] = useState([]);
  const [shelfs, setShelfs] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [selectedStreets, setSelectedStreets] = useState([]);
  const [selectedShelfs, setSelectedShelfs] = useState([]);
  const [selectedSpaces, setSelectedSpaces] = useState([]);


  useEffect(() => {

    axios.get(`${apiURL}/inventory/${id}`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setSelectedInventory(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/inventory_status`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryStatus(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/inventoryline`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryLines(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/storage`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setStorages(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/product`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setProducts(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/inventory_reason`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setInventoryReasons(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/street`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setStreets(response.data);
      })
      .catch(e => { console.log(e.response.data) })
    axios.get(`${apiURL}/shelf`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setShelfs(response.data);
      })
      .catch(e => { console.log(e.response.data) })

    axios.get(`${apiURL}/space`, { headers: { "auth-token": localStorage.getItem('token') } })
      .then(response => {
        setSpaces(response.data);
      })
      .catch(e => { console.log(e.response.data) })

  }, []);


  useEffect(() => {
    if (selectedInventory) {
      const filteredInventoryLines = inventoryLines.filter(line =>
        line.inventory_id === selectedInventory.id &&
        line.quantity_estimated != line.quantity_real &&
        products.some((product) => product.id === line.product_id));

      const orderedInventoryLines = filteredInventoryLines.sort((a, b) => {
        if (a.street_id < b.street_id) return -1;
        if (a.street_id > b.street_id) return 1;

        if (a.selft < b.selft_id) return -1;
        if (a.selft_id > b.selft_id) return 1;

        if (a.space_id < b.space_id) return -1;
        if (a.space_id > b.space_id) return 1;

        return 0;

      })

      const filteredStreets = streets.filter((street) => {
        street.storage_id === selectedInventory.storage_id;
      });

      const filteredShelfs = shelfs.filter((shelf) => {
        shelf.storage_id === selectedInventory.storage_id
      })

      const filteredSpaces = spaces.filter((space) => {
        space.storage_id === selectedInventory.storage_id;
      })

      setSelectedStreets(filteredStreets);
      setSelectedShelfs(filteredShelfs);
      setSelectedSpaces(filteredSpaces);
      setSelectedInventoryLines(orderedInventoryLines);

    } else {
      setSelectedInventoryLines([]);
    }
  }, [selectedInventory])


  const displayData = () => {
    console.log(selectedStreets)
    console.log(selectedShelfs)
    console.log(selectedSpaces)
  }



  useEffect(() => {
    //console.log(updatedInventoryLines)
    console.log(selectedInventoryLines)

  }, [updatedInventoryLines, selectedInventoryLines])

  const handleInputChange = (e) => {
    //console.log(e)
    //console.log(e.target.name)
    const { name, value, type } = e.target;
    const lineId = parseInt(name);
    const newValue = parseInt(value);
    const field = type === 'number' ? 'quantity_real' : 'inventory_reason_id';

    //console.log(lineId + '-' + field + ' - ' + value + ' - ' + type)
    //console.log(field)

    setUpdatedInventoryLines((prev) => {
      const index = prev.findIndex((line) => line.id === lineId);
      if (index != -1) {
        const updatedLines = [...prev];
        updatedLines[index] = { ...updatedLines[index], [field]: newValue };
        return updatedLines;
      }

      return [
        ...prev, { id: lineId, [field]: newValue }
      ]
    })

  }

  const handleSubmit = async () => {
    if (updatedInventoryLines.length != selectedInventoryLines.length) {
      //console.log(updatedInventoryLines.length + " - " + selectedInventory.length)
      alert("Introdueix totes les quantitats reals");
    } else if (updatedInventoryLines.length === 0) {
      alert("No hi ha res a inventariar");
    } else {
      const updatedLines = await Promise.all(selectedInventoryLines.map(async (line) => {
        const updatedLine = updatedInventoryLines.find((updated) => updated.id === line.id);
        const defaultReason = inventoryReasons.find(reason => reason.name === "Recompte cíclic")?.id;

        if (updatedLine) {
          line = {
            ...line,
            quantity_real: updatedLine?.quantity_real,
            operator_id: user.id,
            inventory_reason_id: updatedLine?.inventory_reason_id || defaultReason
          };

          await axios.put(`${apiURL}/inventoryline/${line.id}`, line, { headers: { "auth-token": localStorage.getItem('token') } })

          return line;
        }
        return line;
      }))

      const updatedSelectedInventory = { ...selectedInventory, inventory_status: inventoryStatus.find(status => status.name === 'Fent-se').id }

      await axios.put(`${apiURL}/inventory/${selectedInventory.id}`, updatedSelectedInventory, { headers: { "auth-token": localStorage.getItem('token') } })

      setSelectedInventoryLines(updatedLines);
      setSelectedInventory(updatedSelectedInventory);
      //console.log(updatedSelectedInventory)
      alert("Linia actualitzada amb èxit");
      navigate('/inventaris');
    }

  }

  const changeDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString();
  }

  //********* MODAL *********
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false)
  };

  const handleShow = () => setShow(true);

  return (
    <>
      <Header title="Inventariar Inventari" />
      <Row>
        <Col>
          <div className='px-3 py-3'>
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
                  <td data-cell="ID Inventari: ">{selectedInventory?.id}</td>
                  <td data-cell="Data: ">{changeDate(selectedInventory?.created_at)}</td>
                  <td data-cell="Estat: ">{(inventoryStatus.find(inventory => inventory.id === selectedInventory?.inventory_status))?.name}</td>
                  <td data-cell="Magatzem">{(storages.find(storage => storage.id === selectedInventory?.storage_id))?.name}</td>
                </tr>
              </tbody>
            </Table>

            <Table className='table table-striped text-center'>
              <thead className="table-active border-bottom border-dark-subtle">
                <tr>
                  <th scope="col" className='text-light-blue'>Carrer</th>
                  <th scope="col" className='text-light-blue'>Estanteria</th>
                  <th scope="col" className='text-light-blue'>Espai</th>
                  <th scope="col" className='text-light-blue'>Producte</th>
                  <th scope="col" className='text-light-blue'>Quantitat Real</th>
                  <th scope="col" className='text-light-blue'>Justificació</th>
                </tr>
              </thead>
              <tbody className='text-light-blue'>
                {
                  (selectedInventoryLines.length === 0) ?
                    <tr><td colSpan={7} className='text-center'>No existix informació per a ser mostrat.</td></tr> :
                    selectedInventoryLines.map((value) => {
                      return (
                        <tr key={value.id}>
                          <td data-cell="Carrer: ">{value.street_id}</td>
                          <td data-cell="Estanteria: ">{value.shelf_id}</td>
                          <td data-cell="Espai: ">{value.space_id}</td>
                          <td data-cell="Producte: ">{(products.find(product => product.id === value.product_id))?.name}</td>
                          <td data-cell="Quantitat Real: ">
                            <input
                              type='number'
                              name={value.id}
                              step="1"
                              placeholder='0'
                              className='form-control'
                              onChange={handleInputChange}
                              disabled={inputLocked}
                            />
                          </td>
                          <td>
                            <select
                              name={value.id}
                              className='form-select'
                              onChange={handleInputChange}
                              defaultValue={inventoryReasons.find(reason => reason.name === "Recompte cíclic")?.id}
                            >
                              <option >Selecciona una opció</option>
                              {inventoryReasons.map((reason) => {
                                return (
                                  <option value={reason.id} key={reason.id}>{reason.name}</option>
                                )
                              })}
                            </select>
                          </td>
                        </tr>)
                    })
                }
                <tr>
                  <td colSpan={7} className='text-center'>
                    <Button className="btn outline-blue fw-bold" onClick={handleShow}>+</Button>
                  </td>
                </tr>
              </tbody>

            </Table>
            <div className='text-end'>
              <Button variant='secondary' onClick={() => navigate('/inventaris')}>Tornar</Button>
              <Button onClick={handleSubmit} className='orange-button ms-3'>Inventariar</Button>
            </div>

          </div>

          <Modal show={show} onHide={handleClose} animation={true} >
            <Modal.Header closeButton>
              <Modal.Title className='text-light-blue'>Afegir línia d'inventari</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Formik
                initialValues={{ storage_id: '', street_id: '' }}
                validationSchema={InventoryLineSchema}
                onSubmit={values => {
                  createInventory(values);
                  handleClose();
                }}
              >
                {({ errors, touched, setFieldValue }) => (
                  <Form>
                    <div>
                      <label htmlFor="street_id" className='py-3 text-light-blue'>Carrer:</label>
                      <Field
                        as='select'
                        name='street_id'
                        className='form-select'
                        onChange={(e) => {
                          setSelectedStorageId(e.target.value);
                          setFieldValue('storage_id', e.target.value);
                        }}
                      >
                        <option value=''>Selecciona un carrer</option>
                        {
                          streets.map((street) => {
                            return (
                              <option key={street.id} value={street.id}>{street.name}</option>
                            );
                          })
                        }
                      </Field>
                      {errors.street_id && touched.street_id ? <div className='text-danger'>{errors.street_id}</div> : null}
                    </div>

                    <div>
                      <label htmlFor="shelf_id" className='py-3 text-light-blue'>Estanteria:</label>
                      <Field
                        as='select'
                        name='shelf_id'
                        className='form-select'

                      >
                        <option value=''>Selecciona una estanteria</option>
                        {
                          shelfs.map((shelf) => {
                            return (
                              <option key={shelf.id} value={shelf.id} >{shelf.name}</option>
                            );
                          })
                        }
                      </Field>
                      {errors.shelf_id && touched.shelf_id ? <div className='text-danger'>{errors.shelf_id}</div> : null}
                    </div>

                    <div>
                      <label htmlFor="space_id" className='py-3 text-light-blue'>Espai:</label>
                      <Field
                        as='select'
                        name='space_id'
                        className='form-select'

                      >
                        <option value=''>Selecciona un espai</option>
                        {
                          spaces.map((space) => {
                            return (
                              <option key={space.id} value={space.id} >{space.name}</option>
                            );
                          })
                        }
                      </Field>
                      {errors.space_id && touched.space_id ? <div className='text-danger'>{errors.space_id}</div> : null}
                    </div>

                    <div>
                      <label htmlFor="product_id" className='py-3 text-light-blue'>Producte:</label>
                      <Field
                        as='select'
                        name='product_id'
                        className='form-select'

                      >
                        <option value=''>Selecciona un producte</option>
                        {
                          products.map((product) => {
                            return (
                              <option key={product.id} value={product.id} >{product.name}</option>
                            );
                          })
                        }
                      </Field>
                      {errors.product_id && touched.product_id ? <div className='text-danger'>{errors.product_id}</div> : null}
                    </div>

                    <div>
                      <label htmlFor="quantity_real" className='py-3 text-light-blue'>Quantitat real:</label>
                      <Field
                        type="number"
                        name='quantity_real'
                        className='form-control'
                        placeholder="0"
                      >
                      </Field>
                      {errors.quantity_real && touched.quantity_real ? <div className='text-danger'>{errors.quantity_real}</div> : null}
                    </div>

                    <div>
                      <label htmlFor="inventory_reason_id" className='py-3 text-light-blue'>Producte:</label>
                      <Field
                        as='select'
                        name='inventory_reason_id'
                        className='form-select'

                      >
                        <option >Selecciona una opció</option>
                        {inventoryReasons.map((reason) => {
                          return (
                            <option value={reason.id} key={reason.id}>{reason.name}</option>
                          )
                        })}
                      </Field>
                      {errors.inventory_reason_id && touched.inventory_reason_id ? <div>{errors.inventory_reason_id}</div> : null}
                    </div>


                    <div className='py-3 text-end'>
                      <Button variant='secondary' onClick={handleClose}>Cerrar</Button>
                      <Button type='submit' className='ms-2 orange-button'>Afegir línia</Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Modal.Body>
          </Modal>
        </Col>
      </Row >
    </>
  )
}

export default Inventariar
/*className='text-decoration-none text-orange cursor-pointer'*/