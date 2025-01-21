import React from "react";

import { HiOutlineLightningBolt } from "react-icons/hi";

import { CohortDto, formatDepartement, GRADES, Phase1Routes, ReferentielRoutes, ReferentielTaskType, region2department, RegionsMetropole, TaskName, translate } from "snu-lib";
import { Button, CollapsableSelectSwitcher, Modal, SectionSwitcher } from "@snu/ds/admin";
import { useSetState } from "react-use";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AffectationService } from "@/services/affectationService";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { ReferentielService } from "@/services/ReferentielService";

interface AffectationSimulationMetropoleProps {
  session: CohortDto;
  onClose: () => void;
}

export default function AffectationSimulationMetropoleModal({ session, onClose }: AffectationSimulationMetropoleProps) {
  const queryClient = useQueryClient();

  const [state, setState] = useSetState<{
    niveauScolaires: string[];
    departements: Record<string, string[]>;
    etranger: boolean;
    affecterPDR: boolean;
  }>({
    niveauScolaires: session.eligibility?.schoolLevels?.filter((level: any) => Object.values(GRADES).includes(level)) || Object.values(GRADES),
    departements: RegionsMetropole.reduce((acc, region) => {
      acc[region] = region2department[region].filter((departement) => !session.eligibility?.zones || session.eligibility.zones.includes(departement));
      return acc;
    }, {}),
    etranger: true,
    affecterPDR: false,
  });

  const { isPending: isLoadingImports, data: routesImports } = useQuery<ReferentielRoutes["GetImports"]["response"]>({
    queryKey: ["last-task", TaskName.REFERENTIEL_IMPORT, ReferentielTaskType.IMPORT_ROUTES],
    queryFn: async () => ReferentielService.getImports({ name: TaskName.REFERENTIEL_IMPORT, type: ReferentielTaskType.IMPORT_ROUTES, limit: 1, sort: "DESC" }),
  });

  const sdrImport = routesImports?.[0];
  const isReady = state.niveauScolaires.length > 0 && Object.values(state.departements).some((departements) => departements.length > 0) && !!sdrImport;

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await AffectationService.postAffectationMetropole(session._id!, {
        departements: Object.keys(state.departements).reduce((acc, region) => [...acc, ...state.departements[region]], []),
        niveauScolaires: state.niveauScolaires as any,
        sdrImportId: sdrImport!.id,
        etranger: state.etranger,
        affecterPDR: state.affecterPDR,
      });
    },
    onSuccess: (task) => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      const queryKey = ["affectation", session._id];
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
            <h1 className="font-bold text-xl m-0">Affectation HTS (Hors DOM TOM)</h1>
            <p className="text-lg">
              La simulation se basera sur le schéma de répartition suivant : <b>{isLoadingImports ? "..." : sdrImport?.metadata?.parameters?.fileName || "--"}</b>
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
