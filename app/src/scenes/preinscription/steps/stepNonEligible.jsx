import React, { useContext } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import ProgressBar from "../components/ProgressBar";
import EngagementPrograms from "../components/EngagementPrograms";
import { SignupButtons } from "@snu/ds/dsfr";

export default function NonEligible() {
  const history = useHistory();
  // eslint-disable-next-line no-unused-vars
  const [data, __, removePersistedData] = useContext(PreInscriptionContext);

  const onClickButton = () => {
    removePersistedData();
    history.push("/");
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Nous n'avons pas trouvé de séjour qui correspond à votre situation.">
        {data?.message === "age" && (
          <p className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">
            Pour participer au SNU, vous devez avoir <strong>entre 15 et 17 ans</strong>.
          </p>
        )}
        <EngagementPrograms />
        <SignupButtons onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
      </DSFRContainer>
    </>
  );
}
