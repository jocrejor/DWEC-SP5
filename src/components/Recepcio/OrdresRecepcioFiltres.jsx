function Filtres({ onFilterChange, onFilterRestart }) {
    // Funció per filtrar els valors
    const filtrar = () => {
        const idValue = document.getElementById('id').value;
        const supplierValue = document.getElementById('supplier').value;
        const dateValue = document.getElementById('estimated_reception_date').value;
        const statusValue = document.getElementById('orderreception_status_id').value;
        onFilterChange(idValue, supplierValue, dateValue, statusValue);
    };

    // Funció per netejar els filtres
    const netejaFiltre = () => {
        onFilterRestart();
        document.getElementById('id').value = '';
        document.getElementById('supplier').value = '';
        document.getElementById('estimated_reception_date').value = '';
        document.getElementById('orderreception_status_id').value = '';
    };

    return (
        <>
            <div className="row bg-grey pt-3 px-2 mx-0">
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="id" className="form-label">ID</label>
                        <input type="number" placeholder='Ex: 01' className="form-control" id="id" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="supplier" className="form-label">Proveïdor</label>
                        <input type="text" placeholder='Ex: ABC S.L.' className="form-control" id="supplier" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="estimated_reception_date" className="form-label">Data Estimada</label>
                        <input type="date" className="form-control" id="estimated_reception_date" />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="mb-3 text-light-blue">
                        <label htmlFor="orderreception_status_id" className="form-label">Estat</label>
                        <input type="text" placeholder='Ex: Pendent' className="form-control" id="orderreception_status_id" />
                    </div>
                </div>
            </div>
            <div className="row bg-grey pb-3 mx-0">
                <div className="col-xl-6"></div>
                <div className="col-12 col-xl-6 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejaFiltre}><i className="bi bi-trash px-1 text-white"></i>Netejar</button>
                    <button className="btn btn-primary me-2 ps-2 orange-button text-white" onClick={filtrar}><i className="bi bi-funnel px-1 text-white"></i>Filtrar</button>
                </div>
            </div>
        </>
    );
}

export default Filtres;