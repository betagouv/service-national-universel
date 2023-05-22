import React from "react";
import ConsentDone from "../../../assets/icons/ConsentDone";

export default function CniInvalidDone() {
  return (
    <div className="flex justify-center bg-[#f9f6f2] py-10">
      <div className="relative mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
        <h2 className="border-b-solid m-[0] mb-[32px] border-b-[1px] border-b-[#E5E5E5] pb-[32px] text-[32px] font-bold leading-[40px] text-[#161616]">
          Merci, nous avons bien enregistré votre déclaration.
        </h2>
        <p className="mt-[1em]">Vous pouvez à présent fermer cette page.</p>

        <div className="absolute top-[30px] right-[30px]">
          <ConsentDone />
        </div>
      </div>
    </div>
  );
}
