import { polarToCart, describeArc, getLabelPos } from "@/app/utils/svg";

// ─── TESTS polarToCart ────────────────────────────────────────────────────────

describe("polarToCart", () => {

  // ─── ANGLES CARDINAUX ───────────────────────────────────────────────────────

  it("retourne le point au nord pour 0°", () => {
    const point = polarToCart(400, 400, 100, 0);
    expect(point.x).toBeCloseTo(400);
    expect(point.y).toBeCloseTo(300); // 400 - 100
  });

  it("retourne le point à droite pour 90°", () => {
    const point = polarToCart(400, 400, 100, 90);
    expect(point.x).toBeCloseTo(500); // 400 + 100
    expect(point.y).toBeCloseTo(400);
  });

  it("retourne le point au sud pour 180°", () => {
    const point = polarToCart(400, 400, 100, 180);
    expect(point.x).toBeCloseTo(400);
    expect(point.y).toBeCloseTo(500); // 400 + 100
  });

  it("retourne le point à gauche pour 270°", () => {
    const point = polarToCart(400, 400, 100, 270);
    expect(point.x).toBeCloseTo(300); // 400 - 100
    expect(point.y).toBeCloseTo(400);
  });

  // ─── RAYON ──────────────────────────────────────────────────────────────────

  it("retourne le centre si le rayon est 0", () => {
    const point = polarToCart(400, 400, 0, 45);
    expect(point.x).toBeCloseTo(400);
    expect(point.y).toBeCloseTo(400);
  });

  it("double la distance si le rayon est doublé", () => {
    const p1 = polarToCart(0, 0, 100, 0);
    const p2 = polarToCart(0, 0, 200, 0);
    expect(p2.y).toBeCloseTo(p1.y * 2);
  });

  // ─── CENTRE ─────────────────────────────────────────────────────────────────

  it("fonctionne avec un centre différent de (400, 400)", () => {
    const point = polarToCart(0, 0, 100, 0);
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(-100);
  });

  it("fonctionne avec un centre négatif", () => {
    const point = polarToCart(-100, -100, 100, 90);
    expect(point.x).toBeCloseTo(0);   // -100 + 100
    expect(point.y).toBeCloseTo(-100);
  });

  // ─── RETOUR ─────────────────────────────────────────────────────────────────

  it("retourne un objet avec x et y", () => {
    const point = polarToCart(400, 400, 100, 45);
    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });

  it("retourne des nombres", () => {
    const point = polarToCart(400, 400, 100, 45);
    expect(typeof point.x).toBe("number");
    expect(typeof point.y).toBe("number");
  });
});

// ─── TESTS describeArc ────────────────────────────────────────────────────────

describe("describeArc", () => {

  // ─── FORMAT ─────────────────────────────────────────────────────────────────

  it("retourne une string", () => {
    const path = describeArc(400, 400, 60, 160, 0, 90);
    expect(typeof path).toBe("string");
  });

  it("retourne un path SVG qui commence par M", () => {
    const path = describeArc(400, 400, 60, 160, 0, 90);
    expect(path.startsWith("M")).toBe(true);
  });

  it("retourne un path SVG qui se termine par Z", () => {
    const path = describeArc(400, 400, 60, 160, 0, 90);
    expect(path.endsWith("Z")).toBe(true);
  });

  it("contient deux commandes A (arcs)", () => {
    const path = describeArc(400, 400, 60, 160, 0, 90);
    const arcs = path.match(/A/g);
    expect(arcs).toHaveLength(2);
  });

  it("contient une commande L (ligne)", () => {
    const path = describeArc(400, 400, 60, 160, 0, 90);
    const lines = path.match(/L/g);
    expect(lines).toHaveLength(1);
  });

  // ─── LARGE ARC ──────────────────────────────────────────────────────────────

  it("utilise largeArc=0 pour un arc inférieur à 180°", () => {
    const path = describeArc(400, 400, 60, 160, 0, 90);
    // Le flag largeArc est le 4ème paramètre de la commande A : "A rx ry 0 largeArc sweep x y"
    const match = path.match(/A \d+ \d+ 0 (\d) 1/);
    expect(match?.[1]).toBe("0");
  });

  it("utilise largeArc=1 pour un arc supérieur à 180°", () => {
    const path = describeArc(400, 400, 60, 160, 0, 270);
    const match = path.match(/A \d+ \d+ 0 (\d) 1/);
    expect(match?.[1]).toBe("1");
  });

  // ─── COHÉRENCE ──────────────────────────────────────────────────────────────

  it("produit un path différent si innerR change", () => {
    const path1 = describeArc(400, 400, 60, 160, 0, 90);
    const path2 = describeArc(400, 400, 80, 160, 0, 90);
    expect(path1).not.toBe(path2);
  });

  it("produit un path différent si l'angle change", () => {
    const path1 = describeArc(400, 400, 60, 160, 0, 90);
    const path2 = describeArc(400, 400, 60, 160, 0, 180);
    expect(path1).not.toBe(path2);
  });
});

// ─── TESTS getLabelPos ────────────────────────────────────────────────────────

describe("getLabelPos", () => {

  // ─── RETOUR ─────────────────────────────────────────────────────────────────

  it("retourne un objet avec x et y", () => {
    const pos = getLabelPos(400, 400, 60, 160, 0, 90);
    expect(pos).toHaveProperty("x");
    expect(pos).toHaveProperty("y");
  });

  it("retourne des nombres", () => {
    const pos = getLabelPos(400, 400, 60, 160, 0, 90);
    expect(typeof pos.x).toBe("number");
    expect(typeof pos.y).toBe("number");
  });

  // ─── POSITION ───────────────────────────────────────────────────────────────

  it("retourne un point au rayon moyen entre innerR et outerR", () => {
    // Au nord (angle moyen = 0°), x doit être proche du centre
    // et y à (innerR + outerR) / 2 au-dessus du centre
    const innerR = 60;
    const outerR = 160;
    const rayonMoyen = (innerR + outerR) / 2; // 110

    const pos = getLabelPos(400, 400, innerR, outerR, -45, 45); // angle moyen = 0°
    expect(pos.x).toBeCloseTo(400);
    expect(pos.y).toBeCloseTo(400 - rayonMoyen); // 290
  });

// Option 2 — changer les angles pour éviter la symétrie
it("retourne un point différent si les angles changent", () => {
  const pos1 = getLabelPos(400, 400, 60, 160, 0, 60);   // angle moyen = 30°
  const pos2 = getLabelPos(400, 400, 60, 160, 90, 180);  // angle moyen = 135°
  expect(pos1.x).not.toBeCloseTo(pos2.x); // x est différent
});

  it("retourne un point différent si innerR change", () => {
    const pos1 = getLabelPos(400, 400, 60, 160, 0, 90);
    const pos2 = getLabelPos(400, 400, 80, 160, 0, 90);
    expect(pos1.y).not.toBeCloseTo(pos2.y);
  });

  it("retourne le centre si innerR et outerR sont égaux à 0", () => {
    const pos = getLabelPos(400, 400, 0, 0, 0, 90);
    expect(pos.x).toBeCloseTo(400);
    expect(pos.y).toBeCloseTo(400);
  });
});