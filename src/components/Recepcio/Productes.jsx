import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { url, postData, getData, deleteData, updateId } from '../../apiAccess/crud'
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const ProducteSchema = Yup.object().shape({
  name: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(50, 'El valor màxim és de 60 caracters').required('Valor requerit'),
  description: Yup.string().min(4, 'Valor mínim de 4 caracters.').max(200, 'El valor màxim és de 60 caracters'),
  volume: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  weight: Yup.number().positive('El valor ha de ser positiu').required('Valor requerit'),
  lotorserial: Yup.string().matches(/(Lot|Serial|Non)/).required('Valor requerit'),
  sku: Yup.string().matches(/^[A-Z0-9]{5,10}$/, 'El SKU ha de tindre alfanumèrics en majúscules i números (5 i 10) ').required('Valor requerit'),
})

function Productes() {

  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showModalUpolad, setShowModalUpload] = useState(false)
  const [tipoModal, setTipoModal]  = useState("Crear")
  const [valorsInicials, setValorsInicials] = useState({ name: '', description: '', volume: 0, weight: 0, lotorserial: 'Non', sku: '' })
  const [image, setImage] = useState({id:0, file: null})
  const [messageImage, setMessageImage] = useState('');
  const [messageError, setMessageError] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect( () => {
   
   axios.get(`${apiUrl}/product` , { headers: {"auth-token" : `${token}`} })
    .then((response) => setProducts(response.data) ) 
    .catch((error) => {console.log(error)})
    
  }, [])


const eliminarProducte = (id) =>{
  axios.delete(`${apiUrl}/product/${id}` , { headers: {"auth-token" : `${token}`} })
    .then((response) =>{ 
      console.log(response) 
      const newproducts = products.filter(item => item.id != id)
      setProducts(newproducts)
    }) 
    .catch((error) => {console.log(error)})
     
 
}

const modificarProducte = (valors) =>{
 setTipoModal("Modificar")
 setValorsInicials(valors);
}


const canviEstatModal = () =>{
    setShowModal(!showModal)
    setMessageError('')
}

const canviEstatModalUpload = () =>{
  setShowModalUpload(!showModalUpolad)
}

const grabar = (values)=>{
  setMessageError('');
  if(tipoModal==="Crear"){
    axios.post(`${apiUrl}/product` ,values,  { headers: {"auth-token" : `${token}`} })
    .then((response) =>{ 
      console.log(response.data.message) 
      canviEstatModal()
      axios.get(`${apiUrl}/product` , { headers: {"auth-token" : `${token}`} })
           .then((response) => setProducts(response.data) ) 
           .catch((error) => {setMessageImage(error)})

    }) 
    .catch((error) => {setMessageError(error.response.data)})
  
  }else{
    const id=values.id;
    delete values.id;
    axios.put(`${apiUrl}/product/${id}` ,values ,  { headers: {"auth-token" : `${token}`} })
    .then((response) =>{
       console.log(response.data.message)
       canviEstatModal()
         axios.get(`${apiUrl}/product` , { headers: {"auth-token" : `${token}`} })
           .then((response) => setProducts(response.data) ) 
           .catch((error) => {setMessageImage(error)})

       }) 
    .catch((error) => {setMessageError(error.response.data)})
  
    }
 
 
    

  
}


const handleImageChange = (e) => {
  setImage({
    ...image,
    [e.target.name]: e.target.files[0]
  }); 
}


const updateImage = (valors) =>{
  setImage({
    ...image,
    "id": valors.id
  })
  setMessageImage('') 
  canviEstatModalUpload()
}

const upload =  async (e)=>{
  e.preventDefault();
  // valiar
 

  if (!image.file) {
    setMessageImage('Por favor, selecciona una imagen.');
    return;
  }

      const formData = new FormData();
        formData.append('image', image.file); 
        
        try {
            const response = await axios.put(`${apiUrl}/product/uploadimage/${image.id}` , formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth-token' : `${token}`
                },
            });
            setMessageImage(response.data.message);
            axios.get(`${apiUrl}/product` , { headers: {"auth-token" : `${token}`} })
              .then((response) => setProducts(response.data) ) 
              .catch((error) => {setMessageImage(error)})
            setTimeout(() => { 
              canviEstatModalUpload()
            }, 1500);

        } catch (error) {
            setMessageImage('Error al subir el archivo: ' + (error.response?.data?.message || error.message));
        }

  // fi
 
}
return (
    <>

<div><h2>Llistat productes</h2></div>
    <Button variant='success' onClick={()=>{canviEstatModal(); setTipoModal("Crear")}}>Alta Producte</Button>
      <table className="table">
        <thead>
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Nom</th>
          <th scope="col">Descripció</th>
          <th scope="col">Volume</th>
          <th scope="col">Pes</th>
          <th scope="col">Control</th>
          <th scope="col">SKU</th>
          <th scope="col">Imatge</th>
          <th scope="col">Modificar</th>
          <th scope="col">Eliminar</th>
        </tr>
        </thead>
        <tbody>
        {(products.length == 0)?
          <tr><th>No hi han articles</th></tr>
           
        :products.map((valors) => {
          return (
          <tr key={valors.id}>
            <td><img src={valors.image_url}  height="50"/></td>
            <td>{valors.id}</td>
            <td>{valors.name}</td>
            <td>{valors.description.slice(0,30)}</td>
            <td>{valors.volume}</td>
            <td>{valors.weight}</td>
            <td>{valors.lotorserial}</td>
            <td>{valors.sku}</td>
            <td><Button variant="info"  onClick={()=> {updateImage(valors)}}>Imatge</Button></td>
            <td><Button variant="warning"  onClick={()=> {modificarProducte(valors);canviEstatModal(); }}>Modificar</Button></td>
            <td><Button variant="primary"  onClick={()=> {eliminarProducte(valors.id)}}>Eliminar</Button></td>

          </tr>)
        })}
        </tbody>
      </table>

      <Modal show={showModal} onHide={canviEstatModal}>
        <Modal.Header closeButton >
          <Modal.Title>{tipoModal} Producte</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          
      <Formik
        initialValues= {(tipoModal==='Modificar'?valorsInicials: {name: '', description: '', volume: 0, weight: 0, lotorserial: 'Non', sku: '' })}
        validationSchema={ProducteSchema}
        onSubmit={ values => { grabar(values)} }
      >
        {({
          values,
          errors,
          touched
          /* and other goodies */
        }) => (
          <Form>
            <div className="form-group">
              
              <label htmlFor='name'>Nom </label>
              <Field
                type="text" 
                className="form-control"
                name="name"
                placeholder="Nom del producte"
                autoComplete="off"

                value={values.name}
              />
              {errors.name && touched.name ? <div>{errors.name}</div> : null}
            </div>
            {/*Em senc atacat*/}
            <div className="form-group">
              <label htmlFor='description'>Descripció </label>
              <Field
                as='textarea'
                className="form-control"
                type="text"
                name="description"
                placeholder="Descripció del producte"

                value={values.description}
              />
              {errors.description && touched.description ? <div>{errors.description}</div> : null}
            </div>

            <div className="form-group">
              <label htmlFor='volume'>Volumen </label>
              <Field
                type="number"
                className="form-control"
                name="volume"
                step="0.001"
                placeholder="0"
                
                value={values.volume}
              />
              {errors.volume && touched.volume ? <div>{errors.volume}</div> : null}
            </div>



            <div className="form-group">
              <label htmlFor='weight'>Pes </label>
              <Field
                type="number"
                className="form-control"
                name="weight"
                step="1"
                placeholder="0"
               
                value={values.weight}
              />
              {errors.weight && touched.weight ? <div>{errors.weight}</div> : null}
            </div>

            <div className="form-group">
              <label htmlFor='lotorserial'>Control lot o serie</label>
              <Field
                as="select"
                name="lotorserial"
                className="form-control"
                value={values.lotorserial}
              >
                <option value="">
                  Selecciona una opció
                </option>
                <option value="Non">
                  No
                </option>
                <option value="Lot">
                  Lot
                </option>
                <option value="Serial">
                  Serie
                </option>
              </Field>

              {errors.lotorserial && touched.lotorserial ? <div>{errors.lotorserial}</div> : null}
            </div>

            <div className="form-group">
              <label htmlFor='sku'>SKU </label>
              <Field
                type="text"
                className="form-control"
                name="sku"
                placeholder="sku del producte"

                value={values.sku}
              />
              {errors.sku && touched.sku ? <div>{errors.sku}</div> : null}
            </div>
            <div className="mb-3">
                <p className='text-danger'>{messageError}</p>
            </div>
            <div className="form-group">
              <Button variant="secondary" onClick={canviEstatModal}>Close</Button>

              <Button variant={tipoModal==="Modificar"?"success":"info"} type="submit">{tipoModal}</Button>      
        
           
            </div>
          </Form>
        )}

      </Formik>



       </Modal.Body>
      </Modal>
      
      
     
  
    

<Modal show={showModalUpolad} onHide={canviEstatModalUpload}>
<Modal.Header closeButton >
  <Modal.Title>Pujar Foto del producte</Modal.Title>
</Modal.Header>

<Modal.Body>
    <form onSubmit={upload} >    
    <div className="mb-3">
      <input
        type="hidden"
        name="id"
        value={image.id}
        onChange={handleImageChange}
      />
    </div>
    <div className="mb-3">
      <label htmlFor="file" className="visually-hidden">Imagen</label>
      <input 
        type="file" 
        className="form-control"
        name="file"
        onChange={handleImageChange}
        />
    </div>
        <div className="mb-3">
          <p className='text-danger'>{messageImage}</p>
          </div>
    <div>
      <Button variant="secondary" onClick={canviEstatModalUpload}>Close</Button>

      <Button variant="success" type="submit" >Enviar</Button>      

    </div>
    </form>    

</Modal.Body>
</Modal>





</>
)
}

export default Productes


