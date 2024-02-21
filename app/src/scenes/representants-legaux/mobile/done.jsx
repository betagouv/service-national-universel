import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import ConsentDone from "../../../assets/icons/ConsentDone";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import Loader from "@/components/Loader";

export default function Done({ parentId }) {
  const { young } = useContext(RepresentantsLegauxContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromRI = queryParams.get("fromRI") === "true";
  const title = getTitle();
  const text = getText();

  function getTitle() {
    if (parentId === 1) return young?.parentAllowSNU === "true" ? "Merci, nous avons bien enregistré votre consentement." : "Merci, nous avons bien enregistré votre refus.";
    return young?.parent2AllowImageRights === "true"
      ? "Merci, nous avons bien enregistré votre accord de droit à l'image."
      : "Merci, nous avons bien enregistré votre refus du droit à l'image.";
  }

  function getText() {
    if (fromRI) return "";
    if (parentId === 1)
      return young?.parentAllowSNU === "true"
        ? "Le dossier de votre enfant a bien été enregistré, celui-ci sera étudié ultérieurement."
        : "L'inscription de votre enfant a bien été refusée.";
    return "";
  }

  if (!young) return <Loader />;

  return (
    <>
      <DSFRContainer>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ConsentDone />
            <h1 className="flex-1 text-[22px] font-bold">{title}</h1>
          </div>
          <hr className="my-2 h-px border-0 bg-gray-200" />
          <p className="text-base text-[#161616] ">{text}</p>
          <p className="mt-2 mb-8 text-base text-[#161616]">Vous pouvez à présent fermer cette page.</p>
        </div>
      </DSFRContainer>
    </>
  );
}
