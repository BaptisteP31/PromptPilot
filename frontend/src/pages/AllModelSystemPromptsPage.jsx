import { useEffect, useState } from 'react';
import ModelSystemPromptForm from './ModelSystemPromptForm';

function ModelSystemPromptCard({ prompt, onEdit }) {
    return (
        <div className="card mb-3 shadow-sm" style={{ border: '1px solid #dee2e6' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="card-title mb-2">{prompt.name}</h5>
                    <p className="mb-1 text-muted" style={{ fontSize: '0.95em' }}>
                        {prompt.description || <span className="fst-italic">Aucune description</span>}
                    </p>
                    <div className="d-flex gap-3 mt-2" style={{ fontSize: '0.9em' }}>
                        <span>ID : {prompt.id}</span>
                        <span>Modèle : <span className="text-info">{prompt.modelslug}</span></span>
                        <span>Prompt ID : {prompt.systemPromptId}</span>
                        <span>Créé le : {new Date(prompt.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                </div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(prompt)}>
                    Modifier
                </button>
            </div>
        </div>
    );
}

function AllModelSystemPromptsPage() {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editAssociation, setEditAssociation] = useState(null);
    const [search, setSearch] = useState('');

    const fetchPrompts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(import.meta.env.VITE_API_URL + '/model-system-prompt', {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            if (!res.ok) throw new Error('Erreur lors du chargement des associations.');
            const data = await res.json();
            setPrompts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    // Filtrage des associations selon la recherche
    const filteredPrompts = prompts.filter(assoc =>
        (assoc.name && assoc.name.toLowerCase().includes(search.toLowerCase())) ||
        (assoc.description && assoc.description.toLowerCase().includes(search.toLowerCase())) ||
        (assoc.modelslug && assoc.modelslug.toLowerCase().includes(search.toLowerCase()))
    );

    const handleAdd = () => {
        setEditAssociation(null);
        setShowForm(true);
    };

    const handleEdit = (association) => {
        setEditAssociation(association);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditAssociation(null);
        fetchPrompts();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditAssociation(null);
    };

    if (loading) return <div className="container py-5 text-center">Chargement...</div>;
    if (error) return <div className="container py-5 text-danger text-center">{error}</div>;

    return (
        <div className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="mb-0 text-center flex-grow-1">Associations Modèle / Prompt Système</h1>
            </div>
            <div className="mb-4" style={{maxWidth: 500, margin: '0 auto'}}>
                <div className="input-group">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Rechercher un prompt..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ minWidth: 100 }}
                        onClick={handleAdd}
                    >
                        Ajouter
                    </button>
                </div>
            </div>
            {showForm && (
                <ModelSystemPromptForm
                    association={editAssociation}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}
            <div className="row justify-content-center">
                <div className="col-md-10">
                    {filteredPrompts.length === 0 && <div className="text-center">Aucune association trouvée.</div>}
                    {filteredPrompts.map(prompt => (
                        <ModelSystemPromptCard key={prompt.id} prompt={prompt} onEdit={handleEdit} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AllModelSystemPromptsPage;
