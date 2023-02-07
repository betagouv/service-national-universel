import React, { useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { colors, translate } from "../../utils";
import ModalConfirm from "../../components/modals/ModalConfirm";
import { capture } from "../../sentry";

export default function MailAttestationButton({ young, children, type, template, placeholder, ...rest }) {
  const [loading, setLoading] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onConfirm = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      toastr.error("Erreur lors de l'envoi du document", e.message);
    }
  };

  return (
    <>
      <button
        className="bg-[#EFF6FF] rounded-md px-6 py-2 text-indigo-700 flex items-center hover:shadow-md"
        {...rest}
        onClick={() => {
          setModal({
            isOpen: true,
            onConfirm,
            title: "Envoie de document par mail",
            message: `Voulez-vous vraiment transmettre le document "${placeholder}" par mail à ${young.email} ?`,
          });
        }}>
        {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
      </button>
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

export const PrimaryStyle = styled.div`
  color: ${colors.purple};
  text-decoration: underline;
  cursor: pointer;
  :hover {
    color: ${colors.darkPurple};
  }
`;
