// __tests__/api/children/children.test.ts

import { GET, POST, DELETE } from "@/app/api/children/route";

// ─── MOCKS ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn(),
}));

jest.mock("@/models/Children", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// ─── DONNÉES MOCK ─────────────────────────────────────────────────────────────

const mockChildren = [
  {
    _id: "111111111111111111111111",
    child: { _id: "222222222222222222222222", firstName: "Jean", lastName: "Dupont" },
    parentsUnion: { _id: "333333333333333333333333", spouse1: "444444444444444444444444", spouse2: "555555555555555555555555" },
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "666666666666666666666666",
    child: { _id: "777777777777777777777777", firstName: "Marie", lastName: "Martin" },
    parentsUnion: { _id: "888888888888888888888888", spouse1: "999999999999999999999999", spouse2: "000000000000000000000000" },
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

// ─── TESTS GET ────────────────────────────────────────────────────────────────

describe("GET /api/children", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne un status 200", async () => {
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockChildren),
          }),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("retourne success: true", async () => {
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockChildren),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("retourne un tableau d'enfants", async () => {
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockChildren),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("retourne le bon nombre d'enfants", async () => {
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockChildren),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();
    expect(body.data).toHaveLength(2);
  });

  it("retourne les bonnes données pour chaque enfant", async () => {
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockChildren),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();

    expect(body.data[0]).toMatchObject({
      _id: "111111111111111111111111",
      child: { firstName: "Jean", lastName: "Dupont" },
    });

    expect(body.data[1]).toMatchObject({
      _id: "666666666666666666666666",
      child: { firstName: "Marie", lastName: "Martin" },
    });
  });

  it("retourne un tableau vide si aucun enfant", async () => {
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
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
    const Child = require("@/models/Children").default;
    Child.find.mockReturnValue({
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

describe("POST /api/children", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(body: object) {
    return new Request("http://localhost/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    jest.mock("@/models/Children", () => {
      const mockSave = jest.fn();
      const mockConstructor = jest.fn().mockImplementation(() => ({
        _id: { toString: () => "111111111111111111111111" },
        save: mockSave,
      }));
      return { __esModule: true, default: mockConstructor };
    });
  });

  it("retourne 400 si child est manquant", async () => {
    const req = makeRequest({ parentsUnion: "333333333333333333333333" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si parentsUnion est manquant", async () => {
    const req = makeRequest({ child: "222222222222222222222222" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si le body est vide", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne un message d'erreur si child est manquant", async () => {
    const req = makeRequest({ parentsUnion: "333333333333333333333333" });
    const res = await POST(req);
    const body = await res.json();
    expect(body.message).toBe("L'enfant et l'union des parents sont requis");
  });
});

// ─── TESTS DELETE ─────────────────────────────────────────────────────────────

describe("DELETE /api/children", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 200 si tous les enfants sont supprimés", async () => {
    const Child = require("@/models/Children").default;
    Child.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const res = await DELETE();
    expect(res.status).toBe(200);
  });

  it("retourne le bon message de confirmation", async () => {
    const Child = require("@/models/Children").default;
    Child.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const res = await DELETE();
    const body = await res.json();
    expect(body.message).toBe("Tous les enfants ont été supprimés");
  });

  it("appelle deleteMany avec un objet vide", async () => {
    const Child = require("@/models/Children").default;
    Child.deleteMany.mockResolvedValueOnce({ deletedCount: 0 });

    await DELETE();
    expect(Child.deleteMany).toHaveBeenCalledWith({});
  });

  it("retourne 500 en cas d'erreur serveur", async () => {
    const Child = require("@/models/Children").default;
    Child.deleteMany.mockRejectedValueOnce(new Error("Erreur DB"));

    const res = await DELETE();
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.message).toBe("Erreur serveur");
  });
});