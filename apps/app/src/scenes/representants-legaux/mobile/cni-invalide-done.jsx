import React from "react";
import ConsentDone from "../../../assets/icons/ConsentDone";
import Footer from "../../../components/footerV2";

export default function CniInvalidDone() {
  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ConsentDone />
            <h1 className="text-[22px] font-bold flex-1">Merci, nous avons bien enregistré votre déclaration.</h1>
          </div>
          <hr className="my-2 h-px bg-gray-200 border-0" />
          <p className="text-[#161616] text-base mt-2">Vous pouvez à présent fermer cette page.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
