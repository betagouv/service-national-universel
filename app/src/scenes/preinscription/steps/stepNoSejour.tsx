import React, { useContext, useState } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { useHistory } from "react-router-dom";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import { Highlight, SignupButtons } from "@snu/ds/dsfr";
import EngagementPrograms from "../components/EngagementPrograms";
import CreateContactForm from "../components/CreateContactForm";
import useAuth from "@/services/useAuth";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

export default function NonEligible() {
  const history = useHistory();
  const { isLoggedIn } = useAuth();
  const context = isLoggedIn ? ReinscriptionContext : PreInscriptionContext;
  const [data, removePersistedData] = useContext(context);
  const [state, setState] = useState<"default" | "success" | "info" | "error">("error");
  const [stateRelatedMessage, setStateRelatedMessage] = useState<string>("Impossible de vous inscrire à notre liste de diffusion, veuillez réessayer plus tard.");

  const onClickButton = () => {
    removePersistedData();
    history.push("/");
  };

  return (
    <>
      <DSFRContainer title="Nous n'avons pas trouvé de séjour correspondant à votre situation.">
        <div className="mt-2 mb-12">
          <Highlight>
            📬 Soyez informé(e) de l’ouverture des inscriptions pour les prochaines sessions SNU en renseignant votre adresse e-mail et votre date de naissance.
          </Highlight>
        </div>

        {state === "error" && <Alert severity="error" title="Une erreur est survenue" description={stateRelatedMessage} closable />}
        {state === "success" && <Alert severity="success" title="Merci !" description="Nous vous tiendrons informé(e) de l'ouverture des inscriptions." closable />}
        {state === "info" && <Alert severity="info" title="Information" description={stateRelatedMessage} closable />}

        {state !== "success" && <CreateContactForm data={data} setState={setState} setStateRelatedMessage={setStateRelatedMessage} />}

        <hr className="my-8" />

        <EngagementPrograms />
        <SignupButtons onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
      </DSFRContainer>
    </>
  );
}
