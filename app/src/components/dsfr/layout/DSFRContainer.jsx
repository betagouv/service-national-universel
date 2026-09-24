import React from "react";
import { PaddedContainer } from "@snu/ds/dsfr";

const DSFRContainer = ({ supportLink = "", children, ...otherProps }) => (
  <PaddedContainer href={supportLink} {...otherProps}>
    {children}
  </PaddedContainer>
);

export default DSFRContainer;
