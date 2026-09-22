/**
 * Garde-fou sur le catalogue de permissions seedé par les migrations (audit 2026-09-21, H87).
 *
 * `isAuthorized` n'évalue les policies d'une ressource que si AUCUNE permission sans policy ne
 * couvre la même ressource/action pour le rôle (cf. `hasUnrestrictedPermission`). Une permission
 * large seedée pour un rôle à périmètre est donc un accès national silencieux : le contrôle par
 * document `isXxxAuthorized({ context })` devient un no-op, sans que rien ne le signale.
 *
 * Ce test relit les migrations et échoue dès qu'un tel couple apparaît hors de l'inventaire
 * ci-dessous. Ajouter une entrée à `TROUS_CONNUS` est un acte délibéré, qui doit être justifié en
 * revue : soit la policy est exprimable et il faut l'écrire, soit elle ne l'est pas et le périmètre
 * doit être contrôlé dans la route (`isContractInUserScope`, `canEditYoungInScope`, …).
 *
 * L'analyse est statique : pas de base, pas d'exécution des migrations.
 */
import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(__dirname, "../../../migrations");

/** Rôles sans périmètre : une permission large leur est légitimement accordée. */
const ROLES_GLOBAUX = new Set(["ADMIN", "SUB_ROLE_GOD", "INJEP", "DSNJ", "ROLE_JEUNE", "VISITOR"]);

/**
 * Ressources sur lesquelles au moins une route appelle `isXxxAuthorized({ context })` : ce sont les
 * seules où une policy est réellement évaluée. Ailleurs, toutes les vérifications passent par
 * `permissionAccessControlMiddleware`, qui ne transmet jamais de contexte — y ajouter une policy
 * refuserait la route (le moteur est fail-closed), pas ne la cloisonnerait.
 */
const RESSOURCES_AVEC_CONTEXTE = new Set(["APPLICATION", "CONTRACT", "MISSION", "STRUCTURE"]);

/**
 * Couples `RESSOURCE|RÔLE|ACTION` encore couverts par une permission sans policy, avec la raison.
 * Aucun n'est exprimable avec le moteur actuel, qui ne sait que comparer un champ du contexte à un
 * champ de l'utilisateur — il ne sait pas suivre une relation.
 */
const TROUS_CONNUS: Record<string, string> = {
  // Le contrat ne porte ni `department` ni `region` (il ne connaît que youngId / missionId /
  // structureId) : le périmètre géographique passe par le volontaire, que le moteur ne sait pas
  // joindre. Contrôlé dans la route par `isContractInUserScope` (lot C2).
  "CONTRACT|REFERENT_REGION|FULL": "contrat sans région ; périmètre porté par isContractInUserScope",
  "CONTRACT|REFERENT_DEPARTMENT|FULL": "contrat sans département ; périmètre porté par isContractInUserScope",
  // Exprimable (`structureId`), mais deux appels de `contract.ts` ne transmettent pas encore de
  // contexte (POST /contract, branches création et mise à jour) : la policy les refuserait.
  "CONTRACT|RESPONSIBLE|FULL": "exprimable via structureId, bloqué par les appels sans contexte de POST /contract",
  "CONTRACT|SUPERVISOR|FULL": "réseau de structures : demande `structure` dans le contexte, absent des appels contrat",

  // La candidature ne porte pas non plus de géographie ; pour les référents dép./rég. le périmètre
  // existe déjà via `young` (CANDIDATURE_DEPARTMENT / CANDIDATURE_REGION).
  // Responsable / superviseur : exprimable via `application.structureId`, mais 4 des 7 appels ne
  // transmettent que `{ young }`.
  "APPLICATION|SUPERVISOR|READ": "réseau de structures ; 4 appels sur 7 ne passent que { young }",
  "APPLICATION|RESPONSIBLE|READ": "exprimable via structureId ; 4 appels sur 7 ne passent que { young }",
  "APPLICATION|SUPERVISOR|WRITE": "idem READ",
  "APPLICATION|RESPONSIBLE|WRITE": "idem READ",
  "APPLICATION|SUPERVISOR|CREATE": "à la création, la candidature n'existe pas encore",
  "APPLICATION|RESPONSIBLE|CREATE": "à la création, la candidature n'existe pas encore",
  // Le périmètre d'un chef de centre est la session phase 1 du volontaire : une relation, que le
  // moteur ne sait pas exprimer. Contrôlé dans la route par `canEditYoungInScope`.
  "APPLICATION|HEAD_CENTER|READ": "périmètre = session phase 1, non exprimable",
  "APPLICATION|HEAD_CENTER_ADJOINT|READ": "périmètre = session phase 1, non exprimable",
  "APPLICATION|REFERENT_SANITAIRE|READ": "périmètre = session phase 1, non exprimable",
  "APPLICATION|HEAD_CENTER|WRITE": "périmètre = session phase 1, non exprimable",
  "APPLICATION|HEAD_CENTER_ADJOINT|WRITE": "périmètre = session phase 1, non exprimable",
  "APPLICATION|REFERENT_SANITAIRE|WRITE": "périmètre = session phase 1, non exprimable",
  "APPLICATION|HEAD_CENTER|CREATE": "périmètre = session phase 1, non exprimable",
  "APPLICATION|HEAD_CENTER_ADJOINT|CREATE": "périmètre = session phase 1, non exprimable",
  "APPLICATION|REFERENT_SANITAIRE|CREATE": "périmètre = session phase 1, non exprimable",

  // `department` / `region` existent sur la mission, mais `validateMission` les rend facultatifs :
  // une policy géographique refuserait la création d'une mission dont le corps les omet.
  "MISSION|REFERENT_DEPARTMENT|FULL": "exprimable, mais department/region facultatifs dans validateMission",
  "MISSION|REFERENT_REGION|FULL": "exprimable, mais department/region facultatifs dans validateMission",

  // Création : aucun document préexistant à cloisonner.
  "STRUCTURE|REFERENT_DEPARTMENT|CREATE": "création : pas de document à cloisonner",
  "STRUCTURE|REFERENT_REGION|CREATE": "création : pas de document à cloisonner",
};

interface PermissionSeed {
  code: string;
  resource: string;
  action: string;
  role: string;
  hasPolicy: boolean;
  file: string;
}

/** Extrait chaque `PermissionModel.create({...})` des migrations, boucles `for (const action of …)` comprises. */
function lirePermissionsSeedees(): PermissionSeed[] {
  const seeds: PermissionSeed[] = [];

  for (const file of fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".js")).sort()) {
    const source = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const creates = /PermissionModel\.create\(\{/g;
    let match: RegExpExecArray | null;

    while ((match = creates.exec(source))) {
      const start = match.index + "PermissionModel.create(".length;
      let depth = 0;
      let end = start;
      for (; end < source.length; end++) {
        if (source[end] === "{") depth++;
        else if (source[end] === "}" && --depth === 0) {
          end++;
          break;
        }
      }
      const body = source.slice(start, end);
      const champ = (re: RegExp) => (body.match(re)?.[1] ?? "").trim();

      // `action: PERMISSION_ACTIONS.X` ou la forme abrégée `action,` dans une boucle
      const actionLitterale = champ(/\n\s*action:\s*([^,\n]+)/);
      let actions: string[];
      if (actionLitterale && actionLitterale !== "action") {
        actions = [actionLitterale.replace("PERMISSION_ACTIONS.", "")];
      } else {
        const boucle = source.lastIndexOf("for (const action of", match.index);
        const groupe = source.slice(boucle, boucle + 90).match(/of\s+(PERMISSION_ACTIONS_[A-Z_]+)/)?.[1];
        actions = groupe === "PERMISSION_ACTIONS_READ_WRITE_CREATE" ? ["READ", "WRITE", "CREATE"] : ["READ", "WRITE"];
      }

      const roles = (body.match(/roles:\s*\[([^\]]*)\]/s)?.[1] ?? "")
        .split(",")
        .map((r) => r.trim().replace("ROLES.", ""))
        .filter(Boolean);

      const code = champ(/code:\s*([^,\n+]+)/).replace("PERMISSION_CODES.", "");
      const resource = champ(/resource:\s*([^,\n]+)/).replace("PERMISSION_RESOURCES.", "");
      const hasPolicy = /(^|\n)\s*policy:\s*\{/.test(body);

      for (const action of actions) for (const role of roles) seeds.push({ code, resource, action, role, hasPolicy, file });
    }
  }
  return seeds;
}

const seeds = lirePermissionsSeedees();

/** Une permission d'action FULL couvre toutes les actions, comme dans `getMatchingPermissions`. */
const couvre = (seed: PermissionSeed, action: string) => seed.action === action || seed.action === "FULL";

describe("catalogue de permissions — H87", () => {
  it("lit bien les migrations", () => {
    expect(seeds.length).toBeGreaterThan(50);
    expect(seeds.every((s) => s.resource && s.action && s.role)).toBe(true);
  });

  it("aucune permission sans policy ne masque une policy du même rôle sur la même ressource", () => {
    const masquees: string[] = [];

    for (const seed of seeds) {
      if (seed.hasPolicy) continue;
      const policyMasquee = seeds.filter(
        (autre) => autre.hasPolicy && autre.resource === seed.resource && autre.role === seed.role && couvre(autre, seed.action),
      );
      if (policyMasquee.length) {
        masquees.push(`${seed.resource}|${seed.role}|${seed.action} : ${seed.code} masque ${[...new Set(policyMasquee.map((p) => p.code))].join(", ")}`);
      }
    }

    // `hasUnrestrictedPermission` fait désormais gagner la policy la plus restrictive, donc ces
    // couples ne sont plus des trous ; ils restent des pièges à la lecture du catalogue.
    expect(masquees.sort()).toEqual(
      [
        "APPLICATION|REFERENT_DEPARTMENT|READ : CANDIDATURE_READ masque CANDIDATURE_DEPARTMENT",
        "APPLICATION|REFERENT_REGION|READ : CANDIDATURE_READ masque CANDIDATURE_REGION",
        "MISSION|SUPERVISOR|READ : MISSION_READ masque MISSION_SAME_STRUCTURE_FULL, MISSION_SAME_STRUCTURE_FULL_NETWORK",
      ].sort(),
    );
  });

  it("aucun nouvel accès national pour un rôle à périmètre sur une ressource où les policies sont évaluées", () => {
    const trous = new Set<string>();

    for (const seed of seeds) {
      if (seed.hasPolicy || ROLES_GLOBAUX.has(seed.role) || !RESSOURCES_AVEC_CONTEXTE.has(seed.resource)) continue;
      const aUnePolicy = seeds.some((autre) => autre.hasPolicy && autre.resource === seed.resource && autre.role === seed.role && couvre(autre, seed.action));
      if (!aUnePolicy) trous.add(`${seed.resource}|${seed.role}|${seed.action}`);
    }

    const inattendus = [...trous].filter((t) => !(t in TROUS_CONNUS)).sort();
    expect(inattendus).toEqual([]);

    // Inversement : un trou refermé doit sortir de l'inventaire, pour qu'il reste une liste de travail.
    const perimes = Object.keys(TROUS_CONNUS).filter((t) => !trous.has(t)).sort();
    expect(perimes).toEqual([]);
  });
});
