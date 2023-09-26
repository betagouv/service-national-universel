import React, { useContext } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib/constants";
import CalendarBig from "../../../assets/icons/CalendarBig";
import CheckCircleStroke from "../../../assets/icons/CheckCircleStroke";
import LinkTo from "../../../assets/icons/LinkTo";
import Loader from "../../../components/Loader";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import { isReturningParent } from "../commons";
import { BorderButton } from "../components/Buttons";
import Navbar from "../components/Navbar";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";

export default function Presentation({ step, parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  if (isReturningParent(young, parentId)) {
    const route = parentId === 2 ? "done-parent2" : "done";
    return <Redirect to={`/representants-legaux/${route}?token=${token}`} />;
  }

  const translateNonNecessary = (status) => {
    if (status === "NOT_ELIGIBLE") return "est non éligible";
    if (status === "ABANDONED") return "a abandonné son inscription";
    if (status === "REFUSED") return "est refusé";
  };

  const sejourDate = COHESION_STAY_LIMIT_DATE[young.cohort];
  const title = parentId === 2 ? `${young.firstName} s'est inscrit(e) au SNU !` : `${young.firstName} souhaite s'inscrire au SNU !`;

  function onSubmit() {
    const route = parentId === 2 ? "verification-parent2" : "verification";
    history.push(`/representants-legaux/${route}?token=${token}`);
  }
  if (["NOT_ELIGIBLE", "ABANDONED", "REFUSED"].includes(young.status))
    return (
      <>
        <div className="bg-white p-4 text-[#161616]">
          <div className="flex flex-col gap-4">
            <h1 className="text-[22px] font-bold">Votre accord n&apos;est plus requis</h1>
            <div>Le jeune dont vous êtes représentant légal {translateNonNecessary(young.status)} au SNU. Votre accord n&apos;est plus requis.</div>
          </div>
        </div>
      </>
    );
  return (
    <>
      <Navbar step={step} />
      <>
        <DSFRContainer title={title}>
          <p className="mb-8 text-sm text-[#161616]">
            {parentId === 2 ? (
              <>Nous avons besoin de votre consentement au droit à l’image.</>
            ) : (
              <>Nous avons besoin de votre accord pour que {young.firstName} vive l’aventure du SNU.</>
            )}
          </p>
          <BorderButton href="https://www.snu.gouv.fr/" target="_blank" rel="noreferrer">
            Découvrir le SNU <LinkTo className="ml-2" />
          </BorderButton>

          <div className="flex flex-col bg-[#fbfbfb] p-4">
            <ul>
              <li className="mb-4 flex items-center text-sm font-medium">
                <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                Dispositif financé par l&apos;Etat
              </li>
              <li className="mb-4 flex items-center text-sm font-medium">
                <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                80 000 jeunes déjà engagés
              </li>
              <li className="mb-4 flex items-center text-sm font-medium">
                <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                Renforcement de la cohésion nationale en développant une culture de l&apos;engagement
              </li>
              <li className="mb-4 flex items-center text-sm font-medium">
                <CheckCircleStroke stroke="#D1D5DB" className="mr-2 flex-shrink-0" />
                Mixité sociale et territoriale
              </li>
              <li className="flex items-center text-[14px] font-medium">
                <CheckCircleStroke stroke="#979FAA" className="mr-2 flex-shrink-0" />
                Accompagnement à l&apos;insertion sociale et professionnelle
              </li>
            </ul>
          </div>
          <div className="flex flex-col bg-[#fbfbfb] p-4">
            <h2 className="mb-1.5 mt-0 text-[19px] font-bold">Première étape</h2>
            <p className="text-sm font-bold">Le séjour de cohésion : 2 semaines dans un autre département</p>
            <div className="flex flex-col items-center justify-center py-9">
              <div className="relative ">
                <CalendarBig />
                <CheckCircleStroke stroke="#E1000F" className="absolute bottom-[-5px] right-[-5px] h-[21px] w-[21px]" />
              </div>
              {sejourDate && (
                <p className="font-400 mt-3 text-center text-[15px] leading-[19px]">
                  {young.firstName} a choisi le séjour <br />
                  <span className="font-bold">{sejourDate}</span>
                </p>
              )}
            </div>
          </div>
          <SignupButtonContainer
            onClickNext={onSubmit}
            labelNext="Continuer vers la vérification"
            text="Votre consentement ne sera recueilli qu’à la troisième étape de ce formulaire"
          />
        </DSFRContainer>
      </>
    </>
  );
}
