import React, { useContext, useEffect, useState } from "react";
import ConsentDone from "../../../assets/icons/ConsentDone";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";

export default function Done() {
  const { young } = useContext(RepresentantsLegauxContext);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (young) {
      if (young.parentAllowSNU === "true") {
        setTitle("Merci, nous avons bien enregistré votre consentement.");
        setText("Le dossier de votre enfant a bien été enregsitré, celui-ci sera étudié ultérieurement.");
      } else {
        setTitle("Merci, nous avons bien enregistré votre refus.");
        setText("L'inscription de votre enfant a bien été refusée.");
      }
    }
  }, [young]);

  return (
    <div className="bg-[#f9f6f2] flex justify-center py-10">
      <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616] relative">
        <h2 className="font-bold text-[#161616] text-[32px] leading-[40px] pb-[32px] border-b-solid border-b-[1px] border-b-[#E5E5E5] m-[0] mb-[32px]">{title}</h2>
        <p>{text}</p>
        <p className="mt-[1em]">Vous pouvez à présent fermer cette page.</p>

        <div className="absolute top-[30px] right-[30px]">
          <ConsentDone />
        </div>
      </div>
    </div>
  );
}
