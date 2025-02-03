import React from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Row, Col, Table, Button, Tab } from 'react-bootstrap/'
import Header from '../Header'
import axios from 'axios';




function CompletarInventari() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

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
      axios.get(`${apiURL}inventory/${id}`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setSelectedInventory(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}inventory_status`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setInventoryStatus(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}inventoryline`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setInventoryLines(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}storage`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setStorages(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}product`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setProducts(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}space`, { headers: { "auth-token": localStorage.getItem('token') } })
        .then(response => {
          setSpaces(response.data);
        })
        .catch(e => { console.log(e.response.data) })

      axios.get(`${apiURL}inventory_reason`, { headers: { "auth-token": localStorage.getItem('token') } })
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
    const lineId = name;
    const field = 'justification';
    console.log(value)
    console.log(name)
    setUpdatedInventoryLines((prev) => {
      const index = prev.findIndex((line) => line.id === lineId);

      if (index != -1) {
        const updatedLines = [...prev];
        updatedLines[index] = { ...updatedLines[index], [field]: value };
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

      if (updatedLine) {
        line = { ...line, justification: updatedLine?.justification }
        console.log(line)
        //await updateId(url, "InventoryLine", line.id, line);
        return line;
      }

      return line;
    })
    setSelectedInventoryLines(updatedLines);

    selectedInventoryLines.map(async (line) => {
      const space = spaces.find((space) => space.id === line.space_id);
      const updatedQuantity = space.quantity - line.real_quantity;
      console.log(space.id + ' : product-id: ' + line.product_id + ' - ' + space.quantity + ' - ' + line.real_quantity + ' = ' + updatedQuantity)

      if (space) {
        const updatedSpace = { ...space, quantity: updatedQuantity || space.quantity }
        console.log(updatedSpace);
        //await updateId(url, 'Space', space.id, updatedSpace)
        axios.put(`${apiURL}space/${space.id}`, updatedSpace, { headers: { "auth-token": localStorage.getItem('token') } })
      };
    })

    const updatedInventory = { ...selectedInventory, inventory_status: inventoryStatus.find(status => status.name === 'Completat').id }
    
    //await updateId(url, 'Inventory', selectedInventory.id, updatedInvetory);
    axios.put(`${apiURL}inventory/${selectedInventory.id}`, updatedInventory, { headers: { "auth-token": localStorage.getItem('token') } })

    alert('Inventari completat amb èxit');
    navigate('/inventaris');

  }

  return (
    <>
      <Header title="Completar Inventari" />
      <Row>
        <Col>
          <div className='px-3 py-3'>
            <Table striped bordered hover>
              <thead className='active'>
                <tr>
                  <th className='text-light-blue'>ID Inventari</th>
                  <th className='text-light-blue'>Data</th>
                  <th className='text-light-blue'>Estat</th>
                  <th className='text-light-blue'>Magatzem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{selectedInventory?.id}</td>
                  <td>{selectedInventory?.created_at}</td>
                  <td>{selectedInventory?.inventory_status}</td>
                  <td>{(storages.find(storage => storage.id === selectedInventory?.storage_id))?.name}</td>
                </tr>
              </tbody>
            </Table>

            <Table>
              <thead>
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
                    <tr><td colSpan={4} className='text-center'>No hay nada</td></tr> :
                    selectedInventoryLines.map((value) => {

                      return (
                        <tr key={value.id}>
                          <td>{(products.find(product => product.id === value.product_id))?.name}</td>
                          <td>{value.quantity_estimated}</td>
                          <td>{value.real_quantity}</td>
                          <td>
                            <select
                              name={value.id}
                              className='form-select'
                              onChange={handleInputChange}
                              value={value.justification}
                            >
                              <option>Selecciona una opció</option>
                              {inventoryReasons.map((reason) => {
                                return (
                                  <option value={reason.id} id={reason.id}>{reason.name}</option>
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
            <Button variant='secondary' onClick={() => navigate('/inventaris')}>Tornar</Button>
            <Button type="submit" onClick={handleSubmit}>Completar</Button>
          </div>
        </Col>
      </Row>

    </>
  )
}

export default CompletarInventari