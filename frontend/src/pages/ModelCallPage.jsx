import { useEffect, useState } from 'react';

function ModelCallPage() {
  const [associations, setAssociations] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedAssociation = associations.find(a => a.id === Number(selectedId));
  const selectedApiKey = apiKeys.find(k => k.id === Number(selectedApiKeyId));

  useEffect(() => {
    const fetchAssociations = async () => {
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
        setAssociations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssociations();
  }, []);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(import.meta.env.VITE_API_URL + '/api-key', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des clés API.');
        const data = await res.json();
        const filtered = Array.isArray(data) ? data.filter(k => k.type?.name === 'OpenRouter') : [];
        setApiKeys(filtered);
        // Préselection de la première clé si aucune sélectionnée
        if (filtered.length > 0 && !selectedApiKeyId) {
          setSelectedApiKeyId(String(filtered[0].id));
        }
      } catch (err) {
        setApiKeys([]);
      }
    };
    fetchApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    if (!selectedApiKey) {
      setError('Veuillez sélectionner une clé OpenRouter.');
      return;
    }
    if (!selectedAssociation) {
      setError('Veuillez sélectionner une association modèle/prompt.');
      return;
    }
    if (!userInput.trim()) {
      setError('Veuillez saisir un texte utilisateur.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${selectedApiKey.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedAssociation.modelslug,
          messages: [
            { role: 'system', content: selectedAssociation.systemPrompt?.content },
            { role: 'user', content: userInput },
          ],
        }),
      });
      if (!res.ok) throw new Error('Erreur lors de l’appel au modèle.');
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="container py-5">
        <h1 className="mb-4 text-center">Appel à un modèle IA</h1>
        <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: 700 }}>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Clé API OpenRouter *</label>
                    <select
                        className="form-select"
                        value={selectedApiKeyId}
                        onChange={e => setSelectedApiKeyId(e.target.value)}
                        required
                    >
                        <option value="">Sélectionner une clé...</option>
                        {apiKeys.map(k => (
                            <option key={k.id} value={k.id}>
                                {k.apiKey.slice(0, 8) + '...' + k.apiKey.slice(-4)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Association modèle / prompt *</label>
                    <select
                        className="form-select"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        required
                    >
                        <option value="">Sélectionner une association...</option>
                        {associations.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedAssociation && (
                    <div className="mb-3 p-3 rounded" style={{ background: '#23272b', border: '1px solid #454d55' }}>
                        <div><strong>Modèle :</strong> {selectedAssociation.modelslug}</div>
                        <div><strong>Prompt système :</strong> <span style={{ fontStyle: 'italic' }}>{selectedAssociation.systemPrompt?.content}</span></div>
                        <div className="mt-2 small text-info">
                            <span className="fw-bold">Coût du modèle : </span>
                            <span>
                                In: {selectedAssociation.model?.cost_inputMil !== undefined ? `$${selectedAssociation.model.cost_inputMil}/M tokens` : 'N/A'}
                            </span> |
                            <span>
                                &nbsp;Out: {selectedAssociation.model?.cost_outputMil !== undefined ? `$${selectedAssociation.model.cost_outputMil}/M tokens` : 'N/A'}
                            </span>
                        </div>
                    </div>
                )}
                <div className="mb-3">
                    <label className="form-label">Texte utilisateur *</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Saisissez votre texte ici..."
                        required
                    />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Appel en cours...' : 'Appeler le modèle'}
                </button>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {response && (
                <div className="alert alert-success mt-4 p-0" style={{ background: '#232c2b', border: 'none' }}>
                    <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #3a4a48' }}>
                        <strong className="mb-0" style={{ color: '#b2dfdb' }}>Réponse du modèle :</strong>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            onClick={() => navigator.clipboard.writeText(response)}
                            title="Copier la réponse"
                        >
                            Copier
                        </button>
                    </div>
                    <pre className="m-0 p-4" style={{ whiteSpace: 'pre-wrap', background: 'none', color: '#e6fcf2', fontFamily: 'Fira Mono, monospace', fontSize: 15, lineHeight: 1.6, backgroundColor: 'transparent' }}>{response}</pre>
                </div>
            )}
        </div>
    </div>
);
}

export default ModelCallPage;

