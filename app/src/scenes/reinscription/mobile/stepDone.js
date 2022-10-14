import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Footer from "../../../components/footerV2";
import StickyButton from "../../../components/inscription/stickyButton";
import Validate from "../assets/Validate";

export default function StepWaitingConsent() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="w-full flex justify-between items-center">
          <Validate className="h-12 w-12" />
          <h1 className="text-xl font-semibold ml-2">
            {young.firstName} {young.lastName}, bienvenue au SNU !
          </h1>
        </div>
        <hr className="my-3 h-px bg-gray-200 border-0" />
        <p className="mb-2">
          Bonne nouvelle, <strong> votre inscription a déjà été validée.</strong>
        </p>
      </div>
      <Footer marginBottom={"12vh"} />
      <StickyButton text="Revenir à mon compte volontaire" onClick={() => history.push("/phase1")} />
    </>
  );
}
