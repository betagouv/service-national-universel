import React, { createContext, useState } from "react";

export const PreInscriptionContext = createContext();

const PreInscriptionContextProvider = ({ children }) => {
  const [value, setValue] = useState({});
  return <PreInscriptionContext.Provider value={[value, setValue]}>{children}</PreInscriptionContext.Provider>;
};

export default PreInscriptionContextProvider;
