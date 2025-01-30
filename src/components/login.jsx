import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Correo electrónico inválido').required('Campo obligatorio'),
  password: Yup.string().min(6, 'Demasiado corta').max(20, 'Demasiado larga').required('Campo obligatorio'),
});

function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: SignupSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post(`${apiUrl}/login`, values, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.data.token && response.data.id && response.data.name) {
          localStorage.setItem('token', response.data.token);
          delete response.data.token;
          localStorage.setItem('user', JSON.stringify(response.data));
          navigate('/');
        } else {
          throw new Error('Token, Name o ID no recibido. Verifique el servidor.');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error al iniciar sesión');
      }
    },
  });

  return (
    <div>
      <Header title="Inici de sessió" />
      {error && <div className="text-danger">{error}</div>}
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Correo Electrónico</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger">{formik.errors.email}</div>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-danger">{formik.errors.password}</div>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Button variant="primary" type="submit">Enviar</Button>
        </Form.Group>
      </Form>
    </div>
  );
}

export default Login;
