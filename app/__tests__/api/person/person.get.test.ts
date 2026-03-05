// __tests__/api/person/person.get.test.ts

import { GET } from "@/app/api/person/route";

// ─── MOCKS ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/Person", () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: { toString: () => "111111111111111111111111" },
            firstName: "Jean",
            lastName: "Dupont",
            birthdate: null,
            deathdate: null,
            createdAt: { toISOString: () => "2024-01-01T00:00:00.000Z" },
          },
          {
            _id: { toString: () => "222222222222222222222222" },
            firstName: "Marie",
            lastName: "Martin",
            birthdate: null,
            deathdate: null,
            createdAt: { toISOString: () => "2024-01-02T00:00:00.000Z" },
          },
        ]),
      }),
    }),
  },
}));

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe("GET /api/person", () => {
  it("retourne un status 200", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("retourne success: true", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("retourne un tableau de personnes", async () => {
    const res = await GET();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("retourne le bon nombre de personnes", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.data).toHaveLength(2);
  });

  it("retourne les bonnes données pour chaque personne", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.data[0]).toMatchObject({
      _id: "111111111111111111111111",
      firstName: "Jean",
      lastName: "Dupont",
      birthdate: null,
      deathdate: null,
    });

    expect(body.data[1]).toMatchObject({
      _id: "222222222222222222222222",
      firstName: "Marie",
      lastName: "Martin",
      birthdate: null,
      deathdate: null,
    });
  });

  it("retourne les _id en string et non en ObjectId", async () => {
    const res = await GET();
    const body = await res.json();
    expect(typeof body.data[0]._id).toBe("string");
  });

  it("retourne les dates en format ISO string", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.data[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("retourne success: false et status 500 en cas d'erreur", async () => {
    const People = require("@/models/Person").default;
    People.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValueOnce(new Error("Erreur DB")),
      }),
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});