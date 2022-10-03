import React, { createContext, useState } from "react";

export const PreInscriptionContext = createContext();

const PreInscriptionContextProvider = ({ children }) => {
  //set default value for uncontrolled input
  const [value, setValue] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emailConfirm: "",
    password: "",
    confirmPassword: "",
  });
  return <PreInscriptionContext.Provider value={[value, setValue]}>{children}</PreInscriptionContext.Provider>;
};

export default PreInscriptionContextProvider;
