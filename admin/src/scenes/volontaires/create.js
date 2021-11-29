import React from "react";
import styled from "styled-components";
import { Row } from "reactstrap";
import { Formik } from "formik";
import "dayjs/locale/fr";

import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import Identite from "./edit/identite";
import Coordonnees from "./edit/coordonnees";
import Situation from "./edit/situation";
import SituationsParticulieres from "./edit/situations-particulieres";
import Representant1 from "./edit/representant-legal1";
import Representant2 from "./edit/representant-legal2";
import Consentement from "./edit/consentement";
import ConsentementImage from "./edit/consentement-image";

export default (props) => {
  const history = useHistory();

  return (
    <Wrapper>
      <Formik
        initialValues={{
          status: "VALIDATED",
          firstName: "",
          lastName: "",
          birthdateAt: "",
          cniFiles: [],
          email: "",
          phone: "",
          address: "",
          city: "",
          zip: "",
          department: "",
          region: "",
          parentConsentmentFiles: [],
          highSkilledActivityProofFiles: [],
          parentConsentmentFiles: [],
          imageRightFiles: [],
        }}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.post("/young/invite", values);
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Volontaire créé !");
            return history.push("/inscription");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched, setFieldValue }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Création du profil ${values.firstName ? `de ${values.firstName}  ${values.lastName}` : ""}`}</Title>
              </div>
              <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                Valider cette candidature
              </SaveBtn>
            </TitleWrapper>
            <Row>
              <Identite
                values={values}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                required={{ firstName: true, lastName: true, birthdateAt: true, gender: true }}
                errors={errors}
                touched={touched}
              />
              <Coordonnees
                values={values}
                handleChange={handleChange}
                required={{ email: true, phone: true, address: true, city: true, zip: true, department: true, region: true }}
                errors={errors}
                touched={touched}
              />
              <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} />
              <SituationsParticulieres values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
            </Row>
            <Row>
              <Representant1 values={values} handleChange={handleChange} />
              <Representant2 values={values} handleChange={handleChange} />
            </Row>
            <Row>
              <Consentement values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <ConsentementImage values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
            </Row>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
`;

const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  button {
    background-color: #5245cc;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
`;

const SaveBtn = styled(LoadingButton)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #372f78;
  }
  &.outlined {
    :hover {
      background: #fff;
    }
    background-color: transparent;
    border: solid 1px #5245cc;
    color: #5245cc;
    font-size: 13px;
    padding: 4px 20px;
  }
`;
