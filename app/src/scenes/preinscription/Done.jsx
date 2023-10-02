import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import plausibleEvent from "../../services/plausible";
import DSFRContainer from "../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../components/dsfr/ui/buttons/SignupButtonContainer";
import { capture } from "../../sentry";
import ProgressBar from "./components/ProgressBar";
import { supportURL } from "@/config";

export default function Done() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  async function handleClick() {
    try {
      plausibleEvent("Phase0/CTA preinscription - demarrer");
      history.push("/inscription2023");
    } catch (e) {
      capture(e);
    }
  }

  return (
    <>
      <ProgressBar />
      <DSFRContainer supportLink={supportURL + "/base-de-connaissance/phase-0-les-inscriptions"}>
        <h1 className="text-3xl font-semibold">
          Bienvenue {young.firstName} 🎉
          <br />
          Votre compte volontaire a été créé.
        </h1>
        <p className="py-2 mt-2 text-gray-600">
          Vous pouvez dès à présent <strong>finaliser votre inscription</strong> ou la reprendre à tout moment depuis le mail envoyé à {young.email}, ou depuis l’écran de
          connexion.
        </p>
        <p className="py-2 text-gray-600">Attention, une inscription complète est indispensable pour valider votre candidature au SNU.</p>
        <hr className="mt-4" />
        <h2 className="text-lg font-semibold">Préparez le document suivant :</h2>
        <div className="flex py-2 gap-4 mb-2">
          <div className="flex-none">image</div>
          <div className="space-y-2">
            <p>Pièce d&apos;identité</p>
            <p className="text-xs text-gray-500">Carte Nationale d’Identité ou Passeport</p>
          </div>
        </div>

        <SignupButtonContainer onClickNext={handleClick} labelNext="Finaliser mon inscription" />
      </DSFRContainer>
    </>
  );
}
