import React, { useState } from 'react';

const FiltresTransportistes = ({ carriers, pais, provincia, ciutat, onFilter, onClear }) => {
    const [filters, setFilters] = useState({
        name: '',
        nif: '',
        state_id: '',
        province: '',
        city: '',
    });

    const filtrat = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const botoFiltra = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const netejaFiltres = (e) => {
        e.preventDefault();
        setFilters({
            name: '',
            nif: '',
            state_id: '',
            province: '',
            city: '',
        });
        onClear();
    };

    return (
        <form className="row bg-grey pt-3 px-2 mx-0">
            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterName" className="form-label">Nom</label>
                <input
                    list="nameSuggestions"
                    type="text"
                    className="form-control"
                    id="filterName"
                    name="name"
                    value={filters.name}
                    onChange={filtrat}
                    placeholder="Filtra per nom"
                />
                <datalist id="nameSuggestions">
                    {carriers && carriers.map(carrier => (
                        <option key={carrier.id} value={carrier.name} />
                    ))}
                </datalist>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterNif" className="form-label">NIF</label>
                <input
                    list="nifSuggestions"
                    type="text"
                    className="form-control"
                    id="filterNif"
                    name="nif"
                    value={filters.nif}
                    onChange={filtrat}
                    placeholder="Filtra per NIF"
                />
                <datalist id="nifSuggestions">
                    {carriers && carriers.map(carrier => (
                        <option key={carrier.id} value={carrier.nif} />
                    ))}
                </datalist>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterState" className="form-label">Estat</label>
                <select
                    className="form-select"
                    id="filterState"
                    name="state_id"
                    value={filters.state_id}
                    onChange={filtrat}
                >
                    <option value="">Tots</option>
                    {pais && pais.map(state => (
                        <option key={state.id} value={String(state.id)}>
                            {state.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterProvince" className="form-label">Província</label>
                {filters.state_id === '194' ? (
                    <select
                        name="province"
                        id="filterProvince"
                        className="form-select"
                        value={filters.province}
                        onChange={filtrat}
                    >
                        <option value="">Selecciona una província</option>
                        {Array.isArray(provincia) && provincia.length > 0 ? (
                            provincia
                                .slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((prov) => (
                                    <option key={prov.id} value={prov.name}>
                                        {prov.name}
                                    </option>
                                ))
                        ) : (
                            <option value="">No hi han províncies</option>
                        )}
                    </select>
                ) : (
                    <input
                        type="text"
                        name="province"
                        id="filterProvince"
                        autoComplete="on"
                        className="form-control"
                        value={filters.province}
                        onChange={filtrat}
                        placeholder="Escriu la província"
                    />
                )}
            </div>

            <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="filterCity" className="form-label">Ciutat</label>
                {filters.state_id === '194' && filters.province ? (
                    <select
                        name="city"
                        id="filterCity"
                        className="form-select"
                        value={filters.city}
                        onChange={filtrat}
                    >
                        <option value="">Selecciona una ciutat</option>
                        {ciutat &&
                            ciutat
                                .filter((item) => item.province === filters.province)
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((item) => (
                                    <option key={item.id} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        name="city"
                        id="filterCity"
                        autoComplete="on"
                        className="form-control"
                        value={filters.city}
                        onChange={filtrat}
                        placeholder="Escriu la ciutat"
                    />
                )}
            </div>

            <div className="row bg-grey pb-3 pt-2 mx-0">
                <div className="col-xl-4"></div>
                <div className="col-xl-4"></div>
                <div className="col-12 col-xl-4 text-end">
                    <button className="btn btn-secondary ps-2 me-2 text-white" onClick={netejaFiltres}>
                        <i className="bi bi-trash px-1 text-white"></i> Netejar
                    </button>
                    <button className="btn btn-secondary me-2 ps-2 orange-button text-white" onClick={botoFiltra}>
                        <i className="bi bi-funnel px-1 text-white"></i> Filtrar
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FiltresTransportistes;
