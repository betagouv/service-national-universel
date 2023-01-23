import { toastr } from "react-redux-toastr";
import { ES_NO_LIMIT, ROLES, SENDINBLUE_TEMPLATES, translate } from "snu-lib";
import API from "../../services/api";
import { regexPhoneFrenchCountries } from "../../utils";
import validator from "validator";

export const getNetworkOptions = async () => {
  try {
    const { data } = await API.get("/structure/networks");
    if (data.length) return data.map((e) => ({ label: e.name, value: e._id }));
    return [];
  } catch (e) {
    console.log(e);
  }
};

export const getParentStructure = async (networkId) => {
  try {
    const { responses } = await API.esQuery("structure", { query: { bool: { must: { match_all: {} }, filter: [{ term: { _id: networkId } }] } } });
    if (responses.length) {
      const structures = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
      if (structures.length) return structures[0];
      return null;
    }
  } catch (e) {
    console.log(e);
  }
};

export const getReferents = async (structureId) => {
  try {
    const { responses } = await API.esQuery("referent", {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structureId } }] } },
      size: ES_NO_LIMIT,
    });
    if (responses.length) return responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
  } catch (e) {
    console.log(e);
  }
};

export const updateReferent = async (referentData) => {
  try {
    const { ok, code, data } = await API.put(`/referent/${referentData._id}`, referentData);
    if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
    return data;
  } catch (e) {
    console.log(e);
    return toastr.error("Oups, une erreur est survenue pendant la création du profil :", translate(e.code));
  }
};

export const inviteReferent = async (values, structure) => {
  try {
    values.role = structure.isNetwork ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE;
    values.structureId = structure._id;
    values.structureName = structure.name;
    if (!values.firstName || !values.lastName || !values.email || !values.phone) {
      return toastr.error("Vous devez remplir tous les champs", "nom, prénom, télephone et e-mail");
    }
    if (!validator.matches(values.phone, regexPhoneFrenchCountries)) {
      return toastr.error("Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX");
    }
    if (structure.isNetwork === "true") values.role = ROLES.SUPERVISOR;
    const { ok, code, data } = await API.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, values);
    if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
    return data;
  } catch (e) {
    if (e.code === "USER_ALREADY_REGISTERED")
      return toastr.error("Cette adresse email est déjà utilisée.", `${values.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
    toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
  }
};

export const deleteReferent = async (target) => {
  try {
    const { ok, code } = await API.remove(`/referent/${target._id}`);
    if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
    if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(target);
    if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
  } catch (e) {
    console.log(e);
    return toastr.error("Oups, une erreur est survenue pendant la suppression du profil :", translate(e.code));
  }
};
