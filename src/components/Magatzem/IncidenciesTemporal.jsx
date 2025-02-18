import {useState} from 'react'
import IncidenciaGenerarModal from './IncidenciesGenerar'


export default function IncidenciesTemporal() {

  const [showModal,setShowModal]=useState(false)

  const handleModal = () => { 
    setShowModal(!showModal)
  }
  return (
    <>
    
    <div>IncidenciesTemporal</div>
    <button onClick={handleModal}>Generar Incidencia</button>
  
    <IncidenciaGenerarModal  orderLineReceptionID="63" viewModal={showModal} handleModal={handleModal}/>
   
    </>
  )
 
}
