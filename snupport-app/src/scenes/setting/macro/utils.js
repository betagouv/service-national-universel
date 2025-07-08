export const defaultMacroAction = { action: "SET", field: "", value: "" };
export const defaultMacro = { name: "", macroAction: [defaultMacroAction], isActive: false };

// other options are retrieved from api in macro index page
export const statusValues = [
  { value: "NEW", label: "Nouveau" },
  { value: "OPEN", label: "Ouvert" },
  { value: "CLOSED", label: "Fermé" },
  { value: "PENDING", label: "En attente" },
  { value: "DRAFT", label: "Brouillon" },
];

export const macroActionsAndFields = {
  SET: {
    label: "Ajouter",
    fields: [
      { value: "notes.content", label: "Note" },
      { value: "subject", label: "Sujet" },
      {
        value: "status",
        label: "Statut",
      },
      { value: "tagsId", label: "Tag" },
      { value: "folder", label: "Dossier" },
      { value: "agentId", label: "Agent" },
    ],
  },
  DELETE: {
    label: "Supprimer",
    fields: [{ value: "tagsId", label: "Tag" }],
  },
  ADDMESSAGE: {
    label: "Ajouter un message",
    fields: [{ value: "message", label: "Message" }],
  },
};

export const getMacroActions = () => Object.keys(macroActionsAndFields).map((macroAction) => ({ value: macroAction, label: macroActionsAndFields[macroAction].label }));

export const getMacroFields = (action) => {
  return macroActionsAndFields[action]?.fields || [];
};

export const getActionLabel = (action) => {
  return macroActionsAndFields[action]?.label || action;
};

export const getFieldLabel = (action, field) => {
  if (!macroActionsAndFields[action]) return field;
  const fieldOption = macroActionsAndFields[action].fields.find(({ value }) => value === field);
  return fieldOption?.label || field;
};

export const getValueLabel = (field, value, macroValuesOptions) => {
  if (!macroValuesOptions[field]) return value;
  const valueOption = macroValuesOptions[field].find(({ value: currentValue }) => currentValue === value);
  return valueOption?.label || value;
};
