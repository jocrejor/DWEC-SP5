import axios from "axios";
export const movMagatzem = (product,operator,quantity,origin,origin_id,storage,street,shelf,space) => {
    // importar rulApi
    const apiUrl = import.meta.env.VITE_API_URL;

    // imoptar token
    const token = localStorage.getItem('token')
    // crear objeto 
    const data ={
        "product_id":product,
        "operator_id": operator,
        "quantity": quantity,
        "origin": origin,
        "origin_id": origin_id,
        "storage_id": storage,
        "street_id": street,
        "shelf_id": shelf,
        "space_id": space 
    }
    
    axios.post(`${apiUrl}/movement`,data,{
        headers: {
            'Content-Type': 'multipart/form-data',
            'auth-token' : `${token}`
        },
    })
    .then((resultat) => console.log(resultat.data.message))
    .catch((error) =>console.error(error.data))
}
