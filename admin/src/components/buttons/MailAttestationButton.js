import React, { useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";

import api from "../../services/api";
import { colors } from "../../utils";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default ({ young, children, disabled, type, template, placeholder, ...rest }) => {
  const [loading, setLoading] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onConfirm = async () => {
    setLoading(true);
    await api.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
      fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
    });
    setLoading(false);
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
            message: `Êtes-vous sûr de vouloir transmettre le document "${placeholder}" par mail à ${young.email} ?`,
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
  color: ${colors.purple};
  text-decoration: underline;
  cursor: pointer;
  :hover {
    color: ${colors.darkPurple};
  }
`;
