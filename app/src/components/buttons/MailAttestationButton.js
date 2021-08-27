import React, { useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { colors, translate } from "../../utils";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default ({ young, children, disabled, type, template, placeholder, ...rest }) => {
  const [loading, setLoading] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onConfirm = async () => {
    setLoading(true);
    const { ok, code } = await api.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
      fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
    });
    setLoading(false);
    if (ok) return toastr.success(`Document envoyé à ${young.email}`);
    else return toastr.error("Erreur lors de l'envoie du document", translate(code));
  };
  return (
    <>
      <PrimaryStyle
        {...rest}
        onClick={() => {
          setModal({
            isOpen: true,
            onConfirm,
            title: "Envoie de document par mail",
            message: `Vous allez recevoir le document "${placeholder}" par mail à l'adresse ${young.email}.`,
          });
        }}
      >
        {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
      </PrimaryStyle>
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
};

export const PrimaryStyle = styled.div`
  font-size: 0.9rem;
  color: ${colors.purple};
  cursor: pointer;
  :hover {
    color: ${colors.darkPurple};
    text-decoration: underline;
  }
`;
