# 🌳 Arbre Généalogique

Application web full-stack permettant de visualiser et gérer un arbre généalogique interactif sous forme de roue concentrique.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NextAuth](https://img.shields.io/badge/NextAuth.js-4-purple)
![Jest](https://img.shields.io/badge/Jest-Tests-red?logo=jest)

---

## 📋 Présentation

L'application permet de visualiser une famille sous forme de cercles concentriques en SVG. Le centre représente la personne racine, et chaque anneau ajoute une génération supplémentaire, jusqu'à 3 générations. Les utilisateurs peuvent ajouter, modifier et supprimer des personnes, des mariages et des liens de filiation directement depuis l'interface.

---

## ✨ Fonctionnalités

- **Visualisation SVG interactive** — roue généalogique avec secteurs cliquables
- **Gestion des personnes** — ajout, modification, suppression
- **Gestion des mariages** — liaison de deux personnes
- **Gestion des filiations** — liaison d'un enfant à un mariage
- **Authentification** — connexion sécurisée avec NextAuth.js et JWT
- **Gestion des rôles** — admin (lecture + écriture) et lecteur (lecture seule)
- **Interface d'administration** — gestion des utilisateurs et des droits
- **Tests unitaires** — couverture des routes API et des fonctions utilitaires

---

## 🛠 Stack technique

| Technologie | Rôle |
|---|---|
| **Next.js 15** | Framework React — App Router, routes API, middleware |
| **MongoDB Atlas** | Base de données NoSQL |
| **Mongoose** | Modélisation des données |
| **TypeScript** | Typage statique |
| **NextAuth.js** | Authentification JWT |
| **bcryptjs** | Hash des mots de passe |
| **Jest + ts-jest** | Tests unitaires |

---

## 🗂 Structure du projet

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   → Authentification NextAuth
│   │   ├── person/               → CRUD des personnes
│   │   ├── mariage/              → CRUD des mariages
│   │   ├── children/             → CRUD des filiations
│   │   ├── user/                 → Gestion des utilisateurs (admin)
│   │   └── register/             → Inscription publique
│   ├── admin/                    → Interface d'administration
│   ├── login/                    → Page de connexion
│   ├── register/                 → Page d'inscription
│   └── page.tsx                  → Arbre généalogique principal
├── models/
│   ├── Person.ts                 → Schéma Mongoose personne
│   ├── Mariage.ts                → Schéma Mongoose mariage
│   ├── Children.ts               → Schéma Mongoose filiation
│   └── Users.ts                  → Schéma Mongoose utilisateur
├── __tests__/
│   ├── api/                      → Tests des routes API
│   └── utils/                    → Tests des fonctions SVG
├── app/utils/
│   └── svg.ts                    → Fonctions de calcul SVG
├── types/
│   └── next-auth.d.ts            → Typage de la session
└── middleware.ts                 → Protection des routes
```

---

## 🗃 Modèle de données

```
Person
  ├── firstName (requis)
  ├── lastName
  ├── age
  └── birthdate

Mariage
  ├── spouse1 → Person (requis)
  ├── spouse2 → Person (requis)
  └── marriedAt

Children
  ├── child → Person (requis)
  └── parentsUnion → Mariage (requis)

User
  ├── name (requis)
  ├── surname
  ├── email (requis)
  ├── password hashé (requis)
  └── isAdmin (default: false)
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Un compte MongoDB Atlas
- Un compte GitHub (pour le déploiement)

### 1 — Cloner le projet

```bash
git clone https://github.com/votre-username/arbre-genealogique.git
cd arbre-genealogique
```

### 2 — Installer les dépendances

```bash
npm install
```

### 3 — Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/maDB
NEXTAUTH_SECRET=votre_secret_aleatoire_tres_long
NEXTAUTH_URL=http://localhost:3000
```

Pour générer un secret sécurisé :

```bash
openssl rand -base64 32
```

### 4 — Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 👤 Créer le premier compte admin

Comme il n'existe pas encore d'admin, vous devez en créer un directement dans MongoDB Atlas :

1. Ouvrez votre collection `users`
2. Insérez ce document en remplaçant le mot de passe par un hash bcrypt :

```json
{
  "name": "Admin",
  "surname": "Principal",
  "email": "admin@monsite.com",
  "password": "<hash_bcrypt>",
  "isAdmin": true,
  "createdAt": { "$date": "2024-01-01T00:00:00Z" }
}
```

Pour générer le hash, créez un fichier temporaire `scripts/hash.ts` :

```typescript
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("votreMotDePasse", 12);
console.log(hash);
```

```bash
npx ts-node scripts/hash.ts
```

---

## 👥 Gestion des rôles

| Rôle | Accès |
|---|---|
| Non connecté | Redirigé vers `/login` |
| Connecté (`isAdmin: false`) | Lecture seule de l'arbre |
| Admin (`isAdmin: true`) | Modification de l'arbre + accès `/admin` |

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Mode watch
npm run test:watch
```

### Couverture des tests

```
__tests__/
├── api/
│   ├── person/
│   │   ├── person.get.test.ts    → GET /api/person
│   │   ├── person.post.test.ts   → POST /api/person
│   │   └── person.id.test.ts     → PUT / DELETE /api/person/[id]
│   ├── children/
│   │   └── children.test.ts      → GET / POST / DELETE /api/children
│   └── mariage/
│       └── mariage.test.ts       → GET / POST / DELETE /api/mariage
└── utils/
    └── svg.test.ts               → polarToCart / describeArc / getLabelPos
```

---

## 🌐 Déploiement sur Vercel

1. Poussez votre code sur GitHub
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement dans **Settings → Environment Variables** :

```
MONGO_URI         = mongodb+srv://...
NEXTAUTH_SECRET   = votre_secret
NEXTAUTH_URL      = https://votre-projet.vercel.app
```

4. Autorisez les connexions Vercel dans **MongoDB Atlas → Network Access → 0.0.0.0/0**
5. Déployez

---

## 📡 Routes API

### Personnes

| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/person` | Lister toutes les personnes | ✅ |
| POST | `/api/person` | Créer une personne | ✅ Admin |
| PUT | `/api/person/[id]` | Modifier une personne | ✅ Admin |
| DELETE | `/api/person/[id]` | Supprimer une personne | ✅ Admin |

### Mariages

| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/mariage` | Lister tous les mariages | ✅ |
| POST | `/api/mariage` | Créer un mariage | ✅ Admin |
| DELETE | `/api/mariage` | Supprimer tous les mariages | ✅ Admin |

### Filiations

| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/children` | Lister toutes les filiations | ✅ |
| POST | `/api/children` | Créer une filiation | ✅ Admin |
| DELETE | `/api/children` | Supprimer toutes les filiations | ✅ Admin |

### Utilisateurs

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Inscription publique | ❌ |
| GET | `/api/user` | Lister les utilisateurs | ✅ Admin |
| POST | `/api/user` | Créer un utilisateur | ✅ Admin |
| PUT | `/api/user` | Modifier les droits | ✅ Admin |
| DELETE | `/api/user` | Supprimer un utilisateur | ✅ Admin |

---

## 🔒 Sécurité

- Les mots de passe sont hashés avec **bcrypt** (12 rounds) avant stockage
- Les sessions sont gérées via des **tokens JWT** stockés en cookie sécurisé
- Le **middleware** protège toutes les routes sensibles
- Les mots de passe ne sont **jamais retournés** dans les réponses API
- Un admin ne peut pas **se supprimer ou se révoquer** lui-même

---

## 📄 Licence

Ce projet est réalisé dans le cadre d'un projet de fin d'année — BUT MMI.
