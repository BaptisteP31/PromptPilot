import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ModelSystemPromptCard({ prompt }) {
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
            <span>Créé le : {new Date(prompt.createdAt).toLocaleString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelSystemPromptsPage() {
  const { slug } = useParams();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(import.meta.env.VITE_API_URL + '/model-system-prompt?modelslug=' + encodeURIComponent(slug), {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des prompts associés.');
        const data = await res.json();
        setPrompts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, [slug]);

  if (loading) return <div className="container py-5 text-center">Chargement...</div>;
  if (error) return <div className="container py-5 text-danger text-center">{error}</div>;

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Prompts Système associés</h1>
      <div className="row justify-content-center">
        <div className="col-md-10">
          {prompts.length === 0 && <div className="text-center">Aucun prompt associé à ce modèle.</div>}
          {prompts.map(prompt => (
            <ModelSystemPromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModelSystemPromptsPage;
