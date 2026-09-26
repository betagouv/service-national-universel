/**
 * Contenu des missions poussées aux volontaires par le cron `noticePushMission` (GOO-59, PM22).
 *
 * Le nom de la mission, celui de la structure et l'adresse sont saisis par la structure et partent
 * depuis l'expéditeur officiel vers tous les volontaires à moins de 20 km : ils ne doivent porter
 * aucun balisage.
 */
import { toMailMission } from "../../crons/noticePushMission";

const hit = (source: Record<string, unknown>) => ({
  _id: "0123456789abcdef01234567",
  _source: { startAt: "2030-01-01T00:00:00.000Z", endAt: "2030-02-01T00:00:00.000Z", ...source },
});

describe("noticePushMission — toMailMission", () => {
  it("retire le balisage du nom de mission, du nom de structure et de l'adresse", () => {
    const mission = toMailMission(
      hit({
        name: '<a href="https://sosie.example">Cliquez ici</a>',
        structureName: '<a href="https://sosie.example">Structure</a>',
        city: "<img src=x onerror=alert(1)>Lyon",
        zip: "<i>69001</i>",
        domains: [],
      }),
    );

    expect(mission.name).toEqual("Cliquez ici");
    expect(mission.structureName).toEqual("STRUCTURE");
    expect(mission.address).toEqual("Lyon, 69001");
    for (const value of [mission.name, mission.structureName, mission.address]) expect(value).not.toMatch(/[<>]/);
  });

  it("conserve un texte sans balise", () => {
    const mission = toMailMission(hit({ name: "Aide aux devoirs", structureName: "Association", city: "Lyon", zip: "69001", domains: [] }));

    expect(mission.name).toEqual("Aide aux devoirs");
    expect(mission.structureName).toEqual("ASSOCIATION");
    expect(mission.address).toEqual("Lyon, 69001");
    expect(mission.cta).toMatch(/\/mission\/0123456789abcdef01234567$/);
  });
});
