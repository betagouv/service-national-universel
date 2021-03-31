import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Field, Formik } from "formik";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import LoadingButton from "../../components/buttons/LoadingButton";
import DateInput from "../../components/dateInput";
import { departmentList, regionList, department2region, translate, REFERENT_ROLES, REFERENT_DEPARTMENT_SUBROLE, REFERENT_REGION_SUBROLE } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import Loader from "../../components/Loader";

export default (props) => {
  const [user, setUser] = useState();
  const currentUser = useSelector((state) => state.Auth.user);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setUser(null);
      const { data } = await api.get(`/referent/${id}`);
      setUser(data);
    })();
  }, []);

  if (user === undefined) return <Loader />;

  const getSubtitle = () => {
    const createdAt = new Date(user.createdAt);
    dayjs.extend(relativeTime).locale("fr");
    const diff = dayjs(createdAt).fromNow();
    return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
  };

  const clearDepartmentAndRegion = (handleChange) => {
    handleChange({ target: { name: "region", value: "" } });
    handleChange({ target: { name: "department", value: "" } });
  };

  const getSubRole = (role) => {
    let subRole = [];
    if (role === "referent_department") subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === "referent_region") subRole = REFERENT_REGION_SUBROLE;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };

  return (
    //@todo fix the depart and region
    <Wrapper>
      <Formik
        initialValues={user}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: user } = await api.put(`/referent/${values._id}`, values);
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            setUser(user);
            toastr.success("Mis à jour !");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Profil Utilisateur de ${values.firstName} ${values.lastName}`}</Title>
                <SubTitle>{getSubtitle()}</SubTitle>
              </div>
              <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                Enregistrer
              </SaveBtn>
            </TitleWrapper>
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Identité</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="Nom" values={values} name={"lastName"} handleChange={handleChange} />
                    <Item title="Prénom" values={values} name="firstName" handleChange={handleChange} />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Coordonnées</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="E-mail" values={values} name="email" handleChange={handleChange} />
                    <Item title="Tel. fixe" values={values} name="phone" handleChange={handleChange} />
                    <Item title="Tel. mobile" values={values} name="mobile" handleChange={handleChange} />
                  </BoxContent>
                </Box>
              </Col>
              {currentUser.role === "admin" && (
                <Col md={6} style={{ marginBottom: "20px" }}>
                  <Box>
                    <BoxTitle>Information</BoxTitle>
                    <BoxContent direction="column">
                      <Select
                        name="role"
                        values={values}
                        onChange={(e) => {
                          const value = e.target.value;
                          clearDepartmentAndRegion(handleChange);
                          handleChange({ target: { name: "role", value } });
                        }}
                        title="Rôle"
                        options={[
                          REFERENT_ROLES.REFERENT_DEPARTMENT,
                          REFERENT_ROLES.REFERENT_REGION,
                          REFERENT_ROLES.ADMIN,
                          REFERENT_ROLES.RESPONSIBLE,
                          REFERENT_ROLES.SUPERVISOR,
                        ].map((key) => ({ value: key, label: translate(key) }))}
                      />
                      {[REFERENT_ROLES.REFERENT_DEPARTMENT, REFERENT_ROLES.REFERENT_REGION].includes(values.role) ? (
                        <Select name="subRole" values={values} onChange={handleChange} title="Fonction" options={getSubRole(values.role)} />
                      ) : null}
                      {values.role === REFERENT_ROLES.REFERENT_DEPARTMENT ? (
                        <Select
                          name="department"
                          values={values}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange({ target: { name: "department", value } });
                            const region = department2region[value];
                            handleChange({ target: { name: "region", value: region } });
                          }}
                          title="Département"
                          options={departmentList.map((d) => ({ value: d, label: d }))}
                        />
                      ) : null}
                      {values.role === REFERENT_ROLES.REFERENT_REGION ? (
                        <Select
                          disabled={values.role === REFERENT_ROLES.REFERENT_DEPARTMENT}
                          name="region"
                          values={values}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange({ target: { name: "region", value } });
                            handleChange({ target: { name: "department", value: "" } });
                          }}
                          title="Région"
                          options={regionList.map((r) => ({ value: r, label: r }))}
                        />
                      ) : null}
                    </BoxContent>
                  </Box>
                </Col>
              )}
            </Row>
          </>
        )}
      </Formik>
      {currentUser.role === "admin" || (["referent_department", "referent_region"].includes(currentUser.role) && ["responsible", "supervisor"].includes(user.role)) ? (
        <DeleteBtn
          onClick={async () => {
            if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce profil")) return;
            try {
              const { ok, code } = await api.remove(`/referent/${user._id}`);
              if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
              if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
              toastr.success("Ce profil a été supprimé.");
              return history.push(`/user`);
            } catch (e) {
              console.log(e);
              return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
            }
          }}
        >
          Supprimer
        </DeleteBtn>
      ) : null}
    </Wrapper>
  );
};

const Item = ({ title, values, name, handleChange, type = "text", disabled = false }) => {
  const renderInput = () => {
    if (type === "date") {
      return (
        <>
          <Field
            hidden
            validate={(v) => {
              if (!v) return requiredMessage;
              var from = new Date(2003, 6, 2); // -1 because months are from 0 to 11
              var to = new Date(2006, 3, 20);
              const [y, m, d] = v.substring(0, 10).split("-");
              var check = new Date(Date.UTC(parseInt(y), parseInt(m - 1), parseInt(d)));
              return (check < from || check > to) && "Vous n'avez pas l'âge requis pour vous inscrire au SNU";
            }}
            name="birthdateAt"
            value={values.birthdateAt}
          />
          <DateInput
            value={values.birthdateAt}
            onChange={(date) => {
              handleChange({ target: { value: date, name: "birthdateAt" } });
            }}
          />
        </>
      );
    }
    return <Field disabled={disabled} className="form-control" value={translate(values[name])} name={name} onChange={handleChange} type={type} />;
  };
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>{renderInput()}</Col>
    </Row>
  );
};

const Select = ({ title, name, values, onChange, disabled, errors, touched, validate, options }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <select disabled={disabled} className="form-control" name={name} value={values[name]} onChange={onChange}>
          <option key={-1} value="" label=""></option>
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.value}
            </option>
          ))}
        </select>
      </Col>
    </Row>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
`;

// Title line with filters
const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
`;
const SubTitle = styled.h2`
  color: #242526;
  font-size: 1rem;
  font-weight: 300;
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  min-height: 200px;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
const BoxTitle = styled.h3`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
  color: #171725;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #f2f1f1;
  min-height: 5rem;
`;
const BoxContent = styled.div`
  label {
    font-weight: 500;
    color: #6a6f85;
    display: block;
    margin-bottom: 0;
  }

  .detail {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 20px;
    font-size: 14px;
    text-align: left;
    &-title {
      min-width: 100px;
      width: 100px;
      margin-right: 5px;
    }
  }

  .muted {
    color: #666;
  }
  .history-detail {
    font-size: 0.8rem;
    margin-top: 5px;
    margin-left: 10px;
  }

  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }

  padding: 1rem;
  display: flex;
  flex-direction: ${(props) => props.direction};

  & > * {
    ${(props) =>
      props.direction === "column" &&
      `
    `}
  }
`;

const DeleteBtn = styled.button`
  background-color: #bd2130;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #dc3545;
  }
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
