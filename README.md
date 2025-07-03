# PromptPilot

PromptPilot est une application web moderne pour la gestion, l’association et l’utilisation de prompts systèmes et de modèles IA (OpenRouter) en entreprise.

## Fonctionnalités principales
- Gestion des modèles IA (ajout, recherche, modification)
- Gestion des prompts systèmes (ajout, recherche, modification)
- Association modèle/prompt (mapping, recherche, modification)
- Gestion des clés d’API (OpenRouter, etc.)
- Appel direct à l’API OpenRouter avec sélection d’une association modèle/prompt et d’une clé d’API
- Interface moderne, responsive, dark mode

## Stack technique
- **Frontend** : React 19, Vite, Bootstrap 5 (dark theme)
- **Backend** : Node.js, Express, Prisma (Mariadb)
- **API IA** : OpenRouter (compatible OpenAI)

## Installation

### Prérequis
- Node.js >= 18
- Mariadb (ou base compatible)

### 1. Cloner le dépôt
```bash
# SSH
git clone git@github.com:BaptisteP31/PromptPilot.git
# HTTPS
git clone https://github.com/BaptisteP31/PromptPilot.git
cd PromptPilot
```

### 2. Backend
```bash
cd backend
cp example.env .env # Adapter les variables (DB, JWT, etc.)
npm install
npx prisma migrate dev # Crée la base et les tables
npx prisma db seed     # Remplit les modèles/types de base
npm run dev           # Lance le serveur sur http://localhost:3000
```

### 3. Frontend
```bash
cd ../frontend
cp .env.example .env # (si présent, sinon adapter VITE_API_URL)
npm install
npm run dev          # Lance le frontend sur http://localhost:5173
```

## Utilisation
- Connectez-vous ou créez un compte.
- Ajoutez vos modèles, prompts systèmes, et clés d’API.
- Associez prompts et modèles.
- Utilisez la page “Appel à un modèle” pour tester vos prompts sur les modèles IA via OpenRouter.

## Personnalisation
- Ajoutez vos propres modèles IA dans le seed ou via l’interface.
- Ajoutez d’autres types de clés d’API si besoin (backend/prisma/schema.prisma).

## Sécurité
- Les clés d’API sont stockées côté backend et ne sont accessibles qu’à l’utilisateur connecté.
- Les appels à OpenRouter se font côté frontend, la clé sélectionnée n’est jamais exposée publiquement.

## Licence
GNU General Public License v3.0 (GPL-3.0)

## Auteur
Baptiste P. / PromptPilot

---
Contributions bienvenues !
