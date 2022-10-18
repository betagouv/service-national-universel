import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import LinkTo from "../../../assets/icons/LinkTo";
import CheckCircleStroke from "../../../assets/icons/CheckCircleStroke";
import CalendarBig from "../../../assets/icons/CalendarBig";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib/constants";
import { BorderButton, PlainButton } from "../components/Buttons";
import { isReturningParent } from "../commons";

export default function Presentation({ step, parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  useEffect(() => {
    if (young) {
      if (isReturningParent(young, parentId)) {
        const route = parentId === 2 ? "done-parent2" : "done";
        history.push(`/representants-legaux/${route}?token=${token}`);
      }
    }
  }, [young]);

  if (!young) return <Loader />;

  const sejourDate = COHESION_STAY_LIMIT_DATE[young.cohort];

  function onSubmit() {
    const route = parentId === 2 ? "verification-parent2" : "verification";
    history.push(`/representants-legaux/${route}?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616]">
          <h1 className="text-[31px] font-bold leading-40 text-[#21213F] mb-2">
            {parentId === 2 ? <>{young.firstName} s&apos;est inscrit au SNU&nbsp;!</> : <>{young.firstName} souhaite s&apos;inscrire au SNU&nbsp;!</>}
          </h1>
          <p className="text-[17px] leading-[28px] text-[#161616] mb-8">
            {parentId === 2 ? (
              <>Nous avons besoin de votre consentement au droit à l’image.</>
            ) : (
              <>Nous avons besoin de votre accord pour que {young.firstName} vive l’aventure du SNU.</>
            )}
          </p>

          <BorderButton href="https://www.snu.gouv.fr/" target="_blank" rel="noreferrer">
            Découvrir le SNU <LinkTo className="ml-2" />
          </BorderButton>

          <div className="flex my-8 pb-8  border-b border-[#e5e5e5] border-b-solid">
            <div className="flex-[1_0_0] mr-3 p-7 bg-[#fbfbfb]">
              <ul>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Dispositif financé par l&apos;État
                </li>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                  80 000 jeunes déjà engagés
                </li>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Renforcement de la cohésion nationale en développant une culture de l&apos;engagement
                </li>
                <li className="flex items-center mb-4 text-[14px] font-500">
                  <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                  Mixité sociale et territoriale
                </li>
                <li className="flex items-center text-[14px] font-500">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Accompagnement à l&apos;insertion sociale et professionnelle
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
              <PlainButton onClick={onSubmit}>Continuer vers la vérification</PlainButton>
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
