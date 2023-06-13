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

  const translateNonNecessary = (status) => {
    if (status === "NOT_ELIGIBLE") return "est non éligible";
    if (status === "ABANDONED") return "a abandonné son inscription";
    if (status === "REFUSED") return "est refusé";
  };

  function onSubmit() {
    const route = parentId === 2 ? "verification-parent2" : "verification";
    history.push(`/representants-legaux/${route}?token=${token}`);
  }
  if (["NOT_ELIGIBLE", "ABANDONED", "REFUSED"].includes(young.status))
    return (
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
          <h1 className="leading-40 mb-2 text-[31px] font-bold text-[#21213F]">Votre accord n&apos;est plus requis</h1>
          <div>Le jeune dont vous êtes représentant légal {translateNonNecessary(young.status)} au SNU. Votre accord n&apos;est plus requis.</div>
        </div>
      </div>
    );
  return (
    <>
      <Navbar step={step} />
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
          <h1 className="leading-40 mb-2 text-[31px] font-bold text-[#21213F]">
            {parentId === 2 ? <>{young.firstName} s&apos;est inscrit(e) au SNU&nbsp;!</> : <>{young.firstName} souhaite s&apos;inscrire au SNU&nbsp;!</>}
          </h1>
          <p className="mb-8 text-[17px] leading-[28px] text-[#161616]">
            {parentId === 2 ? (
              <>Nous avons besoin de votre consentement au droit à l’image.</>
            ) : (
              <>Nous avons besoin de votre accord pour que {young.firstName} vive l’aventure du SNU.</>
            )}
          </p>

          <BorderButton href="https://www.snu.gouv.fr/" target="_blank" rel="noreferrer">
            Découvrir le SNU <LinkTo className="ml-2" />
          </BorderButton>

          <div className="border-b-solid my-8 flex  border-b border-[#e5e5e5] pb-8">
            <div className="mr-3 flex-[1_0_0] bg-[#fbfbfb] p-7">
              <ul>
                <li className="font-500 mb-4 flex items-center text-[14px]">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Dispositif financé par l&apos;État
                </li>
                <li className="font-500 mb-4 flex items-center text-[14px]">
                  <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                  80 000 jeunes déjà engagés
                </li>
                <li className="font-500 mb-4 flex items-center text-[14px]">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Renforcement de la cohésion nationale en développant une culture de l&apos;engagement
                </li>
                <li className="font-500 mb-4 flex items-center text-[14px]">
                  <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                  Mixité sociale et territoriale
                </li>
                <li className="font-500 flex items-center text-[14px]">
                  <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                  Accompagnement à l&apos;insertion sociale et professionnelle
                </li>
              </ul>
            </div>
            <div className="ml-3 flex-[1_0_0] bg-[#fbfbfb] py-7 px-[20px]">
              <h2 className="mb-1.5 mt-0 text-[19px] font-bold">Première étape</h2>
              <p className="text-[14px] font-bold">Le séjour de cohésion : 2 semaines dans un autre département</p>
              <div className="mt-9 flex items-center justify-center">
                <div className="relative ">
                  <CalendarBig />
                  <CheckCircleStroke stroke="#E1000F" className="absolute bottom-[-5px] right-[-5px] h-[21px] w-[21px]" />
                </div>
              </div>
              {sejourDate && (
                <p className="font-400 mt-3 text-center text-[15px] leading-[19px]">
                  {young.firstName} a choisi le séjour du <span className="">{sejourDate}</span>
                </p>
              )}
            </div>
          </div>

          <div className="justify-content-end flex">
            <div className="w-[256px]">
              <PlainButton onClick={onSubmit}>Continuer vers la vérification</PlainButton>
              <div className="font-400 mt-1.5 text-center text-[13px] leading-[18px]">
                Votre consentement ne sera recueilli qu’à la <b>troisième étape</b> de ce formulaire
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
