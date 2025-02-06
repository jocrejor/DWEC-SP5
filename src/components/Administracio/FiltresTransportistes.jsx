import React from 'react'

function FiltresTransportistes() {
    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="nombre" className="form-label">Nom</label>
                        <input type="text" placeholder='Ex: DHL' className="form-control" id="nom" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="carrer" className="form-label">Adreça</label>
                        <input type="text" placeholder='Ex: Avinguda Informàtic, 2' className="form-control" id="adreça" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="estanteria" className="form-label">Telèfon</label>
                        <input type="text" placeholder='Ex: 911211311' className="form-control" id="telèfon" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="estanteria" className="form-label">NIF</label>
                        <input type="text" placeholder='Ex: B12345678' className="form-control" id="nif" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="estanteria" className="form-label">Província</label>
                        <input type="text" placeholder='Ex: Alacant' className="form-control" id="provincia" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label for="estanteria" className="form-label">Ciutat</label>
                        <input type="text" placeholder='Ex: Pego' className="form-control" id="ciutat" />
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

export default FiltresTransportistes