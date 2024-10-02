import React from "react";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import humanCooperation from "../../../assets/humanCooperation.svg";
import { supportURL } from "@/config";
import { Container } from "@snu/ds/dsfr";

export default function Help({ supportLink = supportURL }) {
  return (
    <button className="m-0 w-full hover:text-[#161616]" onClick={() => window.open(supportLink, "_blank")?.focus()}>
      <div className="bg-[#F9F6F2] px-4 pt-4 pb-12 text-[#161616] md:hidden">
        <div className="flex justify-end">
          <img src={humanCooperation} alt="" />
        </div>
        <img src={arrowRightBlue} className="mb-2" />
        <div>
          <p className="my-2 text-lg font-bold">Besoin d&apos;aide ?</p>
          <p className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</p>
        </div>
      </div>

      <Container className="hidden md:flex px-4 py-4 items-center">
        <img src={arrowRightBlue} className="h-4 w-4 md:hidden" />
        <div className="flex items-center gap-4">
          <img src={humanCooperation} alt="" className="h-20 w-20" />
          <div>
            <p className="text-lg m-0 text-left font-bold">Besoin d&apos;aide ?</p>
            <p className="text-sm m-0">Consultez notre base de connaissance ou contactez notre équipe support</p>
          </div>
        </div>
        <img src={arrowRightBlue} className="ml-auto mr-8 h-6 w-6" />
      </Container>
    </button>
  );
}
