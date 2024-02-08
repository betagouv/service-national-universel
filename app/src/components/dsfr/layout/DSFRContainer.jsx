import React from "react";
import plausibleEvent from "@/services/plausible";
import { PaddedContainer } from "@snu/ds/dsfr";

const DSFRContainer = ({ supportEvent, supportLink, children, ...otherProps }) => (
  <PaddedContainer href={supportLink} handleClickEvent={supportEvent ? () => plausibleEvent(supportEvent) : null} {...otherProps}>
    {children}
  </PaddedContainer>
);

export default DSFRContainer;
