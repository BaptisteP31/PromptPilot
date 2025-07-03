import { useRef, useState, useEffect } from 'react';

function ApiKeyCard({ apiKey, onEdit, onDelete }) {
  return (
    <div className="card mb-3 shadow-sm" style={{ border: '1px solid #dee2e6' }}>
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-2">{apiKey.type?.name || 'Type inconnu'}</h5>
          <p className="mb-1 text-muted" style={{ fontSize: '0.95em' }}>{apiKey.type?.description}</p>
          <div className="d-flex gap-3 mt-2" style={{ fontSize: '0.9em' }}>
            <span>ID : {apiKey.id}</span>
            <span>Créé le : {new Date(apiKey.createdAt).toLocaleString('fr-FR')}</span>
          </div>
        </div>
        <div className="text-end">
          <div className="mb-2">
            <span className="badge bg-secondary">{apiKey.apiKey}</span>
          </div>
          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(apiKey)}>
            Modifier
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(apiKey)}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function ApiKeyForm({ apiKey, onSuccess, onCancel }) {
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [typeId, setTypeId] = useState('');
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger les types de clefs
    const fetchTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(import.meta.env.VITE_API_URL + '/api-key-type', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des types de clef.');
        const data = await res.json();
        setTypes(Array.isArray(data) ? data : []);
      } catch {
        setTypes([]);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (apiKey) {
      setApiKeyValue(apiKey.apiKey || '');
      setTypeId(apiKey.typeId || (apiKey.type ? apiKey.type.id : ''));
    }
  }, [apiKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    let url = import.meta.env.VITE_API_URL + '/api-key';
    let method = 'POST';
    if (apiKey) {
      url += `/${apiKey.id}`;
      method = 'PUT';
    }
    const body = JSON.stringify({
      apiKey: apiKeyValue,
      typeId: Number(typeId),
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
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement de la clef.');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card p-4 mb-4" onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h4 className="mb-3">{apiKey ? 'Modifier' : 'Ajouter'} une clef d'API</h4>
      <div className="mb-3">
        <label className="form-label">Type *</label>
        <select
          className="form-select"
          value={typeId}
          onChange={e => setTypeId(e.target.value)}
          required
        >
          <option value="">Sélectionner un type</option>
          {types.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Clé *</label>
        <input
          className="form-control"
          value={apiKeyValue}
          onChange={e => setApiKeyValue(e.target.value)}
          required
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : (apiKey ? 'Modifier' : 'Ajouter')}
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

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteKey, setDeleteKey] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchApiKeys();
    // eslint-disable-next-line
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(import.meta.env.VITE_API_URL + '/api-key', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des clefs d\'API.');
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApiKeys = apiKeys.filter(key =>
    (key.apiKey && key.apiKey.toLowerCase().includes(search.toLowerCase())) ||
    (key.type?.name && key.type.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    setEditKey(null);
    setShowForm(true);
  };

  const handleEdit = (key) => {
    setEditKey(key);
    setShowForm(true);
  };

  const handleDelete = (key) => {
    setDeleteKey(key);
  };

  const confirmDelete = async () => {
    if (!deleteKey) return;
    setDeleteLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api-key/${deleteKey.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      setDeleteKey(null);
      fetchApiKeys();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditKey(null);
    fetchApiKeys();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditKey(null);
  };

  if (loading) return <div className="container py-5 text-center">Chargement...</div>;
  if (error) return <div className="container py-5 text-danger text-center">{error}</div>;

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="mb-0 text-center flex-grow-1">Gestion des clefs d'API</h1>
      </div>
      <div className="mb-4" style={{maxWidth: 500, margin: '0 auto'}}>
        <div className="input-group">
          <input
            className="form-control"
            type="text"
            placeholder="Rechercher une clef ou un type..."
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
        <ApiKeyForm
          apiKey={editKey}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
      <div className="row justify-content-center">
        <div className="col-md-10">
          {filteredApiKeys.length === 0 && <div className="text-center">Aucune clef d'API trouvée.</div>}
          {filteredApiKeys.map(apiKey => (
            <ApiKeyCard key={apiKey.id} apiKey={apiKey} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>
      {/* Modal de confirmation suppression */}
      {deleteKey && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteKey(null)}></button>
              </div>
              <div className="modal-body">
                <p>Voulez-vous vraiment supprimer cette clef d'API ?</p>
                <div className="small text-muted">{deleteKey.apiKey}</div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => setDeleteKey(null)} disabled={deleteLoading}>Annuler</button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleteLoading}>
                  {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiKeysPage;
