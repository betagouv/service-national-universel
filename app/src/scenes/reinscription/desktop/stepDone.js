import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import StickyButton from "../../../components/inscription/stickyButton";
import Validate from "../assets/Validate";

export default function StepWaitingConsent() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      <div className="bg-white p-4 text-[#161616] w-3/4 mx-auto h-96">
        <div className="w-full flex items-center">
          <Validate className="h-12 w-12" />
          <h1 className="text-xl font-semibold ml-2">
            {young.firstName} {young.lastName}, bienvenue au SNU !
          </h1>
        </div>
        <hr className="my-3 h-px bg-gray-200 border-0" />
        <p className="mb-4">
          Bonne nouvelle, <strong> votre inscription a déjà été validée.</strong>
        </p>
        <hr className="my-5 h-px bg-gray-200 border-0" />
        <div className="flex flex-col items-end w-full">
          <div className="flex justify-end space-x-4">
            <button
              className="flex items-center justify-center py-2 px-4 hover:!text-[#000091] border-[1px] hover:border-[#000091] hover:bg-white cursor-pointer bg-[#000091] text-white disabled:bg-[#E5E5E5] disabled:text-[#929292] disabled:border-[#E5E5E5]"
              onClick={() => history.push("/phase1")}>
              Revenir à mon compte volontaire
            </button>
          </div>
        </div>
      </div>
      <StickyButton text="Revenir à mon compte volontaire" onClick={() => history.push("/")} />
    </>
  );
}
