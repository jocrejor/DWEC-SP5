import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import { Bar } from 'react-chartjs-2';

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
        const { data: orderReceptionStatus } = await axios.get(`${apiUrl}/orderreception_status`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const { data: orderReception } = await axios.get(`${apiUrl}/orderreception`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const orderReceptionList = orderReceptionStatus
          .filter(status => status.name !== "Emmagatzemada")
          .map(status => {
            const quantity = orderReception.filter(order => order.orderreception_status_id === status.id).length;
            return { id: status.id, status: status.name, quantity };
          });
        setOrderCounts(orderReceptionList);

        const { data: orderShippingStatus } = await axios.get(`${apiUrl}/ordershipping_status`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const { data: orderShipping } = await axios.get(`${apiUrl}/ordershipping`, {
          headers: { 'auth-token': localStorage.getItem('token') },
        });

        const orderShippingList = orderShippingStatus
          .filter(status => status.name !== "Enviada")
          .map(status => {
            const quantity = orderShipping.filter(line => line.ordershipping_status_id === status.id).length;
            return { id: status.id, status: status.name, quantity };
          });
        setOrderLineCounts(orderShippingList);
      } catch (error) {
        console.error('Error carregant les dades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const chartData = {
    labels: orderCounts.map(item => item.status),
    datasets: [{
      label: "Quantitat d'estats d'ordres de recepció",
      data: orderCounts.map(item => item.quantity),
      backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'],
      borderColor: ['#388E3C', '#F57C00', '#1976D2', '#C2185B', '#7B1FA2'],
      borderWidth: 2,
    }],
  };

  const chartData2 = {
    labels: orderLineCounts.map(item => item.status),
    datasets: [{
      label: "Quantitat d'estats d'ordres d'enviament",
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
          <h2 className='text-center'>Ordres de recepció</h2>
          <div className='mt-4'>
            <Bar data={chartData} />
          </div>
        </div>
        <div className='col-md-6 col-sm-12'>
          <h2 className='text-center'>Ordres d'enviament</h2>
          <div className="mt-4">
            <Bar data={chartData2} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;