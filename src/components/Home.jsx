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
  const [orderLineCounts, setOrderLineCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenir la llista d'estats de les ordres
        const { data: statusList } = await axios.get(`${apiUrl}/orderreception_status`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const { data: orders } = await axios.get(`${apiUrl}/orderreception`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const statusCounts = statusList.map(status => {
          const quantity = orders.filter(order => order.orderreception_status_id === status.id).length;
          return { id: status.id, status: status.name, quantity };
        });
        setOrderCounts(statusCounts);

        // Obtenir la llista d'estats de les línies d'ordres
        const { data: lineStatusList } = await axios.get(`${apiUrl}/orderline_status`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const { data: orderLines } = await axios.get(`${apiUrl}/orderlinereception`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const lineStatusCounts = lineStatusList.map(status => {
          const quantity = orderLines.filter(line => line.orderline_status_id === status.id).length;
          return { id: status.id, status: status.name, quantity };
        });
        setOrderLineCounts(lineStatusCounts);
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

  const chartData2 = {
    labels: orderLineCounts.map(item => item.status),
    datasets: [{
      label: 'Quantitat de línies d\'ordres per estat',
      data: orderLineCounts.map(item => item.quantity),
      backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'],
      borderColor: ['#388E3C', '#F57C00', '#1976D2', '#C2185B', '#7B1FA2'],
      borderWidth: 2,
    }],
  };

  return (
    <>
      <Header title='Panel de control' />
      <div className='container mt-4 row'>
        <div className='col-md-6 col-sm-12'>
          <h2 className='text-center'>Ordres de Recepció per Estat</h2>
          <div className='mt-4'>
            <Bar data={chartData} />
          </div>
        </div>
        <div className='col-md-6 col-sm-12'>
          <h2 className='text-center'>Línies d'Ordres per Estat</h2>
          <div className="mt-4">
            <Bar data={chartData2} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;