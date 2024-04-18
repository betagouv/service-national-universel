import React from "react";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import humanCooperation from "../../../assets/humanCooperation.svg";
import { supportURL } from "@/config";

import { Button } from "@snu/ds/dsfr";

export default function Help({ supportLink = supportURL }) {
  return (
    <Button className="mx-auto w-full hover:text-[#161616]" priority="tertiary no outline" onClick={() => window.open(supportLink, "_blank")?.focus()}>
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

      <div className="mx-auto my-8 hidden w-[56rem] items-center justify-between bg-white p-4 text-[#161616] shadow-sm md:flex">
        <img src={arrowRightBlue} className="h-4 w-4 md:hidden" />
        <div className="flex items-center gap-2">
          <img src={humanCooperation} alt="" className="hidden h-20 w-20 md:block" />
          <div>
            <p className="text-lg font-bold">Besoin d&apos;aide ?</p>
            <p className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</p>
          </div>
        </div>
        <img src={arrowRightBlue} className="mr-8 h-6 w-6" />
      </div>
    </Button>
  );
}
