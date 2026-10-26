import { validateMission } from "../utils/validator";

// GOO-19 : les champs de mission rendus en HTML dans app et admin sont assainis à l'écriture.
describe("validateMission — champs HTML", () => {
  const fields = ["description", "actions", "contraintes", "justifications", "frequence"] as const;

  it.each(fields)("assainit %s", (field) => {
    const { error, value } = validateMission({ [field]: `<b>Objectif</b><img src=x onerror="alert(1)"><a href="javascript:alert(1)">lien</a>` });
    expect(error).toBeUndefined();
    expect(value[field]).toBe(`<b>Objectif</b><a rel="noopener noreferrer">lien</a>`);
  });

  it.each(fields)("laisse intact un %s sans balise", (field) => {
    const { value } = validateMission({ [field]: "Sport & culture, âge < 16 ans" });
    expect(value[field]).toBe("Sport & culture, âge < 16 ans");
  });
});
