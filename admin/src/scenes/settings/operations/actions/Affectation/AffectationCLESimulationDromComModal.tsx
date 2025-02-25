import React from "react";

import { HiOutlineLightningBolt } from "react-icons/hi";

import { CohortDto, formatDepartement, Phase1Routes, region2department, RegionsDromComEtCorse, translate } from "snu-lib";
import { Button, CollapsableSelectSwitcher, Modal, SectionSwitcher } from "@snu/ds/admin";
import { useSetState } from "react-use";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AffectationService } from "@/services/affectationService";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";

interface AffectationCLESimulationDromComModalProps {
  session: CohortDto;
  onClose: () => void;
}

export default function AffectationCLESimulationDromComModal({ session, onClose }: AffectationCLESimulationDromComModalProps) {
  const queryClient = useQueryClient();

  const [state, setState] = useSetState<{
    departements: Record<string, string[]>;
    etranger: boolean;
  }>({
    departements: RegionsDromComEtCorse.reduce((acc, region) => {
      acc[region] = region2department[region];
      return acc;
    }, {}),
    etranger: true,
  });

  const isReady = Object.values(state.departements).some((departements) => departements.length > 0);

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await AffectationService.postSimulationAffectationCLEDromCom(session._id!, {
        departements: Object.keys(state.departements).reduce((acc, region) => [...acc, ...state.departements[region]], []),
        etranger: state.etranger,
      });
    },
    onSuccess: (task) => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      const queryKey = ["affectation", "cle-dromcom", session._id];
      const oldStatus = queryClient.getQueryData<Phase1Routes["GetSimulationsRoute"]["response"]>(queryKey) || [];
      queryClient.setQueryData(queryKey, { ...oldStatus, simulation: { status: task.status } });
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
            <h1 className="font-bold text-xl m-0">Affectation CLE (DROM COM et Corse)</h1>
          </div>
          <div className="flex items-start flex-col w-full gap-8">
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Découpage territorial</h2>
              <div className="flex flex-col w-full">
                {RegionsDromComEtCorse.map((region) => (
                  <CollapsableSelectSwitcher
                    key={region}
                    title={region}
                    options={region2department[region]?.map((department) => ({ label: formatDepartement(department), value: department }))}
                    values={state.departements[region]}
                    onChange={(values) => setState({ departements: { ...state.departements, [region]: values } })}
                    isOpen={false}
                  />
                ))}
                <SectionSwitcher title="Etranger" value={state.etranger} onChange={(etranger) => setState({ etranger })} className="py-2.5" />
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onClose} />
          <Button disabled={!isReady || isPending} onClick={() => mutate()} title="Lancer une simulation" className="flex-1" />
        </div>
      }
    />
  );
}
