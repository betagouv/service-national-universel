import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import StickyButton from "../../../components/inscription/stickyButton";
import Navbar from "../components/Navbar";
import Loader from "../../../components/Loader";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";

export default function Verification({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  function onSubmit() {
    history.push(`/representants-legaux/consentement?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Voici les informations transmises par Joao</h1>
        <div>TODO</div>
      </div>
      <StickyButton text={"Suivant"} onClick={() => onSubmit()} onClickPrevious={() => history.push(`/representants-legaux/presentation?token=${token}`)} />
    </>
  );
}
