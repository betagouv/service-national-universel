import React from "react";

import { HiOutlineLightningBolt } from "react-icons/hi";

import { formatDepartement, GRADES, Phase1Routes, region2department, RegionsMetropole, translate } from "snu-lib";
import { Button, CollapsableSelectSwitcher, Modal, SectionSwitcher } from "@snu/ds/admin";
import { useSetState } from "react-use";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AffectationService } from "@/services/affectationService";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";

interface AffectationSimulationMetropoleProps {
  sessionId: string;
  onClose: () => void;
}

export default function AffectationSimulationMetropoleModal({ sessionId, onClose }: AffectationSimulationMetropoleProps) {
  const queryClient = useQueryClient();
  const [state, setState] = useSetState<{
    niveauScolaires: string[];
    departements: Record<string, string[]>;
    etranger: boolean;
    affecterPDR: boolean;
  }>({
    niveauScolaires: Object.values(GRADES),
    departements: RegionsMetropole.reduce((acc, region) => {
      acc[region] = region2department[region];
      return acc;
    }, {}),
    etranger: false,
    affecterPDR: false,
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await AffectationService.postAffectationMetropole(sessionId, {
        departements: Object.keys(state.departements).reduce((acc, region) => [...acc, ...state.departements[region]], []),
        niveauScolaires: state.niveauScolaires as any,
        changementDepartements: [],
        etranger: state.etranger,
        affecterPDR: state.affecterPDR,
      });
    },
    onSuccess: (task) => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      const oldTasks = queryClient.getQueryData<Phase1Routes["GetSimulationsRoute"]["response"]>(["affectation-simulations-pending"]) || [];
      queryClient.setQueryData(["affectation-simulations-pending"], [...oldTasks, task]);
      onClose();
    },
    onError: (error: any) => {
      capture(error);
      toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message), { timeOut: 5000 });
    },
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="md:max-w-[800px]"
      content={
        <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col items-center text-center gap-6 mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
                <HiOutlineLightningBolt className="w-6 h-6" />
              </div>
            </div>
            <h1 className="font-bold text-xl m-0">Affectation HTS (Hors DOM TOM)</h1>
            <p className="text-lg">
              La simulation se basera sur le schéma de répartition suivant : <b>Nom-du-Fichier.xxx</b>
            </p>
          </div>
          <div className="flex items-start flex-col w-full gap-8">
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Situations scolaires</h2>
              <CollapsableSelectSwitcher
                title="Niveaux"
                options={Object.values(GRADES).map((grade) => ({ label: translate(grade), value: grade }))}
                values={state.niveauScolaires}
                onChange={(values) => setState({ niveauScolaires: values as any })}
                isOpen={false}
              />
            </div>
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Découpage territorial</h2>
              <div className="flex flex-col w-full">
                {RegionsMetropole.map((region) => (
                  <CollapsableSelectSwitcher
                    key={region}
                    title={region}
                    options={region2department[region].map((department) => ({ label: formatDepartement(department), value: department }))}
                    values={state.departements[region]}
                    onChange={(values) => setState({ departements: { ...state.departements, [region]: values } })}
                    isOpen={false}
                  />
                ))}
                <SectionSwitcher title="Etranger" disabled value={state.etranger} onChange={(etranger) => setState({ etranger })} />
              </div>
            </div>
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Points de rassemblement</h2>
              <SectionSwitcher title="Affecter les PDR" disabled value={state.affecterPDR} onChange={(affecterPDR) => setState({ affecterPDR })} />
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onClose} />
          <Button disabled={isPending} onClick={() => mutate()} title="Lancer une simulation" className="flex-1" />
        </div>
      }
    />
  );
}
