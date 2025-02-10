import React from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Row, Col, Table, Button, Tab } from 'react-bootstrap/'
import Header from '../Header'
import axios from 'axios';
import { movMagatzem } from './movMagatzem';



function CompletarInventari() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem('user'));


  const [storages, setStorages] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryLines, setInventoryLines] = useState([]);
  const [products, setProducts] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [selectedInventoryLines, setSelectedInventoryLines] = useState([]);
  const [updatedInventoryLines, setUpdatedInventoryLines] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [inventoryReasons, setInventoryReasons] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
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

      axios.get(`${apiURL}/space`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setSpaces(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}/inventory_reason`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setInventoryReasons(response.data);
        })
        .catch(e => { console.log(e.response.data) })
    }

    fetchData();

  }, []);


  useEffect(() => {
    if (selectedInventory) {
      const filteredInventoryLines = inventoryLines.filter(line =>
        line.inventory_id === selectedInventory.id &&
        line.quantity_estimated != line.real_quantity &&
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
      setSelectedInventoryLines(filteredInventoryLines);
    } else {
      setSelectedInventoryLines([]);
    }
  }, [selectedInventory])


  useEffect(() => {
    console.log(updatedInventoryLines)
    console.log(selectedInventoryLines)

  }, [updatedInventoryLines, selectedInventoryLines])


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const lineId = parseInt(name);
    const field = 'inventory_reason_id';
    const newValue = parseInt(value);

    setUpdatedInventoryLines((prev) => {
      const index = prev.findIndex((line) => line.id === lineId);

      if (index != -1) {
        const updatedLines = [...prev];
        updatedLines[index] = { ...updatedLines[index], [field]: newValue };
        return updatedLines;
      }
      return [
        ...prev, { id: lineId, [field]: value }
      ]
    })
  }


  const handleSubmit = async () => {
    const updatedLines = selectedInventoryLines.map(async (line) => {
      const updatedLine = updatedInventoryLines.find((updated) => updated.id === line.id);
      const defaultReason = inventoryReasons.find(reason => reason.name === "Recompte cíclic")?.id;
      console.log(updatedLine)
      if (updatedLine) {
        line = { ...line, inventory_reason_id: updatedLine?.inventory_reason_id || defaultReason}
        console.log('AQUI 1:')
        console.log(line)
        axios.put(`${apiURL}/inventoryline/${line.id}`, line, { headers: { "auth-token": localStorage.getItem('token') } })
        movMagatzem(line.product_id, user.id,line.quantity_real, "inventoryline", line.id, line.storage_id, line.street_id, line.shelf_id, line.space_id)
        return line;
      }

      return line;
    })
    setSelectedInventoryLines(updatedLines);

    selectedInventoryLines.map(async (line) => {
      const space = spaces.find((space) => 
                  space.id === line.space_id && 
                  space.storage_id === line.storage_id &&
                  space.shelf_id === line.shelf_id &&
                  space.street_id === line.street_id);

                  console.log(line)

      const updatedQuantity = (space?.quantity === null) ? 100 - line.quantity_real : space?.quantity - line.quantity_real;
      // No actualiza el espacio
      if (space) {
        const updatedSpace = { ...space, 
          product_id: (space?.product_id === null) ? line.product_id : space?.product_id, 
          quantity: updatedQuantity || space?.quantity }

          console.log()
       // axios.put(`${apiURL}/space/${space.id}`, updatedSpace, { headers: { "auth-token": localStorage.getItem('token') } })
      };

      

    })

    const updatedInventory = { ...selectedInventory, inventory_status: inventoryStatus.find(status => status.name === 'Completat').id }

    //axios.put(`${apiURL}/inventory/${selectedInventory.id}`, updatedInventory, { headers: { "auth-token": localStorage.getItem('token') } })

    alert('Inventari completat amb èxit');
   // navigate('/inventaris');

  }

  return (
    <>
      <Header title="Completar Inventari" />
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
                  <td data-cell="Data: ">{selectedInventory?.created_at}</td>
                  <td data-cell="Estat: ">{selectedInventory?.inventory_status}</td>
                  <td data-cell="Magatzem: ">{(storages.find(storage => storage.id === selectedInventory?.storage_id))?.name}</td>
                </tr>
              </tbody>
            </Table>

            <Table className='table table-striped text-center'>
              <thead className="table-active border-bottom border-dark-subtle">
                <tr>
                  <th scope="col" className='text-light-blue'>Producte</th>
                  <th scope="col" className='text-light-blue'>Quantitat Estimada</th>
                  <th scope="col" className='text-light-blue'>Quantitat Real</th>
                  <th scope="col" className='text-light-blue'>Justificació</th>
                </tr>
              </thead>
              <tbody>
                {
                  (selectedInventoryLines.length === 0) ?
                    <tr><td colSpan={4} className='text-center'>No existix informació per a ser mostrat.</td></tr> :
                    selectedInventoryLines.map((value) => {

                      return (
                        <tr key={value.id}>
                          <td data-cell="Producte: ">{(products.find(product => product.id === value.product_id))?.name}</td>
                          <td data-cell="Quantitat Estimada: ">{value.quantity_estimated}</td>
                          <td data-cell="Quantitat Real: ">{value.quantity_real}</td>
                          <td data-cell="Justificació: ">
                            <select
                              name={value.id}
                              className='form-select'
                              onChange={handleInputChange}
                              defaultValue={value.inventory_reason_id || inventoryReasons.find(reason => reason.name === "Recompte cíclic")?.id}
                            >
                              <option>Selecciona una opció</option>
                              {inventoryReasons.map((reason) => {
                                return (
                                  <option value={reason.id} key={reason.id}>{reason.name}</option>
                                )
                              })}
                            </select>

                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </Table>
            <div className='text-end'>
              <Button variant='secondary' onClick={() => navigate('/inventaris')}>Tornar</Button>
              <Button type="submit" onClick={handleSubmit} className='orange-button ms-3'>Completar</Button>
            </div>
          </div>
        </Col>
      </Row>

    </>
  )
}

export default CompletarInventari