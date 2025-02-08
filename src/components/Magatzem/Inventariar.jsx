import React from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Row, Col, Table, Button, Tab } from 'react-bootstrap/'
import Header from '../Header'
import axios from 'axios';



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

      setSelectedInventoryLines(orderedInventoryLines);

    } else {
      setSelectedInventoryLines([]);
    }
  }, [selectedInventory])

  useEffect(() => {
    console.log(updatedInventoryLines)
    console.log(selectedInventoryLines)

  }, [updatedInventoryLines, selectedInventoryLines])

  const handleInputChange = (e) => {
    console.log(e)
    console.log(e.target.name)
    const { name, value, type } = e.target;
    const lineId = parseInt(name);
    const newValue = parseInt(value);
    const field = type === 'number' ? 'quantity_real' : 'inventory_reason_id';

    console.log(lineId + '-' + field + ' - ' + value + ' - ' + type)
    console.log(field)

    /*setUpdatedInventoryLines((prev) => ({
      ...prev, [name]: { ...prev[name], [field]: value }
    }))*/

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
      console.log(updatedInventoryLines.length + " - " + selectedInventory.length)
      alert("Introdueix totes les quantitats reals");
    } else if (updatedInventoryLines.length === 0) {
      alert("No hi ha res a inventariar");
    } else {
      const updatedLines = await Promise.all(selectedInventoryLines.map(async (line) => {
        const updatedLine = updatedInventoryLines.find((updated) => updated.id === line.id);
        const defaultReason = inventoryReasons.find(reason => reason.name === "Recompte cíclic")?.id;

        if (updatedLine) {
          line = { ...line, 
            quantity_real: updatedLine?.quantity_real, 
            operator_id: user.id, 
            inventory_reason_id: updatedLine?.inventory_reason_id || defaultReason};

          await axios.put(`${apiURL}/inventoryline/${line.id}`, line, { headers: { "auth-token": localStorage.getItem('token') } })
          
          return line;
        }
        return line;
      }))

      const updatedSelectedInventory = { ...selectedInventory, inventory_status: inventoryStatus.find(status => status.name === 'Fent-se').id }
      //console.log("AQUI2: " + updatedSelectedInventory)

      await axios.put(`${apiURL}/inventory/${selectedInventory.id}`, updatedSelectedInventory, { headers: { "auth-token": localStorage.getItem('token') } })

      setSelectedInventoryLines(updatedLines);
      setSelectedInventory(updatedSelectedInventory);
      console.log(updatedSelectedInventory)
      alert("Linia actualitzada amb èxit");
      navigate('/inventaris');
    }

  }


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
                  <td data-cell="Data: ">{selectedInventory?.created_at}</td>
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
                  <th scope="col" className='text-light-blue'>Espacio</th>
                  <th scope="col" className='text-light-blue'>Producte</th>
                  <th scope="col" className='text-light-blue'>Quantitat Real</th>
                  <th scope="col" className='text-light-blue'>Justificació</th>
                </tr>
              </thead>
              <tbody className='text-light-blue'>
                {
                  (selectedInventoryLines.length === 0) ?
                    <tr><td colSpan={6} className='text-center'>No hay nada</td></tr> :
                    selectedInventoryLines.map((value) => {
                      return (
                        <tr key={value.id}>
                          <td data-cell="Carrer: ">{value.street_id}</td>
                          <td data-cell="Estanteria: ">{value.shelf_id}</td>
                          <td data-cell="Espacio: ">{value.space_id}</td>
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
                                  <option value={reason.id} id={reason.id}>{reason.name}</option>
                                )
                              })}
                            </select>
                          </td>
                        </tr>)
                    })
                }
              </tbody>

            </Table>
            <div className='text-end'>
              <Button variant='secondary' onClick={() => navigate('/inventaris')}>Tornar</Button>
              <Button onClick={handleSubmit} className='orange-button ms-3'>Inventariar</Button>
            </div>

          </div>
        </Col>
      </Row >
    </>
  )
}

export default Inventariar
/*className='text-decoration-none text-orange cursor-pointer'*/