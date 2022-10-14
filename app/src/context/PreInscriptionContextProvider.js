import React, { createContext, useState } from "react";
import { PREINSCRIPTION_STEPS } from "../utils/navigation";

export const PreInscriptionContext = createContext();

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

const LOCAL_STORAGE_KEY = "preinscription";

const getDefaultState = () => {
  const persistedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  return persistedState ? JSON.parse(persistedState) : defaultState;
};

const PreInscriptionContextProvider = ({ children }) => {
  //set default value for uncontrolled input
  const [value, setValue] = useState(getDefaultState());

  const updateValue = (value, shouldPersist = true) => {
    setValue(value);
    if (shouldPersist) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
    }
  };

  const removeValue = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return <PreInscriptionContext.Provider value={[value, updateValue, removeValue]}>{children}</PreInscriptionContext.Provider>;
};

export default PreInscriptionContextProvider;
