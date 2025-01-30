import { useState, useEffect } from 'react'

export default function IncidenciesGenerar() {


  const [orderReceptions, setOrderReceptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [products, setProducts] = useState([]);

const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [orders, suppliersData, statusesData, productsData] = await Promise.all([
        getData(url, 'OrderReception'),
        getData(url, 'Supplier'),
        getData(url, 'OrderReception_Status'),
        getData(url, 'Product'),
      ]);
      setOrderReceptions(orders);
      setSuppliers(suppliersData);
      setStatuses(statusesData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError('Error carregant les dades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

const revisarOrdre = (id) =>{
   console.log(id)
}

  return (
    <>
     <Table striped bordered hover>
          <thead>
            <tr>
              <th>Id</th>
              <th>Proveïdor</th>
              <th>Data Estimada</th>
              <th>Revisar</th>
            </tr>
          </thead>
          <tbody>
            {orderReceptions.map((valors) => (
              <tr key={valors.id}>
                <td>{valors.id}</td>
                <td>{suppliers.find((sup) => sup.id === valors.supplier_id)?.name}</td>
                <td>{valors.estimated_reception_date}</td>
                <td>
                
                </td>
                <td>
                  <Button variant="primary" onClick={() => revisarOrdre(valors.id)}>
                    Revisar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
    
    
    </>
  )
  
}
