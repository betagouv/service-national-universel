import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik, Field } from "formik";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import Avatar from "../../components/Avatar";
import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import Invite from "./components/invite";
import Loader from "../../components/Loader";
import { translate, ROLES, ENABLE_PM, legalStatus, typesStructure, sousTypesStructure } from "../../utils";
import api from "../../services/api";
import { Box, BoxTitle } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";
import { canDeleteReferent } from "snu-lib/roles";
import DeleteBtnComponent from "./components/DeleteBtnComponent";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default function Edit(props) {
  const setDocumentTitle = useDocumentTitle("Structures");
  const [defaultValue, setDefaultValue] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [networks, setNetworks] = useState([]);
  const [referents, setReferents] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  const onClickDelete = (target) => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(target),
      title: `Êtes-vous sûr(e) de vouloir supprimer le profil de ${target.firstName} ${target.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async (target) => {
    try {
      const { ok, code } = await api.remove(`/referent/${target._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_OBJECT") return toastr.error(translate(code), "Ce responsable est affilié comme tuteur sur une ou plusieurs missions.");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce profil a été supprimé.");
      setReferents(referents.filter((referent) => referent._id !== target._id));
      return true;
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la suppression du profil :", translate(e.code));
    }
  };

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setDefaultValue(null);
      const { data } = await api.get(`/structure/${id}`);
      const { data: networkData } = await api.get(`/structure/networks`);
      setNetworks(networkData);
      setDocumentTitle(`${data.name}`);
      setDefaultValue(data);
    })();
  }, []);

  useEffect(() => {
    if (!defaultValue) return;
    (async () => {
      const structure = defaultValue;
      const { responses } = await api.esQuery("referent", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
      });
      if (responses.length) {
        setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
      }
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
          setLoading(true);
          let id = values._id;
          if (!id) {
            values.placesLeft = values.placesTotal;
            const { ok, data, code } = await api.post("/structure", values);
            setLoading(false);
            if (!ok) return toastr.error("Une erreur s'est produite lors de la création de la structure", translate(code));
            id = data._id;
            toastr.success("Structure créée");
          } else {
            const responsePutStructure = await api.put(`/structure/${values._id}`, values);
            setLoading(false);
            if (!responsePutStructure.ok) return toastr.error(translate(responsePutStructure.code));
            history.push(`/structure/${values._id}`);
            toastr.success("Structure mise à jour");
          }
        } catch (e) {
          setLoading(false);
          console.log(e);
          toastr.error("Erreur!");
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <Wrapper>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'une structure"}</Title>
            <LoadingButton
              onClick={() => {
                handleChange({ target: { value: "VALIDATED", name: "status" } });
                handleSubmit();
              }}
              loading={loading}>
              {defaultValue ? "Enregistrer les modifications" : "Créer la structure"}
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
                    <label>PRÉSENTATION SYNTHÉTIQUE DE LA STRUCTURE</label>
                    <Field
                      name="description"
                      component="textarea"
                      rows={4}
                      value={values.description || ""}
                      onChange={handleChange}
                      placeholder="Décrivez en quelques mots votre structure"
                    />
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
                  {user.role === ROLES.ADMIN && (
                    <>
                      <FormGroup>
                        <label>TÊTE DE RÉSEAU</label>
                        <Field component="select" name="isNetwork" value={values.isNetwork} onChange={handleChange}>
                          <option key="false" value="false">
                            Non
                          </option>
                          <option key="true" value="true">
                            Oui
                          </option>
                        </Field>
                      </FormGroup>
                      {ENABLE_PM ? (
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
                    </>
                  )}
                </Wrapper>
              </Col>
              <Col md={6}>
                <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <BoxTitle>{`Équipe (${referents.length})`}</BoxTitle>
                    {referents.length ? null : <i>Aucun compte n&apos;est associé à cette structure.</i>}
                    {referents.map((referent) => (
                      <div className="flex items-center justify-between mt-4" key={referent._id}>
                        <Link to={`/user/${referent._id}`} className="flex items-center">
                          <Avatar name={`${referent.firstName} ${referent.lastName}`} />
                          <div className="pr-10">{`${referent.firstName} ${referent.lastName}`}</div>
                        </Link>
                        {referents.length > 1 && canDeleteReferent({ actor: user, originalTarget: referent, structure: defaultValue }) && (
                          <DeleteBtnComponent onClick={() => onClickDelete(referent)}></DeleteBtnComponent>
                        )}
                      </div>
                    ))}
                    <ModalConfirm
                      isOpen={modal?.isOpen}
                      title={modal?.title}
                      message={modal?.message}
                      onCancel={() => setModal({ isOpen: false, onConfirm: null })}
                      onConfirm={() => {
                        modal?.onConfirm();
                        setModal({ isOpen: false, onConfirm: null });
                      }}
                    />
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
                    required={false}
                    keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region" }}
                    values={values}
                    handleChange={handleChange}
                    errors={errors}
                    touched={touched}
                  />
                  <p style={{ color: "#a0aec1", fontSize: 12 }}>Si l&apos;adresse n&apos;est pas reconnue, veuillez saisir le nom de la ville.</p>
                </Wrapper>
              </Col>
            </Row>
          </Box>
          {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
          <Header style={{ justifyContent: "flex-end" }}>
            <LoadingButton
              onClick={() => {
                handleChange({ target: { value: "VALIDATED", name: "status" } });
                handleSubmit();
              }}
              loading={loading}>
              {defaultValue ? "Enregistrer les modifications" : "Créer la structure"}
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
