import React from 'react'
import { useParams } from 'react-router-dom' 

export default function Provincia() {

  let {pais} = useParams();
    console.log(pais);

  return (

    <div>Provincies del pais id {pais}</div>
  )
}
