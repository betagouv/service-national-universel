import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { Link, useHistory } from "react-router-dom";
import ReactSelect from "react-select";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import AddressInput from "../../components/addressInput";
import Toggle from "../../components/Toggle";

import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import { translate, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, MISSION_DOMAINS, PERIOD, dateForDatePicker, ROLES, ENABLE_PM, ES_NO_LIMIT } from "../../utils";
import api from "../../services/api";
import Invite from "../structure/components/invite";
import Loader from "../../components/Loader";
import { Box, BoxTitle } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";
import { HiOutlineLockClosed } from "react-icons/hi";
import { capture } from "../../sentry";
import { putLocation } from "../../services/api-adresse";

export default function Edit(props) {
  const setDocumentTitle = useDocumentTitle("Missions");
  const [defaultValue, setDefaultValue] = useState(null);
  const [structure, setStructure] = useState();
  const [structures, setStructures] = useState();
  const [referents, setReferents] = useState([]);
  const [showTutor, setShowTutor] = useState();
  const [invited, setInvited] = useState();
  const [isJvaMission, setIsJvaMission] = useState(false);
  const [loadings, setLoadings] = useState({
    saveButton: false,
    submitButton: false,
    changeStructureButton: false,
  });
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const isNew = !props?.match?.params?.id;

  async function initMission() {
    if (isNew) return setDefaultValue(null);
    const id = props.match && props.match.params && props.match.params.id;
    if (!id) return <div />;
    const { data } = await api.get(`/mission/${id}`);
    if (data && data.startAt) data.startAt = dateForDatePicker(data.startAt);
    if (data && data.endAt) data.endAt = dateForDatePicker(data.endAt);
    setDocumentTitle(`${data.name}`);
    setDefaultValue(data);
    setIsJvaMission(data.isJvaMission === "true");
  }

  async function initReferents() {
    if (!structure) return;
    const body = { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } }, size: ES_NO_LIMIT };
    const { responses } = await api.esQuery("referent", body);
    if (responses.length) {
      setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    }
  }

  async function initStructure() {
    let structureId;
    if (props?.match?.params?.structureId) structureId = props.match.params.structureId;
    else if (defaultValue) structureId = defaultValue.structureId;
    else if (user.structureId) structureId = user.structureId;

    if (structureId) {
      const { data, ok } = await api.get(`/structure/${structureId}`);
      if (!ok && isNew) {
        toastr.error("Impossible de trouver la structure pour créer la mission", "Vous devez créer la mission depuis une structure existante", { timeOut: 5000 });
        history.goBack();
      }
      return setStructure(ok ? data : null);
    }
  }

  async function initStructures() {
    const responseStructure = await api.get("/structure");
    const s = responseStructure.data.map((e) => ({ label: e.name, value: e.name, _id: e._id, structure: e }));
    setStructures(s);
  }

  async function modifyStructure() {
    try {
      setLoadings({
        saveButton: false,
        submitButton: false,
        changeStructureButton: true,
      });
      const { ok, code } = await api.put(`/mission/${defaultValue._id}/structure/${structure._id}`);
      setLoadings({
        saveButton: false,
        submitButton: false,
        changeStructureButton: false,
      });
      if (!ok)
        return code === "OPERATION_NOT_ALLOWED"
          ? toastr.error(translate(code), "Le tuteur de cette mission est affilié à d'autres missions de la structure.")
          : toastr.error(translate(code), "Une erreur s'est produite lors de la modification de la structure.");
      history.push(`/mission/${defaultValue._id}`);
      toastr.success("Structure modifiée");
    } catch (e) {
      setLoadings({
        saveButton: false,
        submitButton: false,
        changeStructureButton: false,
      });
      return toastr.error("Une erreur s'est produite lors de la modification de la structure", e?.message);
    }
  }

  useEffect(() => {
    initMission();
    initStructures();
  }, []);
  useEffect(() => {
    initStructure();
  }, [defaultValue]);
  useEffect(() => {
    initReferents();
  }, [structure, invited]);

  if ((!defaultValue && !isNew) || !structure) return <Loader />;
  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={
        defaultValue || {
          placesTotal: 1,
          format: "CONTINUOUS",
          structureId: structure._id,
          structureName: structure.name,
          name: "",
          description: "",
          actions: "",
          justifications: "",
          contraintes: "",
          tuteur: "",
          startAt: dateForDatePicker(Date.now()),
          endAt: dateForDatePicker(Date.now() + 1000 * 60 * 60 * 24 * 7),
          hebergement: "false",
          hebergementPayant: "false",
          city: "",
          zip: "",
          address: "",
          location: "",
          department: "",
          region: "",
          mainDomain: "",
          domains: [],
          period: [],
          subPeriod: [],
        }
      }
      onSubmit={async (values) => {
        try {
          if (values.status === "DRAFT") {
            setLoadings({
              saveButton: true,
              submitButton: false,
              changeStructureButton: false,
            });
            values.placesLeft = values.placesTotal;
          } else {
            setLoadings({
              saveButton: false,
              submitButton: true,
              changeStructureButton: false,
            });

            if (!defaultValue?.placesTotal) values.placesLeft = values.placesTotal;
            else values.placesLeft += values.placesTotal - defaultValue.placesTotal;

            if (values.placesLeft < 0) {
              return toastr.error("Le nombre de places ne peut pas être inférieur au nombre de places déjà attribuées");
            }

            if (!values.location || !values.location.lat || !values.location.lon) {
              values.location = await putLocation(values.city, values.zip);
              if (!values.location) return toastr.error("Il y a un soucis avec le nom de la ville ou/et le zip code");
              toastr.warning("Une localisation a été ajoutée automatiquement à partir de la ville et du code postal");
            }

            if (!values.domains.includes(values.mainDomain)) values.domains = [values.mainDomain, ...values.domains];
          }
          values.duration = values.duration?.toString();

          const { ok, code, data: mission } = values._id ? await api.put(`/mission/${values._id}`, values) : await api.post("/mission", values);
          if (!ok) throw new Error(translate(code));

          setLoadings({
            saveButton: false,
            submitButton: false,
            changeStructureButton: false,
          });

          history.push(`/mission/${mission._id}`);
          toastr.success("Mission enregistrée");
        } catch (e) {
          setLoadings({
            saveButton: false,
            submitButton: false,
            changeStructureButton: false,
          });
          capture(e);
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", e?.message);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched, validateField, validateForm }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'une mission"}</Title>
            {!defaultValue ? (
              <LoadingButton
                color={"#fff"}
                textColor={"#767697"}
                loading={loadings.saveButton}
                disabled={loadings.submitButton || loadings.changeStructureButton}
                onClick={() => {
                  handleChange({ target: { value: "DRAFT", name: "status" } });
                  handleSubmit();
                }}>
                Enregistrer
              </LoadingButton>
            ) : (
              <LoadingButton
                color={"#fff"}
                textColor={"#767697"}
                loading={loadings.saveButton}
                disabled={loadings.submitButton || loadings.changeStructureButton}
                onClick={handleSubmit}>
                Enregistrer les modifications
              </LoadingButton>
            )}

            {!defaultValue || defaultValue.status === "DRAFT" ? (
              <LoadingButton
                loading={loadings.submitButton}
                disabled={loadings.saveButton || loadings.changeStructureButton}
                onClick={async () => {
                  await handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                  const erroredFields = await validateForm();
                  if (Object.keys(erroredFields).length) {
                    await handleChange({ target: { value: "DRAFT", name: "status" } });
                    return toastr.error("Il y a des erreurs dans le formulaire");
                  }
                  handleSubmit();
                }}>
                Enregistrer et proposer la mission
              </LoadingButton>
            ) : null}
          </Header>

          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            {isJvaMission ? (
              <div className="bg-violet-100 text-indigo-800 p-4 mb-2.5 rounded-lg text-center text-base">
                Les informations grisées sont à modifier par le responsable de la structure depuis son espace{" "}
                <a target="_blank" rel="noreferrer" href="https://www.jeveuxaider.gouv.fr/">
                  jeveuxaider.gouv.fr
                </a>
              </div>
            ) : null}

            <Box>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <BoxTitle>Détails de la mission</BoxTitle>
                    {values.status === "VALIDATED" ? (
                      <FormGroup>
                        <label className="uppercase">Visibilité pour les candidats</label>

                        {values.placesLeft < 1 ? (
                          // Si les places sont toutes attribuées, on l'indique.
                          <div className="flex items-center">
                            <div className={"flex items-center w-9 h-4 rounded-full bg-gray-300"}>
                              <div className={`flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] shadow-nina`}>
                                <HiOutlineLockClosed className="text-gray-400" width={10} height={10} />
                              </div>
                            </div>
                            <div className="ml-2">
                              La mission est <strong>fermée</strong> aux candidatures. Toutes les places sont attribuées.
                            </div>
                          </div>
                        ) : values.pendingApplications >= values.placesLeft * 5 ? (
                          // Si il y a trop de candidatures en attente, on l'indique.
                          <div className="flex items-center">
                            <div className={"flex items-center w-9 h-4 rounded-full bg-gray-300"}>
                              <div className={`flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] shadow-nina`}>
                                {values.visibility === "VISIBLE" ? null : <HiOutlineLockClosed className="text-gray-400" width={10} height={10} />}
                              </div>
                            </div>
                            <div className="ml-2">
                              La mission est <strong>fermée</strong> aux candidatures. Vous avez atteint le seuil des{" "}
                              <Link to="youngs" className="underline text-blue-800">
                                candidatures à traiter
                              </Link>
                              .
                            </div>
                          </div>
                        ) : values.visibility == "VISIBLE" ? (
                          // Toggle de visibilité
                          <div className="flex items-center">
                            <div
                              onClick={() => {
                                handleChange({ target: { value: "HIDDEN", name: "visibility" } });
                              }}
                              name="visibility"
                              className="flex items-center w-9 h-4 rounded-full bg-blue-600 cursor-pointer transition duration-100 ease-in">
                              <div className="flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] translate-x-[16px] transition duration-100 ease-in shadow-nina"></div>
                            </div>
                            <div className="flex ml-2 items-center">
                              <div>
                                La mission est <strong>ouverte</strong> aux candidatures.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div
                              onClick={() => {
                                handleChange({ target: { value: "VISIBLE", name: "visibility" } });
                              }}
                              name="visibility"
                              className="flex items-center w-9 h-4 rounded-full bg-red-500 cursor-pointer transition duration-100 ease-in">
                              <div className="flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] translate-x-0 transition duration-100 ease-in shadow-nina">
                                <HiOutlineLockClosed className="text-gray-400" width={10} height={10} />
                              </div>
                            </div>
                            <div className="flex ml-2 items-center">
                              <div>
                                La mission est <strong>fermée</strong> aux candidatures.
                              </div>
                            </div>
                          </div>
                        )}
                      </FormGroup>
                    ) : null}
                    <FormGroup>
                      <label>
                        <span>*</span>NOM DE LA MISSION
                      </label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Privilégiez une phrase précisant l&apos;action du volontaire.
                        <br />
                        Exemple: « Je fais les courses de produits pour mes voisins les plus fragiles »
                      </p>
                      <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre mission" />
                      <ErrorMessage errors={errors} touched={touched} name="name" />
                    </FormGroup>
                    <FormGroup>
                      <label>DOMAINE D&apos;ACTION PRINCIPAL</label>
                      {!values.mainDomain && values.domains.length > 1 ? (
                        <ul style={{ color: "#a0aec1", fontSize: 12, marginBottom: "1rem" }}>
                          <li>Précédemment, vous aviez sélectionné plusieurs domaines :</li>
                          {values?.domains.map((domain) => (
                            <li key={domain}>• {translate(domain)}</li>
                          ))}
                          <li>Merci de sélectionner un domaine principal (requis), ainsi qu&apos;un ou plusieurs domaine(s) secondaire(s) (facultatif)</li>
                        </ul>
                      ) : null}
                      <Field
                        disabled={isJvaMission}
                        component="select"
                        value={values.mainDomain}
                        onChange={handleChange}
                        name="mainDomain"
                        validate={(v) => values.status === "WAITING_VALIDATION" && !v && requiredMessage}>
                        <option value="" label="Sélectionnez un domaine principal">
                          Sélectionnez un domaine principal
                        </option>
                        {Object.keys(MISSION_DOMAINS).map((el) => (
                          <option key={el} value={el}>
                            {translate(el)}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="mainDomain" />
                    </FormGroup>
                    <FormGroup>
                      <label>DOMAINE(S) D&apos;ACTION SECONDAIRE(S)</label>
                      <CustomSelect
                        styles={{
                          container: () => ({ flex: 1 }),
                          menu: () => ({
                            borderStyle: "solid",
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: "#dedede",
                          }),
                        }}
                        isMulti
                        options={Object.keys(MISSION_DOMAINS)
                          .filter((el) => el !== values.mainDomain)
                          .map((el) => ({ value: el, label: translate(el) }))}
                        placeholder={"Sélectionnez un ou plusieurs domaines"}
                        onChange={(e) => {
                          handleChange({ target: { value: e, name: "domains" } });
                        }}
                        value={values.domains}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>TYPE DE MISSION</label>
                      <Field
                        validate={(v) => values.status === "WAITING_VALIDATION" && !v && requiredMessage}
                        component="select"
                        name="format"
                        value={values.format}
                        onChange={handleChange}>
                        <option key="CONTINUOUS" value="CONTINUOUS">
                          {translate("CONTINUOUS")}
                        </option>
                        <option key="DISCONTINUOUS" value="DISCONTINUOUS">
                          {translate("DISCONTINUOUS")}
                        </option>
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="format" />
                    </FormGroup>
                    <FormGroup>
                      <label>OBJECTIFS DE LA MISSION</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        En cas de modification de ce champ après validation de votre mission, cette dernière repassera en attente de validation et devra être de nouveau étudiée par
                        votre référent départemental.
                      </p>
                      <Field
                        validate={(v) => values.status === "WAITING_VALIDATION" && !v && requiredMessage}
                        name="description"
                        component="textarea"
                        rows={4}
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Décrivez en quelques mots votre mission"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="description" />
                    </FormGroup>
                    <FormGroup>
                      <label>ACTIONS CONCRÈTES CONFIÉES AU(X) VOLONTAIRE(S)</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        En cas de modification de ce champ après validation de votre mission, cette dernière repassera en attente de validation et devra être de nouveau étudiée par
                        votre référent départemental.
                      </p>
                      <Field
                        validate={(v) => values.status === "WAITING_VALIDATION" && !v && requiredMessage}
                        name="actions"
                        component="textarea"
                        rows={4}
                        value={values.actions}
                        onChange={handleChange}
                        placeholder="Listez briévement les actions confiées au(x) volontaire(s)"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="actions" />
                    </FormGroup>
                    <FormGroup>
                      <label>CONTRAINTES SPÉCIFIQUES POUR CETTE MISSION ?</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Précisez les informations complémentaires à préciser au volontaire.
                        <br />
                        Exemple : Conditons physiques / Période de formation / Mission en soirée / etc
                      </p>
                      <Field
                        name="contraintes"
                        component="textarea"
                        rows={4}
                        value={values.contraintes || ""}
                        onChange={handleChange}
                        placeholder="Spécifiez les contraintes liées à la mission"
                      />
                    </FormGroup>
                    {ENABLE_PM && structure.isMilitaryPreparation === "true" ? (
                      <FormGroup>
                        <div>
                          <label>PRÉPARATION MILITAIRE</label>
                          <Field component="select" name="isMilitaryPreparation" value={values.isMilitaryPreparation} onChange={handleChange}>
                            <option key="false" value="false">
                              Non
                            </option>
                            <option key="true" value="true">
                              Oui
                            </option>
                          </Field>
                        </div>
                      </FormGroup>
                    ) : null}
                  </Wrapper>
                </Col>
                <Col md={6}>
                  <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                    <Wrapper style={{ maxWidth: "100%" }}>
                      <BoxTitle>Date et places disponibles</BoxTitle>
                      <FormGroup>
                        <label>
                          <span>*</span>DATES DE LA MISSION
                        </label>
                        <p style={{ color: "#a0aec1", fontSize: 12 }}>
                          3 semaines avant la date de fin indiquée ci-dessous, vous ne recevrez plus de candidatures. La mission sera considérée comme close.
                        </p>
                        <Row>
                          <Col>
                            <Field
                              validate={(v) => {
                                if (!v) return requiredMessage;
                              }}
                              type="date"
                              name="startAt"
                              onChange={handleChange}
                              placeholder="Date de début"
                              disabled={isJvaMission}
                            />
                            <ErrorMessage errors={errors} touched={touched} name="startAt" />
                          </Col>
                          <Col>
                            <Field
                              validate={(v) => {
                                if (!v) return requiredMessage;
                                const end = new Date(v);
                                const start = new Date(values.startAt);
                                if (end.getTime() < start.getTime()) return "La date de fin doit être après la date de début.";
                              }}
                              type="date"
                              name="endAt"
                              onChange={handleChange}
                              placeholder="Date de fin"
                              disabled={isJvaMission}
                            />
                            <ErrorMessage errors={errors} touched={touched} name="endAt" />
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <label htmlFor="duration">Durée de la mission</label>
                        <p style={{ color: "#a0aec1", fontSize: 12 }}>Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</p>
                        <Row>
                          <Col>
                            <input
                              type="text"
                              name="duration"
                              id="duration"
                              onChange={(e) => {
                                const value = e.target.value;
                                var re = new RegExp(/^((?!(0))[0-9]{1,2})$/);
                                if (re.test(value) || !value) {
                                  handleChange({ target: { value: value, name: "duration" } });
                                }
                              }}
                              value={values.duration}
                            />
                            <Field
                              hidden
                              value={values.duration}
                              name="duration"
                              validate={(v) => (parseInt(v) < 1 || parseInt(v) > 99) && "Le nombre saisi doit être compris entre 1 et 100"}
                            />
                            <ErrorMessage errors={errors} touched={touched} name="duration" />
                          </Col>
                          <Col style={{ display: "flex", alignItems: "center" }}>heure(s)</Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <label>FRÉQUENCE ESTIMÉE DE LA MISSION</label>
                        <p style={{ color: "#a0aec1", fontSize: 12 }}>Par exemple, tous les mardis soirs, le samedi, tous les mercredis après-midi pendant un trimestre, etc.</p>
                        <Field
                          // validate={(v) => !v.length}
                          name="frequence"
                          component="textarea"
                          rows={2}
                          value={values.frequence}
                          onChange={handleChange}
                          placeholder="Fréquence estimée de la mission"
                        />
                      </FormGroup>
                      <FormGroup>
                        <label>Période de réalisation de la mission :</label>
                        <CustomSelect
                          styles={{
                            container: () => ({ flex: 1 }),
                            menu: () => ({
                              borderStyle: "solid",
                              borderWidth: 1,
                              borderRadius: 5,
                              borderColor: "#dedede",
                            }),
                          }}
                          isMulti
                          options={Object.values(PERIOD).map((el) => ({ value: el, label: translate(el) }))}
                          placeholder={"Sélectionnez une ou plusieurs périodes"}
                          onChange={(e) => {
                            handleChange({ target: { value: e, name: "period" } });
                          }}
                          value={values.period}
                        />
                        {values.period?.length ? (
                          <>
                            <label style={{ marginTop: "10px" }}>Précisez :</label>
                            <CustomSelect
                              styles={{
                                container: () => ({ flex: 1 }),
                                menu: () => ({
                                  borderStyle: "solid",
                                  borderWidth: 1,
                                  borderRadius: 5,
                                  borderColor: "#dedede",
                                }),
                              }}
                              isMulti
                              options={(() => {
                                const valuesToCheck = values.period;
                                let options = [];
                                if (valuesToCheck?.indexOf(PERIOD.DURING_HOLIDAYS) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_HOLIDAYS));
                                if (valuesToCheck?.indexOf(PERIOD.DURING_SCHOOL) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_SCHOOL));
                                return options.map((el) => ({ value: el, label: translate(el) }));
                              })()}
                              placeholder={"Sélectionnez une ou plusieurs périodes"}
                              onChange={(e) => {
                                handleChange({ target: { value: e, name: "subPeriod" } });
                              }}
                              value={values.subPeriod}
                            />
                          </>
                        ) : null}
                      </FormGroup>
                      <FormGroup>
                        <label>NOMBRE DE VOLONTAIRES RECHERCHÉS POUR CETTE MISSION</label>
                        <p style={{ color: "#a0aec1", fontSize: 12 }}>
                          Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
                        </p>
                        <Input name="placesTotal" onChange={handleChange} value={values.placesTotal} type="number" min={1} max={999} disabled={isJvaMission} />
                      </FormGroup>
                      <div className="flex flex-row justify-between items-center w-full text-[#6a6f85] text-[11px] uppercase">
                        <div className="flex flex-row items-center gap-1">
                          <div>Hébergement proposé : </div>
                          <div className="font-bold">{values.hebergement === "true" ? "Oui" : "Non"}</div>
                        </div>
                        <Toggle
                          id="hebergement"
                          name="hebergement"
                          value={values.hebergement === "true"}
                          onChange={(e) => handleChange({ target: { value: e.toString(), name: "hebergement" } })}
                        />
                      </div>
                      {values.hebergement === "true" && (
                        <div className="flex flex-row justify-between items-center w-full text-[#6a6f85] text-[11px] uppercase mt-4">
                          <div className="flex flex-row items-center gap-1">
                            <div>Hébergement payant : </div>
                            <div className="font-bold">{values.hebergementPayant === "true" ? "Oui" : "Non"}</div>
                          </div>
                          <Toggle
                            id="hebergementPayant"
                            name="hebergementPayant"
                            value={values.hebergementPayant === "true"}
                            onChange={(e) => {
                              handleChange({ target: { value: e.toString(), name: "hebergementPayant" } });
                            }}
                          />
                        </div>
                      )}
                    </Wrapper>
                  </Row>
                  <Wrapper>
                    <BoxTitle>Tuteur de la mission</BoxTitle>
                    <FormGroup>
                      <label>TUTEUR</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Sélectionner le tuteur qui va s&apos;occuper de la mission. <br />
                        {/* todo invite tuteur */}
                        {structure && (
                          <span>
                            Vous pouvez également{" "}
                            <u>
                              <a
                                style={{ textDecoration: "underline", cursor: "pointer" }}
                                onClick={() => {
                                  setShowTutor(true);
                                }}>
                                ajouter un nouveau tuteur
                              </a>
                            </u>{" "}
                            à votre équipe.
                          </span>
                        )}
                      </p>
                      <Field
                        validate={(v) => values.status === "WAITING_VALIDATION" && !v && requiredMessage}
                        disabled={isJvaMission}
                        component="select"
                        name="tutorId"
                        value={values.tutorId}
                        onChange={handleChange}>
                        <option value="">Sélectionner un tuteur</option>
                        {referents &&
                          referents.map((referent) => {
                            return <option key={referent._id} value={referent._id}>{`${referent.firstName} ${referent.lastName}`}</option>;
                          })}
                      </Field>
                      {structure && showTutor && !isJvaMission && <Invite structure={structure} setInvited={setInvited} />}
                      <ErrorMessage errors={errors} touched={touched} name="tutorId" />
                    </FormGroup>
                  </Wrapper>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Wrapper>
                    <BoxTitle>Lieu où se déroule la mission</BoxTitle>
                    <AddressInput
                      keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region", addressVerified: "addressVerified" }}
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      validateField={validateField}
                      required={values.status === "WAITING_VALIDATION"}
                      disabled={isJvaMission}
                    />
                  </Wrapper>
                </Col>
              </Row>
            </Box>
            {user.role === ROLES.ADMIN && defaultValue ? (
              structures?.length ? (
                <Box>
                  <Row>
                    <Col md={12}>
                      <Wrapper>
                        <BoxTitle>Structure associée</BoxTitle>
                        <Header>
                          <ReactSelect
                            styles={{
                              container: () => ({ flex: 1 }),
                              menu: () => ({
                                borderStyle: "solid",
                                borderWidth: 1,
                                borderRadius: 5,
                                borderColor: "#dedede",
                              }),
                            }}
                            defaultValue={{ label: structure.name, value: structure.name, _id: structure._id }}
                            options={structures}
                            placeholder={"Modifier la structure rattachée"}
                            noOptionsMessage={() => "Aucune structure ne correspond à cette recherche."}
                            onChange={(e) => {
                              setStructure(e.structure);
                            }}
                          />
                          <div style={{ alignSelf: "flex-start" }}>
                            <LoadingButton
                              loading={loadings.changeStructureButton}
                              disabled={loadings.saveButton || loadings.submitButton}
                              onClick={() => {
                                modifyStructure();
                              }}>
                              Modifier la structure
                            </LoadingButton>
                          </div>
                        </Header>
                      </Wrapper>
                    </Col>
                  </Row>
                </Box>
              ) : (
                <Loader />
              )
            ) : null}
            {Object.values(errors).filter((e) => !!e).length ? (
              <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3>
            ) : null}
            <Header style={{ justifyContent: "flex-end" }}>
              {!defaultValue && (
                <a
                  href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3508?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
                  target="_blank"
                  rel="noreferrer"
                  className="mr-auto">
                  <img className="w-32" src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" />
                </a>
              )}
              {!defaultValue ? (
                <LoadingButton
                  color={"#fff"}
                  textColor={"#767697"}
                  loading={loadings.saveButton}
                  disabled={loadings.submitButton || loadings.changeStructureButton}
                  onClick={() => {
                    handleChange({ target: { value: "DRAFT", name: "status" } });
                    handleSubmit();
                  }}>
                  Enregistrer
                </LoadingButton>
              ) : (
                <LoadingButton
                  color={"#fff"}
                  textColor={"#767697"}
                  loading={loadings.saveButton}
                  disabled={loadings.submitButton || loadings.changeStructureButton}
                  onClick={handleSubmit}>
                  Enregistrer les modifications
                </LoadingButton>
              )}
              {!defaultValue || defaultValue.status === "DRAFT" ? (
                <LoadingButton
                  loading={loadings.submitButton}
                  disabled={loadings.saveButton || loadings.changeStructureButton}
                  onClick={async () => {
                    await handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                    const erroredFields = await validateForm();
                    if (Object.keys(erroredFields).length) {
                      await handleChange({ target: { value: "DRAFT", name: "status" } });
                      return toastr.error("Il y a des erreurs dans le formulaire");
                    }
                    handleSubmit();
                  }}>
                  Enregistrer et proposer la mission
                </LoadingButton>
              ) : null}
            </Header>
          </Wrapper>
        </div>
      )}
    </Formik>
  );
}
const CustomSelect = ({ onChange, options, value, isMulti, placeholder }) => {
  return (
    <ReactSelect
      options={options}
      placeholder={placeholder}
      onChange={(val) => (isMulti ? onChange(val.map((c) => c.value)) : onChange(val.value))}
      value={isMulti ? options.filter((c) => value.includes(c.value)) : options.find((c) => c.value === value)}
      isMulti={isMulti}
    />
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
    :disabled {
      background-color: #e9ecef;
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
