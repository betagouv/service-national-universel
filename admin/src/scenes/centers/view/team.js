import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Formik, Field } from "formik";
import { colors, CENTER_ROLES } from "../../../utils";

import { Box } from "../../../components/box";
import api from "../../../services/api";
import BinSVG from "../../../assets/bin.svg";

export default function Team({ focusedSession, deleteTeamate, addTeamate }) {
  return (
    <Box>
      <Wrapper gridTemplateColumns="repeat(2,1fr)" style={{ background: "linear-gradient(#E5E4E8,#E5E4E8) center/1px 100% no-repeat" }}>
        <div>
          <ChefCenterBlock headCenterId={focusedSession?.headCenterId} />
          <TeamBlock team={focusedSession?.team} deleteTeamate={deleteTeamate} />
        </div>
        <AddBlock addTeamate={addTeamate} />
      </Wrapper>
    </Box>
  );
}

const ChefCenterBlock = ({ headCenterId }) => {
  if (!headCenterId) return <></>;

  const history = useHistory();
  const [chefCenter, setChefCenter] = useState();

  useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/referent/${headCenterId}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      setChefCenter(data);
    })();
  }, []);

  return (
    <div style={{ padding: "3rem 3rem 0 3rem" }}>
      <h4 style={{ marginBottom: 0 }}>Chef de centre</h4>
      <a onClick={() => history.push(`/user/${headCenterId}`)} style={{ cursor: "pointer", color: "#5245CC" }}>
        {chefCenter?.firstName} {chefCenter?.lastName}&nbsp;›
      </a>
      <Wrapper gridTemplateColumns="120px auto" style={{ marginBlock: "1rem" }}>
        <b>E-mail :</b>
        <p style={{ margin: 0 }}>{chefCenter?.email}</p>
        <b>Téléphone :</b>
        <p style={{ margin: 0 }}>{chefCenter?.phone}</p>
      </Wrapper>
    </div>
  );
};

const TeamBlock = ({ team, deleteTeamate }) => {
  if (!team) return <></>;

  return (
    <div style={{ padding: "3rem" }}>
      <h4>Équipe ({team.length || 0})</h4>
      {team.length === 0 && <p style={{ fontStyle: "italic" }}>Aucun membre</p>}

      {Object.values(CENTER_ROLES).map((role, index) => {
        return <Group key={index} team={team} role={role} />;
      })}
    </div>
  );
};

const Group = ({ team, role }) => {
  const teamFiltered = team.filter((member) => member.role === role);

  if (teamFiltered.length === 0) return <></>;

  return (
    <>
      <h6>{teamFiltered[0].role}</h6>
      {teamFiltered.map((user, index) => (
        <FlexBox key={index} style={{ justifyContent: "space-between", marginBlock: "0.25rem" }}>
          <FlexBox>
            <Badge>
              <p style={{ margin: 0, fontSize: "1rem", color: "#372F78", fontWeight: "bold" }}>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </p>
            </Badge>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: "500", margin: 0 }}>
                {user.firstName} {user.lastName}
              </p>
              <p style={{ color: "#92929D", margin: 0 }}>{user.role}</p>
            </div>
          </FlexBox>
          <ButtonIcon icon={BinSVG} onClick={() => deleteTeamate(index)} />
        </FlexBox>
      ))}
    </>
  );
};

const AddBlock = ({ addTeamate }) => {
  const listRoles = Object.values(CENTER_ROLES);

  return (
    <div style={{ padding: "3rem" }}>
      <h4>Ajouter un nouveau membre à l’équipe</h4>
      <p style={{ color: "#9C9C9C" }}>Renseignez les membres de l’équipe d’encadrement du centre de séjour de cohésion.</p>
      <h6 style={{ color: "#696974", textTransform: "uppercase" }}>
        informations <span style={{ color: "#EF4036" }}>*</span>
      </h6>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          firstName: "",
          lastName: "",
          role: "",
          email: "",
          phone: "",
        }}
        onSubmit={(values) => addTeamate(values)}>
        {({ values, handleChange, handleSubmit, errors, isSubmitting }) => (
          <React.Fragment>
            <Row>
              <Col xs="12" md="6">
                <CustomField placeholder="Prénom" validate={(v) => !v} name="firstName" value={values.firstName} onChange={handleChange} />
              </Col>
              <Col xs="12" md="6">
                <CustomField placeholder="Nom" validate={(v) => !v} name="lastName" value={values.lastName} onChange={handleChange} />
              </Col>
            </Row>
            <Row>
              <Col xs="12">
                <CustomField placeholder="Adresse e-mail" validate={(v) => !v} name="email" value={values.email} onChange={handleChange} />
              </Col>
            </Row>
            <Row>
              <Col xs="12">
                <Field
                  as="select"
                  validate={(v) => !v}
                  className="form-control"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  style={{ width: "100%", height: "auto", padding: "1rem", marginTop: "1rem", border: "none", borderRadius: "7px", border: "solid 1px #ccc" }}>
                  <option disabled value="" label="Rôle" />
                  {listRoles.map((e) => (
                    <option value={e} key={e} label={e} />
                  ))}
                </Field>
              </Col>
            </Row>
            <Row>
              <Col xs="12" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <ButtonText type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  Ajouter le membre
                </ButtonText>
              </Col>
            </Row>
            {!!Object.keys(errors).length && (
              <p style={{ fontSize: 12, color: colors.red, textAlign: "center", marginTop: "10px", marginBottom: "0px" }}>Merci de remplir tous les champs</p>
            )}
          </React.Fragment>
        )}
      </Formik>
    </div>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) => `${props.gridTemplateColumns}`};
  grid-gap: 10px;
`;

const Badge = styled.div`
  border: solid 4px #ce2027;
  border-radius: 100%;
  width: 40px;
  height: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonIcon = styled.button`
  color: #555 !important;
  width: 40px;
  height: 40px;
  background: ${({ icon }) => icon && `url(${icon})`};
  background-repeat: no-repeat;
  background-position: center;
  background-color: #fff;
  :hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }
  border: 1px solid #eee;
  outline: 0;
  border-radius: 7px;
  cursor: pointer;
`;

const CustomField = styled(Field)`
  width: 100%;
  height: auto;
  padding: 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 7px;
  border: solid 1px #ccc;
  ::placeholder {
    color: #cbcbcb;
    opacity: 1;
  }
`;

const ButtonText = styled.button`
  padding: 1rem 2rem;
  background-color: white;
  border: none;
  border: solid 1px #ccc;
  border-radius: 7px;
  margin-top: 1rem;

  :hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }
`;
