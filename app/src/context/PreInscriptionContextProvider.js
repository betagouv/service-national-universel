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
  { key: "step", values: [PREINSCRIPTION_STEPS.CONFIRM, PREINSCRIPTION_STEPS.DONE], fallbackValue: PREINSCRIPTION_STEPS.PROFIL },
];
const LOCAL_STORAGE_KEY = "preinscription";

const getDefaultState = () => {
  const persistedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  return persistedState ? JSON.parse(persistedState) : defaultState;
};

const PreInscriptionContextProvider = ({ children }) => {
  const [value, setValue] = useState(getDefaultState());

  const updateValue = (value) => {
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

  const removePersistedValue = (resetAll) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (resetAll) {
      setValue(defaultState);
    }
  };

  return <PreInscriptionContext.Provider value={[value, updateValue, removePersistedValue]}>{children}</PreInscriptionContext.Provider>;
};

export default PreInscriptionContextProvider;
