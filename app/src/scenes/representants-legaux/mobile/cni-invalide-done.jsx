import React from "react";
import ConsentDone from "../../../assets/icons/ConsentDone";
import Footer from "@/components/dsfr/layout/Footer";

export default function CniInvalidDone() {
  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ConsentDone />
            <h1 className="flex-1 text-[22px] font-bold">Merci, nous avons bien enregistré votre déclaration.</h1>
          </div>
          <hr className="my-2 h-px border-0 bg-gray-200" />
          <p className="mt-2 text-base text-[#161616]">Vous pouvez à présent fermer cette page.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
