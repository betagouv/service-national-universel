import React, { useState } from "react";
import { HiOutlineOfficeBuilding, HiOutlineExclamation } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";

import { ModalConfirmation } from "@snu/ds/admin";
import { ClasseService } from "@/services/classeService";
import { YoungType, ClasseType, translate } from "snu-lib";
import api from "@/services/api";
import { capture } from "@/sentry";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  young: Omit<YoungType, "classeId"> & { classeId: string };
  setYoung: (young: YoungType) => void;
}

export default function ModalAffectationsForCLE({ isOpen, onClose, young, setYoung }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const youngId = young._id;
  const classeId = young.classeId;

  const { data: classe } = useQuery<ClasseType>({
    queryKey: ["classe", classeId],
    queryFn: async () => await ClasseService.getOne(classeId),
    enabled: !!classeId,
    refetchOnWindowFocus: false,
  });

  const centerFull = !classe?.session || !classe?.session.placesLeft || classe.session.placesLeft <= 0;
  const ligneFull = !classe?.ligne || classe.ligne.youngCapacity - classe.ligne.youngSeatsTaken <= 0;

  const isFull = centerFull || ligneFull;

  const onSendInfo = async () => {
    if (!classe) return;
    try {
      setIsLoading(true);
      const {
        young: youngResponse,
        ok,
        code,
      } = await api.post(`/young/${youngId}/phase1/affectation`, {
        centerId: classe.cohesionCenterId,
        sessionId: classe.sessionId,
        pdrOption: "ref-select",
        meetingPointId: classe.pointDeRassemblementId,
        ligneId: classe.ligneId,
      });
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(code));
      }
      setYoung(youngResponse);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(e.message));
    } finally {
      toastr.success("Succès !", "Le jeune a bien été affecté");
      setIsLoading(false);
      onClose();
    }
  };

  return isFull ? (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[800px]"
      icon={
        <div className="bg-red-100 rounded-full p-[11px]">
          <HiOutlineExclamation className="text-red-600" size={24} />
        </div>
      }
      title="Erreur !"
      text={
        <div className="w-2/3 mx-auto">
          <p className="text-base leading-6 font-normal">
            Impossible d’affecter ce jeune comme sa classe. Il manque de la place dans {centerFull ? "le centre." : "la ligne de bus."}
          </p>
        </div>
      }
      actions={[{ title: "Fermer", isCancel: true }]}
    />
  ) : (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[800px]"
      icon={
        <div className="bg-gray-100 rounded-full p-[11px]">
          <HiOutlineOfficeBuilding className="text-gray-900" size={24} />
        </div>
      }
      title="Affecter ce jeune comme sa classe"
      text={
        <div className="text-left mt-8">
          <p className="font-bold mb-2">Critères d'affectation :</p>
          <div className="bg-gray-50 rounded-md py-2.5 px-4 flex flex-col gap-2">
            <>
              <p>
                <span className="text-gray-500">Centre : </span>
                {classe.cohesionCenter?.name}
              </p>
              <p>
                <span className="text-gray-500">Point de rassemblement : </span>
                {classe.pointDeRassemblement?.name}
              </p>
              <p>
                <span className="text-gray-500">Ligne de bus : </span>
                {classe.ligne?.busId}
              </p>
            </>
          </div>
        </div>
      }
      actions={[
        { title: "Annuler", isCancel: true },
        {
          title: "Valider",
          loading: isLoading,
          onClick: () => onSendInfo(),
        },
      ]}
    />
  );
}
