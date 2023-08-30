import React, { createContext, useState } from "react";
import { PREINSCRIPTION_STEPS } from "../utils/navigation";

export const PreInscriptionContext = createContext();

//set default value for uncontrolled input
const defaultState = {
  step: PREINSCRIPTION_STEPS.ELIGIBILITE,
  firstName: "",
  lastName: "",
  email: "",
  emailConfirm: "",
  password: "",
  confirmPassword: "",
  acceptCGU: "false",
  rulesYoung: "false",
};

const SECRET_VALUE_KEYS = [
  { key: "password", values: [] },
  { key: "confirmPassword", values: [] },
  { key: "acceptCGU", values: [] },
  { key: "rulesYoung", values: [] },
  { key: "step", values: [PREINSCRIPTION_STEPS.CONFIRM], fallbackValue: PREINSCRIPTION_STEPS.PROFIL },
];
const LOCAL_STORAGE_KEY = "preinscription";

const getDefaultState = () => {
  const persistedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (persistedState) {
    let parsedStateObject = JSON.parse(persistedState);
    if (parsedStateObject.birthDate) {
      parsedStateObject.birthDate = new Date(parsedStateObject.birthDate);
    }
    return parsedStateObject;
  }
  return defaultState;
};

const PreInscriptionContextProvider = ({ children }) => {
  const [value, setValue] = useState(getDefaultState());

  const updateValue = (value = defaultState) => {
    setValue(value);

    // remove secret values before persisting into local storage
    const valuesToPersist = {};
    Object.keys(value).forEach((key) => {
      const secretValueConfig = SECRET_VALUE_KEYS.find((secretValue) => secretValue.key === key);
      if (!secretValueConfig) {
        valuesToPersist[key] = value[key];
      } else if (secretValueConfig.values.length > 0) {
        valuesToPersist[key] = !secretValueConfig.values.includes(value[key]) ? value[key] : secretValueConfig.fallbackValue;
      }
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(valuesToPersist));
  };

  const removePersistedValue = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setValue(defaultState);
  };

  return <PreInscriptionContext.Provider value={[value, updateValue, removePersistedValue]}>{children}</PreInscriptionContext.Provider>;
};

export default PreInscriptionContextProvider;
