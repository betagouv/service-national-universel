import React, { useState } from "react";
import { Button } from "@snu/ds/admin";
import DocumentSelect from "../DocumentSelect";
import Badge from "../../../../components/Badge";
import downloadPDF from "../../../../utils/download-pdf";
import { toastr } from "react-redux-toastr";
import { ROLES, YOUNG_STATUS_COLORS, translate, translatePhase1 } from "snu-lib";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";
import ModalDispense from "../ModalDispense";
import ModalConfirm from "../../../../components/modals/ModalConfirm";

const Phase1Header = ({ setLoading, young = null, setYoung, user }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalDispense, setModalDispense] = useState({ isOpen: false });

  const canUserDownloadConvocation = () => {
    return young.hasMeetingInformation === "true" && ["AFFECTED", "DONE", "NOT_DONE", "EXEMPTED"].includes(young.statusPhase1);
  };

  const handleSendConvocationByEmail = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/convocation/cohesion/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - convocation - cohesion.pdf`,
      });
      setLoading(false);
      setModal({ isOpen: false });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      toastr.error("Erreur lors de l'envoie du document", e.message);
    }
  };

  const handleDownloadConvocationPdfFile = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/cohesion`,
      fileName: `${young.firstName} ${young.lastName} - convocation - cohesion.pdf`,
    });
  };

  return (
    <>
      <div className="mb-6 flex justify-between">
        <div className="flex items-center gap-2">
          <p className="text-2xl leading-7 font-bold">Séjour de cohésion</p>
          <Badge minify text={translatePhase1(young.statusPhase1)} color={YOUNG_STATUS_COLORS[young.statusPhase1]} />
        </div>
        <div className="flex items-center gap-2">
          {young.statusPhase1 === "NOT_DONE" && user.role === ROLES.ADMIN && (
            <div onClick={() => setModalDispense({ isOpen: true })} className="ml-2 cursor-pointer rounded border-[1px] border-blue-700 px-2.5 py-1.5 font-medium text-blue-700">
              Dispenser le volontaire du séjour
            </div>
          )}
          {canUserDownloadConvocation() && (
            <DocumentSelect
              title="Convocation"
              onClickPdf={handleDownloadConvocationPdfFile}
              onClickMail={() =>
                setModal({
                  isOpen: true,
                  title: "Envoi de document par mail",
                  message: `Êtes-vous sûr de vouloir transmettre le document Convocation par mail à ${young.email} ?`,
                  onConfirm: handleSendConvocationByEmail,
                })
              }
            />
          )}
        </div>
      </div>
      <ModalConfirm isOpen={modal?.isOpen} title={modal?.title} message={modal?.message} onCancel={() => setModal({ isOpen: false })} onConfirm={modal?.onConfirm} />
      <ModalDispense
        isOpen={modalDispense?.isOpen}
        youngId={young?._id}
        onCancel={() => setModalDispense({ isOpen: false })}
        onSuccess={(young) => {
          setModalDispense({ isOpen: false });
          setYoung(young);
        }}
      />
    </>
  );
};

export default Phase1Header;
