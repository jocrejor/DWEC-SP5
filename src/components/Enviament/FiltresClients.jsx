import React from 'react'

function FiltresClients() {
    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="nom" className="form-label">Nom</label>
                        <input type="text" placeholder='Paco Perez' className="form-control" id="nom"/>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="email" className="form-label">Email</label>
                        <input type="email" placeholder='prova@gmail.com' className="form-control" id="email" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="telefon" className="form-label">Telèfon</label>
                        <input type="text" placeholder='+34 743883232' className="form-control" id="telefon" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="adreça" className="form-label">Adreça</label>
                        <input type="text" placeholder='Calle Gran Vía, 32' className="form-control" id="adreça" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="NIF" className="form-label">NIF</label>
                        <input type="text" placeholder='32186572R' className="form-control" id="NIF" />
                    </div>
                </div>
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
            </div>
            <div className="row bg-grey pb-3 mx-0">
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
                <div className="col-12 col-xl-4 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white"><i className="bi bi-trash px-1 text-white"></i>Netejar</button>
                    <button className="btn btn-primary me-2 ps-2 orange-button text-white"><i className="bi bi-funnel px-1 text-white"></i>Filtrar</button>
                </div>
            </div>
        </>
    )
}

export default FiltresClients