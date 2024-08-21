import React, { useState } from "react";
import { BsTrash3 } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { MdOutlineDangerous } from "react-icons/md";
import { HiOutlineExclamation } from "react-icons/hi";

import { ModalConfirmation } from "@snu/ds/admin";
import { translate, ClasseDto, YOUNG_STATUS } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";

interface Props {
  classe: ClasseDto;
  onLoading: (isLoading: boolean) => void;
}

export default function DeleteButton({ classe, onLoading }: Props) {
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      onLoading(true);
      const { ok, code } = await api.remove(`/cle/classe/${classe?._id}?type=delete`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression", translate(code));
        return onLoading(false);
      }
      history.push("/classes");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression", e);
    } finally {
      onLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button type="button" className="flex items-center justify-start w-full text-red-500 hover:text-red-700 text-sm leading-5 font-normal" onClick={() => setShowModal(true)}>
        <BsTrash3 size={24} className="mr-2" />
        Supprimer la classe
      </button>
      <ModalConfirmation
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        className="md:max-w-[700px]"
        icon={<HiOutlineExclamation className="text-red-600 bg-red-50 rounded-full p-2" size={40} />}
        title="Supprimer cette classe"
        text="Voulez-vous vraiment supprimer cette classe ? Cette action est irréversible."
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Supprimer la classe",
            leftIcon: <MdOutlineDangerous size={20} />,
            onClick: () => handleDelete(),
            isDestructive: true,
          },
        ]}
      />
    </>
  );
}
