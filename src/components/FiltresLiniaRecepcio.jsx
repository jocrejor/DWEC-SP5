import React from 'react'

function Filtres() {
    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6">
                    <div className="mb-3 text-light-blue">
                        <label for="nombre" className="form-label">ID</label>
                        <input type="number" placeholder='Ex: 01' className="form-control" id="id" />
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="mb-3 text-light-blue">
                        <label for="carrer" className="form-label">Nom Estat</label>
                        <input type="text" placeholder='Ex: Pendent' className="form-control" id="name" />
                    </div>
                </div>

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

export default Filtres