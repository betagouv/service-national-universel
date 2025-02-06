import React from "react";

import { HiOutlineLightningBolt } from "react-icons/hi";

import {
  CohortDto,
  DEPART_SEJOUR_MOTIFS,
  formatDepartement,
  GRADES,
  Phase1Routes,
  region2department,
  regionList,
  translate,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  YoungDto,
} from "snu-lib";
import { Button, CollapsableSelectSwitcher, Modal, SectionSwitcher } from "@snu/ds/admin";
import { useSetState, useUpdateEffect } from "react-use";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { InscriptionService } from "@/services/inscriptionService";

interface BasculeJeuneValidesMetropoleProps {
  session: CohortDto;
  onClose: () => void;
}

export default function BasculeJeuneValidesMetropoleModal({ session, onClose }: BasculeJeuneValidesMetropoleProps) {
  const queryClient = useQueryClient();

  const [state, setState] = useSetState<{
    status: YoungDto["status"][];
    statusPhase1: YoungDto["statusPhase1"][];
    statusPhase1Motif: YoungDto["statusPhase1Motif"][];
    cohesionStayPresence: boolean;
    niveauScolaires: string[];
    departements: Record<string, string[]>;
    etranger: boolean;
    avenir: boolean;
  }>({
    status: [YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED],
    statusPhase1: [YOUNG_STATUS_PHASE1.NOT_DONE],
    statusPhase1Motif: [],
    cohesionStayPresence: false,
    niveauScolaires: session.eligibility?.schoolLevels?.filter((level: any) => Object.values(GRADES).includes(level)) || Object.values(GRADES),
    departements: regionList.reduce((acc, region) => {
      acc[region] = region2department[region].filter((departement) => !session.eligibility?.zones || session.eligibility.zones.includes(departement));
      return acc;
    }, {}),
    etranger: true,
    avenir: false,
  });

  const isReady = state.niveauScolaires.length > 0 && Object.values(state.departements).some((departements) => departements.length > 0);

  useUpdateEffect(() => {
    if (!state.status.includes(YOUNG_STATUS.VALIDATED)) {
      setState({ statusPhase1: [], statusPhase1Motif: [], cohesionStayPresence: false });
    }
  }, [state.status]);

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await InscriptionService.postBasculeJeunesValides(session._id!, {
        status: state.status,
        statusPhase1: state.statusPhase1,
        statusPhase1Motif: state.statusPhase1Motif,
        cohesionStayPresence: state.cohesionStayPresence,
        departements: Object.keys(state.departements).reduce((acc, region) => [...acc, ...state.departements[region]], []),
        niveauScolaires: state.niveauScolaires as any,
        etranger: state.etranger,
        avenir: state.avenir,
      });
    },
    onSuccess: (task) => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      const queryKey = ["inscription", "bascule-jeunes-valides", session._id];
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
      noBodyScroll
      onClose={onClose}
      className="md:max-w-[800px]"
      content={
        <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
                <HiOutlineLightningBolt className="w-6 h-6" />
              </div>
            </div>
            <h1 className="font-bold text-xl m-0">Bascule des jeunes validés</h1>
          </div>
          <div className="flex items-start flex-col w-full gap-8">
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Statuts de phase</h2>
              <CollapsableSelectSwitcher
                title="Phase 0"
                options={Object.values([YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED]).map((statut) => ({ label: translate(statut), value: statut }))}
                values={state.status as string[]}
                onChange={(values) => setState({ status: values as string[] })}
                isOpen={false}
              />
              {state.status.includes(YOUNG_STATUS.VALIDATED) && (
                <CollapsableSelectSwitcher
                  title="Phase 1"
                  options={Object.values([YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.NOT_DONE]).map((statut) => ({
                    label: translate(statut),
                    value: statut,
                  }))}
                  values={state.statusPhase1 as string[]}
                  onChange={(values) => setState({ statusPhase1: values as string[] })}
                  isOpen={false}
                />
              )}
            </div>
            {state.status.includes(YOUNG_STATUS.VALIDATED) && (
              <>
                <div className="flex flex-col w-full gap-2.5">
                  <h2 className="text-lg leading-7 font-bold m-0">Arrivées et départs</h2>
                  <SectionSwitcher
                    title="Présence à l'arrivée"
                    value={state.cohesionStayPresence}
                    onChange={(cohesionStayPresence) => setState({ cohesionStayPresence })}
                    className="py-2.5"
                  />
                  <CollapsableSelectSwitcher
                    title="Motif de départ"
                    options={Object.values(DEPART_SEJOUR_MOTIFS).map((motif) => ({ label: translate(motif), value: motif }))}
                    values={state.statusPhase1Motif as string[]}
                    onChange={(values) => setState({ statusPhase1Motif: values as string[] })}
                    isOpen={false}
                  />
                </div>
                <div className="flex flex-col w-full gap-2.5">
                  <h2 className="text-lg leading-7 font-bold m-0">Situations scolaires</h2>
                  <CollapsableSelectSwitcher
                    title="Niveaux"
                    options={Object.values(GRADES).map((grade) => ({ label: translate(grade), value: grade }))}
                    values={state.niveauScolaires}
                    onChange={(values) => setState({ niveauScolaires: values as string[] })}
                    isOpen={false}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Départements de résidence</h2>
              <div className="flex flex-col w-full">
                {regionList.map((region) => (
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
            <div className="flex flex-col w-full gap-2.5">
              <h2 className="text-lg leading-7 font-bold m-0">Cohorte à venir</h2>
              <SectionSwitcher title="Basculer tous les jeunes vers la cohorte à venir" value={state.avenir} onChange={(avenir) => setState({ avenir })} className="py-2.5" />
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
