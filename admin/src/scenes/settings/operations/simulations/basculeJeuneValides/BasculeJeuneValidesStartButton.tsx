import React, { useMemo } from "react";
import { useToggle } from "react-use";
import { toastr } from "react-redux-toastr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import cx from "classnames";
import { HiOutlineLightningBolt, HiPlay } from "react-icons/hi";

import {
  formatDepartement,
  InscriptionRoutes,
  region2department,
  RegionsMetropole,
  SENDINBLUE_TEMPLATES,
  SimulationBasculerJeunesValidesTaskDto,
  TaskStatus,
  translate,
} from "snu-lib";
import { Button, Modal } from "@snu/ds/admin";

import { capture } from "@/sentry";
import { isBefore } from "date-fns";
import { Link } from "react-router-dom";
import { InscriptionService } from "@/services/inscriptionService";
import { Checkbox } from "@snu/ds";

interface BasculeJeuneValidesStartButtonProps {
  simulation: unknown;
}

export default function BasculeJeuneValidesStartButton({ simulation }: BasculeJeuneValidesStartButtonProps) {
  const simulationBascule = simulation as SimulationBasculerJeunesValidesTaskDto;
  const queryClient = useQueryClient();

  const [sendEmail, toggleSentEmail] = useToggle(true);
  const [showModal, toggleModal] = useToggle(false);

  const regions = useMemo(
    () =>
      RegionsMetropole.reduce((acc, region) => {
        acc[region] = simulationBascule.metadata?.parameters?.departements?.filter((dep) => region2department[region].includes(dep)) || [];
        return acc;
      }, {}),
    [simulationBascule],
  );

  const affectationKey = ["inscription", "bacule-jeunes-valides", simulationBascule.metadata!.parameters!.sessionId]; // check BasculeJeuneValidesModal.tsx queryKey
  const {
    isPending: isLoading,
    isError,
    data: affectationStatus,
  } = useQuery<InscriptionRoutes["GetBasculerJeunesValides"]["response"]>({
    queryKey: affectationKey,
    queryFn: async () => InscriptionService.getBasculerJeunesValides(simulationBascule.metadata!.parameters!.sessionId),
  });

  const isOutdated =
    [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(affectationStatus?.traitement.status as TaskStatus) ||
    (!!affectationStatus?.traitement?.lastCompletedAt && isBefore(new Date(simulationBascule.createdAt), new Date(affectationStatus.traitement.lastCompletedAt)));

  const totalJeunes = (simulationBascule.metadata?.results?.jeunesProchainSejour || 0) + (simulationBascule.metadata?.results?.jeunesAvenir || 0);
  const isDisabled = totalJeunes <= 0 || simulationBascule.status !== TaskStatus.COMPLETED || isLoading || isError || isOutdated;

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await InscriptionService.postValiderBasculerJeunesValides(simulationBascule.metadata!.parameters!.sessionId!, simulationBascule.id, { sendEmail });
    },
    onSuccess: () => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      queryClient.invalidateQueries({ queryKey: affectationKey });
      toggleModal(false);
    },
    onError: (error: any) => {
      capture(error);
      toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message), { timeOut: 5000 });
    },
  });

  return (
    <>
      <button onClick={toggleModal}>
        <HiPlay className={cx({ "text-gray-400": isDisabled, "text-blue-600": !isDisabled })} size={50} />
      </button>
      <Modal
        isOpen={showModal}
        noBodyScroll
        onClose={toggleModal}
        className="md:max-w-[800px]"
        content={
          <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
                  <HiOutlineLightningBolt className="w-6 h-6" />
                </div>
              </div>
              <h1 className="font-bold text-xl m-0">Bascule des jeunes validés</h1>
              <p className="text-lg">Vérifier les paramètres avant de lancer ce traitement.</p>
            </div>
            <div className="flex items-start flex-col w-full gap-8">
              <div className="flex flex-col w-full gap-1.5">
                <h2 className="text-lg leading-7 font-bold m-0">Suivi</h2>
                <div>Sur un séjour : {simulationBascule.metadata?.results?.jeunesProchainSejour ?? "--"}</div>
                <div>Sur le séjour à venir : {simulationBascule.metadata?.results?.jeunesAvenir ?? "--"}</div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Statuts de phase</h2>
                <div className="flex gap-2">
                  <div className="text-gray-400">Phase 0&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">{simulationBascule.metadata?.parameters?.status?.map((status) => translate(status)).join(", ") || "Aucun"}</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-gray-400">Phase 1&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">
                    {simulationBascule.metadata?.parameters?.statusPhase1?.map((status) => translate(status)).join(", ") || "Aucun"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Arrivées et départs</h2>
                <div className="flex gap-2">
                  <div className="text-gray-400">Présence à l'arrivée&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">{simulationBascule.metadata?.parameters?.cohesionStayPresence ? "oui" : "non"}</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-gray-400">Motif de départ&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">
                    {simulationBascule.metadata?.parameters?.statusPhase1Motif?.map((motif) => translate(motif)).join(", ") || "Aucun"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Situations scolaires</h2>
                <div className="flex gap-2">
                  <div className="text-gray-400">Niveaux&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">
                    {simulationBascule.metadata?.parameters?.niveauScolaires?.map((niveau) => translate(niveau)).join(", ") || "Aucun"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Départements de résidence</h2>
                <div className="flex flex-col w-full gap-4">
                  {RegionsMetropole.map((region) => (
                    <div key={region} className="flex gap-2">
                      <div className="text-gray-400 min-w-[200px]">{region}&nbsp;:</div>
                      <div className="text-sm leading-5 font-normal">{regions[region].map(formatDepartement).join(", ") || "Aucun"}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="text-gray-400">Etranger&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">{simulationBascule.metadata?.parameters?.etranger ? "Oui" : "Non"}</div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Cohorte à venir</h2>
                <div className="flex gap-2">
                  <div className="text-gray-400">Basculer tous les jeunes vers la cohorte à venir: </div>
                  <div className="text-sm leading-5 font-normal">{simulationBascule.metadata?.parameters?.avenir ? "Oui" : "Non"}</div>
                </div>
              </div>
              <div className="flex align-top w-full gap-2.5">
                <Checkbox className="mt-1" checked={sendEmail} onChange={toggleSentEmail} />
                <div>
                  <b>Envoyer une campagne d'emailing aux volontaires ({totalJeunes}) et à leurs représentants légaux.</b>
                  <div className="flex gap-4">
                    {(simulationBascule.metadata?.results?.jeunesProchainSejour || 0) > 0 && (
                      <Link
                        to={`/email-preview/${SENDINBLUE_TEMPLATES.BASCULE_SEJOUR_ELIGIBLE}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-800 underline inline-flex items-center">
                        Visualiser l'aperçu du template {SENDINBLUE_TEMPLATES.BASCULE_SEJOUR_ELIGIBLE}
                      </Link>
                    )}
                    {(simulationBascule.metadata?.results?.jeunesAvenir || 0) > 0 && (
                      <Link
                        to={`/email-preview/${SENDINBLUE_TEMPLATES.BASCULE_SEJOUR_AVENIR}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-800 underline inline-flex items-center">
                        Visualiser l'aperçu du template {SENDINBLUE_TEMPLATES.BASCULE_SEJOUR_AVENIR}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={() => toggleModal(false)} />
            <Button disabled={isPending || isDisabled} loading={isPending} onClick={() => mutate()} title="Lancer le traitement" className="flex-1" />
          </div>
        }
      />
    </>
  );
}
