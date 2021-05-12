import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { useHistory } from "react-router-dom";

import { translate, departmentList, regionList, department2region } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../components/box";
import Item from "./components/Item";
import Select from "./components/Select";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState(null);
  const history = useHistory();
  const isNew = !props?.match?.params?.id;

  async function initCenter() {
    if (isNew) return setDefaultValue(null);
    const id = props.match && props.match.params && props.match.params.id;
    const { data } = await api.get(`/cohesion-center/${id}`);
    setDefaultValue(data);
  }

  useEffect(() => {
    initCenter();
  }, []);

  if (!defaultValue && !isNew) return <Loader />;

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={defaultValue || {}}
      onSubmit={async (values) => {
        try {
          if (isNew) values.placesLeft = values.placesTotal;
          else values.placesLeft += values.placesTotal - defaultValue.placesTotal;

          const { ok, code, data } = await api[values._id ? "put" : "post"]("/cohesion-center", values);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre !!", translate(code));
          history.push(`/centre/${data._id}`);
          toastr.success("Centre enregistré");
        } catch (e) {
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre", e?.error?.message);
        }
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'un centre"}</Title>
            <ButtonContainer>
              <button onClick={handleSubmit}>{defaultValue ? "Enregistrer les modifications" : "Créer le centre"}</button>
            </ButtonContainer>
          </Header>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas enregistrer ce centre car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Informations générales</BoxHeadTitle>
                  <BoxContent direction="column">
                    <Item title="Nom du centre" values={values} name={"name"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Code" values={values} name={"code"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="COR" values={values} name={"COR"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Capacité d'accueil" values={values} name={"placesTotal"} handleChange={handleChange} required errors={errors} touched={touched} />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Coordonnées</BoxHeadTitle>
                  <BoxContent direction="column">
                    <Item title="Adresse" values={values} name={"address"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Ville" values={values} name={"city"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Code Postal" values={values} name={"zip"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Select
                      handleChange={handleChange}
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
                      errors={errors}
                      touched={touched}
                      required
                    />
                    <Select
                      handleChange={handleChange}
                      name="region"
                      values={values}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleChange({ target: { name: "region", value } });
                        handleChange({ target: { name: "department", value: "" } });
                      }}
                      title="Région"
                      options={regionList.map((r) => ({ value: r, label: r }))}
                      errors={errors}
                      touched={touched}
                      required
                    />
                  </BoxContent>
                </Box>
              </Col>
              {/* <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Informations complémentaires</BoxHeadTitle>
                  <BoxContent direction="column">
                    <Select
                      name="outfitDelivered"
                      values={values}
                      handleChange={handleChange}
                      title="Tenue livrées"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                  </BoxContent>
                </Box>
              </Col> */}
            </Row>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              <ButtonContainer>
                <button onClick={handleSubmit}>{defaultValue ? "Enregistrer les modifications" : "Créer le centre"}</button>
              </ButtonContainer>
            </Header>
          </Wrapper>
        </div>
      )}
    </Formik>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
  li {
    list-style-type: none;
  }
  h3.alert {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
    text-align: center;
  }
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-top: 25px;
  align-items: center;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  flex: 1;
`;

const ButtonContainer = styled.div`
  button {
    background-color: #5245cc;
    color: #fff;
    &.white-button {
      color: #000;
      background-color: #fff;
      :hover {
        background: #ddd;
      }
    }
    margin-left: 1rem;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;
