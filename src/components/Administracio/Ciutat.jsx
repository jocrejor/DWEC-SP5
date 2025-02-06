import React from 'react'
import { useParams } from 'react-router-dom' 


export default function Ciutat() {
let {pais,provincia} = useParams();
    console.log(pais);


  return (
    <div>Ciutats del país {pais} i de la provincia {provincia} </div>
  )
}
