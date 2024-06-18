import { Field, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { useDebounce } from "@uidotdev/usehooks";
import { AddressForm } from "@snu/ds/common";
import { Box, BoxTitle } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import MultiSelect from "../../components/Multiselect";
import api from "../../services/api";
import { useAddress, ENABLE_PM, legalStatus, ROLES, SENDINBLUE_TEMPLATES, sousTypesStructure, translate, typesStructure } from "../../utils";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import validator from "validator";

export default function Create() {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const [networks, setNetworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  const redirect = new URLSearchParams(window.location.search).get("redirect");

  function validateEmail(value) {
    let error;
    if (value && !validator.isEmail(value)) {
      error = "L'e-mail est invalide";
    }
    return error;
  }

  useEffect(() => {
    if (redirect) window.scrollTo(0, 0);
    (async () => {
      const { data } = await api.get(`/structure/networks`);
      setNetworks(data);
    })();
  }, []);

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={{
        status: "VALIDATED",
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
        legalStatus: "",
        isMilitaryPreparation: "false",
        networkId: user.structureId,
      }}
      onSubmit={async (values) => {
        try {
          setIsLoading(true);

          const emailError = validateEmail(values.email);
          if (emailError) {
            toastr.error(emailError);
            setIsLoading(false);
            return;
          }
          const { data: exist } = await api.post("/referent/exist", { email: values.email });
          if (exist) {
            toastr.warning("Utilisateur déjà inscrit", "Merci de vérifier si la structure existe déjà sur la plateforme");
            setIsLoading(false);
            return;
          }

          if (!values.location) {
            values.location = {
              lat: null,
              lon: null,
            };
          }
          const { data } = await api.post("/structure", values);
          toastr.success("Structure créée");

          const role = values.isNetwork === "true" ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE;
          if (!values.firstName || !values.lastName || !values.email || !values.phone)
            return toastr.error("Vous devez remplir tous les champs", "nom, prénom, téléphone et e-mail");
          const obj = {
            firstName: values.firstName,
            lastName: values.lastName,
            role,
            email: values.email,
            structureId: data._id,
            structureName: data.name,
            phone: values.phone,
          };
          const { ok, code } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE}`, obj);
          if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
          toastr.success("Invitation envoyée");
          setIsLoading(false);
          if (redirect) history.push(redirect);
          else history.push(`/structure/${data._id}`);
        } catch (e) {
          console.log(e);
          toastr.error("Erreur!");
          setIsLoading(false);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched, validateField }) => (
        <Wrapper>
          <Header>
            <Title>Inviter une nouvelle structure</Title>
            <LoadingButton onClick={() => handleSubmit()} color={"#5245cc"} textColor={"#fff"} loading={isLoading}>
              Enregistrer la structure
            </LoadingButton>
          </Header>
          {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
          <Box>
            <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
              <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                <Wrapper>
                  {/*<pre>{JSON.stringify(values, null, 2)}</pre>*/}
                  <BoxTitle>Informations sur la structure d&apos;accueil</BoxTitle>
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
                      <option value={""} disabled selected>
                        Statut juridique
                      </option>
                      {legalStatus.map((status) => (
                        <option key={status} value={status} label={translate(status)}>
                          {translate(status)}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage errors={errors} touched={touched} name="legalStatus" />
                  </FormGroup>
                  {values.legalStatus === "ASSOCIATION" && (
                    <FormGroup>
                      <label>DISPOSEZ-VOUS D&apos;UN AGRÉMENT ?</label>
                      <MultiSelect
                        value={values.types}
                        onChange={handleChange}
                        name="types"
                        options={typesStructure.ASSOCIATION}
                        placeholder="Sélectionnez un ou plusieurs agréments"
                      />
                    </FormGroup>
                  )}
                  {values.legalStatus === "PRIVATE" && (
                    <FormGroup>
                      <label>
                        <span>*</span>TYPE DE STRUCTURE PRIVÉE
                      </label>
                      <Field
                        className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                        validate={(v) => (!v || !v?.length) && "Ce champ est obligatoire"}
                        component="select"
                        name="types"
                        value={values.types}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange({ target: { value: [value], name: "types" } });
                        }}>
                        <option key="" value="" selected disabled>
                          Type de structure privée
                        </option>
                        {typesStructure.PRIVATE.map((e) => {
                          return (
                            <option key={e} value={e}>
                              {translate(e)}
                            </option>
                          );
                        })}
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="types" />
                    </FormGroup>
                  )}
                  {values.legalStatus === "PUBLIC" && (
                    <>
                      <FormGroup>
                        <label>
                          <span>*</span>TYPE DE STRUCTURE PUBLIQUE
                        </label>
                        <Field
                          className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                          validate={(v) => (!v || !v?.length) && "Ce champ est obligatoire"}
                          component="select"
                          name="types"
                          value={values.types}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange({ target: { value: [value], name: "types" } });
                          }}>
                          <option key="" value="" selected disabled>
                            Type de structure publique
                          </option>
                          {typesStructure.PUBLIC.map((e) => {
                            return (
                              <option key={e} value={e}>
                                {translate(e)}
                              </option>
                            );
                          })}
                        </Field>
                        <ErrorMessage errors={errors} touched={touched} name="types" />
                      </FormGroup>
                      {values.types?.some((t) => ["Collectivité territoriale", "Etablissement scolaire", "Etablissement public de santé", "Corps en uniforme"].includes(t)) && (
                        <FormGroup>
                          <label>
                            <span>*</span>SOUS-TYPE DE STRUCTURE
                          </label>
                          <Field
                            className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                            validate={(v) => !v && "Ce champ est obligatoire"}
                            component="select"
                            name="sousType"
                            value={values.sousType}
                            onChange={handleChange}>
                            <option key="" value="" selected disabled>
                              Type de service de l&apos;état
                            </option>
                            {sousTypesStructure[values.types].map((e) => {
                              return (
                                <option key={e} value={e}>
                                  {translate(e)}
                                </option>
                              );
                            })}
                          </Field>
                          <ErrorMessage errors={errors} touched={touched} name="sousType" />
                        </FormGroup>
                      )}
                    </>
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
                      Si l’organisation est membre d&apos;un réseau national (Les Banques alimentaires, Armée du Salut...), renseignez son nom. Vous permettez ainsi au superviseur
                      de votre réseau de visualiser les missions et bénévoles rattachés à votre organisation.
                    </p>
                    <Field component="select" name="networkId" disabled={user.role !== ROLES.ADMIN} value={values.networkId} onChange={handleChange}>
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
                    {user.role === ROLES.ADMIN && (
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
                    {ENABLE_PM && [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) ? (
                      <FormGroup>
                        <label>PRÉPARATION MILITAIRE</label>
                        <Field component="select" name="isMilitaryPreparation" value={values.isMilitaryPreparation} onChange={handleChange}>
                          <option key="false" value="false">
                            Non
                          </option>
                          <option key="true" value="true">
                            Oui
                          </option>
                        </Field>
                      </FormGroup>
                    ) : null}
                  </FormGroup>
                </Wrapper>
              </Col>
              <Col md={6}>
                <Wrapper>
                  <BoxTitle>Responsable de la structure</BoxTitle>
                  <Row>
                    <Col>
                      <FormGroup>
                        <label>
                          <span>*</span>PRÉNOM
                        </label>
                        <Field validate={(v) => !v && requiredMessage} value={values.firstName} name="firstName" onChange={handleChange} placeholder="Prénom" />
                        <ErrorMessage errors={errors} touched={touched} name="firstName" />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <label>
                          <span>*</span>NOM
                        </label>
                        <Field validate={(v) => !v && requiredMessage} value={values.lastName} name="lastName" onChange={handleChange} placeholder="Nom de famille" />
                        <ErrorMessage errors={errors} touched={touched} name="lastName" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <label htmlFor="phone" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span>*</span>Téléphone
                    </label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      name="phone"
                      type="tel"
                      id="phone"
                      value={values.phone}
                      onChange={handleChange}
                      placeholder="06/02 00 00 00 00"
                      validate={(v) =>
                        (!v && requiredMessage) || (!isPossiblePhoneNumber(v, "FR") && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX")
                      }
                    />
                    <ErrorMessage errors={errors} touched={touched} name="phone" />
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>ADRESSE EMAIL
                    </label>
                    <Field validate={(v) => !v && requiredMessage} type="email" value={values.email} name="email" onChange={handleChange} placeholder="Adresse Email" />
                    <ErrorMessage errors={errors} touched={touched} name="email" />
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>
                      Une notification par mail sera envoyée au responsable pour activation de son compte dès l&apos;enregistrement de la structure.
                    </p>
                  </FormGroup>
                </Wrapper>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Wrapper>
                  <BoxTitle>Lieu de la structure</BoxTitle>
                  <AddressForm
                    data={{ address: values.address, zip: values.zip, city: values.city }}
                    updateData={(address) => {
                      for (const [key, value] of Object.entries(address)) {
                        console.log(`${key}: ${value}`);
                        handleChange({ target: { value, name: key } });
                      }
                    }}
                    query={query}
                    setQuery={setQuery}
                    options={results}
                  />
                </Wrapper>
              </Col>
            </Row>
          </Box>
          {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
          <Header style={{ justifyContent: "flex-end" }}>
            <LoadingButton onClick={() => handleSubmit()} color={"#5245cc"} textColor={"#fff"} loading={isLoading}>
              Enregistrer la structure
            </LoadingButton>
          </Header>
        </Wrapper>
      )}
    </Formik>
  );
}

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
