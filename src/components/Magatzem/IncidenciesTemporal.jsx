import React from 'react'
import IncidenciaGenerarModal from './IncidenciesGenerar'
export default function IncidenciesTemporal() {

    const handleSubmit = () =>{
        {<IncidenciaGenerarModal  orderLineReceptionID="63" viewModal="true"/>}
    }
  return (
    <>
    <div>IncidenciesTemporal</div>
    <button onClick={handleSubmit}>Generar Incidencia</button>
    
    </>
  )
 
}
