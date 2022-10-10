import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import StickyButton from "../../../components/inscription/stickyButton";
import FranceConnectButton from "../../inscription/components/FranceConnectButton";
import Navbar from "../components/Navbar";
import Loader from "../../../components/Loader";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";

export default function Consentement({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  const isParentFromFranceConnect = young[`parent1FromFranceConnect`] === "true";

  function getFranceConnectCallback() {
    return `representants-legaux/france-connect-callback?parent=1&token=${token}`;
  }
  function onSubmit() {
    history.push(`/representants-legaux/done?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Apporter votre consentement</h1>
        {isParentFromFranceConnect ? (
          <i>Les information en provenance de FranceConnect du représentant légal n°1 ont bien été enregistrées.</i>
        ) : (
          <FranceConnectButton callback={getFranceConnectCallback()} />
        )}

        <div>TODO</div>
      </div>
      <StickyButton
        text={"Valider mon consentement"}
        onClick={() => onSubmit()}
        onClickPrevious={() => history.push(`/representants-legaux/verification?token=${token}&parent=1`)}
      />
    </>
  );
}
