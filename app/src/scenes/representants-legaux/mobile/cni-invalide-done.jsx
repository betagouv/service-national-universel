import React from "react";
import ConsentDone from "../../../assets/icons/ConsentDone";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";

export default function CniInvalidDone() {
  return (
    <DSFRContainer
      title={
        <div className="flex items-center gap-4">
          <ConsentDone />
          <h1 className="flex-1 text-[22px] font-bold">Merci, nous avons bien enregistré votre déclaration.</h1>
        </div>
      }>
      <div className="flex flex-col gap-4">
        <p className="mt-2 mb-8 text-base text-[#161616]">Vous pouvez à présent fermer cette page.</p>
      </div>
    </DSFRContainer>
  );
}
