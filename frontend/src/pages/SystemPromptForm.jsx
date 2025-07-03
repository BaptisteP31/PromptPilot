import { useState, useEffect } from 'react';

function SystemPromptForm({ prompt, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prompt) {
      setName(prompt.name || '');
      setContent(prompt.content || '');
      setDescription(prompt.description || '');
    }
  }, [prompt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    let url = import.meta.env.VITE_API_URL + '/system-prompt';
    let method = 'POST';
    if (prompt) {
      url += `/${prompt.id}`;
      method = 'PUT';
    }
    const body = JSON.stringify({
      name,
      content,
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
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement du prompt.');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card p-4 mb-4" onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h4 className="mb-3">{prompt ? 'Modifier' : 'Créer'} un prompt système</h4>
      <div className="mb-3">
        <label className="form-label">Nom *</label>
        <input
          className="form-control"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Contenu *</label>
        <textarea
          className="form-control"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          required
        />
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
          {loading ? 'Enregistrement...' : (prompt ? 'Modifier' : 'Créer')}
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

export default SystemPromptForm;
