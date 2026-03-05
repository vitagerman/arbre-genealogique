// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // ─── VALIDATION ───────────────────────────────────────────────────────────

    function validate() {
        if (!name || !email || !password) {
            setError("Le nom, l'email et le mot de passe sont requis");
            return false;
        }
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return false;
        }
        return true;
    }

    // ─── HANDLE SUBMIT ────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validate()) return;

        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, surname, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? "Erreur lors de l'inscription");
                return;
            }

            // ─── Inscription réussie ───────────────────────────────────────────────
            setSuccess("Compte créé avec succès ! En attente de validation par un administrateur.");

            // Redirige vers login après 3 secondes
            setTimeout(() => router.push("/login"), 3000);

        } catch (err) {
            setError("Une erreur est survenue, veuillez réessayer");
        } finally {
            setLoading(false);
        }
    }

    // ─── RENDU ────────────────────────────────────────────────────────────────

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f7fafc",
            }}
        >
            <div
                style={{
                    background: "white",
                    padding: 40,
                    borderRadius: 12,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    width: "100%",
                    maxWidth: 400,
                }}
            >
                <h1 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700, color: "#1a202c" }}>
                    Créer un compte
                </h1>
                <p style={{ marginBottom: 24, color: "#718096", fontSize: 14 }}>
                    Votre compte devra être validé par un administrateur
                </p>

                {/* ─── MESSAGE ERREUR ───────────────────────────────────────────────── */}
                {error && (
                    <div
                        style={{
                            background: "#fff5f5",
                            border: "1px solid #fc8181",
                            borderRadius: 8,
                            padding: "12px 16px",
                            marginBottom: 16,
                            color: "#c53030",
                            fontSize: 14,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* ─── MESSAGE SUCCÈS ───────────────────────────────────────────────── */}
                {success && (
                    <div
                        style={{
                            background: "#f0fff4",
                            border: "1px solid #68d391",
                            borderRadius: 8,
                            padding: "12px 16px",
                            marginBottom: 16,
                            color: "#276749",
                            fontSize: 14,
                        }}
                    >
                        {success}
                    </div>
                )}

                {/* ─── FORMULAIRE ──────────────────────────────────────────────────── */}
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                            Prénom *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Jean"
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#1a202c",
                                background: "white",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                            Nom
                        </label>
                        <input
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            placeholder="Dupont"
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#1a202c",
                                background: "white",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jean.dupont@email.com"
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#1a202c",
                                background: "white",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                            Mot de passe * (8 caractères minimum)
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#1a202c",
                                background: "white",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                            Confirmer le mot de passe *
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#1a202c",
                                background: "white",
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name || !email || !password || !confirmPassword}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading || !name || !email || !password || !confirmPassword ? "#a0aec0" : "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: loading || !name || !email || !password || !confirmPassword ? "not-allowed" : "pointer",
                            transition: "background 0.2s",
                        }}
                    >
                        {loading ? "Inscription en cours..." : "S'inscrire"}
                    </button>
                </div>

                {/* ─── LIEN VERS LOGIN ──────────────────────────────────────────────── */}
                <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#718096" }}>
                    Déjà un compte ?{" "}
                    <a href="/login" style={{ color: "#667eea", fontWeight: 600, textDecoration: "none" }}>
                        Se connecter
                    </a>
                </p>
            </div>
        </div>
    );
}