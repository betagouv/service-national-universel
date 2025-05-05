import React from "react";
import { Button, Modal } from "@snu/ds/admin";
import { BsClipboardCheck } from "react-icons/bs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClasseService } from "@/services/classeService";
import { toastr } from "react-redux-toastr";
import { ClassesRoutes, translate } from "snu-lib";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCount: number;
  classeId: string;
  mapping: Record<string, string>;
  fileKey: string;
  onSuccess: () => void;
}

export const SuccessModal = ({ isOpen, onClose, studentCount, classeId, mapping, fileKey, onSuccess }: SuccessModalProps) => {
  const queryClient = useQueryClient();

  const { mutate: confirmImport, isPending: isImporting } = useMutation({
    mutationFn: () => ClasseService.importInscriptionEnMasse(classeId, mapping, fileKey),
    onSuccess: (task: ClassesRoutes["InscriptionEnMasseImporter"]["response"]) => {
      onSuccess();
      queryClient.setQueryData(["inscription-en-masse", classeId], () => ({
        status: task.status,
        statusDate: task.updatedAt,
      }));
      queryClient.invalidateQueries({ queryKey: ["inscription-en-masse", classeId] });
      toastr.success("Le traitement d'import des élèves a été lancé avec succès", "");
    },
    onError: (e: any) => {
      toastr.error("Une erreur est survenue lors de l'envoi du traitement d'import des élèves", translate(e.code));
    },
  });

  const header = (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
        <BsClipboardCheck className="w-8 h-8 text-gray-800" />
      </div>
    </div>
  );

  const content = <h2 className="text-xl leading-7 font-medium text-center mt-0 mb-8">Vous vous apprêtez à inscrire {studentCount} nouveaux élèves à cette classe.</h2>;

  const footer = (
    <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
      <Button onClick={onClose} title="Annuler" type="secondary" />
      <Button onClick={() => confirmImport()} title="Confirmer l'inscription" loading={isImporting} />
    </div>
  );

  return <Modal isOpen={isOpen} onClose={onClose} header={header} content={content} footer={footer} className="sm:max-w-lg mx-auto" />;
};
