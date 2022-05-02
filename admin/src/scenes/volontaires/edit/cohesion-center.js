import React, { useState, useEffect } from "react";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import AssignCenter from "../components/AssignCenter";
import { canAssignCohesionCenter, translate } from "../../../utils";
import api from "../../../services/api";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default function CohesionCenter({ values, handleChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [cohesionCenter, setCohesionCenter] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const history = useHistory();

  useEffect(() => {
    if (!values.sessionPhase1Id) return;
    (async () => {
      try {
        const response = await api.get(`/session-phase1/${values.sessionPhase1Id}/cohesion-center`);
        setCohesionCenter(response.data);
      } catch (e) {
        console.log(e);
        toastr.error("Oups, une erreur est survenue :", translate(e.code));
      }
    })();
  }, [values.sessionPhase1Id]);

  const onClickCancel = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmCancel,
      title: "Êtes-vous sûr de vouloir supprimer ce choix de centre de cohésion ?",
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmCancel = async () => {
    try {
      const { code, ok } = await api.post(`/young/${values._id}/session-phase1/cancel`);
      if (!ok) return toastr.error("error", translate(code));
      toastr.success("Annulation de l'affectation au centre de cohésion");
      history.go(0);
      setModal((prevState) => ({ ...prevState, isOpen: false }));
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant l'annulation de l'affectation au centre de cohésion :", translate(e.code));
    }
  };

  return (
    <>
      <Col md={6} style={{ marginBottom: "20px" }}>
        <Box>
          <BoxHeadTitle>Centre de cohésion</BoxHeadTitle>
          <BoxContent direction="column">
            {canAssignCohesionCenter(user) && (
              <AssignCenter young={values} onAffect={(session, young) => handleChange({ target: { value: young.sessionPhase1Id, name: "sessionPhase1Id" } })} />
            )}
            {cohesionCenter ? (
              <>
                <Item disabled title="Centre de cohésion" values={cohesionCenter} name="name" handleChange={handleChange} />
                <Item disabled title="Code postal centre de cohésion" values={cohesionCenter} name="zip" handleChange={handleChange} />
                <Item disabled title="Ville centre de cohésion" values={cohesionCenter} name="city" handleChange={handleChange} />
                {canAssignCohesionCenter(user) ? (
                  <div className="m-4 italic text-red-700 hover:underline cursor-pointer" onClick={onClickCancel}>
                    Annuler ce choix
                  </div>
                ) : null}
              </>
            ) : null}
          </BoxContent>
        </Box>
      </Col>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={modal?.onConfirm}
      />
    </>
  );
}
