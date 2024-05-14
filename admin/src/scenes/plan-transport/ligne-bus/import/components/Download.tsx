import React from "react";
import { useSelector } from "react-redux";
import { BsDownload } from "react-icons/bs";

import { COHORT_TYPE } from "snu-lib";

import { CDN_BASE_URL } from "@/utils";
import { CohortState } from "@/redux/cohorts/reducer";

import { PlainButton } from "../../../components/Buttons";

interface Props {
  cohort: string;
  addLigne?: string | null;
  onNextStep: () => void;
}

export default function Download({ cohort, addLigne, onNextStep }: Props) {
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const currentCohort = cohorts.find((c) => c.name === cohort);

  return (
    <>
      {addLigne ? (
        <div className="mt-8 flex w-full flex-col rounded-xl px-8 pt-12 pb-24 bg-white">
          <h1 className="text-lg leading-6 font-medium mx-auto mb-4 text-gray-900">Pré-requis</h1>
          <p className="mx-auto text-sm leading-5 font-normal text-gray-500">Aucune ligne déjà existante ne sera remplacée.</p>
          <p className="mx-auto text-sm leading-5 font-normal text-gray-500">Aucune suppression ne sera effectuée si une ligne n’existe pas dans le fichier partiel.</p>
          <p className="mx-auto text-sm leading-5 font-normal text-gray-500">Chaque nouvelle ligne détectée sera ajoutée.</p>
          <PlainButton className="w-52 mx-auto mt-6" onClick={onNextStep}>
            Suivant
          </PlainButton>
        </div>
      ) : (
        <div className="mt-8 flex w-full flex-col rounded-xl px-8 pt-12 pb-24 bg-white">
          <h1 className="text-lg leading-6 font-medium mx-auto mb-4 text-gray-900">Le modèle vierge</h1>
          <p className="mx-auto text-sm leading-5 font-normal text-gray-500">Téléchargez le modèle de plan de transport. Renseignez-le en tenant compte du guide de remplissage.</p>
          <p className="mx-auto text-sm leading-5 font-normal text-gray-500">Puis téléversez votre plan de transport complété.</p>
          <div className="flex items-center gap-3 mx-auto pt-10">
            <a
              className="flex items-center gap-3 rounded-md border !border-blue-600 bg-white py-2 px-4 text-sm font-medium text-blue-700 hover:shadow"
              href={
                currentCohort?.type === COHORT_TYPE.CLE ? `${CDN_BASE_URL}/file/snu-plan-de-transport-model-CLE.xlsx` : `${CDN_BASE_URL}/file/snu-plan-de-transport-model.xlsx`
              }>
              <BsDownload className="text-blue-600" />
              Télécharger le modèle
            </a>
            <PlainButton className="w-52" onClick={onNextStep}>
              Suivant
            </PlainButton>
          </div>
        </div>
      )}
    </>
  );
}
