import React, { useState } from "react";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { translate, YOUNG_STATUS, ClasseType } from "snu-lib";
import { YoungDto } from "snu-lib/src/dto";
import { DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import { capture } from "@/sentry";
import API from "@/services/api";

interface Props {
  selectedYoungs: YoungDto[];
  setSelectedYoungs: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectAll: React.Dispatch<React.SetStateAction<boolean>>;
  onYoungsChange: () => void;
  classes: Pick<ClasseType, "_id" | "name" | "uniqueKeyAndId" | "totalSeats" | "seatsTaken">[];
}

export default function ButtonActionGroupValidation({ selectedYoungs, setSelectedYoungs, setSelectAll, onYoungsChange, classes }: Props) {
  const [showModale, setShowModale] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const handleValidate = () => {
    const classeIds = selectedYoungs.map((young) => young.classeId);

    validateYoung();
  };

  const { isPending, mutate: validateYoung } = useMutation({
    mutationFn: async () => {
      const youngIds = selectedYoungs.map((young) => young._id);
      const { ok, code, data } = await API.put(`/referent/youngs`, { youngIds, status: authorized ? YOUNG_STATUS.VALIDATED : YOUNG_STATUS.REFUSED });
      if (!ok) throw new Error(translate(code));
      return data;
    },
    onSuccess: () => {
      toastr.success("La validation a bien été enregistré", "");
      setSelectedYoungs([]);
      setSelectAll(false);
      onYoungsChange();
      setShowModale(false);
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
        title="Validation des inscriptions"
        text={
          authorized ? (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez accepter les inscriptions de <span className="font-bold">{selectedYoungs.length} élèves</span>. Un mail leur sera envoyé pour les en informer.
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez refuser les inscriptions de <span className="font-bold">{selectedYoungs.length} élèves</span>. Un mail leur sera envoyé pour les en informer.
            </p>
          )
        }
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Confirmer",
            disabled: isPending,
            onClick: () => validateYoung(),
          },
        ]}
      />
    </>
  );
}
