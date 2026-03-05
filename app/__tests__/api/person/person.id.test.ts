// __tests__/api/person/person.id.test.ts

import { PUT, DELETE } from "@/app/api/person/[id]/route";

// ─── MOCKS ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/Person", () => ({
  __esModule: true,
  default: {
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/person/111111111111111111111111", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const fakeParams = Promise.resolve({ id: "111111111111111111111111" });

// ─── TESTS PUT ────────────────────────────────────────────────────────────────

describe("PUT /api/person/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 200 si la personne est mise à jour", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "111111111111111111111111",
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await PUT(req, { params: fakeParams });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Personne mise à jour");
  });

  it("retourne les données mises à jour", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "111111111111111111111111",
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await PUT(req, { params: fakeParams });
    const body = await res.json();

    expect(body.data).toMatchObject({
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });
  });

  it("retourne 404 si la personne n'existe pas", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndUpdate.mockResolvedValueOnce(null);

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await PUT(req, { params: fakeParams });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Personne non trouvée");
  });

  it("retourne 500 en cas d'erreur serveur", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndUpdate.mockRejectedValueOnce(new Error("Erreur DB"));

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    const res = await PUT(req, { params: fakeParams });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Erreur serveur");
  });

  it("appelle findByIdAndUpdate avec le bon id", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndUpdate.mockResolvedValueOnce({ firstName: "Jean" });

    const req = makeRequest({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });
    await PUT(req, { params: fakeParams });

    expect(People.findByIdAndUpdate).toHaveBeenCalledWith(
      "111111111111111111111111",
      expect.objectContaining({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null }),
      { new: true }
    );
  });
});

// ─── TESTS DELETE ─────────────────────────────────────────────────────────────

describe("DELETE /api/person/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 200 si la personne est supprimée", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndDelete.mockResolvedValueOnce({
      _id: "111111111111111111111111",
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });

    const req = new Request("http://localhost/api/person/111111111111111111111111", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: fakeParams });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Personne supprimée");
  });

  it("retourne 404 si la personne n'existe pas", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndDelete.mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/person/111111111111111111111111", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: fakeParams });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Personne non trouvée");
  });

  it("retourne 500 en cas d'erreur serveur", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndDelete.mockRejectedValueOnce(new Error("Erreur DB"));

    const req = new Request("http://localhost/api/person/111111111111111111111111", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: fakeParams });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Erreur serveur");
  });

  it("appelle findByIdAndDelete avec le bon id", async () => {
    const People = require("@/models/Person").default;
    People.findByIdAndDelete.mockResolvedValueOnce({ firstName: "Jean", lastName: "Dupont", birthdate: null, deathdate: null });

    const req = new Request("http://localhost/api/person/111111111111111111111111", {
      method: "DELETE",
    });
    await DELETE(req, { params: fakeParams });

    expect(People.findByIdAndDelete).toHaveBeenCalledWith(
      "111111111111111111111111"
    );
  });
});