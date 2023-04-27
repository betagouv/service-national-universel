import React, { useContext, useEffect, useState } from "react";
import ConsentDone from "../../../assets/icons/ConsentDone";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";

export default function Done({ parentId }) {
  const { young } = useContext(RepresentantsLegauxContext);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (young) {
      if (parentId === 1) {
        if (young.parentAllowSNU === "true") {
          setTitle("Merci, nous avons bien enregistré votre consentement.");
          setText("Le dossier de votre enfant a bien été enregistré, celui-ci sera étudié ultérieurement.");
        } else {
          setTitle("Merci, nous avons bien enregistré votre refus.");
          setText("L'inscription de votre enfant a bien été refusée.");
        }
      } else {
        if (young.parent2AllowImageRights === "true") {
          setTitle("Merci, nous avons bien enregistré votre accord de droit à l'image.");
        } else {
          setTitle("Merci, nous avons bien enregistré votre refus du droit à l'image.");
        }
      }
    }
  }, [young]);

  return (
    <div className="flex justify-center bg-[#f9f6f2] py-10">
      <div className="relative mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
        <h2 className="border-b-solid m-[0] mb-[32px] border-b-[1px] border-b-[#E5E5E5] pb-[32px] text-[32px] font-bold leading-[40px] text-[#161616]">{title}</h2>
        <p>{text}</p>
        <p className="mt-[1em]">Vous pouvez à présent fermer cette page.</p>

        <div className="absolute top-[30px] right-[30px]">
          <ConsentDone />
        </div>
      </div>
    </div>
  );
}
