import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-grey">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} xxl={4}> 
            <Card className="p-4 shadow fondo-azul-claro">
              <div className='text-center fs-3 text-white fw-bold'>Inici de Sessió</div>
              {error && <div className="text-danger">{error}</div>}
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Control
                    type="email"
                    placeholder="Correu electrònic"
                    id="email"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className='w-100' 
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-danger">{formik.errors.email}</div>
                  )}
                </Form.Group>
                <Form.Group className="mb-3 mt-4">
                  <Form.Control
                    type="password"
                    id="password"
                    name="password"
                    placeholder='Contrasenya'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className='w-100'
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-danger">{formik.errors.password}</div>
                  )}
                </Form.Group>
                <Form.Group className="mb-3 mt-4">
                  <Button variant="primary" type="submit" className="w-100 bg-orange orange-button-login border-0 fw-bold p-2">Iniciar Sessió</Button> 
                </Form.Group>
                <p className='pt-2 text-center'>
                <a href="#" className='text-decoration-none text-white'>He oblidat la meua contrasenya</a>
                </p>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
