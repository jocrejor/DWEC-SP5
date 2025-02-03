import React from 'react'

function Filtres() {
    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="nombre" className="htmlForm-label">Magatzem</label>
                        <input type="text" placeholder='Ex: 01' className="htmlForm-control" id="nombre" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="carrer" className="htmlForm-label">Carrer</label>
                        <input type="text" placeholder='Ex: 02' className="htmlForm-control" id="carrer" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="estanteria" className="htmlForm-label">Estanteria</label>
                        <input type="text" placeholder='Ex: 03' className="htmlForm-control" id="telefono" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="espai" className="htmlForm-label">Espai</label>
                        <input type="email" placeholder='Ex: 04' className="htmlForm-control" id="espai" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="producte" className="htmlForm-label">Producte</label>
                        <input type="email" placeholder='Ex: Producto uno' className="htmlForm-control" id="producte" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="data" className="htmlForm-label">Data</label>
                        <input type="date" placeholder='Ex: Reception' className="htmlForm-control" id="data" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="operari" className="htmlForm-label">Operari</label>
                        <input type="email" placeholder='Ex: 1' className="htmlForm-control" id="operari" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="origen" className="htmlForm-label">Origen</label>
                        <input type="email" placeholder='Ex: Reception' className="htmlForm-control" id="origen" />
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

export default Filtres