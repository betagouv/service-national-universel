import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { HiOutlineX, HiOutlineCheck, HiOutlineClipboardCheck } from "react-icons/hi";

import { YOUNG_STATUS, getAge } from "snu-lib";
import { Badge, ModalConfirmation } from "@snu/ds/admin";
import { YoungDto, ClasseDto } from "snu-lib/src/dto";

interface YoungDtoWithClasse extends YoungDto {
  classe?: ClasseDto;
}

interface Props {
  young: YoungDtoWithClasse;
  selectedYoungs: YoungDtoWithClasse[];
  setSelectedYoungs: React.Dispatch<React.SetStateAction<YoungDtoWithClasse[]>>;
}

export default function YoungRowImageRight({ young, selectedYoungs, setSelectedYoungs }: Props) {
  const history = useHistory();
  const [showModale, setShowModale] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const handleSelectYoung = (young: YoungDtoWithClasse) => {
    setSelectedYoungs((prevSelected) => (prevSelected.some((y) => y._id === young._id) ? prevSelected.filter((y) => y._id !== young._id) : [...prevSelected, young]));
  };

  return (
    <>
      <tr className="flex items-center py-3 px-4 hover:bg-gray-50">
        <td className="w-[5%]">
          <input type="checkbox" className="w-5 h-5 ml-1" checked={selectedYoungs.some((y) => y._id === young._id)} onChange={() => handleSelectYoung(young)} />
        </td>
        <td className="w-[40%] table-cell truncate cursor-pointer" onClick={() => history.push(`/volontaire/${young._id}`)}>
          <span className="font-bold text-gray-900 text-base leading-5">{young.status !== YOUNG_STATUS.DELETED ? `${young.firstName} ${young.lastName}` : "Compte supprimé"}</span>
          <p className="text-xs text-gray-500 leading-5">
            {young.birthdateAt ? `${getAge(young.birthdateAt)} ans` : null}{" "}
            {young.status !== YOUNG_STATUS.DELETED && young.department ? `• ${young.city || ""} (${young.department || ""})` : null}
          </p>
        </td>
        <td className="flex w-[45%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/classes/${young.classeId}`)}>
          <div className="flex w-full flex-col justify-center">
            <div className="m-0 table w-full table-fixed border-collapse">
              <div className="table-cell truncate font-bold text-gray-900">{young?.classe?.name}</div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-xs leading-5 text-gray-500 ">id: {young?.classe?.uniqueKeyAndId}</div>
            </div>
          </div>
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
        title="Récolte des droits à l’image"
        text={
          authorized ? (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez déclarer que vous avez reçu l'autorisation écrite des représentants légaux pour les droits à l’image de&nbsp;
              <span className="font-bold">
                {young.firstName} {young.lastName}
              </span>
              . Conservez bien cette autorisation écrite dans le dossier de l'élève au sein de l’établissement.
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez déclarer que vous avez reçu le refus écrit des représentants légaux pour les droits à l’image de&nbsp;
              <span className="font-bold">
                {young.firstName} {young.lastName}
              </span>
              . Conservez bien ce refus écrit dans le dossier de l'élève au sein de l’établissement.
            </p>
          )
        }
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Confirmer",
            onClick: () => {
              console.log("confirmed");
              setShowModale(false);
            },
          },
        ]}
      />
    </>
  );
}
