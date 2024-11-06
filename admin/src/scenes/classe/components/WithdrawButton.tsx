import React, { useState } from "react";
import { BsTrash3 } from "react-icons/bs";
import { MdOutlineDangerous } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { capture } from "@/sentry";
import api from "@/services/api";
import { translate, ClasseType } from "snu-lib";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  classe: Pick<ClasseType, "_id" | "name">;
  setIsLoading: (b: boolean) => void;
}

export default function WithdrawButton({ classe, setIsLoading }: Props) {
  const [showModaleWithdraw, setShowModaleWithdraw] = useState(false);
  const history = useHistory();
  const onWithdraw = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.remove(`/cle/classe/${classe?._id}?type=withdraw`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression", translate(code));
        return setIsLoading(false);
      }
      history.push("/classes");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression", e);
    } finally {
      setIsLoading(false);
      setShowModaleWithdraw(false);
    }
  };
  return (
    <>
      <div className="flex items-center justify-end mt-6">
        <button type="button" className="flex items-center justify-center text-xs text-red-500 hover:text-red-700" onClick={() => setShowModaleWithdraw(true)}>
          <BsTrash3 className="mr-2" />
          Désister la classe
        </button>
      </div>
      <ModalConfirmation
        isOpen={showModaleWithdraw}
        onClose={() => {
          setShowModaleWithdraw(false);
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-red-600" size={40} />}
        title="Attention, vous êtes sur le point de désister cette classe."
        text="Cette action entraînera l'abandon de l'inscription de tous les élèves de cette classe."
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Désister la classe",
            leftIcon: <MdOutlineDangerous size={20} />,
            onClick: () => onWithdraw(),
            isDestructive: true,
          },
        ]}
      />
    </>
  );
}
