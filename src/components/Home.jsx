import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import { Bar } from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'chart.js/auto';

function Home() {
  const [orderCounts, setOrderCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenir la llista d'estats
        const { data: statusList } = await axios.get(`${apiUrl}/orderreception_status`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        // Obtenir totes les ordres de recepció
        const { data: orders } = await axios.get(`${apiUrl}/orderreception`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        // Comptar quantes ordres hi ha per cada estat
        const statusCounts = statusList.map(status => {
          const quantity = orders.filter(order => order.orderreception_status_id === status.id).length;
          return { id: status.id, status: status.name, quantity };
        });

        setOrderCounts(statusCounts);
      } catch (error) {
        console.error('Error carregant les dades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const chartData = {
    labels: orderCounts.map(item => item.status),
    datasets: [{
      label: 'Quantitat d\'ordres per estat',
      data: orderCounts.map(item => item.quantity),
      backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'],
      borderColor: ['#388E3C', '#F57C00', '#1976D2', '#C2185B', '#7B1FA2'],
      borderWidth: 2,
    }],
  };

  const columns = [
    { headerName: 'Estat', field: 'status', sortable: true, filter: true, flex: 1 },
    { headerName: 'Quantitat', field: 'quantity', sortable: true, flex: 1 },
  ];

  return (
    <>
      <Header title='Panel de control' />
      <div className="col-md-6 col-sm-12">
        <div className='container mt-4'>
          <h2 className='text-center'>Ordres de Recepció per Estat</h2>
          <>
            <div className='mt-4'>
              <Bar data={chartData} />
            </div>
          </>
        </div>
      </div>
    </>
  );
}

export default Home;
