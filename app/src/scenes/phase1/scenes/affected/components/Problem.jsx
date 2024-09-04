import React from "react";
import { getCohortPeriod } from "snu-lib";
import { RiErrorWarningLine } from "react-icons/ri";
import useAuth from "@/services/useAuth";

export default function Problem() {
  const { young } = useAuth();

  return (
    <div className="my-12 mx-10 w-full">
      <div className="relative my-0 mb-4 max-w-[80rem] justify-between overflow-hidden rounded-xl bg-gray-50 px-4 py-8 shadow md:mx-auto md:bg-white md:!px-8 lg:!px-16">
        <section className="content">
          <section>
            <article className="flex flex-col items-center lg:flex-row lg:items-center">
              <div className="mb-4 mr-8 hidden flex-col md:flex">
                <h1 className="text-5xl">Mon séjour de cohésion</h1>
                <div className="flex flex-row items-center">
                  <h1 className="text-5xl">
                    <strong>{getCohortPeriod(young.cohortData)}</strong>
                  </h1>
                </div>
              </div>
              <div className="mb-4 flex flex-col md:hidden">
                <h1 className="text-sm text-gray-600 ">Séjour {getCohortPeriod(young.cohortData)}</h1>
              </div>
            </article>
          </section>
          <div className="mt-6 flex flex-col items-center space-x-3 rounded-xl bg-yellow-50 p-4 md:flex-row">
            <RiErrorWarningLine className="text-3xl text-yellow-400" />
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
