import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Field, Formik } from "formik";

import DateInput from "../../components/dateInput";
import { departmentList, regionList, translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";

export default (props) => {
  const [user, setUser] = useState();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setUser(null);
      const { data } = await api.get(`/referent/${id}`);
      setUser(data);
    })();
  }, []);

  if (user === undefined) return <div>Chargement...</div>;

  const getSubtitle = () => {
    const createdAt = new Date(user.createdAt);
    createdAt.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(createdAt - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `Inscrit(e) il y a ${diffDays} jour(s) - ${createdAt.toLocaleDateString()}`;
  };

  return (
    //@todo fix the depart and region
    <Wrapper>
      <Formik
        initialValues={user}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: user } = await api.put(`/referent/${values._id}`, values);
            if (!ok) toastr.error("Une erreur s'est produite :", code);
            setUser(user);
            toastr.success("Mis à jour !");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", e.code);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Profil Référent de ${values.firstName} ${values.lastName}`}</Title>
                <SubTitle>{getSubtitle()}</SubTitle>
              </div>
              <button onClick={handleSubmit}>Enregistrer</button>
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
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Information</BoxTitle>
                  <BoxContent direction="column">
                    <Select
                      name="role"
                      values={values}
                      handleChange={handleChange}
                      title="Rôle"
                      options={["referent_department", "referent_region", "admin"].map((key) => ({ value: key, label: translate(key) }))}
                    />
                    <Select name="department" values={values} handleChange={handleChange} title="Département" options={departmentList.map((d) => ({ value: d, label: d }))} />
                    <Select
                      disabled={values.role === "referent_department"}
                      name="region"
                      values={values}
                      handleChange={handleChange}
                      title="Région"
                      options={regionList.map((r) => ({ value: r, label: r }))}
                    />
                  </BoxContent>
                </Box>
              </Col>
            </Row>
          </>
        )}
      </Formik>
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

const Select = ({ title, name, values, handleChange, disabled, errors, touched, validate, options }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <select disabled={disabled} className="form-control" className="form-control" name={name} value={values[name]} onChange={handleChange}>
          <option key={-1} value="" label="" />
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label} />
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
