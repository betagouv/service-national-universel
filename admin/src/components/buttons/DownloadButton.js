import React, { useState } from "react";
import styled from "styled-components";
import * as FileSaver from "file-saver";
import { toastr } from "react-redux-toastr";

import LoadingButton from "./LoadingButton";
import ModalConfirm from "../modals/ModalConfirm";

export default function DownloadButton({ source, title, ...rest }) {
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
      FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
    }
    setButtonsLoading(false);
  };
  return (
    <>
      <DownloadBtn {...rest} color="white" loading={buttonsLoading} onClick={onClick}>
        {title}
      </DownloadBtn>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onChange={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

const DownloadBtn = styled(LoadingButton)`
  color: #555 !important;
  background: url(${require("../../assets/download.svg")}) left 15px center no-repeat;
  background-color: #fff;
  border: 1px solid #eee;
  outline: 0;
  border-radius: 5px;
  padding: 8px 25px 8px 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;
  margin-top: 1rem;
  width: fit-content;
  :hover {
    background: url(${require("../../assets/download.svg")}) left 15px center no-repeat;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }
`;
