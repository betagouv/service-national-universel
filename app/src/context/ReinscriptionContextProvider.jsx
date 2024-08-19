import React, { createContext, useState } from "react";
import { REINSCRIPTION_STEPS } from "../utils/navigation";
import { useSelector } from "react-redux";
import Loader from "@/components/Loader";

export const ReinscriptionContext = createContext();

const defaultState = (young) => {
  return {
    step: REINSCRIPTION_STEPS.ELIGIBILITE,
    birthDate: young.birthdateAt,
    scolarity: "",
    school: {},
    cohort: "",
    zip: young.zip,
    frenchNationality: young.frenchNationality,
    isReInscription: true,
  };
};

const ReinscriptionContextProvider = ({ children }) => {
  const young = useSelector((state) => state.Auth.young);
  const [value, setValue] = useState(defaultState(young));

  const updateValue = (value = defaultState) => {
    setValue(value);
  };

  if (!young) return <Loader />;
  return <ReinscriptionContext.Provider value={[value, updateValue]}>{children}</ReinscriptionContext.Provider>;
};

export default ReinscriptionContextProvider;
