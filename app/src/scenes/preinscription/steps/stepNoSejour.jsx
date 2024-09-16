import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { useHistory } from "react-router-dom";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import { SignupButtons } from "@snu/ds/dsfr";
import EngagementPrograms from "../components/EngagementPrograms";
import CreateContactForm from "../components/CreateContactForm";

export default function NonEligible() {
  const history = useHistory();
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const context = isLoggedIn ? ReinscriptionContext : PreInscriptionContext;
  const [data, removePersistedData] = useContext(context);
  const [success, setSuccess] = useState(false);

  const onClickButton = () => {
    removePersistedData();
    history.push("/");
  };

  return (
    <>
      <DSFRContainer title="Nous n'avons pas trouvé de séjour correspondant à votre situation.">
        <div className="mt-2">
          {success ? <p>Merci ! Nous vous tiendrons informé(e) de l'ouverture des inscriptions.</p> : <CreateContactForm data={data} onSuccess={() => setSuccess(true)} />}
        </div>

        <hr className="my-8" />

        <EngagementPrograms />
        <SignupButtons onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
      </DSFRContainer>
    </>
  );
}
