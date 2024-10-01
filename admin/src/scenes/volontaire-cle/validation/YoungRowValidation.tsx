import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { HiOutlineX, HiOutlineCheck, HiOutlineClipboardCheck } from "react-icons/hi";
import { useMutation } from "@tanstack/react-query";
import { IoWarningOutline } from "react-icons/io5";

import { YOUNG_STATUS, getAge, STATUS_CLASSE } from "snu-lib";
import { YoungDto, ClasseDto } from "snu-lib/src/dto";
import { Badge, ModalConfirmation } from "@snu/ds/admin";
import { translate } from "@/utils";
import { TStatus } from "@/types";
import API from "@/services/api";
import { capture } from "@/sentry";

interface YoungDtoWithClasse extends YoungDto {
  classe: ClasseDto;
}
interface Props {
  young: YoungDtoWithClasse;
  selectedYoungs: YoungDtoWithClasse[];
  onYoungSelected: React.Dispatch<React.SetStateAction<YoungDtoWithClasse[]>>;
  onChange: () => void;
}

export default function YoungRowValidation({ young, selectedYoungs, onYoungSelected, onChange }: Props) {
  const history = useHistory();
  const [showModale, setShowModale] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [modalError, setModalError] = useState(false);
  const classe = young.classe;

  const handleValidate = () => {
    if (!classe) return;
    if (authorized) {
      const availableSeats = classe.totalSeats - classe.seatsTaken;

      if (classe.status === STATUS_CLASSE.CLOSED || availableSeats <= 0) {
        return setModalError(true);
      }
      validateYoung();
    }
  };

  const { isPending, mutate: validateYoung } = useMutation({
    mutationFn: async () => {
      const { ok, code, data } = await API.put(`/referent/youngs`, { youngIds: [young._id], status: authorized ? YOUNG_STATUS.VALIDATED : YOUNG_STATUS.REFUSED });
      if (!ok) throw new Error(translate(code));
      return data;
    },
    onSuccess: () => {
      toastr.success("La validation a bien été enregistré", "");
      setShowModale(false);
      onChange();
    },
    onError: (e: any) => {
      capture(e);
      toastr.error("Une erreur est survenue", translate(e.code));
    },
  });

  const handleSelectYoung = (young: YoungDtoWithClasse) => {
    onYoungSelected((prevSelected) => (prevSelected.some((y) => y._id === young._id) ? prevSelected.filter((y) => y._id !== young._id) : [...prevSelected, young]));
  };

  return (
    <>
      <tr className="flex items-center py-3 px-4 hover:bg-gray-50">
        <td className="w-[5%]">
          <input type="checkbox" className="w-5 h-5 ml-1" checked={selectedYoungs.some((y) => y._id === young._id)} onChange={() => handleSelectYoung(young)} />
        </td>
        <td className="w-[25%] table-cell truncate cursor-pointer" onClick={() => history.push(`/volontaire/${young._id}`)}>
          <span className="font-bold text-gray-900 text-base leading-5">{young.status !== YOUNG_STATUS.DELETED ? `${young.firstName} ${young.lastName}` : "Compte supprimé"}</span>
          <p className="text-xs text-gray-500 leading-5">
            {young.birthdateAt ? `${getAge(young.birthdateAt)} ans` : null}{" "}
            {young.status !== YOUNG_STATUS.DELETED && young.department ? `• ${young.city || ""} (${young.department || ""})` : null}
          </p>
        </td>
        <td className="flex w-[30%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/classes/${young.classeId}`)}>
          <div className="flex w-full flex-col justify-center">
            <div className="m-0 table w-full table-fixed border-collapse">
              <div className="table-cell truncate font-bold text-gray-900">{young?.classe?.name}</div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-xs leading-5 text-gray-500 ">id: {young?.classe?.uniqueKeyAndId}</div>
            </div>
          </div>
        </td>
        <td className="w-[30%]">
          <Badge title={translate(YOUNG_STATUS[young.status!])} status={young.status as TStatus} />
        </td>
        <td className="flex w-[10%] gap-2">
          <Badge
            title={<HiOutlineX size={20} />}
            mode="editable"
            className="rounded-[50%] !p-0 !w-10 !h-10 border text-gray-500 border-gray-300 !bg-white hover:!bg-gray-200 hover:!border-red-400 hover:text-red-600"
            onClick={() => {
              setAuthorized(false);
              setShowModale(true);
            }}
          />
          <Badge
            title={<HiOutlineCheck size={20} />}
            mode="editable"
            className="rounded-[50%] !p-0 !w-10 !h-10 text-white !bg-blue-600 hover:!bg-white hover:!text-blue-600 hover:!border hover:!border-blue-600"
            onClick={() => {
              setAuthorized(true);
              setShowModale(true);
            }}
          />
        </td>
      </tr>
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
              Vous souhaitez accepter l’inscription à la classe <span className="font-bold">{young.classe?.name}</span> de&nbsp;
              <span className="font-bold">
                {young.firstName} {young.lastName}
              </span>
              . Une notification lui sera envoyée par email.
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez refuser l’inscription à la classe <span className="font-bold">{young.classe?.name}</span> de&nbsp;
              <span className="font-bold">
                {young.firstName} {young.lastName}
              </span>
              . Une notification lui sera envoyée par email.
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
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-red-600" size={40} />}
        title="Vous ne pouvez pas effectuer cette action."
        text={
          classe.status === STATUS_CLASSE.CLOSED ? (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous ne pouvez pas valider l'inscriptions de {young.firstName} {young.lastName} pour la classe {classe.name} car les inscriptions sont fermées pour cette classe.
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous ne pouvez pas valider l'inscriptions de {young.firstName} {young.lastName} pour la classe {classe.name} car le nombre de places disponibles est insuffisant.
            </p>
          )
        }
        actions={[{ title: "Annuler", isCancel: true }]}
      />
    </>
  );
}
