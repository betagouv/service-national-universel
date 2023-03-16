import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../../redux/auth/actions";
import { translate } from "snu-lib";
import { capture } from "../../../../../sentry";
import API from "../../../../../services/api";
import plausibleEvent from "../../../../../services/plausible";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";

import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import ButtonPrimaryOutline from "../../../../../components/ui/buttons/ButtonPrimaryOutline";
import CloseSvg from "../../../../../assets/Close";
import ModalConfirm from "../../../../../components/modals/ModalConfirm";
import ModalTailwind from "../../../../../components/ui/modals/Modal";
import downloadPDF from "../../../../../utils/download-pdf";

export function ModalConvocation({ open, setOpen }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const handleDownload = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/cohesion`,
      fileName: `${young.firstName} ${young.lastName} - convocation - cohesion.pdf`,
      errorTitle: "Une erreur est survenue lors de l'édition de votre convocation",
    });
    if (young?.convocationFileDownload === "true") return;
    const { data } = await API.put(`/young/phase1/convocation`, { convocationFileDownload: "true" });
    plausibleEvent("affecté_step3");
    dispatch(setYoung(data));
  };

  const handleMail = async () => {
    try {
      let template = "cohesion";
      let type = "convocation";
      const { ok, code } = await API.post(`/young/${young._id}/documents/${type}/${template}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
      setOpen(false);
      setModal({ isOpen: false, onConfirm: null });
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoie du document : ", e.message);
      setOpen(false);
      setModal({ isOpen: false, onConfirm: null });
    }
  };

  return (
    <ModalTailwind isOpen={open} onClose={() => setOpen(false)}>
      <div className="bg-white p-4 space-y-2 rounded-md w-full md:w-auto">
        <div className="flex gap-4 justify-between">
          <h1 className="text-gray-900 text-lg font-semibold m-0">Choisissez une option de téléchargement</h1>
          <CloseSvg className="close-icon hover:cursor-pointer" height={16} width={16} onClick={() => setOpen(false)} />
        </div>

        <br />
        <ButtonPrimary onClick={handleDownload} className="w-full">
          <HiOutlineDownload className="h-5 w-5 text-blue-300 mr-2" />
          Télécharger
        </ButtonPrimary>

        <ButtonPrimaryOutline
          onClick={() =>
            setModal({
              isOpen: true,
              onConfirm: handleMail,
              title: "Envoi de document par mail",
              message: `Vous allez recevoir votre convocation par mail à l'adresse ${young.email}.`,
            })
          }
          className="w-full">
          <HiOutlineMail className="h-5 w-5 mr-2" />
          Recevoir par mail
        </ButtonPrimaryOutline>
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => modal?.onConfirm()}
      />
    </ModalTailwind>
  );
}
