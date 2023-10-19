import React, { createContext, useState } from "react";
import { REINSCRIPTION_STEPS } from "../utils/navigation";
import { PHONE_ZONES_NAMES } from "snu-lib";

export const ReinscriptionContext = createContext();

//set default value for uncontrolled input
const defaultState = {
  step: REINSCRIPTION_STEPS.ELIGIBILITE,
  birthDate: "",
  frenchNationality: "",
  scolarity : "",
  school: {},
  acceptCGU: "false",
  rulesYoung: "false",
};

const SECRET_VALUE_KEYS = [
  { key: "password", values: [] },
  { key: "confirmPassword", values: [] },
  { key: "acceptCGU", values: [] },
  { key: "rulesYoung", values: [] },
  { key: "step", values: [REINSCRIPTION_STEPS.CONFIRM], fallbackValue: REINSCRIPTION_STEPS.PROFIL },
];
const LOCAL_STORAGE_KEY = "reinscription";

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

const ReinscriptionContextProvider = ({ children }) => {
  
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

  return <ReinscriptionContext.Provider value={[value, updateValue, removePersistedValue]}>{children}</ReinscriptionContext.Provider>;
};

export default ReinscriptionContextProvider;
