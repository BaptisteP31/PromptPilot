import { useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import logo from './assets/logo.png'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';
import ModelsPage from './pages/ModelsPage';
import SystemPromptsPage from './pages/SystemPromptsPage';
import ModelSystemPromptsPage from './pages/ModelSystemPromptsPage';
import AllModelSystemPromptsPage from './pages/AllModelSystemPromptsPage';
import ApiKeysPage from './pages/ApiKeysPage';
import ModelCallPage from './pages/ModelCallPage';

function Home() {
  return (
    <div className="container py-5">
      <div className="card p-5 shadow-sm mx-auto" style={{ maxWidth: 600 }}>
        <img
          src={logo}
          className="logo react mb-4"
          alt="React logo"
          style={{ width: 120, height: 120, objectFit: 'contain', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        />
        <h1 className="mb-4 text-center text-primary">Bienvenue sur PromptPilot !</h1>
        <p className="lead text-center">
          PromptPilot est une plateforme dédiée à la création d'un environnement de travail pour l'utilisation de l'IA en entreprise. PromptPilot permet de définir des prompts systèmes et d'y accéder rapidement.
        </p>
        <hr />
        <p>Ainsi, avec PromptPilot, il est possible de :</p>
        <ul className="mb-4">
          <li>Reformuler des comptes rendus de réunion</li>
          <li>Rédiger des emails professionnels</li>
          <li>Créer des résumés de documents</li>
          <li>Générer des idées de contenu</li>
          <li>Et bien plus encore !</li>
        </ul>
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
          <Link className="btn btn-primary btn-lg" to="/login">
            Commencer à utiliser PromptPilot
          </Link>
          <Link className="btn btn-outline-secondary btn-lg" to="/about">
            En savoir plus
          </Link>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">À propos de PromptPilot</h1>
      <div className="card p-4 mx-auto" style={{ maxWidth: 600 }}>
        <p>
          <strong>PromptPilot</strong> est une application web qui permet de créer et de gérer des <strong>prompts systèmes</strong> pour les modèles d'IA. Un prompt système est un ensemble d'instructions ou de directives qui guident le comportement du modèle d'IA, lui permettant de mieux comprendre le contexte et les attentes de l'utilisateur.
        </p>
        <p>
          L'application est conçue pour être simple et intuitive, permettant aux utilisateurs de créer des prompts personnalisés en quelques clics. Les utilisateurs peuvent également parcourir les prompts existants, les modifier et les supprimer selon leurs besoins.
        </p>
        <hr/>
        <p>
          PromptPilot est un projet open source, je vous invite à contribuer et à partager vos idées pour améliorer l'application. Vous pouvez trouver le code source sur GitHub
        </p>
        <div className="d-flex justify-content-between mt-4">
          <a
            className="btn btn-outline-secondary"
            href="https://github.com/BaptisteP31/PromptPilot"
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir le projet sur GitHub
          </a>
          <Link className="btn btn-primary" to="/">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppContent() {
  const { auth, logout } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo PromptPilot" style={{ width: 30, height: 30, marginRight: 8 }} />
            PromptPilot
          </Link>
          <div className="navbar-nav">
            <Link className="nav-link" to="/">Accueil</Link>
            {auth && (
              <>
                <Link className="nav-link" to="/api-keys">Clés API</Link>
                <Link className="nav-link" to="/models">Modèles</Link>
                <Link className="nav-link" to="/system-prompts">Prompts</Link>
                <Link className="nav-link" to="/model-system-prompts">Modèle / Prompt</Link>
                <Link className="nav-link" to="/model-call">Appel à un modèle</Link>
              </>
            )}
            {auth ? (
              <button className="nav-link btn btn-link text-light" style={{border:0,background:'none'}} onClick={logout}>Déconnexion</button>
            ) : (
              <Link className="nav-link" to="/login">Connexion</Link>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/system-prompts" element={<SystemPromptsPage />} />
        <Route path="/models/:slug/prompts" element={<ModelSystemPromptsPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/model-system-prompts" element={<AllModelSystemPromptsPage />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
        <Route path="/model-call" element={<ModelCallPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
