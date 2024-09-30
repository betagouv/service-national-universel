import React, { useState } from "react";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { IoWarningOutline } from "react-icons/io5";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { translate, YOUNG_STATUS, ClasseType, YoungDto } from "snu-lib";
import { DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import { capture } from "@/sentry";
import API from "@/services/api";
import { set } from "mongoose";

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
  const [modalError, setModalError] = useState(false);
  const [fullClasses, setFullClasses] = useState<{ [key: string]: number }>({});

  const handleValidate = () => {
    const youngsByClass: { [key: string]: number } = {};

    // Count youngs for each classe
    selectedYoungs.forEach((young) => {
      if (!young.classeId) return;
      if (young.classeId in youngsByClass) {
        youngsByClass[young.classeId]++;
      } else {
        youngsByClass[young.classeId] = 1;
      }
    });

    // Check if number of youngs exceeds available seats for each class
    classes.forEach((classe) => {
      if (!classe.name) return;
      const youngsInClass = youngsByClass[classe._id] || 0;
      const availableSeats = classe.totalSeats - classe.seatsTaken;

      if (youngsInClass > availableSeats) {
        setFullClasses((prev) => ({ ...prev, [classe.name]: availableSeats }));
      }
    });

    if (fullClasses.length > 0) {
      return setModalError(true);
    } else {
      validateYoung();
    }
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
            onClick: () => handleValidate(),
          },
        ]}
      />
      <ModalConfirmation
        isOpen={modalError}
        onClose={() => {
          setModalError(false);
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-red-600" size={40} />}
        title="Vous ne pouvez pas effectuer cette action."
        text={
          <p className="text-base leading-6 font-normal text-gray-900">
            Vous ne pouvez pas valider les inscriptions de <span className="font-bold">élèves</span> pour les classes suivantes car le nombre de places disponibles est insuffisant
            :
            <ul>
              {Object.entries(fullClasses).map(([name, seats]) => (
                <li key={name}>
                  <span className="font-bold">{name}</span> : {seats} place{seats > 1 ? "s" : ""}
                </li>
              ))}
            </ul>
          </p>
        }
        actions={[{ title: "Annuler", isCancel: true }]}
      />
    </>
  );
}
