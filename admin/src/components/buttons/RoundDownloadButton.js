import React, { useState } from "react";
import * as FileSaver from "file-saver";
import { toastr } from "react-redux-toastr";
import IconButton from "./IconButton";
import ModalConfirm from "../modals/ModalConfirm";

export default function RoundButton({ source, icon, bgColor, ...rest }) {
  const [buttonsLoading, setButtonsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const onClick = () => {
    setModal({
      isOpen: true,
      onConfirm,
      title: "Téléchargement de document",
      message:
        "En téléchargeant cette pièce jointe, vous vous engagez à la supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
    });
  };

  const onConfirm = async () => {
    setButtonsLoading(true);
    try {
      const f = await source();
      FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
    }
    setButtonsLoading(false);
  };
  return (
    <>
      <IconButton onClick={onClick} buttonsLoading={buttonsLoading} icon={icon} bgColor={bgColor} {...rest} />
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}
