const fs = require("fs");
const path = require("path");

// Le contrôleur ne peut pas être monté dans jest : il dépend de middlewares écrits en TypeScript
// (authenticationGuards.ts, userRoleGuards.ts) et ce paquet n'a pas de transformation TS.
// Ce test lit donc le routeur et vérifie le câblage des garde-fous, pour qu'une régression
// (suppression d'un requireRole, peuplement à nouveau complet) fasse échouer la suite.
const source = fs.readFileSync(path.join(__dirname, "../controllers/template.js"), "utf8");

// Découpe le fichier en blocs "une route = son handler", pour vérifier chaque route isolément.
const routeBlock = (declaration) => {
  const start = source.indexOf(declaration);
  if (start === -1) return null;
  const next = source.indexOf("\nrouter.", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
};

describe("routeur /template : garde-fous d'autorisation", () => {
  it("n'autorise que les agents du support à créer un modèle", () => {
    expect(routeBlock('router.post("/"')).toMatch(/requireRole\("AGENT"\)/);
  });

  it("n'autorise que les agents du support à modifier un modèle", () => {
    expect(routeBlock('router.patch("/:id"')).toMatch(/requireRole\("AGENT"\)/);
  });

  it("n'autorise que les agents du support à supprimer un modèle", () => {
    expect(routeBlock('router.delete("/:id"')).toMatch(/requireRole\("AGENT"\)/);
  });

  it("laisse la lecture ouverte à tout agent (écran de création de ticket des référents)", () => {
    expect(routeBlock('router.get("/"')).not.toMatch(/requireRole\(/);
  });

  it("ne peuple jamais la fiche agent complète de l'auteur ni du destinataire", () => {
    const lecture = routeBlock('router.get("/"');
    expect(lecture).toMatch(/path: "createdBy", select: "firstName lastName"/);
    expect(lecture).toMatch(/path: "attributedTo", select: "firstName lastName"/);
    expect(lecture).not.toMatch(/populate\(\["createdBy"/);
  });

  it("garde l'authentification agent sur l'ensemble du routeur", () => {
    expect(source).toMatch(/router\.use\(agentGuard\)/);
  });
});
