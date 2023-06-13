import * as FileSaver from "file-saver";
import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../assets/Close";
import Download from "../../../../assets/icons/Download";
import ModalButton from "../../../../components//buttons/ModalButton";
import LoadingButton from "../../../../components/buttons/LoadingButton";
import { Footer, ModalContainer } from "../../../../components/modals/Modal";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import api from "../../../../services/api";

function getFileName(file) {
  return (file && file.name) || file;
}

export default function ModalFiles({ isOpen, onCancel, initialValues, young, nameFiles }) {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(false);
  const handleClick = (e) => {
    setModal({
      isOpen: true,
      onConfirm,
      title: "Téléchargement de document",
      message:
        "En téléchargeant cette pièce jointe, vous vous engagez à la supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
      value: e,
    });
  };

  const onConfirm = async (file) => {
    setLoading(true);
    try {
      const f = await api.get(`/young/file/${young._id}/${nameFiles}/${getFileName(file)}`);
      FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant le téléchagement", e.toString());
    }
    setLoading(false);
  };

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
        <ModalContainer>
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
          <div className="flex w-full flex-col items-center px-2 pt-2 pb-4 text-center">
            <div className="mb-4">
              <h3 className="mb-3">Télécharger vos documents d&apos;équivalence</h3>
            </div>

            <div className="mb-4 text-lg">Telecharger le(s) document(s) : </div>
            <div className="flex flex-col justify-start gap-2">
              {initialValues.map((e, i) => (
                <div key={i} className=" flex items-center">
                  <LoadingButton className="mr-2" color="#EFF6FF" textColor="#5145cd" loading={loading && modal?.value === e} onClick={() => handleClick(e)}>
                    <Download color="#5145cd" className="mr-2" />
                    Télécharger
                  </LoadingButton>
                  <div className="ml-2">{getFileName(e)}</div>
                </div>
              ))}
            </div>
          </div>
          <Footer>
            <ModalButton onClick={onCancel}>Retour</ModalButton>
          </Footer>
        </ModalContainer>
      </Modal>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null, value: null })}
        onConfirm={async () => {
          await modal?.onConfirm(modal?.value);
          setModal({ isOpen: false, onConfirm: null, value: null });
        }}
      />
    </>
  );
}
