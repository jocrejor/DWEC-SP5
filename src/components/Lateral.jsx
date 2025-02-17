import { useState } from 'react'
import logo from '../assets/logo_footer2.png';
import '../App'
import { Link,useNavigate  } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import { Modal,Button } from 'react-bootstrap';


function Lateral() {
    const [showModal, setShowModal] = useState(false);
    const [activeOption, setActiveOption] = useState();
    const liActive = 'list-group-item px-0 opacity-75 activo';
    const liInactive = 'list-group-item fondo-azul-claro';
    const linkActive = 'text-decoration-none d-block';
    const linkInactive = 'text-decoration-none text-white d-block';
  
    const navigate = useNavigate();

    const canviEstatModal = () => {
        setShowModal(!showModal)
    }

    const borrarToken = () => {
        localStorage.clear();
        canviEstatModal()
        navigate("/login")
    }
    return (
        <>
            <div className="col-12 col-xl-2 p-0 fondo-azul z-3">
                <div className="">
                    <div className="d-flex justify-content-between">
                        <img id="logo" className="m-4 py-xl-4 m-xl-auto" src={logo} alt="Logo Stockflow" />
                        <nav className="navbar navbar-dark  d-xl-none d-flex">
                            <div className="container-fluid">
                                <button className="navbar-toggler text-white" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarToggleExternalContent"
                                    aria-controls="navbarToggleExternalContent" aria-expanded="false"
                                    aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon text"></span>
                                </button>
                            </div>
                        </nav>
                    </div>
                    <nav className="collapse d-xl-block" id="navbarToggleExternalContent">
                        <ul className="list-group list-group-flush border-top border-bottom ">
                            <li className="list-group-item py-3 px-1 text-white fondo-azul no-hover">
                                <i className="bi bi-house-fill px-1 text-white"></i>Administració</li>
                            <li className={activeOption == 'Usuaris' ? liActive : liInactive}>
                                <Link className={activeOption == 'Usuaris' ? linkActive : linkInactive} onClick={() => { setActiveOption('Usuaris') }} to="/usuaris">
                                    {activeOption == 'Usuaris' ? <i className="bi bi-caret-right-fill pe-1"></i> : null} 
                                    Usuaris
                                </Link>
                            </li>
                            <li className={activeOption == 'Rols' ? liActive : liInactive}>
                                <Link className={activeOption == 'Rols' ? linkActive : linkInactive} onClick={() => { setActiveOption('Rols') }} to="/rols">
                                    {activeOption == 'Rols' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Rols
                                </Link>
                            </li>
                            <li className={activeOption == 'DadesGeografiques' ? liActive : liInactive}>
                                <Link className={activeOption == 'DadesGeografiques' ? linkActive : linkInactive} onClick={() => {setActiveOption('DadesGeografiques');}} to="/dadesGeografiques">
                                    {activeOption == 'DadesGeografiques' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Dades geogràfiques
                                </Link>
                            </li>
                            <li className={activeOption == 'Transportistes' ? liActive : liInactive}>
                                <Link className={activeOption == 'Transportistes' ? linkActive : linkInactive} onClick={() => { setActiveOption('Transportistes') }} to="/transportistes">
                                    {activeOption == 'Transportistes' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Transportistes
                                </Link>
                            </li>
                            
                            <li className="list-group-item py-3 px-1 text-white fondo-azul border-top no-hover"><i className="bi bi-send px-1 text-white"></i>Enviament</li>
                            
                            
                            <li className={activeOption == 'Clients' ? liActive : liInactive}>
                                <Link className={activeOption == 'Clients' ? linkActive : linkInactive} onClick={() => {setActiveOption('Clients'); }} to="/clients">
                                    {activeOption == 'Clients' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Clients
                                </Link>
                            </li>
                            <li className={activeOption == 'ordresEnviament' ? liActive : liInactive}>
                                <Link className={activeOption == 'ordresEnviament' ? linkActive : linkInactive} onClick={() => {setActiveOption('ordresEnviament') }} to="/ordresEnviament">
                                    {activeOption == 'ordresEnviament' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Ordres d'enviament 
                                </Link>
                            </li>

                            <li className={activeOption == 'EstatsOrdesEnviament' ? liActive : liInactive}>
                                <Link className={activeOption == 'EstatsOrdesEnviament' ? linkActive : linkInactive} onClick={() => {setActiveOption('EstatsOrdesEnviament') }} to="/estatsOrdreEnviament">
                                    {activeOption == 'EstatsOrdesEnviament' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Estats ordres enviament 
                                </Link>
                            </li>

                            <li className="list-group-item py-3 px-1 text-white fondo-azul border-top no-hover"><i className="bi bi-inboxes px-1 text-white"></i>Recepció</li>
                            
                            
                            <li className={activeOption == 'Proveidors' ? liActive : liInactive}>
                                <Link className={activeOption == 'Proveidors' ? linkActive : linkInactive} onClick={() => { setActiveOption('Proveidors') }} to="/proveidors">
                                    {activeOption == 'Proveidors' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Proveïdors
                                </Link>
                            </li>
                            <li className={activeOption == 'OrdesRecepcio' ? liActive : liInactive}>
                                <Link className={activeOption == 'OrdesRecepcio' ? linkActive : linkInactive} onClick={() => {setActiveOption('OrdesRecepcio') }} to="/ordesRecepcio">
                                    {activeOption == 'OrdesRecepcio' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Ordres de recepció
                                </Link>
                            </li>
                            <li className={activeOption == 'OrdesRecepcio' ? liActive : liInactive}>
                                <Link className={activeOption == 'orderpickingreception' ? linkActive : linkInactive} onClick={() => {setActiveOption('orderpickingreception') }} to="/orderpickingreception">
                                    {activeOption == 'OrdesRecepcio' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Ordres Picking R
                                </Link>
                            </li>
                            <li className={activeOption == 'EstatsOrdre' ? liActive : liInactive}>
                                <Link className={activeOption == 'EstatsOrdre' ? linkActive : linkInactive} onClick={() => {setActiveOption('EstatsOrdre') }} to="/estatsOrdreList">
                                    {activeOption == 'EstatsOrdre' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Estats Ordres
                                </Link>
                            </li>
                            <li className={activeOption == 'EstatsLinia' ? liActive : liInactive}>
                                <Link className={activeOption == 'EstatsLinia' ? linkActive : linkInactive} onClick={() => { setActiveOption('EstatsLinia') }} to="/estatsLinia">
                                    {activeOption == 'EstatsLinia' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Estats Línia
                                </Link>
                            </li>
                            <li className={activeOption == 'Productes' ? liActive : liInactive}>
                                <Link className={activeOption == 'Productes' ? linkActive : linkInactive} onClick={() => { setActiveOption('Productes') }} to="/productes">
                                    {activeOption == 'Productes' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Productes
                                </Link>
                            </li>
                            <li className={activeOption == 'Lots' ? liActive : liInactive}>
                                <Link className={activeOption == 'Lots' ? linkActive : linkInactive} onClick={() => { setActiveOption('Lots') }} to="/lots">
                                    {activeOption == 'Lots' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Lots
                                </Link>
                            </li>
                            
                            
                            <li className="list-group-item py-3 px-1 text-white fondo-azul border-top no-hover"><i className="bi bi-shop-window px-1 text-white"></i>Magatzem</li>
                            
                            <li className={activeOption == 'GestioMagatzem' ? liActive : liInactive}>
                                <Link className={activeOption == 'GestioMagatzem' ? linkActive : linkInactive} onClick={() => { setActiveOption('GestioMagatzem') }} to="/gestioMagatzem">
                                {activeOption == 'GestioMagatzem' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Gestió de magatzem
                                </Link>
                            </li>
                            <li className={activeOption == 'Inventaris' ? liActive : liInactive}>
                                <Link className={activeOption == 'Inventaris' ? linkActive : linkInactive} onClick={() => { setActiveOption('Inventaris') }} to="/inventaris">
                                    {activeOption == 'Inventaris' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Inventaris
                                </Link>
                            </li>
                            <li className={activeOption == 'Incidencies' ? liActive : liInactive}>
                                <Link className={activeOption == 'Incidencies' ? linkActive : linkInactive} onClick={() => { setActiveOption('Incidencies') }} to="/incidencies">
                                    {activeOption == 'Incidencies' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Incidències
                                </Link>
                            </li>
                            <li className={activeOption == 'Moviments' ? liActive : liInactive}>
                                <Link className={activeOption == 'Moviments' ? linkActive : linkInactive} onClick={() => { setActiveOption('Moviments') }} href="/moviments">
                                    {activeOption == 'Moviments' ? <i className="bi bi-caret-right-fill pe-1"></i> : null}
                                    Moviments
                                </Link>
                            </li>
                            
                            
                            <li className="list-group-item text-white logout"><a className="text-decoration-none text-white d-block"  onClick={canviEstatModal}><i className="bi bi-box-arrow-right pe-1 text-white"></i>Tancar</a></li>
                        </ul>
                    </nav>
                  
                </div>
            </div>


            <Modal show={showModal} onHide={canviEstatModal}>
                <Modal.Header closeButton >
                    <Modal.Title>Tancar sessió</Modal.Title>
                </Modal.Header>

                <Modal.Body>
      <h4 >Vols eixir del teu perfil d'usuari?</h4>
    <div className="d-flex justify-content-end">
    <Button type="submit"
            id="enviar"
            className="mt-2 orange-button"
            onClick={()=> borrarToken()}
            >
        Eixir
    </Button>
    </div>
      </Modal.Body>
      </Modal> 

        </>
    )
}

export default Lateral


