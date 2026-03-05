"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface IUserClient {
  _id: string;
  name: string;
  surname: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

function btnStyle(color: string, bg: string) {
  return {
    padding: "6px 12px",
    background: bg,
    color,
    border: `1px solid ${color}`,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  };
}

function UserCard({ user, onToggleAdmin, onDelete }: {
  user: IUserClient;
  onToggleAdmin: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "16px 20px",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#1a202c" }}>
          {user.name} {user.surname}
          {user.isAdmin && (
            <span style={{
              marginLeft: 8, fontSize: 11,
              background: "#553c9a", color: "white",
              padding: "2px 8px", borderRadius: 99,
            }}>
              ADMIN
            </span>
          )}
        </div>
        <div style={{ color: "#718096", fontSize: 13 }}>{user.email}</div>
        <div style={{ color: "#a0aec0", fontSize: 11, marginTop: 2 }}>
          Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onToggleAdmin} style={btnStyle("#553c9a", "#faf5ff")}>
          {user.isAdmin ? "Retirer admin" : "Rendre admin"}
        </button>
        <button onClick={onDelete} style={btnStyle("#c53030", "#fff5f5")}>
          🗑 Supprimer
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<IUserClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin) router.push("/");
  }, [session, status]);

  useEffect(() => {
    if (session?.user?.isAdmin) fetchUsers();
  }, [session]);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/user");
    const data = await res.json();
    setUsers(data.data ?? []);
    setLoading(false);
  }

  async function handleToggleAdmin(userId: string, isAdmin: boolean) {
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAdmin }),
    });
    fetchUsers();
  }

  async function handleDelete(userId: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    fetchUsers();
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: 32, color: "#1a202c" }}>Chargement...</div>;
  }

  const admins    = users.filter((u) => u.isAdmin);
  const lecteurs  = users.filter((u) => !u.isAdmin);

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto", color: "#1a202c" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Interface d'administration
          </h1>
          <p style={{ color: "#718096", margin: 0 }}>
            Connecté en tant que : {session?.user?.name} · {users.length} utilisateur(s)
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 20px",
            background: "#2b6cb0",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1e4d8b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#2b6cb0";
          }}
        >
          ← Retour aux graphiques
        </button>
      </div>

      {/* ─── ADMINS ────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#553c9a" }}>
          👑 Administrateurs ({admins.length})
        </h2>
        {admins.length === 0 ? (
          <p style={{ color: "#718096" }}>Aucun administrateur</p>
        ) : (
          admins.map((u) => (
            <UserCard
              key={u._id}
              user={u}
              onToggleAdmin={() => handleToggleAdmin(u._id, false)}
              onDelete={() => handleDelete(u._id)}
            />
          ))
        )}
      </section>

      {/* ─── LECTEURS ──────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#2b6cb0" }}>
          👁 Lecteurs ({lecteurs.length})
        </h2>
        {lecteurs.length === 0 ? (
          <p style={{ color: "#718096" }}>Aucun lecteur</p>
        ) : (
          lecteurs.map((u) => (
            <UserCard
              key={u._id}
              user={u}
              onToggleAdmin={() => handleToggleAdmin(u._id, true)}
              onDelete={() => handleDelete(u._id)}
            />
          ))
        )}
      </section>
    </div>
  );
}