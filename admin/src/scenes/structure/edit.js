import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik, Field } from "formik";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import Avatar from "../../components/Avatar";
import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import Invite from "./components/invite";
import Loader from "../../components/Loader";
import { associationTypes, privateTypes, publicTypes, publicEtatTypes, translate } from "../../utils";
import api from "../../services/api";
import { Box, BoxTitle } from "../../components/box";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState();
  const [networks, setNetworks] = useState([]);
  const [referents, setReferents] = useState([]);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setDefaultValue(null);
      const { data } = await api.get(`/structure/${id}`);
      const { data: networkData } = await api.get(`/structure/networks`);
      setNetworks(networkData);
      setDefaultValue(data);
    })();
  }, []);

  useEffect(() => {
    if (!defaultValue) return;
    (async () => {
      const structure = defaultValue;
      const queries = [];
      queries.push({ index: "referent", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
      });

      const { responses } = await api.esQuery(queries);
      setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    })();
  }, [defaultValue]);

  if (defaultValue === undefined) return <Loader />;

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={
        defaultValue || {
          name: "",
          description: "",
          actions: "",
          justifications: "",
          contraintes: "",
          departement: "",
          city: "",
          zip: "",
          address: "",
          location: "",
          department: "",
          region: "",
          website: "",
          facebook: "",
          twitter: "",
          instagram: "",
        }
      }
      onSubmit={async (values) => {
        try {
          let id = values._id;
          if (!id) {
            values.placesLeft = values.placesTotal;
            const { ok, data, code } = await api.post("/structure", values);
            if (!ok) return toastr.error("Une erreur s'est produite lors de la création de la structure", translate(code));
            id = data._id;
            toastr.success("Structure créée");
          } else {
            await api.put(`/structure/${values._id}`, values);
            history.push(`/structure/${values._id}`);
            toastr.success("Structure mise à jour");
          }

          if (values.isNetwork !== defaultValue.isNetwork) {
            const { data: members, ok } = await api.get(`/referent/structure/${id}`);
            if (!ok) return;
            members
              .filter((m) => ["supervisor", "responsible"].includes(m.role))
              .forEach(async (m) => {
                await api.put(`/referent/${m._id}`, {
                  role: values.isNetwork === "true" ? "supervisor" : "responsible",
                });
              });
          }
        } catch (e) {
          console.log(e);
          toastr.error("Erreur!");
        }
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <Wrapper>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'une structure"}</Title>
            <SaveButton handleChange={handleChange} handleSubmit={handleSubmit} defaultValue={defaultValue} />
          </Header>
          {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
          <Box>
            <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
              <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                <Wrapper>
                  {/*<pre>{JSON.stringify(values, null, 2)}</pre>*/}
                  <BoxTitle>Informations sur la structure d'accueil</BoxTitle>
                  <FormGroup>
                    <label>
                      <span>*</span>NOM DE LA STRUCTURE
                    </label>
                    <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre structure" />
                    <ErrorMessage errors={errors} touched={touched} name="name" />
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>STATUT JURIDIQUE
                    </label>
                    <Field validate={(v) => !v && requiredMessage} component="select" name="legalStatus" value={values.legalStatus} onChange={handleChange}>
                      <option key="PUBLIC" value="PUBLIC">
                        {translate("PUBLIC")}
                      </option>
                      <option key="PRIVATE" value="PRIVATE">
                        {translate("PRIVATE")}
                      </option>
                      <option key="ASSOCIATION" value="ASSOCIATION">
                        {translate("ASSOCIATION")}
                      </option>
                      <option key="OTHER" value="OTHER">
                        {translate("OTHER")}
                      </option>
                    </Field>
                    <ErrorMessage errors={errors} touched={touched} name="legalStatus" />
                  </FormGroup>
                  {values.legalStatus === "ASSOCIATION" && (
                    <FormGroup>
                      <label>DISPOSEZ-VOUS D'UN AGRÉMENT ?</label>
                      <MultiSelect
                        value={values.associationTypes}
                        onChange={handleChange}
                        name="associationTypes"
                        options={associationTypes}
                        placeholder="Sélectionnez un ou plusieurs agréments"
                      />
                    </FormGroup>
                  )}
                  {values.legalStatus === "PRIVATE" && (
                    <FormGroup>
                      <label>TYPE DE STRUCTURE PRIVÉE</label>
                      <Field validate={(v) => !v && requiredMessage} component="select" name="structurePriveeType" value={values.structurePriveeType} onChange={handleChange}>
                        <option key="" value="" />
                        {privateTypes.map((e) => {
                          return (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          );
                        })}
                      </Field>
                    </FormGroup>
                  )}
                  {values.legalStatus === "PUBLIC" && (
                    <div>
                      <FormGroup>
                        <label>TYPE DE STRUCTURE PUBLIQUE</label>
                        <Field validate={(v) => !v && requiredMessage} component="select" name="structurePubliqueType" value={values.structurePubliqueType} onChange={handleChange}>
                          <option key="" value="" />
                          {publicTypes.map((e) => {
                            return (
                              <option key={e} value={e}>
                                {e}
                              </option>
                            );
                          })}
                        </Field>
                      </FormGroup>
                      {["Service de l'Etat", "Etablissement public"].includes(values.structurePubliqueType) && (
                        <FormGroup>
                          <label>TYPE DE SERVICE DE L'ETAT</label>
                          <Field
                            validate={(v) => !v && requiredMessage}
                            component="select"
                            name="structurePubliqueEtatType"
                            value={values.structurePubliqueEtatType}
                            onChange={handleChange}
                          >
                            <option key="" value="" />
                            {publicEtatTypes.map((e) => {
                              return (
                                <option key={e} value={e}>
                                  {e}
                                </option>
                              );
                            })}
                          </Field>
                        </FormGroup>
                      )}
                    </div>
                  )}
                  <FormGroup>
                    <label>
                      <span>*</span>PRÉSENTATION SYNTHÉTIQUE DE LA STRUCTURE
                    </label>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      name="description"
                      component="textarea"
                      rows={4}
                      value={values.description || ""}
                      onChange={handleChange}
                      placeholder="Décrivez en quelques mots votre structure"
                    />
                    <ErrorMessage errors={errors} touched={touched} name="description" />
                  </FormGroup>
                  <FormGroup>
                    <label>NUMÉRO DE SIRET (SI DISPONIBLE)</label>
                    <Field value={values.siret || ""} onChange={handleChange} name="siret" placeholder="Numéro de SIRET" />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <label>SITE INTERNET</label>
                        <Field value={values.website || ""} onChange={handleChange} name="website" placeholder="Site internet" />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <label>FACEBOOK</label>
                        <Field value={values.facebook || ""} onChange={handleChange} name="facebook" placeholder="Facebook" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <label>TWITTER</label>
                        <Field value={values.twitter || ""} onChange={handleChange} name="twitter" placeholder="Twitter" />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <label>INSTAGRAM</label>
                        <Field value={values.instagram || ""} onChange={handleChange} name="instagram" placeholder="Instagram" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <label>RÉSEAU NATIONAL</label>
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>
                      Si l’organisation est membre d'un réseau national (Les Banques alimentaires, Armée du Salut...), renseignez son nom. Vous permettez ainsi au superviseur de
                      votre réseau de visualiser les missions et bénévoles rattachés à votre organisation.
                    </p>
                    <Field component="select" name="networkId" value={values.networkId} onChange={handleChange}>
                      <option key="" value="" />
                      {networks &&
                        networks.map((network) => {
                          return (
                            <option key={network._id} value={network._id}>
                              {network.name}
                            </option>
                          );
                        })}
                    </Field>
                  </FormGroup>
                  <FormGroup>
                    {user.role === "admin" && (
                      <div>
                        <label>TÊTE DE RÉSEAU</label>
                        <Field component="select" name="isNetwork" value={values.isNetwork} onChange={handleChange}>
                          <option key="false" value="false">
                            Non
                          </option>
                          <option key="true" value="true">
                            Oui
                          </option>
                        </Field>
                      </div>
                    )}
                  </FormGroup>
                </Wrapper>
              </Col>
              <Col md={6}>
                <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <BoxTitle>{`Équipe (${referents.length})`}</BoxTitle>
                    {referents.length ? null : <i>Aucun compte n'est associé à cette structure.</i>}
                    {referents.map((referent, k) => (
                      <Link to={`/user/${referent._id}`} key={k}>
                        <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
                          <Avatar name={`${referent.firstName} ${referent.lastName}`} />
                          <div>{`${referent.firstName} ${referent.lastName}`}</div>
                        </div>
                      </Link>
                    ))}
                  </Wrapper>
                </Row>
                <Invite structure={values} />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Wrapper>
                  <BoxTitle>Lieu de la structure</BoxTitle>
                  <AddressInput
                    keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region" }}
                    values={values}
                    handleChange={handleChange}
                    errors={errors}
                    touched={touched}
                  />
                  <p style={{ color: "#a0aec1", fontSize: 12 }}>Si l'adresse n'est pas reconnue, veuillez saisir le nom de la ville.</p>
                </Wrapper>
              </Col>
            </Row>
          </Box>
          {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
          <Header style={{ justifyContent: "flex-end" }}>
            <SaveButton handleChange={handleChange} handleSubmit={handleSubmit} defaultValue={defaultValue} />
          </Header>
        </Wrapper>
      )}
    </Formik>
  );
};

const SaveButton = ({ handleChange, handleSubmit, defaultValue }) => (
  <ButtonContainer>
    <button
      type="submit"
      onClick={() => {
        handleChange({ target: { value: "VALIDATED", name: "status" } });
        handleSubmit();
      }}
    >
      {defaultValue ? "Enregistrer les modifications" : "Créer la structure"}
    </button>
  </ButtonContainer>
);

const Wrapper = styled.div`
  padding: 3rem;
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
  margin-bottom: 2rem;
  align-items: center;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  > label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    > span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  select,
  textarea,
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
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
