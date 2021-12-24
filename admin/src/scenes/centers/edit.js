import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { useHistory } from "react-router-dom";

import { translate } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../components/box";
import Item from "./components/Item";
import Select from "./components/Select";
import LoadingButton from "../../components/buttons/LoadingButton";
import AddressInput from "../../components/addressInputV2";
import MultiSelect from "../../components/Multiselect";

export default function Edit(props) {
  const [defaultValue, setDefaultValue] = useState(null);
  const [loading, setLoading] = useState(false);
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
          setLoading(true);
          if (isNew) values.placesLeft = values.placesTotal;
          else values.placesLeft += values.placesTotal - defaultValue.placesTotal;

          const { ok, code, data } = values._id ? await api.put("/cohesion-center", values) : await api.post("/cohesion-center", values);

          setLoading(false);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre !!", translate(code));
          history.push(`/centre/${data._id}`);
          toastr.success("Centre enregistré");
        } catch (e) {
          setLoading(false);
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre", e?.error?.message);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched, validateField }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'un centre"}</Title>
            <LoadingButton onClick={handleSubmit} loading={loading}>
              {defaultValue ? "Enregistrer les modifications" : "Créer le centre"}
            </LoadingButton>
          </Header>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas enregistrer ce centre car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Informations générales sur le centre</BoxHeadTitle>
                  <BoxContent direction="column">
                    <Item title="Nom du centre" values={values} name={"name"} handleChange={handleChange} required errors={errors} touched={touched} />
                    {values._id ? <Item disabled title="Code" values={values} name="_id" /> : null}
                    <Item title="Capacité d'accueil" values={values} name={"placesTotal"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Select
                      name="pmr"
                      values={values}
                      handleChange={handleChange}
                      title="Accessibilité aux personnes à mobilité réduite"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                      required
                      errors={errors}
                      touched={touched}
                    />
                    <MultiSelectWithTitle
                      title="Séjour(s) de cohésion concerné(s)"
                      value={values.cohorts}
                      onChange={handleChange}
                      name="cohorts"
                      options={["Juillet 2022", "Juin 2022", "Février 2022", "2021", "2020", "2019"]}
                      placeholder="Sélectionner un ou plusieurs séjour de cohésion"
                    />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Adresse du centre</BoxHeadTitle>
                  <BoxContent direction="column">
                    <AddressInput
                      keys={{
                        country: "country",
                        city: "city",
                        zip: "zip",
                        address: "address",
                        location: "location",
                        department: "department",
                        region: "region",
                        addressVerified: "addressVerified",
                      }}
                      values={values}
                      departAndRegionVisible={true}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      validateField={validateField}
                      required
                    />
                  </BoxContent>
                </Box>
              </Col>
            </Row>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              <LoadingButton onClick={handleSubmit} loading={loading}>
                {defaultValue ? "Enregistrer les modifications" : "Créer le centre"}
              </LoadingButton>
            </Header>
          </Wrapper>
        </div>
      )}
    </Formik>
  );
}
const MultiSelectWithTitle = ({ title, value, onChange, name, options, placeholder }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <MultiSelect value={value} onChange={onChange} name={name} options={options} placeholder={placeholder} />
      </Col>
    </Row>
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
