import React from "react";
import styled from "styled-components";
import { Input } from "reactstrap";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";
import { YOUNG_STATUS, YOUNG_PHASE } from "../../../utils";
import { saveYoung, STEPS } from "../utils";


export default () => {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  if (!young) {
    history.push('/inscription/create');
    return <div />;
  }
  const handleSave = async (values) => {
    const young = await saveYoung(values);
    if (young) dispatch(setYoung(young));
  };
  return (
    <Wrapper>
      <Heading>
        <h2>Vos motivations pour le SNU</h2>
        <p>Exprimez en quelques mots pourquoi vous souhaitez participer au Service National Universel</p>
      </Heading>
      <Formik
        initialValues={young}
        onSubmit={async (values) => {
          try {
            // if the young is not already in WAITING_VALIDATION, update the status and push it in the historic
            if (values.status !== YOUNG_STATUS.WAITING_VALIDATION) {
              values.status = YOUNG_STATUS.WAITING_VALIDATION;
              values.historic.push({
                phase: YOUNG_PHASE.INSCRIPTION,
                createdAt: Date.now(),
                userName: `${values.firstName} ${values.lastName}`,
                userId: values._id,
                status: YOUNG_STATUS.WAITING_VALIDATION,
                note: "",
              });
            }
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", code);
            dispatch(setYoung(young));
            history.push("/inscription/done");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", e.code);
          }
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <>
            <Input type="textarea" rows={10} placeholder="Vos motivations en quelques mots ..." name="motivations" value={values.motivations} onChange={handleChange} />
            <Optional>Optionnel</Optional>
            <Footer>
              <ButtonContainer>
                <SaveButton onClick={() => handleSave(values)}>Enregistrer</SaveButton>
                <ContinueButton onClick={handleSubmit}>Terminer</ContinueButton>
              </ButtonContainer>
            </Footer>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 40px;
  @media (max-width: 768px) {
    padding: 22px;
  }
  textarea {
    padding: 20px 15px;
    font-size: 18px;
    ::placeholder {
      font-size: 18px;
    }
  }
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 1.8rem;
    font-weight: 700;
  }
  p {
    color: #161e2e;
    font-size: 1rem;
  }
`;

const Optional = styled.div`
  font-weight: 400;
  color: #6b7280;
  text-align: center;
  padding-top: 5px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 20px;
  margin-right: 10px;
  margin-top: 40px;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const SaveButton = styled(ContinueButton)`
  color: #374151;
  background-color: #f9fafb;
  border-width: 1px;
  border-color: transparent;
`;
