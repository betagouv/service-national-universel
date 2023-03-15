import React from "react";
import { translateCohort } from "snu-lib";
import { RiErrorWarningLine } from "react-icons/ri";

export function Problem({ young }) {
  return (
    <div className="my-12 mx-10 w-full">
      <div className="max-w-[80rem] rounded-xl shadow my-0 md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 relative overflow-hidden justify-between bg-gray-50 md:bg-white mb-4">
        <section className="content">
          <section>
            <article className="flex flex-col items-center lg:flex-row lg:items-center">
              <div className="hidden md:flex flex-col mb-4 mr-8">
                <h1 className="text-5xl">Mon séjour de cohésion</h1>
                <div className="flex flex-row items-center">
                  <h1 className="text-5xl">
                    <strong>{translateCohort(young.cohort)}</strong>
                  </h1>
                </div>
              </div>
              <div className="flex md:hidden flex-col mb-4">
                <h1 className="text-sm text-gray-600 ">Séjour {translateCohort(young.cohort)}</h1>
              </div>
            </article>
          </section>
          <div className="flex flex-col md:flex-row items-center space-x-3 bg-yellow-50 rounded-xl p-4 mt-6">
            <RiErrorWarningLine className="text-yellow-400 text-3xl" />
            <div className="text-center md:!text-left">
              Il y a un problème avec votre affectation.
              <br />
              Nous sommes en train de le résoudre. Revenez plus tard dans l&apos;après-midi, avec nos excuses pour la gêne occasionnée.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
