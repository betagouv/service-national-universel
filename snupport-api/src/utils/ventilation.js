const VentilationModel = require("../models/ventilation");
const FolderModel = require("../models/folder");
const TagModel = require("../models/tag");
const { capture, captureMessage } = require("../sentry");
const { setAgent, setContact } = require("../utils");

const matchVentilationRule = async (ticket) => {
  try {
    // Un référent ne lit (ticketScope.js) que les tickets QUESTION de son territoire : ses règles de
    // ventilation ne doivent pas non plus agir sur un ticket TECHNICAL hors de ce périmètre (PM47).
    // `formSubjectStep1` est un champ du ticket, pas de la règle : c'est le ticket traité qui doit
    // être QUESTION pour que les branches référent entrent même dans la requête.
    const isReferentEligible = ticket.formSubjectStep1 === "QUESTION";
    let ventilations = await VentilationModel.find({
      active: true,
      $or: [
        { userRole: "AGENT" },
        ...(isReferentEligible
          ? [
              { userRole: "REFERENT_REGION", userRegion: ticket.contactRegion },
              { userRole: "REFERENT_DEPARTMENT", userDepartment: ticket.contactDepartment },
            ]
          : []),
      ],
    });
    //match all ET conditions
    for (let ventilation of ventilations) {
      let matchEt = true;
      for (let condition of ventilation.conditionsEt) {
        switch (condition.operator) {
          case "is":
            if (ticket[condition.field] === condition.value) {
              break;
            }
            matchEt = false;
            break;
          case "is not":
            if (ticket[condition.field] !== condition.value) {
              break;
            }
            matchEt = false;
            break;
          case "contains":
            if (ticket[condition.field]?.includes(condition.value)) {
              break;
            }
            matchEt = false;
            break;
          case "not contains":
            if (!ticket[condition.field]?.includes(condition.value)) {
              break;
            }
            matchEt = false;
            break;
          case "before":
            if (ticket[condition.field] < condition.value) {
              break;
            }
            matchEt = false;
            break;
          case "after":
            if (ticket[condition.field] > condition.value) {
              break;
            }
            matchEt = false;
            break;
          default:
            matchEt = false;
            break;
        }
        if (matchEt === false) break;
      }

      //match all at least one OU conditions
      let matchOu = ventilation.conditionsOu.length === 0 ? true : false;
      for (let condition of ventilation.conditionsOu) {
        switch (condition.operator) {
          case "is":
            if (ticket[condition.field] === condition.value) {
              matchOu = true;
              break;
            }
            break;
          case "is not":
            if (ticket[condition.field] !== condition.value) {
              matchOu = true;
              break;
            }
            break;
          case "contains":
            if (ticket[condition.field]?.includes(condition.value)) {
              matchOu = true;
              break;
            }
            break;
          case "does not contain":
            if (!ticket[condition.field]?.includes(condition.value)) {
              matchOu = true;
              break;
            }
            break;
          case "before":
            if (ticket[condition.field] < condition.value) {
              matchOu = true;
              break;
            }
            break;
          case "after":
            if (ticket[condition.field] > condition.value) {
              matchOu = true;
              break;
            }
            break;
          default:
            matchOu = false;
            break;
        }
      }

      if (matchEt && matchOu) {
        for (let actionVentilation of ventilation.actions) {
          switch (actionVentilation.action) {
            case "SET":
              ticket = await setField(ticket, actionVentilation);
              if (actionVentilation.field === "foldersId") {
                ticket.foldersId = [...new Set([...ticket.foldersId])];
              }
              if (actionVentilation.field === "folder") {
                let folder = await FolderModel.findOne({ name: actionVentilation.value });
                if (!folder) captureMessage("Folder not found", { extra: { folderName: actionVentilation.value, ventilation } });
                ticket.foldersId.push(folder?._id?.toString());
                ticket.folders.push(folder?.name);
              }
              if (actionVentilation.field === "tag") {
                let tag = await TagModel.findById(actionVentilation.value);
                if (!tag || tag?.deletedAt) captureMessage("Tag not found or deleted", { extra: { tagId: actionVentilation.value, ventilation } });
                ticket.tagsId.push(tag?._id?.toString());
                ticket.tags.push(tag?.name);
              }
              break;
          }
        }
        ticket.logVentilation.push(ventilation._id.toString());
      }
    }

    return ticket;
  } catch (error) {
    // `ticket` peut être devenu undefined si un appelant en amont (ex. un futur bug de setField) ne
    // respecte pas son contrat : ne pas déréférencer une deuxième fois dans le bloc qui journalise
    // l'erreur, c'est exactement ce qui transformait cette erreur en requête sans réponse (PM47).
    if (ticket) ticket.logVentilation.push(error);
    capture(error);
    return ticket;
  }
};
const setField = async (ticket, action) => {
  try {
    Array.isArray(ticket[action.field]) ? ticket[action.field].push(action.value) : ticket.set({ [action.field]: action.value });
    if (action.field === "agentId") ticket = await setAgent(ticket);
    if (action.field === "contactId") ticket = await setContact(ticket);

    return ticket;
  } catch (error) {
    // Ne jamais renvoyer undefined : l'appelant (matchVentilationRule) déréférence le ticket juste
    // après pour journaliser la règle appliquée (PM47).
    capture(error);
    return ticket;
  }
};

module.exports = {
  matchVentilationRule,
};
