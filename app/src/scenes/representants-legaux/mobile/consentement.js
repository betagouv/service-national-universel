import React from "react";
import { useHistory } from "react-router-dom";
import StickyButton from "../../../components/inscription/stickyButton";
import Navbar from "../components/Navbar";

export default function MobileCniInvalide({ step }) {
  const history = useHistory();
  function onSubmit() {
    history.push("/representants-legaux/done");
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Apporter votre consentement</h1>
        <div>TODO</div>
      </div>
      <StickyButton text={"Suivant"} onClick={() => onSubmit()} onClickPrevious={() => history.push("/representants-legaux/verification")} />
    </>
  );
}
