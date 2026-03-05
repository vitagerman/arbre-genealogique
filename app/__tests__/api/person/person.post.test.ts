// __tests__/api/person/person.post.test.ts

import { POST } from "@/app/api/person/route";

// ─── MOCKS ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/Person", () => {
  const mockSave = jest.fn();
  const mockConstructor = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: { toString: () => "111111111111111111111111" },
    createdAt: new Date("2024-01-01"),
    save: mockSave,
  }));

  return {
    __esModule: true,
    default: mockConstructor,
  };
});

// ─── HELPER ───────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/person", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe("POST /api/person", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── STATUS ───────────────────────────────────────────────────────────────

  it("retourne 201 si la personne est créée", async () => {
    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);

    expect(res.status).toBe(201);
  });

  it("retourne 400 si firstName est manquant", async () => {
    const req = makeRequest({ lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("retourne 400 si le body est vide", async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // ─── BODY ─────────────────────────────────────────────────────────────────

  it("retourne les bonnes données après création", async () => {
    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);
    const body = await res.json();

    expect(body).toMatchObject({
      _id: "111111111111111111111111",
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });
  });

  it("retourne un message d'erreur si firstName est manquant", async () => {
    const req = makeRequest({ lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);
    const body = await res.json();

    expect(body.message).toBe("Le prénom est requis");
  });

  it("retourne un _id en string", async () => {
    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);
    const body = await res.json();

    expect(typeof body._id).toBe("string");
  });

  it("retourne birthdate à null si non fournie", async () => {
    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);
    const body = await res.json();

    expect(body.birthdate).toBeNull();
  });

  it("retourne une date createdAt en ISO string", async () => {
    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);
    const body = await res.json();

    expect(typeof body.createdAt).toBe("string");
    expect(() => new Date(body.createdAt)).not.toThrow();
  });

  // ─── ERREUR SERVEUR ───────────────────────────────────────────────────────

  it("retourne 500 en cas d'erreur serveur", async () => {
    const People = require("@/models/Person").default;
    People.mockImplementationOnce(() => ({
      save: jest.fn().mockRejectedValueOnce(new Error("Erreur DB")),
      _id: { toString: () => "111111111111111111111111" },
      firstName: "Jean",
      createdAt: new Date(),
    }));

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Erreur serveur");
  });

  // ─── APPELS ───────────────────────────────────────────────────────────────

  it("appelle le constructeur People avec les bonnes données", async () => {
    const People = require("@/models/Person").default;

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    await POST(req);

    expect(People).toHaveBeenCalledWith({
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });
  });
});