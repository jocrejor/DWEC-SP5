import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import Header from './Header';

function Logout() {
    const borrarToken = () => {
        localStorage.clear();
    };

    return (
        <Container>
            <Header title="Logout" />
            <div class="d-flex flex-column align-items-center justify-content-center pt-5">
            <Card className="p-4 shadow-lg text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <Card.Body>
                    <Card.Title>¿Quieres salir de tu perfil de usuario?</Card.Title>
                    <Button
                        type="submit"
                        id="enviar"
                        className="mt-3 w-100"
                        variant="danger"
                        onClick={() => borrarToken()}
                    >
                        Salir
                    </Button>
                </Card.Body>
            </Card>
            </div>
        </Container>
    );
}

export default Logout;