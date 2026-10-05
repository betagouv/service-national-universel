/**
 * Transitions de statut de candidature ouvertes à un responsable / superviseur, par énumération.
 *
 * Invariant : aucune suite de changements de statut ouverte à une structure ne peut amener une
 * candidature née d'une proposition non acceptée par le volontaire à VALIDATED, IN_PROGRESS ou DONE.
 * Les parcours légitimes (candidature du volontaire, refus puis nouvelle validation, suivi de la
 * mission jusqu'à sa réalisation) restent ouverts.
 */
import { APPLICATION_STATUS, ROLES } from "snu-lib";

import { canReferentChangeApplicationStatus } from "../young/youngStatusTransitions";

const STATUTS: string[] = Object.values(APPLICATION_STATUS);
const ROLES_STRUCTURE = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR];
const COHORTE_OUVERTE = { status: "PUBLISHED" } as any;

/** Tous les statuts atteignables depuis `depart` par une suite de changements autorisés au rôle. */
function atteignables(role: string, depart: string, proposalNotAccepted = false): string[] {
  const vus = new Set<string>();
  const file = [depart];
  while (file.length) {
    const courant = file.shift() as string;
    for (const cible of STATUTS) {
      if (cible === courant || vus.has(cible)) continue;
      if (canReferentChangeApplicationStatus({ role }, courant, cible, COHORTE_OUVERTE, { proposalNotAccepted })) {
        vus.add(cible);
        file.push(cible);
      }
    }
  }
  vus.delete(depart);
  return [...vus].sort();
}

describe.each(ROLES_STRUCTURE)("transitions de candidature du rôle %s", (role) => {
  it("aucune chaîne ne sort de WAITING_ACCEPTATION", () => {
    expect(atteignables(role, APPLICATION_STATUS.WAITING_ACCEPTATION)).toEqual([]);
  });

  it.each(STATUTS)("une candidature née d'une proposition non acceptée ne change plus de statut (depuis %s)", (depart) => {
    expect(atteignables(role, depart, true)).toEqual([]);
  });

  it("garde le suivi d'une candidature du volontaire : validation, mission en cours, réalisation, abandon, refus", () => {
    expect(atteignables(role, APPLICATION_STATUS.WAITING_VALIDATION)).toEqual(
      [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON, APPLICATION_STATUS.REFUSED].sort(),
    );
    expect(atteignables(role, APPLICATION_STATUS.WAITING_VERIFICATION)).toEqual(
      [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON, APPLICATION_STATUS.REFUSED].sort(),
    );
  });

  it("garde le refus suivi d'une nouvelle validation", () => {
    const apresRefus = atteignables(role, APPLICATION_STATUS.REFUSED);
    expect(apresRefus).toContain(APPLICATION_STATUS.VALIDATED);
    expect(apresRefus).toContain(APPLICATION_STATUS.DONE);
  });

  it("garde IN_PROGRESS vers DONE et ABANDON", () => {
    expect(atteignables(role, APPLICATION_STATUS.IN_PROGRESS)).toEqual([APPLICATION_STATUS.ABANDON, APPLICATION_STATUS.DONE].sort());
  });
});

describe("transitions de candidature : admin et référents territoriaux", () => {
  it.each([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION])("%s : toutes les transitions depuis une proposition, marquée ou non", (role) => {
    const autres = STATUTS.filter((statut) => statut !== APPLICATION_STATUS.WAITING_ACCEPTATION).sort();
    expect(atteignables(role, APPLICATION_STATUS.WAITING_ACCEPTATION)).toEqual(autres);
    expect(atteignables(role, APPLICATION_STATUS.WAITING_ACCEPTATION, true)).toEqual(autres);
    expect(atteignables(role, APPLICATION_STATUS.REFUSED, true)).toEqual(STATUTS.filter((statut) => statut !== APPLICATION_STATUS.REFUSED).sort());
  });
});
