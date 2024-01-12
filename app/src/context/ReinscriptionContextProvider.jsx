import React, { createContext, useState } from "react";
import { REINSCRIPTION_STEPS } from "../utils/navigation";

export const ReinscriptionContext = createContext();

const defaultState = {
  step: REINSCRIPTION_STEPS.ELIGIBILITE,
  birthDate: "",
  scolarity: "",
  school: {},
  cohort: "",
  // acceptCGU: "false",
  // rulesYoung: "false",
};

const getDefaultState = () => {
  return defaultState;
};

const ReinscriptionContextProvider = ({ children }) => {
  const [value, setValue] = useState(getDefaultState());

  const updateValue = (value = defaultState) => {
    setValue(value);
  };

  return <ReinscriptionContext.Provider value={[value, updateValue]}>{children}</ReinscriptionContext.Provider>;
};

export default ReinscriptionContextProvider;
