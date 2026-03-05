//La fonction répond à la question : "Si je pars du centre, que je tourne de X degrés et avance de R pixels, où est-ce que j'arrive ?"
//Centre : (400, 400)
//Rayon  : 100 pixels
//Angle  : 0°

//→ Je pars de (400, 400)
//→ Je vais vers le haut de 100 pixels
//→ J'arrive en (400, 300)
export function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function describeArc(cx: number, cy: number, innerR: number, outerR: number, startDeg: number, endDeg: number) {
    //polarToCart calcule les 4 coins :
    //Chaque secteur est un morceau de cercle. `polarToCart` sert à calculer **les 4 coins de chaque secteur** pour tracer le path SVG :

  const outerStart = polarToCart(cx, cy, outerR, startDeg);//   coin haut-gauche  (outerR, startDeg)
  const outerEnd = polarToCart(cx, cy, outerR, endDeg);//   coin haut-droite  (outerR, endDeg)
  const innerEnd = polarToCart(cx, cy, innerR, endDeg);//   coin bas-droite   (innerR, endDeg)
  const innerStart = polarToCart(cx, cy, innerR, startDeg);//   coin bas-gauche   (innerR, startDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`, //   partir du coin haut-gauche
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`, //   tracer un arc jusqu'au coin haut-droite
    `L ${innerEnd.x} ${innerEnd.y}`, //   tracer une ligne droite jusqu'au coin bas-droite
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`, //   tracer un arc jusqu'au coin bas-gauche
    "Z",
  ].join(" ");
}

export function getLabelPos(cx: number, cy: number, innerR: number, outerR: number, startDeg: number, endDeg: number) {
  return polarToCart(cx, cy, (innerR + outerR) / 2, (startDeg + endDeg) / 2);
}