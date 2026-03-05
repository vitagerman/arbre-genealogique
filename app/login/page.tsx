// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ─── HANDLE SUBMIT ────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, // on gère la redirection manuellement
            });

            if (result?.error) {
                setError(result.error);
                return;
            }

            // ─── Connexion réussie → redirection vers la page principale ──────────
            router.push("/");
            router.refresh(); // force le rechargement de la session

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
                    Connexion
                </h1>
                <p style={{ marginBottom: 24, color: "#718096", fontSize: 14 }}>
                    Connectez-vous à votre compte
                </p>

                {/* ─── MESSAGE D'ERREUR ────────────────────────────────────────── */}
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

                {/* ─── FORMULAIRE ──────────────────────────────────────────────── */}
                <div>
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

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                            Mot de passe *
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

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !email || !password}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading || !email || !password ? "#a0aec0" : "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: loading || !email || !password ? "not-allowed" : "pointer",
                            transition: "background 0.2s",
                        }}
                    >
                        {loading ? "Connexion en cours..." : "Se connecter"}
                    </button>
                </div>

                {/* ─── LIEN VERS INSCRIPTION ────────────────────────────────────── */}
                <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#718096" }}>
                    Pas encore de compte ?{" "}
                    <a href="/register" style={{ color: "#667eea", fontWeight: 600, textDecoration: "none" }}>
                        S'inscrire
                    </a>
                </p>
            </div>
        </div>
    );
}