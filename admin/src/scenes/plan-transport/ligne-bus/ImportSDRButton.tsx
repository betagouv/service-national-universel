import React, { useState } from "react";
import cx from "classnames";
import { useToggle } from "react-use";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { HttpError, MIME_TYPES, ReferentielTaskType, translate } from "snu-lib";
import { Button, InputFile, Modal } from "@snu/ds/admin";

import { FILE_SIZE_LIMIT } from "@/services/file.service";
import { ReferentielService } from "@/services/ReferentielService";

interface ImportSDRButtonProps {
  className?: string;
}

// TODO: à déplacer une fois l'écran général d'import des fichiers ajouté
export default function ImportSDRButton({ className }: ImportSDRButtonProps) {
  const [showModal, toggleModal] = useToggle(false);

  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();

  const { isPending, mutate } = useMutation({
    mutationFn: async () => ReferentielService.importFile(ReferentielTaskType.IMPORT_ROUTES, file!),
    onSuccess: () => {
      toastr.success("Le fichier a bien été importé", "", { timeOut: 5000 });
      toggleModal();
    },
    onError: (error: HttpError) => {
      console.log(error);
      toastr.error("Une erreur est survenue. Nous n'avons pu enregistrer le fichier.", `${translate(error.message)}: ${error.description}`);
    },
  });

  const handleAddFile = (event) => {
    if (event.target.files?.[0].type !== MIME_TYPES.EXCEL) {
      setError("Le fichier doit être au format Excel.");
    } else if (event.target.files?.[0].size > FILE_SIZE_LIMIT) {
      setError("Votre fichier dépasse la limite de 5Mo.");
    } else {
      setFile(event.target.files?.[0]);
    }
  };

  const handleClose = () => {
    toggleModal(false);
    setFile(undefined);
  };

  return (
    <>
      <Button title="Mettre à jour les routes" onClick={toggleModal} className={cx(className)} />
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        className="md:max-w-[800px]"
        content={
          <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50"></div>
              </div>
              <h1 className="font-bold text-xl m-0">Import du Schema De Répartition</h1>
            </div>
            <div className="flex items-start flex-col w-full gap-8 mb-6">
              <div className="flex flex-col w-full items-center gap-2.5">
                <InputFile accept={MIME_TYPES.EXCEL} onChange={handleAddFile} error={error} loading={isPending} />
                {file?.name ? <p className="text-sm text-gray-500">{file.name}</p> : null}
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={handleClose} />
            <Button disabled={!file || isPending} title="Lancer l'import" onClick={() => mutate()} className={"flex-1"} />
          </div>
        }
      />
    </>
  );
}
