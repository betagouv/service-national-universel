import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { useHistory } from "react-router-dom";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import { SignupButtons } from "@snu/ds/dsfr";
import EngagementPrograms from "../components/EngagementPrograms";

export default function NonEligible() {
  const history = useHistory();
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const context = isLoggedIn ? ReinscriptionContext : PreInscriptionContext;
  const [data, removePersistedData] = useContext(context);

  const onClickButton = () => {
    removePersistedData();
    history.push("/");
  };

  return (
    <>
      <DSFRContainer title="Nous n'avons pas trouvé de séjour qui correspond à votre situation.">
        <EngagementPrograms />
        <SignupButtons onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
      </DSFRContainer>
    </>
  );
}
