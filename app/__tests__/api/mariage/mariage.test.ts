// __tests__/api/mariage/mariage.test.ts

import { GET, POST, DELETE } from "@/app/api/mariage/route";

// ─── MOCKS ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/Mariage", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// ─── DONNÉES MOCK ─────────────────────────────────────────────────────────────

const mockMariages = [
  {
    _id: "111111111111111111111111",
    spouse1: { _id: "222222222222222222222222", firstName: "Jean", lastName: "Dupont" },
    spouse2: { _id: "333333333333333333333333", firstName: "Marie", lastName: "Martin" },
    marriedAt: "2000-06-15T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "444444444444444444444444",
    spouse1: { _id: "555555555555555555555555", firstName: "Pierre", lastName: "Durand" },
    spouse2: { _id: "666666666666666666666666", firstName: "Sophie", lastName: "Bernard" },
    marriedAt: "1995-09-20T00:00:00.000Z",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

// ─── HELPER ───────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/mariage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── TESTS GET ────────────────────────────────────────────────────────────────

describe("GET /api/mariage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne un status 200", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMariages),
          }),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("retourne success: true", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMariages),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("retourne un tableau de mariages", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMariages),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("retourne le bon nombre de mariages", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMariages),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(body.data).toHaveLength(2);
  });

  it("retourne les bonnes données pour chaque mariage", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMariages),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();

    expect(body.data[0]).toMatchObject({
      _id: "111111111111111111111111",
      spouse1: { firstName: "Jean", lastName: "Dupont" },
      spouse2: { firstName: "Marie", lastName: "Martin" },
    });

    expect(body.data[1]).toMatchObject({
      _id: "444444444444444444444444",
      spouse1: { firstName: "Pierre", lastName: "Durand" },
      spouse2: { firstName: "Sophie", lastName: "Bernard" },
    });
  });

  it("retourne un tableau vide si aucun mariage", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it("retourne 500 en cas d'erreur serveur", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockRejectedValueOnce(new Error("Erreur DB")),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});

// ─── TESTS POST ───────────────────────────────────────────────────────────────

describe("POST /api/mariage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mock("@/models/Mariage", () => {
      const mockSave = jest.fn();
      const mockConstructor = jest.fn().mockImplementation((data) => ({
        ...data,
        _id: { toString: () => "111111111111111111111111" },
        save: mockSave,
      }));
      return { __esModule: true, default: mockConstructor };
    });
  });

  it("retourne 400 si spouse1 est manquant", async () => {
    const req = makeRequest({ spouse2: "333333333333333333333333" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si spouse2 est manquant", async () => {
    const req = makeRequest({ spouse1: "222222222222222222222222" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si le body est vide", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne un message d'erreur si spouse1 est manquant", async () => {
    const req = makeRequest({ spouse2: "333333333333333333333333" });
    const res = await POST(req);
    const body = await res.json();
    expect(body.message).toBe("Les deux conjoints sont requis");
  });

  it("retourne un message d'erreur si spouse2 est manquant", async () => {
    const req = makeRequest({ spouse1: "222222222222222222222222" });
    const res = await POST(req);
    const body = await res.json();
    expect(body.message).toBe("Les deux conjoints sont requis");
  });
});

// ─── TESTS DELETE ─────────────────────────────────────────────────────────────

describe("DELETE /api/mariage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 200 si tous les mariages sont supprimés", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const res = await DELETE();
    expect(res.status).toBe(200);
  });

  it("retourne le bon message de confirmation", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const res = await DELETE();
    const body = await res.json();
    expect(body.message).toBe("Tous les mariages ont été supprimés");
  });

  it("appelle deleteMany avec un objet vide", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.deleteMany.mockResolvedValueOnce({ deletedCount: 0 });

    await DELETE();
    expect(Mariage.deleteMany).toHaveBeenCalledWith({});
  });

  it("retourne 500 en cas d'erreur serveur", async () => {
    const Mariage = require("@/models/Mariage").default;
    Mariage.deleteMany.mockRejectedValueOnce(new Error("Erreur DB"));

    const res = await DELETE();
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.message).toBe("Erreur serveur");
  });
});