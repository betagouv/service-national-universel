import React, { useState } from "react";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { IoWarningOutline } from "react-icons/io5";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { translate, YOUNG_STATUS, YoungDto, STATUS_CLASSE, ClasseDto } from "snu-lib";
import { DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import { capture } from "@/sentry";
import API from "@/services/api";

interface YoungDtoWithClasse extends YoungDto {
  classe: ClasseDto;
}

interface Props {
  selectedYoungs: YoungDtoWithClasse[];
  setSelectedYoungs: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectAll: React.Dispatch<React.SetStateAction<boolean>>;
  onYoungsChange: () => void;
}

interface FullClass {
  name: string;
  availableSeats: number;
  youngs: number;
}

export default function ButtonActionGroupValidation({ selectedYoungs, setSelectedYoungs, setSelectAll, onYoungsChange }: Props) {
  const [showModale, setShowModale] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [fullClasses, setFullClasses] = useState<FullClass[]>([]);
  const [closedClasses, setClosedClasses] = useState<{ [key: string]: string }>({});
  const classes = selectedYoungs.map((young) => young.classe);

  const handleValidate = () => {
    if (authorized) {
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
        if (classe.status === STATUS_CLASSE.CLOSED) {
          closedClasses[String(classe.name)] = String(classe.name);
          setClosedClasses({ ...closedClasses });
        }
        const youngsInClass = youngsByClass[classe._id] || 0;
        const availableSeats = classe.totalSeats - classe.seatsTaken;

        if (youngsInClass > availableSeats) {
          fullClasses.push({
            name: String(classe.name),
            availableSeats: availableSeats,
            youngs: youngsInClass,
          });
          setFullClasses([...fullClasses]);
        }
      });
    }

    if (Object.keys(closedClasses).length > 0 || fullClasses.length > 0) {
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
          setShowModale(false);
          setFullClasses([]);
          setClosedClasses({});
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-red-600" size={40} />}
        title="Vous ne pouvez pas effectuer cette action."
        text={
          Object.keys(closedClasses).length > 0 ? (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous ne pouvez pas valider les inscriptions pour les classes suivantes car elles sont fermées :
              <ul>
                {Object.keys(closedClasses).map((classe) => (
                  <li key={classe}>
                    <span className="font-bold">{classe}</span>
                  </li>
                ))}
              </ul>
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous ne pouvez pas valider les inscriptions pour les classes suivantes car le nombre de places disponibles est insuffisant :
              <ul>
                {fullClasses.map((classe) => (
                  <li key={classe.name}>
                    <span className="font-bold">{classe.name}</span> : {classe.youngs} élèves pour {classe.availableSeats} places disponibles
                  </li>
                ))}
              </ul>
            </p>
          )
        }
        actions={[{ title: "Annuler", isCancel: true }]}
      />
    </>
  );
}
