import { ROLES, UserDto } from "snu-lib";

import { ApplicationModel, StructureModel, YoungModel } from "../models";

/**
 * Périmètre d'un contrat / d'une candidature pour un utilisateur référent.
 *
 * La permission `CONTRACT_FULL` est seedée sans policy pour les rôles responsable,
 * superviseur et référent départemental/régional : `isReadAuthorized` répond donc vrai
 * pour n'importe quel document. Ce contrôle rétablit le cloisonnement attendu, en
 * reprenant les axes déjà utilisés ailleurs dans le code (structure pour le responsable,
 * réseau pour le superviseur, département / région du jeune pour les référents).
 */
type ScopedDocument = {
  structureId?: string | null;
  applicationId?: string | null;
  youngId?: string | null;
  youngDepartment?: string | null;
};

/** Certains contrats anciens n'ont pas de `structureId` : on retombe alors sur celui de la candidature. */
async function getStructureId({ structureId, applicationId }: ScopedDocument): Promise<string | undefined> {
  if (structureId) return String(structureId);
  if (applicationId) {
    const application = await ApplicationModel.findById(applicationId).select({ structureId: 1 });
    if (application?.structureId) return String(application.structureId);
  }
  return undefined;
}

async function getYoungScope({ youngId, youngDepartment }: ScopedDocument): Promise<{ department?: string; region?: string }> {
  if (youngId) {
    const young = await YoungModel.findById(youngId).select({ department: 1, region: 1 });
    if (young) return { department: young.department, region: young.region };
  }
  // Contrat anonymisé (lien vers le jeune rompu) : on retombe sur le département figé dans le document.
  return { department: youngDepartment ?? undefined };
}

async function isInStructureNetwork(networkHeadId: string, structureId: string): Promise<boolean> {
  const structures = await StructureModel.find({ $or: [{ networkId: String(networkHeadId) }, { _id: String(networkHeadId) }] }).select({ _id: 1 });
  return structures.some((structure) => String(structure._id) === String(structureId));
}

async function isInUserScope(user: UserDto, document: ScopedDocument): Promise<boolean> {
  switch (user?.role) {
    case ROLES.ADMIN:
      return true;

    case ROLES.RESPONSIBLE: {
      const structureId = await getStructureId(document);
      if (!user.structureId || !structureId) return false;
      return structureId === String(user.structureId);
    }

    case ROLES.SUPERVISOR: {
      const structureId = await getStructureId(document);
      if (!user.structureId || !structureId) return false;
      return isInStructureNetwork(String(user.structureId), structureId);
    }

    case ROLES.REFERENT_DEPARTMENT: {
      const { department } = await getYoungScope(document);
      if (!department) return false;
      return (user.department || []).includes(department);
    }

    case ROLES.REFERENT_REGION: {
      const { region } = await getYoungScope(document);
      if (!region || !user.region) return false;
      return String(region) === String(user.region);
    }

    default:
      // fail-closed : tout rôle sans périmètre explicite n'a pas accès au document
      return false;
  }
}

export async function isContractInUserScope(user: UserDto, contract: ScopedDocument): Promise<boolean> {
  return isInUserScope(user, contract);
}

export async function isApplicationInUserScope(user: UserDto, application: ScopedDocument): Promise<boolean> {
  return isInUserScope(user, application);
}
