import React from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import StickyButton from "../../../components/inscription/stickyButton";
import Navbar from "../components/Navbar";

export default function MobileCniInvalide({ step }) {
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token } = params;

  function onSubmit() {
    history.push(`/representants-legaux/consentement?token=${token}&parent=${parent}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Voici les informations transmises par Joao</h1>
        <div>TODO</div>
      </div>
      <StickyButton text={"Suivant"} onClick={() => onSubmit()} onClickPrevious={() => history.push("/representants-legaux/presentation")} />
    </>
  );
}
