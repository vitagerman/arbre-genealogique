"use client";

import { useState, useEffect, useMemo } from "react";
import { describeArc, getLabelPos } from "@/app/utils/svg";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Person {
  _id: string;
  firstName: string;
  lastName?: string;
  birthdate: string | null;
  deathdate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type TreeMap = Record<string, Person | null>;

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const CX = 400;
const CY = 400;
const R_CENTER = 60;
const RING_WIDTH = 100;
const GAP_DEG = 4;

// ─── MODAL ENFANT ─────────────────────────────────────────────────────────────

function EnfantModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [personnes, setPersonnes] = useState<Person[]>([]);
  const [mariages, setMariages] = useState<any[]>([]);
  const [childId, setChildId] = useState("");
  const [parentsUnionId, setParentsUnionId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/person").then((r) => r.json()),
      fetch("/api/mariage").then((r) => r.json()),
    ]).then(([personnesRes, mariagesRes]) => {
      setPersonnes(personnesRes.data ?? []);
      setMariages(mariagesRes.data ?? []);
    });
  }, []);

  async function handleSubmit() {
    if (!childId || !parentsUnionId) return;
    await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ child: childId, parentsUnion: parentsUnionId }),
    });
    onSave();
    onClose();
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <h3 style={modalTitleStyle}>Ajouter un enfant</h3>
        <div style={fieldStyle}>
          <label style={labelStyle}>Enfant *</label>
          <select value={childId} onChange={(e) => setChildId(e.target.value)} style={selectStyle}>
            <option value="">-- Choisir l'enfant --</option>
            {personnes.map((p) => (
              <option key={p._id} value={p._id}>{p.firstName} {p.lastName ?? ""}</option>
            ))}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Mariage des parents *</label>
          <select value={parentsUnionId} onChange={(e) => setParentsUnionId(e.target.value)} style={selectStyle}>
            <option value="">-- Choisir le mariage --</option>
            {mariages.map((m) => (
              <option key={m._id} value={m._id}>
                {m.spouse1?.firstName ?? "?"} {m.spouse1?.lastName ?? ""} × {m.spouse2?.firstName ?? "?"} {m.spouse2?.lastName ?? ""}
              </option>
            ))}
          </select>
        </div>
        <div style={btnRowStyle}>
          <button style={btnSecStyle} onClick={onClose}>Annuler</button>
          <button style={btnPrimStyle} disabled={!childId || !parentsUnionId} onClick={handleSubmit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL MARIAGE ────────────────────────────────────────────────────────────

function MariageModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [personnes, setPersonnes] = useState<Person[]>([]);
  const [spouse1, setSpouse1] = useState("");
  const [spouse2, setSpouse2] = useState("");
  const [marriedAt, setMarriedAt] = useState("");

  useEffect(() => {
    fetch("/api/person").then((r) => r.json()).then((data) => setPersonnes(data.data ?? []));
  }, []);

  async function handleSubmit() {
    if (!spouse1 || !spouse2 || spouse1 === spouse2) return;
    await fetch("/api/mariage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spouse1, spouse2, marriedAt: marriedAt || undefined }),
    });
    onSave();
    onClose();
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <h3 style={modalTitleStyle}>Ajouter un mariage</h3>
        <div style={fieldStyle}>
          <label style={labelStyle}>Conjoint 1 *</label>
          <select value={spouse1} onChange={(e) => setSpouse1(e.target.value)} style={selectStyle}>
            <option value="">-- Choisir --</option>
            {personnes.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName ?? ""}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Conjoint 2 *</label>
          <select value={spouse2} onChange={(e) => setSpouse2(e.target.value)} style={selectStyle}>
            <option value="">-- Choisir --</option>
            {personnes.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName ?? ""}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Date de mariage</label>
          <input type="date" value={marriedAt} onChange={(e) => setMarriedAt(e.target.value)} style={inputStyle} />
        </div>
        {spouse1 && spouse2 && spouse1 === spouse2 && (
          <p style={{ color: "#e53e3e", fontSize: 12, marginBottom: 8 }}>Les deux conjoints doivent être différents</p>
        )}
        <div style={btnRowStyle}>
          <button style={btnSecStyle} onClick={onClose}>Annuler</button>
          <button style={btnPrimStyle} disabled={!spouse1 || !spouse2 || spouse1 === spouse2} onClick={handleSubmit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PERSONNE ───────────────────────────────────────────────────────────

function PersonModal({
  sectorId, currentPerson, onClose, onSave,
}: {
  sectorId: string;
  currentPerson: Person | null;
  onClose: () => void;
  onSave: (id: string, person: Person | null) => void;
}) {
  const [firstName, setFirstName] = useState(currentPerson?.firstName ?? "");
  const [lastName, setLastName] = useState(currentPerson?.lastName ?? "");
  const [birthdate, setBirthdate] = useState(currentPerson?.birthdate ?? "");
  const [deathdate, setDeathdate] = useState(currentPerson?.deathdate ?? "");

  return (
    <div style={{ ...overlayStyle, zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <h3 style={modalTitleStyle}>{currentPerson ? "Modifier" : "Ajouter"} — secteur {sectorId}</h3>
        <div style={fieldStyle}>
          <label style={labelStyle}>Prénom *</label>
          <input autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Nom</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Date de naissance</label>
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Date de décès</label>
          <input type="date" value={deathdate} onChange={(e) => setDeathdate(e.target.value)} style={inputStyle} />
        </div>
        <div style={btnRowStyle}>
          {currentPerson && (
            <button style={btnDangerStyle} onClick={() => { onSave(sectorId, null); onClose(); }}>Supprimer</button>
          )}
          <button style={btnSecStyle} onClick={onClose}>Annuler</button>
          <button
            style={btnPrimStyle}
            disabled={!firstName.trim()}
            onClick={() => {
              onSave(sectorId, {
                _id: currentPerson?._id ?? crypto.randomUUID(),
                firstName: firstName.trim(),
                lastName: lastName.trim() || undefined,
                birthdate: birthdate || null,
                deathdate: deathdate || null,
                createdAt: currentPerson?.createdAt ?? new Date(),
                updatedAt: new Date(),
              });
              onClose();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function Header({ onLogout }: { onLogout: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.isAdmin || false;

  return (
    <header style={{
      background: "#1a1a2e",
      borderBottom: "1px solid #2d2d4e",
      padding: "16px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "#e2e8f0",
    }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Généalogie</h1>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            style={{
              padding: "8px 16px",
              background: "#7c6aff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#9984ff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#7c6aff";
            }}
          >
            👨‍💼 Admin
          </button>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            background: "#c53030",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#e53e3e";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#c53030";
          }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

// ─── PANNEAU LATÉRAL ──────────────────────────────────────────────────────────

function SidePanel({
  onSelectPerson,
  selectedId,
  onDeletePerson,
  onRefresh,
  refreshTrigger,
  isAdmin,
}: {
  onSelectPerson: (person: Person) => void;
  selectedId: string | null;
  onDeletePerson: (personId: string, e: React.MouseEvent) => void;
  onRefresh?: () => Promise<void>;
  refreshTrigger?: number;
  isAdmin: boolean;
}) {
  const [personnes, setPersonnes] = useState<Person[]>([]);
  const [recherche, setRecherche] = useState("");

  const loadPersonnes = async () => {
    const data = await fetch("/api/person").then((r) => r.json());
    setPersonnes(data.data ?? []);
  };

  useEffect(() => {
    loadPersonnes();
  }, [refreshTrigger]);

  const handleDelete = async (personId: string, e: React.MouseEvent) => {
    await onDeletePerson(personId, e);
    if (onRefresh) {
      await onRefresh();
    }
    await loadPersonnes();
  };

  const personneFiltrees = useMemo(() => {
    return [...personnes]
      .filter((p) => {
        const fullName = `${p.firstName} ${p.lastName ?? ""}`.toLowerCase();
        return fullName.includes(recherche.toLowerCase());
      })
      .sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName ?? ""}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName ?? ""}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [personnes, recherche]);

  return (
    <div style={{
      width: 260,
      minWidth: 260,
      background: "#1a1a2e",
      borderLeft: "1px solid #2d2d4e",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #2d2d4e" }}>
        <p style={{ color: "#a0aec0", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
          Membres ({personnes.length})
        </p>
        {/* Barre de recherche */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "#4a5568", fontSize: 14,
          }}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px 8px 32px",
              background: "#0d0d1a",
              border: "1px solid #2d2d4e",
              borderRadius: 8,
              color: "#e2e8f0",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Liste */}
      <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
        {personneFiltrees.length === 0 ? (
          <p style={{ color: "#4a5568", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            Aucune personne trouvée
          </p>
        ) : (
          personneFiltrees.map((p) => {
            const isSelected = p._id === selectedId;
            return (
              <div
                key={p._id}
                onClick={() => onSelectPerson(p)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  background: isSelected ? "#2d2d4e" : "transparent",
                  borderLeft: isSelected ? "3px solid #7c6aff" : "3px solid transparent",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#16213e";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>
                  {p.firstName} {p.lastName ?? ""}
                  </span>
                  {p.birthdate && !p.deathdate ? (
                      <span style={{ color: "#4a5568", fontSize: 11 }}>{Math.floor((new Date().getTime() - new Date(p.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans</span>
                  ) : null}
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(p._id, e)}
                    style={{
                      padding: "4px 8px",
                      background: "#742a2a",
                      color: "#feb2b2",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#9c3c3c";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#742a2a";
                    }}
                  >
                    ✕ Supprimer
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── STYLES PARTAGÉS ──────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 999,
};
const modalStyle: React.CSSProperties = {
  background: "#1a1a2e",
  padding: 28,
  borderRadius: 12,
  minWidth: 300,
  border: "1px solid #2d2d4e",
  color: "#e2e8f0",
};
const modalTitleStyle: React.CSSProperties = {
  marginBottom: 20,
  fontSize: 18,
  fontWeight: 600,
  color: "#e2e8f0",
};
const fieldStyle: React.CSSProperties = { marginBottom: 14 };
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 4,
  fontSize: 12,
  color: "#a0aec0",
  textTransform: "uppercase",
  letterSpacing: 1,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "#0d0d1a",
  border: "1px solid #2d2d4e",
  borderRadius: 6,
  color: "#e2e8f0",
  fontSize: 14,
  boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = { ...inputStyle };
const btnRowStyle: React.CSSProperties = { display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" };
const btnPrimStyle: React.CSSProperties = {
  padding: "8px 18px", background: "#7c6aff", color: "white",
  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
};
const btnSecStyle: React.CSSProperties = {
  padding: "8px 18px", background: "#2d2d4e", color: "#a0aec0",
  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
};
const btnDangerStyle: React.CSSProperties = {
  padding: "8px 18px", background: "#742a2a", color: "#feb2b2",
  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
};

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function FamilyTreePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin || false;
  const [generations, setGenerations] = useState(0);
  const [tree, setTree] = useState<TreeMap>({});
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [openMariageModal, setOpenMariageModal] = useState(false);
  const [openEnfantModal, setOpenEnfantModal] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [sidePanelRefresh, setSidePanelRefresh] = useState(0);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  useEffect(() => {
    chargerArbre(null);
  }, []);

  // ─── chargerArbre ──────────────────────────────────────────────────────────

  async function chargerArbre(personneRacine: Person | null) {
    try {
      const [resPerson, resMariages, resEnfants] = await Promise.all([
        fetch("/api/person"),
        fetch("/api/mariage"),
        fetch("/api/children"),
      ]);

      const personnesRes = await resPerson.json();
      const mariagesRes = await resMariages.json();
      const enfantsRes = await resEnfants.json();

      const personnes: Person[] = personnesRes.data ?? [];
      const mariages: any[] = mariagesRes.data ?? [];
      const enfants: any[] = enfantsRes.data ?? [];

      if (!personnes.length || !mariages.length || !enfants.length) return;

      const nouveauTree: TreeMap = {};
      let generationsTrouvees = 0;

      // ── Génération 0 : enfant racine ──────────────────────────────────────
      // Si une personne est sélectionnée dans le panneau, on la met au centre
      // Sinon on prend le premier enfant de la base
      let enfantRacine: Person | undefined;

      if (personneRacine) {
        enfantRacine = personneRacine;
      } else {
        const lienEnfant0 = enfants[0];
        enfantRacine = personnes.find(
          (p) => String(p._id) === String(lienEnfant0.child._id ?? lienEnfant0.child)
        );
      }

      if (!enfantRacine) return;
      nouveauTree["0-0"] = enfantRacine;
      generationsTrouvees = 0;

      // ── Génération 1 : parents ────────────────────────────────────────────
      const lienEnfant = enfants.find(
        (e) => String(e.child._id ?? e.child) === String(enfantRacine!._id)
      );

      const mariage = lienEnfant
        ? mariages.find((m) => String(m._id) === String(lienEnfant.parentsUnion._id ?? lienEnfant.parentsUnion))
        : null;

      if (mariage) {
        nouveauTree["1-0"] = personnes.find((p) => String(p._id) === String(mariage.spouse1._id ?? mariage.spouse1)) ?? null;
        nouveauTree["1-1"] = personnes.find((p) => String(p._id) === String(mariage.spouse2._id ?? mariage.spouse2)) ?? null;
        generationsTrouvees = 1;

        // ── Génération 2 : grands-parents de parent1 ─────────────────────
        const lienParent1 = enfants.find(
          (e) => String(e.child._id ?? e.child) === String(mariage.spouse1._id ?? mariage.spouse1)
        );
        if (lienParent1) {
          const mariageParent1 = mariages.find(
            (m) => String(m._id) === String(lienParent1.parentsUnion._id ?? lienParent1.parentsUnion)
          );
          if (mariageParent1) {
            nouveauTree["2-0"] = personnes.find((p) => String(p._id) === String(mariageParent1.spouse1._id ?? mariageParent1.spouse1)) ?? null;
            nouveauTree["2-1"] = personnes.find((p) => String(p._id) === String(mariageParent1.spouse2._id ?? mariageParent1.spouse2)) ?? null;
            generationsTrouvees = 2;
          }
        }

        // ── Génération 2 : grands-parents de parent2 ─────────────────────
        const lienParent2 = enfants.find(
          (e) => String(e.child._id ?? e.child) === String(mariage.spouse2._id ?? mariage.spouse2)
        );
        if (lienParent2) {
          const mariageParent2 = mariages.find(
            (m) => String(m._id) === String(lienParent2.parentsUnion._id ?? lienParent2.parentsUnion)
          );
          if (mariageParent2) {
            nouveauTree["2-2"] = personnes.find((p) => String(p._id) === String(mariageParent2.spouse1._id ?? mariageParent2.spouse1)) ?? null;
            nouveauTree["2-3"] = personnes.find((p) => String(p._id) === String(mariageParent2.spouse2._id ?? mariageParent2.spouse2)) ?? null;
            generationsTrouvees = 2;
          }
        }
      }
      // ── Génération 3 : grands-parents des grands-parents ─────────────────────
      if (generationsTrouvees === 2) {
        for (let i = 0; i < 4; i++) {
          const parent = nouveauTree[`2-${i}`];
          if (parent) {
            const lienParent = enfants.find(
              (e) => String(e.child._id ?? e.child) === String(parent._id)
            );
            if (lienParent) {
              const mariageParent = mariages.find(
                (m) => String(m._id) === String(lienParent.parentsUnion._id ?? lienParent.parentsUnion)
              );
              if (mariageParent) {
                nouveauTree[`3-${i * 2}`] = personnes.find((p) => String(p._id) === String(mariageParent.spouse1._id ?? mariageParent.spouse1)) ?? null;
                nouveauTree[`3-${i * 2 + 1}`] = personnes.find((p) => String(p._id) === String(mariageParent.spouse2._id ?? mariageParent.spouse2)) ?? null;
                generationsTrouvees = 3;
              }
            }
          }
        }
      }
      setTree(nouveauTree);
      setGenerations(generationsTrouvees);

    } catch (error) {
      console.error("Erreur lors du chargement de l'arbre :", error);
    }
  }

  // ─── clearGraph ────────────────────────────────────────────────────────────
  function clearGraph(clearAll: boolean = false) {
    if (clearAll) {
      setTree({});
      setGenerations(0);
    } else {
      setTree((prev) => {
        const newTree = { ...prev };
        for (const key in newTree) {
          if (key.startsWith("1-") || key.startsWith("2-")) {
            delete newTree[key];
          }
        }
        return newTree;
      });
      setGenerations(0);
    }
  }

  // ─── handleSelectPerson ───────────────────────────────────────────────────

  function handleSelectPerson(person: Person) {
    setSelectedPersonId(person._id);
    chargerArbre(person);
  }

  // ─── refreshPersonnes ──────────────────────────────────────────────────────

  async function refreshPersonnes() {
    // Cette fonction sera appelée depuis le SidePanel après une suppression
    // Elle permet simplement de déclencher n'importe quel rafraîchissement nécessaire
    // dans le composant parent si besoin
  }

  // ─── handleSvgClick ───────────────────────────────────────────────────────

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const target = e.target as SVGElement;
    if (target.closest("[data-sector]")) return;
    if (generations < 3) setGenerations((g) => g + 1);
  }

  // ─── handleSave ───────────────────────────────────────────────────────────

  async function handleSave(sectorId: string, person: Person | null) {
    setTree((prev) => ({ ...prev, [sectorId]: person }));

    if (person === null) {
      const anciennePersonne = tree[sectorId];
      if (anciennePersonne?._id) {
        await fetch(`/api/person/${anciennePersonne._id}`, { method: "DELETE" });
      }
      return;
    }

    const estEnBase = person._id.length === 24;

    if (estEnBase) {
      await fetch(`/api/person/${person._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: person.firstName, lastName: person.lastName, birthdate: person.birthdate, deathdate: person.deathdate }),
      });
    } else {
      const res = await fetch("/api/person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: person.firstName, lastName: person.lastName, birthdate: person.birthdate, deathdate: person.deathdate }),
      });
      const nouvellePersonne = await res.json();
      setTree((prev) => ({ ...prev, [sectorId]: nouvellePersonne }));
    }
    
    // Rafraîchir le SidePanel
    setSidePanelRefresh((prev) => prev + 1);
  }


   // ─── handleDeletePerson ───────────────────────────────────────────────────

  async function handleDeletePerson(personId: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    // Vérifier que l'utilisateur est admin
    if (!isAdmin) {
      alert("Vous n'avez pas les permissions pour supprimer une personne");
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette personne ? Tous les mariages et liens familiaux seront également supprimés.")) {
      return;
    }

    try {
      // Récupérer tous les data en parallèle
      const [mariagesRes, enfantsRes] = await Promise.all([
        fetch("/api/mariage"),
        fetch("/api/children"),
      ]);
      
      const mariagesData = await mariagesRes.json();
      const enfantsData = await enfantsRes.json();
      
      const mariages = mariagesData.data ?? [];
      let enfants = enfantsData.data ?? [];

      // Trouver et supprimer les mariages de cette personne
      const mariagesASupprimer = mariages.filter((m: any) => 
        String(m.spouse1._id ?? m.spouse1) === personId || 
        String(m.spouse2._id ?? m.spouse2) === personId
      );

      for (const mariage of mariagesASupprimer) {
        const enfantsASupprimer = enfants.filter((e: any) => 
          String(e.parentsUnion._id ?? e.parentsUnion) === String(mariage._id)
        );

        for (const enfant of enfantsASupprimer) {
          await fetch(`/api/children/${enfant._id}`, { method: "DELETE" });
        }

        await fetch(`/api/mariage/${mariage._id}`, { method: "DELETE" });
      }

      // Trouver et supprimer les enfants liés à cette personne
      const liensEnfantASupprimer = enfants.filter((e: any) => 
        String(e.child._id ?? e.child) === personId
      );

      for (const lien of liensEnfantASupprimer) {
        await fetch(`/api/children/${lien._id}`, { method: "DELETE" });
      }

      // Supprimer la personne
      const res = await fetch(`/api/person/${personId}`, { method: "DELETE" });
      
      if (res.ok) {
        await chargerArbre(null);
        alert("Personne supprimée avec succès, ainsi que tous ses liens familiaux.");
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression : " + (error instanceof Error ? error.message : String(error)));
    }
  }

  // ─── Rendu SVG ────────────────────────────────────────────────────────────

// Dans la fonction renderCenterCircle()
function renderCenterCircle() {
  const person = tree["0-0"] ?? null;
  return (
    <g key="0-0" data-sector="true" style={{ cursor: isAdmin ? "pointer" : "default" }} onClick={(e) => { if (isAdmin) { e.stopPropagation(); setOpenModal("0-0"); } }}>
      <circle cx={CX} cy={CY} r={R_CENTER} fill="#2d2d4e" stroke={isAdmin ? "#7c6aff" : "#4a5568"} strokeWidth={2} />
      <text x={CX} y={CY - 6} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#e2e8f0">
        <tspan x={CX} dy={0}>{person ? person.firstName : (isAdmin ? "+" : "")}</tspan>
        <tspan x={CX} dy={16}>{person ? (person.lastName ?? "") : ""}</tspan>
      </text>
    </g>
  );
}

// Dans la fonction renderRings()
function renderRings() {
  const elements: React.ReactNode[] = [];
  for (let g = 1; g <= generations; g++) {
    const totalInGen = Math.pow(2, g);
    const innerR = R_CENTER + (g - 1) * RING_WIDTH;
    const outerR = R_CENTER + g * RING_WIDTH;
    for (let i = 0; i < totalInGen; i++) {
      const sectorId = `${g}-${i}`;
      const person = tree[sectorId] ?? null;
      const anglePer = 360 / totalInGen;
      const startDeg = i * anglePer + GAP_DEG / 2;
      const endDeg = (i + 1) * anglePer - GAP_DEG / 2;
      const pathD = describeArc(CX, CY, innerR, outerR, startDeg, endDeg);
      const labelP = getLabelPos(CX, CY, innerR, outerR, startDeg, endDeg);
      elements.push(
        <g key={sectorId} data-sector="true" style={{ cursor: isAdmin ? "pointer" : "default" }} onClick={(e) => { if (isAdmin) { e.stopPropagation(); setOpenModal(sectorId); } }}>
          <path d={pathD} fill={person ? "#16213e" : "#0d0d1a"} stroke="#2d2d4e" strokeWidth={1.5} opacity={isAdmin ? 1 : 0.6} />
          <text x={labelP.x} y={labelP.y - 6} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill={person ? "#e2e8f0" : "#4a5568"} style={{ pointerEvents: "none", userSelect: "none" }}>
            <tspan x={labelP.x} dy={0}>{person ? person.firstName : (isAdmin ? "+" : "")}</tspan>
            <tspan x={labelP.x} dy={13}>{person ? (person.lastName ?? "") : ""}</tspan>
          </text>
        </g>
      );
    }
  }
  return elements;
}

  const svgSize = (R_CENTER + Math.max(generations, 1) * RING_WIDTH + 20) * 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0d0d1a" }}>
      {/* ── Header ── */}
      <Header onLogout={handleLogout} />

      {/* ── Main content ── */}
      <div style={{ display: "flex", flex: 1 }}>
      {/* ── Zone principale ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: 32, overflowY: "auto" }}>

        <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5 }}>
          Arbre Généalogique
        </h1>
        <p style={{ marginBottom: 20, color: "#4a5568", fontSize: 14 }}>
          {!isAdmin ? (
            <>Mode lecture seule · Authentifiez-vous comme admin pour modifier</>
          ) : (
            <>
              {generations < 3 ? "Cliquez sur le fond pour ajouter une génération" : "Nombre maximum de générations atteint"}
              {" · "}
              Cliquez sur un secteur pour modifier
            </>
          )}
        </p>

        {/* Boutons d'action */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setOpenMariageModal(true)}
            disabled={!isAdmin}
            style={{ ...btnPrimStyle, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? "pointer" : "not-allowed" }}
          >
            + Mariage
          </button>
          <button
            onClick={() => setOpenEnfantModal(true)}
            disabled={!isAdmin}
            style={{ ...btnPrimStyle, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? "pointer" : "not-allowed" }}
          >
            + Enfant
          </button>
          <button
            onClick={() => clearGraph(true)}
            disabled={!isAdmin}
            style={{ ...btnPrimStyle, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? "pointer" : "not-allowed" }}
          >
            clear
          </button>
        </div>

        {/* SVG */}
        <svg
          width={svgSize} height={svgSize}
          viewBox={`${CX - svgSize / 2} ${CY - svgSize / 2} ${svgSize} ${svgSize}`}
          style={{ border: "1px solid #2d2d4e", background: "#0d0d1a", borderRadius: 12, cursor: isAdmin ? "crosshair" : "default", opacity: isAdmin ? 1 : 0.7 }}
          onClick={(e) => { if (isAdmin) handleSvgClick(e); }}
        >
          {renderCenterCircle()}
          {renderRings()}
        </svg>

        <p style={{ marginTop: 12, color: "#2d2d4e", fontSize: 12 }}>
          Générations affichées : {generations} / 3
        </p>
      </div>

        {/* ── Panneau latéral droit ── */}
        <SidePanel
          onSelectPerson={handleSelectPerson}
          selectedId={selectedPersonId}
          onDeletePerson={handleDeletePerson}
          onRefresh={refreshPersonnes}
          refreshTrigger={sidePanelRefresh}
          isAdmin={isAdmin}
        />
      </div>

      {/* ── Modals ── */}
      {openModal && (
        <PersonModal
          sectorId={openModal}
          currentPerson={tree[openModal] ?? null}
          onClose={() => setOpenModal(null)}
          onSave={handleSave}
        />
      )}
      {openMariageModal && (
        <MariageModal
          onClose={() => setOpenMariageModal(false)}
          onSave={() => chargerArbre(null)}
        />
      )}
      {openEnfantModal && (
        <EnfantModal
          onClose={() => setOpenEnfantModal(false)}
          onSave={() => chargerArbre(null)}
        />
      )}
    </div>
  );
}


