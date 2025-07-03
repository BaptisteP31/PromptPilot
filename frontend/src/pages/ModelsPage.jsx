import { useEffect, useState } from 'react';

function ModelCard({ model }) {

    const handleCopy = () => {
        navigator.clipboard.writeText(model.slug);
    };

    return (
        <div className="card bg-dark text-light mb-4 border-secondary">
            <div className="card-body d-flex align-items-start justify-content-between">
                <div>
                    <h5 className="card-title mb-1 fw-semibold">
                        {model.name} {model.free && <span className="badge bg-success ms-2">free</span>}
                    </h5>
                    <div className="mb-2 small d-flex align-items-center gap-2">
                        <span className='text-muted'>{model.slug}</span>
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            onClick={handleCopy}
                            type="button"
                            title="Copier le slug"
                            style={{ padding: '2px 8px' }}
                        >
                            <span className="me-1" style={{ display: 'flex', alignItems: 'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                        d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z"
                                        fill="white" />
                                </svg>
                            </span>
                        </button>
                    </div>
                    <div className="mb-2 small">
                        {model.description || <span className="fst-italic">Aucune description</span>}
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2 small">
                        <span>
                            par <span className="text-info">{model.provider || 'openrouter'}</span>
                        </span>
                        <span>| {model.contextLength ? (model.contextLength / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + 'M context' : '-'}</span>
                        <span>| {model.cost_inputMil !== null ? `$${model.cost_inputMil}/M input tokens` : '$0/M input tokens'}</span>
                        <span>| {model.cost_outputMil !== null ? `$${model.cost_outputMil}/M output tokens` : '$0/M output tokens'}</span>
                    </div>
                </div>
                <div className="text-end ms-3" style={{ minWidth: 120 }}>
                    {/* Actions or buttons can go here */}
                </div>
            </div>
        </div>
    );
}

function ModelsPage() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(import.meta.env.VITE_API_URL + '/model', {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                    },
                });
                if (!res.ok) throw new Error('Erreur lors du chargement des modèles.');
                const data = await res.json();
                setModels(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const filteredModels = models.filter(model =>
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.slug.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="container py-5 text-center">Chargement...</div>;
    if (error) return <div className="container py-5 text-danger text-center">{error}</div>;

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-center">Modèles disponibles</h1>
            <div className="mb-4" style={{maxWidth: 400, margin: '0 auto'}}>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Rechercher un modèle..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="row justify-content-center">
                <div className="col-md-10">
                    {filteredModels.length === 0 && <div className="text-center">Aucun modèle disponible.</div>}
                    {filteredModels.map(model => (
                        <ModelCard key={model.slug} model={model} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModelsPage;
