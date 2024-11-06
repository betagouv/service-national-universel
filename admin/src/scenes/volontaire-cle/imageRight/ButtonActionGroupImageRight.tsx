import React, { useState } from "react";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { translate } from "snu-lib";
import { YoungDto } from "snu-lib/src/dto";
import { DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import { capture } from "@/sentry";
import API from "@/services/api";

interface Props {
  selectedYoungs: YoungDto[];
  setSelectedYoungs: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectAll: React.Dispatch<React.SetStateAction<boolean>>;
  onYoungsChange: () => void;
}

export default function ButtonActionGroupImageRight({ selectedYoungs, setSelectedYoungs, setSelectAll, onYoungsChange }: Props) {
  const [showModale, setShowModale] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const { isPending, mutate: updateImageRight } = useMutation({
    mutationFn: async () => {
      const youngIds = selectedYoungs.map((young) => young._id);
      const { ok, code, data } = await API.put(`/young-edition/ref-allow-snu`, { youngIds, imageRights: authorized });
      if (!ok) throw new Error(translate(code));
      return data;
    },
    onSuccess: () => {
      toastr.success("La modification du droit à l'image a bien été enregistrée", "");
      setShowModale(false);
      setSelectedYoungs([]);
      setSelectAll(false);
      onYoungsChange();
    },
    onError: (e: any) => {
      capture(e);
      toastr.error("Une erreur est survenue", translate(e.code));
    },
  });

  return (
    <>
      <DropdownButton
        key="edit"
        type="secondary"
        title="Actions groupées"
        disabled={selectedYoungs.length === 0}
        optionsGroup={[
          {
            key: "actions",
            title: "Actions groupées",
            items: [
              {
                key: "authorized",
                render: (
                  <button
                    type="button"
                    className="flex items-center justify-start w-full text-gray-900 hover:text-gray-700 text-sm leading-5 font-normal"
                    onClick={() => {
                      setAuthorized(true);
                      setShowModale(true);
                    }}>
                    Autorisé
                  </button>
                ),
              },
              {
                key: "unauthorized",
                render: (
                  <button
                    type="button"
                    className="flex items-center justify-start w-full text-gray-900 hover:text-gray-700 text-sm leading-5 font-normal"
                    onClick={() => {
                      setAuthorized(false);
                      setShowModale(true);
                    }}>
                    Refusé
                  </button>
                ),
              },
            ],
          },
        ]}
      />
      <ModalConfirmation
        isOpen={showModale}
        onClose={() => {
          setShowModale(false);
        }}
        className="md:max-w-[600px]"
        icon={<HiOutlineClipboardCheck className="text-gray-900 bg-gray-100 rounded-full p-2" size={40} />}
        title="Récolte des droits à l’image"
        text={
          authorized ? (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez déclarer que vous avez reçu les autorisations écrites des représentants légaux pour les droits à l’image de{" "}
              <span className="font-bold">{selectedYoungs.length} élèves</span>. Conservez bien ces autorisations écrites dans le dossier des élèves au sein de l’établissement.
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez déclarer que vous avez reçu les refus écrits des représentants légaux pour les droits à l’image de{" "}
              <span className="font-bold">{selectedYoungs.length} élèves</span>. Conservez bien ces refus écrits dans le dossier des élèves au sein de l’établissement.
            </p>
          )
        }
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Confirmer",
            disabled: isPending,
            onClick: () => updateImageRight(),
          },
        ]}
      />
    </>
  );
}
