import React from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import StickyButton from "../../../components/inscription/stickyButton";
import FranceConnectButton from "../../inscription/components/FranceConnectButton";
import Navbar from "../components/Navbar";

export default function MobileCniInvalide({ step }) {
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token } = params;

  function getFranceConnectCallback(idRepresentant) {
    return `representants-legaux/france-connect-callback?representant=${idRepresentant}`;
  }
  function onSubmit() {
    history.push(`/representants-legaux/done?token=${token}&parent=${parent}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Apporter votre consentement</h1>
        <FranceConnectButton callback={getFranceConnectCallback(1)} />
        <div>TODO</div>
      </div>
      <StickyButton text={"Suivant"} onClick={() => onSubmit()} onClickPrevious={() => history.push(`/representants-legaux/verification?token=${token}&parent=${parent}`)} />
    </>
  );
}
