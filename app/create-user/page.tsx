"use client"; // ← nécessaire pour un composant client (formulaire interactif)

import { useState } from "react";

export default function CreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isAdmin }),
      });
      if (res.ok) {
        alert("Utilisateur créé !");
        setName("");
        setEmail("");
        setPassword("");
        setIsAdmin(false);
      } else {
        const data = await res.json();
        alert("Erreur : " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  return (
    <div>
      <h1>Créer un utilisateur</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Créer</button>
      </form>
    </div>
  );
}