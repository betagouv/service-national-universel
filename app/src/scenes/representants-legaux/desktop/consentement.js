import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";

export default function Consentement({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  function onSubmit() {
    history.push(`/representants-legaux/consentement?token=${token}`);
  }
  function onPrevious() {
    history.push(`/representants-legaux/verification?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616]">
          <h1 className="text-[24px] leading-[32px] font-bold leading-40 text-[#21213F] mb-2">Apporter votre consentement</h1>

          <div className="text-[14px] leading-[20px] text-[#666666] mb-[32px] mt-2">
            <p>
              En tant que représentant(e) légal(e), utilisez ce bouton pour vous identifier avec FranceConnect et
              <b>vérifier votre identité et vos données personnelles</b> (nom, prénom, adresse email),
              ou complétez les informations <b>manuellement</b> ci-dessous.
            </p>
          </div>

          <div>// france connect</div>
          <div>// form</div>
          <div>// residence</div>
          <div>// participation SNU</div>
          <div>// covid</div>
          <div>// droit à l'image</div>

          <div className="flex justify-content-end pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <button className="flex items-center justify-center px-3 py-2 cursor-pointer border-[1px] border-solid border-[#000091] text-[#000091] mr-2" onClick={onPrevious}>
              Précédent
            </button>
            <button className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white" onClick={onSubmit}>
              Je valide mon consentement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
