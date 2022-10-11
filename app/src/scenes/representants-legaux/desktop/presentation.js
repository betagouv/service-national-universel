import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import LinkTo from "../../../assets/icons/LinkTo";
import CheckCircleStroke from "../../../assets/icons/CheckCircleStroke";
import CalendarBig from "../../../assets/icons/CalendarBig";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib/constants";

export default function Presentation({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  const sejourDate = COHESION_STAY_LIMIT_DATE[young.cohort];

  function onSubmit() {
    history.push(`/representants-legaux/verification?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616]">
          <h1 className="text-[31px] font-bold leading-40 text-[#21213F] mb-2">{young.firstName} souhaite s&apos;inscrire au SNU&nbsp;!</h1>

          <p className="text-[17px] leading-[28px] text-[#161616] mb-8">Nous avons besoin de votre accord pour que {young.firstName} vive l’aventure du SNU.</p>

          <a
            href="https://www.snu.gouv.fr/"
            target="_blank"
            className="inline-flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091]"
            rel="noreferrer">
            Découvrir le SNU <LinkTo className="ml-2" />
          </a>

          <div className="flex my-8 pb-8  border-b border-[#e5e5e5] border-b-solid">
            <div className="flex-[1_0_0] mr-3 p-7 bg-[#fbfbfb]">
              <ul>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Frais de séjour pris en charge par l’État
                </li>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                  80 000 jeunes se sont déjà engagés
                </li>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Pour mettre son énergie et ses valeurs au service d’une société solidaire
                </li>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                  Réalisation d’une mission d’intérêt général (phase 2)
                </li>
                <li className="flex items-center text-[14px] font-500">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Possibilité de poursuivre son engagement en phase 3
                </li>
              </ul>
            </div>
            <div className="flex-[1_0_0] ml-3 py-7 px-[20px] bg-[#fbfbfb]">
              <h2 className="text-[19px] font-bold mb-1.5 mt-0">Première étape</h2>
              <p className="text-[14px] font-bold">Le séjour de cohésion : 2 semaines dans un autre département</p>
              <div className="flex items-center justify-center mt-9">
                <div className="relative ">
                  <CalendarBig />
                  <CheckCircleStroke stroke="#E1000F" className="absolute bottom-[-5px] right-[-5px] w-[21px] h-[21px]" />
                </div>
              </div>
              {sejourDate && (
                <p className="text-[15px] font-400 leading-[19px] mt-3 text-center">
                  {young.firstName} a choisi le séjour du <span className="">{sejourDate}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-content-end">
            <div className="w-[256px]">
              <button className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white" onClick={onSubmit}>
                Continuer vers la vérification
              </button>
              <div className="text-center text-[13px] leading-[18px] font-400 mt-1.5">
                Votre consentement ne sera recueilli qu’à la <b>troisième étape</b> de ce formulaire
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
