import { useState, useEffect, useRef } from 'react';

function ModelSystemPromptForm({ association, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [modelslug, setModelslug] = useState('');
  const [systemPromptId, setSystemPromptId] = useState(association ? association.systemPromptId || '' : '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemPrompts, setSystemPrompts] = useState([]);
  const [models, setModels] = useState([]);
  const [modelSearch, setModelSearch] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const modelInputRef = useRef();

  useEffect(() => {
    // Charger la liste des prompts système pour la dropdown
    const fetchSystemPrompts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(import.meta.env.VITE_API_URL + '/system-prompt', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des prompts système.');
        const data = await res.json();
        setSystemPrompts(Array.isArray(data) ? data : []);
      } catch (err) {
        setSystemPrompts([]);
      }
    };
    fetchSystemPrompts();
  }, []);

  useEffect(() => {
    // Charger la liste des modèles pour la dropdown
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
        setModels([]);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (association) {
      setName(association.name || '');
      setModelslug(association.modelslug || '');
      setSystemPromptId(association.systemPromptId || '');
      setDescription(association.description || '');
    }
  }, [association]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    let url = import.meta.env.VITE_API_URL + '/model-system-prompt';
    let method = 'POST';
    if (association) {
      url += `/${association.id}`;
      method = 'PUT';
    }
    const body = JSON.stringify({
      name,
      modelslug,
      systemPromptId: Number(systemPromptId),
      description,
    });
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body,
      });
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement de l\'association.');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recherche filtrée sur les modèles
  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.slug.toLowerCase().includes(modelSearch.toLowerCase())
  );

  // Gestion du dropdown custom
  const handleModelSelect = (slug) => {
    setModelslug(slug);
    setModelSearch(models.find(m => m.slug === slug)?.name || '');
    setShowModelDropdown(false);
  };

  useEffect(() => {
    if (modelslug) {
      setModelSearch(models.find(m => m.slug === modelslug)?.name || modelslug);
    }
  }, [modelslug, models]);

  return (
    <form className="card p-4 mb-4" onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h4 className="mb-3">{association ? 'Modifier' : 'Créer'} une association modèle / prompt système</h4>
      <div className="mb-3">
        <label className="form-label">Nom *</label>
        <input
          className="form-control"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3 position-relative">
        <label className="form-label">Modèle *</label>
        <input
          className="form-control"
          value={modelSearch}
          onChange={e => {
            setModelSearch(e.target.value);
            setShowModelDropdown(true);
          }}
          onFocus={() => setShowModelDropdown(true)}
          placeholder="Rechercher un modèle..."
          autoComplete="off"
          ref={modelInputRef}
          required
        />
        {showModelDropdown && (
          <div className="list-group position-absolute w-100 model-autocomplete-dropdown" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filteredModels.length === 0 && (
              <div className="list-group-item list-group-item-action disabled">Aucun modèle trouvé</div>
            )}
            {filteredModels.map(m => (
              <button
                type="button"
                className={`list-group-item list-group-item-action${m.slug === modelslug ? ' active' : ''}`}
                key={m.slug}
                onClick={() => handleModelSelect(m.slug)}
              >
                <span className="fw-bold">{m.name}</span> <span className="text-muted small">({m.slug})</span>
                <span className="d-block small mt-1 text-muted">
                  {m.cost_inputMil !== null ? `In: $${m.cost_inputMil}/M` : 'In: $0/M'} | {m.cost_outputMil !== null ? ` Out: $${m.cost_outputMil}/M` : 'Out: $0/M'}
                </span>
              </button>
            ))}
          </div>
        )}
        {modelslug && (
          <div className="mt-2 small text-info">
            {(() => {
              const m = models.find(m => m.slug === modelslug);
              if (!m) return null;
              return (
                <>
                  <span className="fw-bold">Coût du modèle sélectionné : </span> 
                  <span>In: {m.cost_inputMil !== null ? `$${m.cost_inputMil}/M tokens` : '$0/M tokens'}</span> | 
                  <span> Out: {m.cost_outputMil !== null ? `$${m.cost_outputMil}/M tokens` : '$0/M tokens'}</span>
                </>
              );
            })()}
          </div>
        )}
      </div>
      <div className="mb-3">
        <label className="form-label">Prompt système *</label>
        <select
          className="form-select"
          value={systemPromptId}
          onChange={e => setSystemPromptId(Number(e.target.value))}
          required
        >
          <option value="">Sélectionner un prompt système</option>
          {systemPrompts.map(sp => (
            <option key={sp.id} value={sp.id}>{sp.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <input
          className="form-control"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : (association ? 'Modifier' : 'Créer')}
        </button>
        {onCancel && (
          <button className="btn btn-outline-secondary" type="button" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

export default ModelSystemPromptForm;
