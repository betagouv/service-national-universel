/**
 * M100 (audit du 21/09/2026) : l'en-tête `x-user-timezone` sert à calculer « maintenant » pour les
 * fenêtres d'inscription, d'instruction et de changement de séjour. Non borné, il permettait de
 * déplacer cette date de plusieurs jours et de rouvrir une fenêtre fermée.
 */
import validateCustomHeader from "../middlewares/validateCustomHeader";

function run(headers: Record<string, unknown>) {
  const req = { headers: { ...headers } } as any;
  const next = jest.fn();
  validateCustomHeader(req, {} as any, next);
  expect(next).toHaveBeenCalledTimes(1);
  return req.headers["x-user-timezone"];
}

describe("validateCustomHeader — x-user-timezone", () => {
  it.each(["-120", "0", "600", "840", "-840"])("conserve un décalage de fuseau réel (%s)", (offset) => {
    expect(run({ "x-user-timezone": offset })).toBe(offset);
  });

  it.each(["841", "-841", "43200", "-525600", "1e9"])("ramène à 0 un décalage hors des bornes d'un fuseau réel (%s)", (offset) => {
    expect(run({ "x-user-timezone": offset })).toBe(0);
  });

  it.each(["abc", "", "Infinity"])("ramène à 0 une valeur non numérique (%s)", (offset) => {
    expect(run({ "x-user-timezone": offset })).toBe(0);
  });

  it("pose 0 quand l'en-tête est absent", () => {
    expect(run({})).toBe(0);
  });
});
