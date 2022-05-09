import React, { useState, useEffect } from "react";
import { HiBell } from "react-icons/hi";
import StepAgreement from "./step/stepAgreement.js";
import StepConvocation from "./step/stepConvocation.js";
import StepMedicalField from "./step/stepMedicalFile.js";
import StepRules from "./step/StepRules.js";

export default function StepsAffected({ young }) {
  if (!young) return null;
  const [nbvalid, setNbvalid] = useState(0);

  useEffect(() => {
    if (young) {
      let nb = 0;
      if (young.rulesYoung === "true") nb++;
      if (young.youngPhase1Agreement === "true") nb++;
      if (young.convocationFileDownload === "true") nb++;
      if (young.cohesionStayMedicalFileDownload === "true") nb++;
      setNbvalid(nb);
    }
  }, [young]);

  return (
    <>
      {/* Desktop view */}
      <section className="flex flex-col mb-5 mt-4 md:mt-0">
        <article className="mb-3">
          <div className="flex md:hidden flex-row items-center">
            {nbvalid !== 4 ? (
              <>
                <div className="flex items-center justify-center bg-orange-500 h-11 w-11 rounded-full mr-3">
                  <HiBell className="flex md:hidden w-5 h-5 text-white rounded-full" />
                </div>
              </>
            ) : null}
            <div className="flex flex-col">
              <h1 className="text-base leading-7">4 étapes pour continuer</h1>
              <p className="text-sm text-gray-500 leading-5">{nbvalid} de 4 tâches réalisées</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col">
            <h1 className="text-base leading-7">4 étapes pour continuer</h1>
            <p className="text-sm text-gray-500 leading-5">{nbvalid} de 4 tâches réalisées</p>
          </div>
        </article>
        <hr className="hidden md:flex text-gray-200 -mx-20" />
        <div className="flex flex-col ">
          <StepRules young={young} />
        </div>
        <hr className="hidden md:flex text-gray-200 -mx-20" />
        <div className="flex flex-col ">
          <StepAgreement young={young} />
        </div>
        <hr className="hidden md:flex text-gray-200 -mx-20" />
        <div className="flex flex-col ">
          <StepConvocation young={young} />
        </div>
        <hr className="hidden md:flex text-gray-200 -mx-20" />
        <div className="flex flex-col ">
          <StepMedicalField young={young} />
        </div>
        <hr className="hidden md:flex text-gray-200 -mx-20" />
      </section>
    </>
  );
}
