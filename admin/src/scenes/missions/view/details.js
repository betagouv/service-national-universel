import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { translate, ROLES, MISSION_DOMAINS, PERIOD, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL } from "../../../utils";
import MissionView from "./wrapper";
import Pencil from "../../../assets/icons/Pencil";
import Field from "../components/Field";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import api from "../../../services/api";
import Toggle from "../../../components/Toggle";

export default function DetailsView({ mission, structure, tutor }) {
  const [values, setValues] = useState(mission);
  const [structures, setStructures] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [editingBottom, setEdittingBottom] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const [errorsBottom, setErrorsBottom] = useState({});

  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  async function initStructures() {
    const responseStructure = await api.get("/structure");
    const s = responseStructure.data.map((e) => ({ label: e.name, value: { name: e.name, _id: e._id } }));
    setStructures(s);
  }

  useEffect(() => {
    initStructures();
  }, []);

  const onSubmit = () => {
    setLoading(true);
    const error = {};
    if (!values.name) error.name = "Ce champ est obligatoire";
    if (!values.structureName || !values.structureId) error.structureName = "Ce champ est obligatoire";
    if (!values.domain) error.domain = "Ce champ est obligatoire";
    if (!values.address) error.address = "Ce champ est obligatoire";
    if (!values.zip) error.zip = "Ce champ est obligatoire";
    if (!values.city) error.city = "Ce champ est obligatoire";
    if (!values.addressVerified) error.addressVerified = "L'adresse doit être vérifié";

    if (!values.description) error.description = "Ce champ est obligatoire";
    if (!values.actions) error.actions = "Ce champ est obligatoire";

    console.log(values);
    setErrors(error);
    if (Object.keys(error).length > 0) return setLoading(false);
  };
  const onSubmitBottom = () => {};

  const mainDomainsOption = Object.keys(MISSION_DOMAINS).map((d) => {
    return { value: d, label: translate(d) };
  });

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setValues({
      ...values,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      address: isConfirmed ? suggestion.address : values.address,
      zip: isConfirmed ? suggestion.zip : values.zip,
      city: isConfirmed ? suggestion.city : values.city,
    });
  };

  const formatOptions = [
    { value: "CONTINUOUS", label: translate("CONTINUOUS") },
    { value: "DISCONTINUOUS", label: translate("DISCONTINUOUS") },
  ];
  console.log(mission);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="details">
        <div className="bg-white rounded-lg mx-8 mb-8 overflow-hidden pt-2">
          <div className="flex flex-col rounded-lg pb-12 px-8 bg-white">
            <div className="flex items-center justify-between my-4">
              <div className="flex flex-row gap-4 items-center justify-center">
                <div className="text-lg font-medium text-gray-900">Informations générales</div>
                {mission.status === "VALIDATED" && (
                  <div className="flex flex-row gap-2">
                    <Toggle
                      id="visibility"
                      name="visibility"
                      disabled={!editing}
                      value={mission.visibility === "VISIBLE"}
                      onChange={(e) => setValues({ ...values, visibility: e ? "VISIBLE" : "HIDDEN" })}
                    />
                    <div>
                      La mission est <strong>{mission.visibility === "VISIBLE" ? "ouverte" : "fermée"}</strong> aux candidatures
                    </div>
                  </div>
                )}
              </div>
              {user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION ? (
                <>
                  {!editing ? (
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEditing(true)}
                      disabled={loading}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setEditing(false);
                          setValues(mission);
                          setErrors({});
                        }}
                        disabled={loading}>
                        Annuler
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onSubmit}
                        disabled={loading}>
                        <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                        Enregistrer les changements
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-14">
              <div className="flex flex-col gap-4 flex-1 min-w-[350px]">
                <div>
                  <div className="text-xs font-medium mb-2">
                    Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. Ex : « Je fais les courses de produits pour mes voisins les plus
                    fragiles »
                  </div>
                  <Field
                    name="name"
                    errors={errors}
                    readOnly={!editing}
                    handleChange={(e) => setValues({ ...values, name: e.target.value })}
                    label="Nom de la mission"
                    value={values.name}
                  />
                </div>
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Structure rattachée</div>
                  <Field
                    errors={errors}
                    name="structureName"
                    type="select"
                    readOnly={!editing}
                    options={structures}
                    handleChange={(e) => setValues({ ...values, structureName: e.name, structureId: e._id })}
                    label="Structure"
                    value={values.structureName}
                  />
                  {values.structureName && editing && (
                    <div
                      onClick={() => history.push(`/structure/${values.structureId}/edit`)}
                      className="border-[1px] py-2 cursor-pointer text-blue-600 rounded border-blue-600 text-center mt-4">
                      Modifier la structure
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-xs font-medium mb-2">Domaine d&apos;action principal</div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    handleChange={(e) => setValues({ ...values, mainDomain: e, domains: values.domains.filter((d) => d !== e) })}
                    type="select"
                    name="mainDomain"
                    options={mainDomainsOption}
                    label="Sélectionnez un domaine principal"
                    value={translate(values.mainDomain)}
                  />
                  <div className="flex flex-row text-xs font-medium my-2">
                    <div>Domaine(s) d&apos;action secondaire(s)</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    name="domains"
                    handleChange={(e) => setValues({ ...values, domains: e })}
                    type="select"
                    multiple
                    options={mainDomainsOption.filter((d) => d.value !== values.mainDomain && !values.domains.includes(d.value))}
                    label="Sélectionnez un ou plusieurs domaines"
                    transformer={translate}
                    value={translate(values.domains)}
                  />
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900 mt-8 mb-4">Lieu où se déroule la mission</div>
                  <div className="text-xs font-medium mb-2">Adresse</div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    label="Adresse"
                    name="address"
                    handleChange={(e) => {
                      console.log(e);
                      setValues({ ...values, address: e.target.value, addressVerified: false });
                    }}
                    value={values.address}
                    error={errors?.address}
                  />
                  <div className="flex flex-row justify-between gap-3 my-4">
                    <Field
                      errors={errors}
                      readOnly={!editing}
                      label="Code postal"
                      className="w-[50%]"
                      name="zip"
                      handleChange={(e) => setValues({ ...values, zip: e.target.value, addressVerified: false })}
                      value={values.zip}
                      error={errors?.zip}
                    />
                    <Field
                      errors={errors}
                      readOnly={!editing}
                      label="Ville"
                      name="city"
                      className="w-[50%]"
                      handleChange={(e) => setValues({ ...values, city: e.target.value, addressVerified: false })}
                      value={values.city}
                      error={errors?.city}
                    />
                  </div>
                  {editing && !values.addressVerified && (
                    <VerifyAddress
                      address={values.address}
                      zip={values.zip}
                      city={values.city}
                      onSuccess={onVerifyAddress(true)}
                      onFail={onVerifyAddress()}
                      isVerified={values.addressVerified === true}
                      buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                      verifyText="Pour vérifier  l'adresse vous devez remplir les champs adresse, code postal et ville."
                    />
                  )}
                </div>
              </div>
              <div className="hidden xl:flex justify-center items-center">
                <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex flex-col gap-4 flex-1 min-w-[350px]">
                <div>
                  <div className="text-xs font-medium mb-2">Type de mission</div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    name="format"
                    type="select"
                    handleChange={(e) => setValues({ ...values, format: e })}
                    options={formatOptions}
                    label="Mission regroupée sur des journées"
                    value={translate(values.format)}
                  />
                </div>
                <div>
                  <div className="flex flex-row text-xs font-medium mt-2">
                    <div>Domaine(s) d&apos;action secondaire(s)</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  <div className="text-xs font-medium mb-2">Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    name="duration"
                    handleChange={(e) => setValues({ ...values, duration: e.target.value })}
                    label="Heure(s)"
                    value={translate(values.duration)}
                  />
                </div>
                <div>
                  <div className="flex flex-row text-xs font-medium my-2">
                    <div>
                      Objectifs de la mission -
                      <span className="text-gray-400">
                        &nbsp;En cas de modification de ce champ après validation de votre mission, cette dernière repassera en attente de validation et devra être de nouveau
                        étudiée par votre référent départemental.
                      </span>
                    </div>
                  </div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    name="description"
                    type="textarea"
                    row={4}
                    handleChange={(e) => setValues({ ...values, description: e.target.value })}
                    label="Décrivez en quelques mots votre mission"
                    value={translate(values.description)}
                  />
                </div>
                <div>
                  <div className="flex flex-row text-xs font-medium my-2">
                    <div>
                      Actions concrètes confiées au(x) volontaire(s) -
                      <span className="text-gray-400">
                        &nbsp;En cas de modification de ce champ après validation de votre mission, cette dernière repassera en attente de validation et devra être de nouveau
                        étudiée par votre référent départemental.
                      </span>
                    </div>
                  </div>
                  <Field
                    errors={errors}
                    readOnly={!editing}
                    type="textarea"
                    name="actions"
                    row={4}
                    handleChange={(e) => setValues({ ...values, actions: e.target.value })}
                    label="Listez brièvement les actions confiées au(x) volontaires"
                    value={translate(values.actions)}
                  />
                </div>
                <div>
                  <div className="flex flex-col text-xs font-medium my-2">
                    <div>
                      Contraintes spécifiques pour cette mission
                      <span className="text-gray-400">&nbsp;(facultatif).&nbsp;</span>
                    </div>
                    <div>(conditons physiques, période de formation, mission en soirée...)</div>
                  </div>
                  <Field
                    readOnly={!editing}
                    type="textarea"
                    row={4}
                    handleChange={(e) => setValues({ ...values, contraintes: e.target.value })}
                    label="Précisez les informations complémentaires à préciser au volontaire."
                    value={translate(values.contraintes)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg mx-8 mb-8 overflow-hidden pt-2">
          <div className="flex flex-col rounded-lg pb-12 px-8 bg-white">
            <div className="flex items-center justify-between my-4">
              <div className="text-lg font-medium text-gray-900">
                <div>Dates et places disponibles</div>
              </div>
              {user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION ? (
                <>
                  {!editingBottom ? (
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEdittingBottom(true)}
                      disabled={loadingBottom}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setEdittingBottom(false);
                          setValues(mission);
                        }}
                        disabled={loading}>
                        Annuler
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onSubmitBottom}
                        disabled={loadingBottom}>
                        <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                        Enregistrer les changements
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-12">
              <div className="flex flex-col gap-4 flex-1 min-w-[350px]">
                <div>
                  <div className="text-xs font-medium mb-2">Dates de la mission</div>
                  <div className="flex flex-row justify-between gap-3 my-4">
                    <Field
                      errors={errorsBottom}
                      name="startAt"
                      readOnly={!editingBottom}
                      label="Date de début"
                      type="date"
                      className="w-[50%]"
                      handleChange={(e) => setValues({ ...values, startAt: e })}
                      value={values.startAt}
                      error={errors?.startAt}
                    />
                    <Field
                      errors={errorsBottom}
                      readOnly={!editingBottom}
                      label="Date de fin"
                      name="endAt"
                      className="w-[50%]"
                      type="date"
                      handleChange={(e) => setValues({ ...values, endAt: e })}
                      value={values.endAt}
                      error={errors?.endAt}
                    />
                  </div>
                  <div className="flex flex-col text-xs font-medium my-2">
                    <div>
                      Fréquence estimée de la mission
                      <span className="text-gray-400">&nbsp;(facultatif)&nbsp;</span>
                      (tous les mardis soirs, le samedi, tous les mercredis après-midi pendant un trimestre...)
                    </div>
                  </div>
                  <Field
                    errors={errorsBottom}
                    readOnly={!editingBottom}
                    name="frequence"
                    type="textarea"
                    row={4}
                    handleChange={(e) => setValues({ ...values, frequence: e.target.value })}
                    label="Fréquence estimée de la mission"
                    value={values.frequence}
                  />
                </div>
              </div>
              <div className="hidden xl:flex justify-center items-center">
                <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex flex-col gap-4 flex-1 min-w-[350px]">
                <div>
                  <div className="flex flex-row text-xs font-medium my-2">
                    <div>Période de réalisation de la mission</div>
                    <div className="text-gray-400">&nbsp;(facultatif)</div>
                  </div>
                  {/* Script pour passage d'array periode en single value */}
                  <Field
                    errors={errorsBottom}
                    readOnly={!editingBottom}
                    name="values"
                    handleChange={(e) => setValues({ ...values, period: e })}
                    type="select"
                    multiple
                    options={Object.keys(PERIOD)
                      .filter((el) => !values.period.includes(el))
                      .map((d) => {
                        return { value: d, label: translate(d) };
                      })}
                    label="Sélectionnez une ou plusieurs périodes"
                    transformer={translate}
                    value={values.period}
                  />
                  {values.period !== "" && values.period !== "WHENEVER" && (
                    <Field
                      errors={errorsBottom}
                      readOnly={!editingBottom}
                      className="mt-4"
                      name="subPeriod"
                      handleChange={(e) => setValues({ ...values, subPeriod: e })}
                      type="select"
                      multiple
                      options={(() => {
                        const valuesToCheck = values.period;
                        let options = [];
                        if (valuesToCheck?.indexOf(PERIOD.DURING_HOLIDAYS) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_HOLIDAYS));
                        if (valuesToCheck?.indexOf(PERIOD.DURING_SCHOOL) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_SCHOOL));
                        return options.filter((el) => !values.subPeriod.includes(el)).map((el) => ({ value: el, label: translate(el) }));
                      })()}
                      label="Précisez"
                      transformer={translate}
                      value={translate(values.subPeriod)}
                    />
                  )}
                </div>
                <div>
                  <div className="flex flex-col text-xs font-medium my-2">
                    Nombre de volontaire(s) recherché(s). Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
                  </div>
                  <Field
                    name="placesTotal"
                    errors={errorsBottom}
                    readOnly={!editingBottom}
                    handleChange={(e) => setValues({ ...values, placesTotal: e.target.value })}
                    value={values.placesTotal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*
        <Box>
          <Row style={rowStyle}>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7", padding: 0 }}>
              <Bloc title="La mission">
                {mission.placesLeft < 1 ? (
                  <div className="flex flex-row items-center gap-2">
                    <VscWarning className="w-6 h-6 text-red-500" />
                    <div>
                      La mission est <strong>fermée</strong> aux candidatures de manière automatique : aucune place disponible.
                    </div>
                  </div>
                ) : mission.pendingApplications >= mission.placesLeft * 5 ? (
                  <div className="flex flex-row items-center gap-2">
                    <VscWarning className="w-6 h-6 text-red-500" />
                    <div>
                      La mission est <strong>fermée</strong> aux candidatures. Vous avez atteint le seuil des{" "}
                      <Link to={`${mission._id}/youngs`} className="underline text-blue-800">
                        candidatures à traiter
                      </Link>
                      .
                    </div>
                  </div>
                ) : mission.visibility === "HIDDEN" ? (
                  <div className="flex flex-row items-center gap-2">
                    <VscWarning className="w-6 h-6 text-red-500" />
                    <div>
                      La mission est <strong>fermée</strong> aux candidatures par l&apos;action d&apos;un administrateur.
                    </div>
                  </div>
                ) : null}

                <Details title="Format" value={translate(mission.format)} />
                {mission.mainDomain ? <Details title="Domaine principal" value={translate(mission.mainDomain)} /> : null}
                {mission.domains ? <Details title="Domaine(s)" value={domains.map((d) => translate(d)).join(", ")} /> : null}
                <Details title="Début" value={formatStringDateTimezoneUTC(mission.startAt)} />
                <Details title="Fin" value={formatStringDateTimezoneUTC(mission.endAt)} />
                {mission.duration ? <Details title="Durée" value={`${mission.duration} heure(s)`} /> : null}
                <Details title="Adresse" value={mission.address} />
                <Details title="Ville" value={mission.city} />
                <Details title="Code postal" value={mission.zip} />
                <Details title="Dép." value={mission.department} />
                <Details title="Région" value={mission.region} />
                {user.role === ROLES.ADMIN && mission.location?.lat && mission.location?.lon ? (
                  <Details title="GPS" value={`${mission.location?.lat} , ${mission.location?.lon}`} copy />
                ) : null}
                <Details title="Format" value={translate(mission.format)} />
                <Details title="Fréquence" value={mission.frequence} />
                <Details title="Périodes" value={mission.period.map((p) => translate(p)).join(", ")} />
                <Details title="Objectifs" value={mission.description} />
                <Details title="Actions" value={mission.actions} />
                <Details title="Hébergement proposé" value={mission?.hebergement === "true" ? "Oui" : "Non"} />
                {mission?.hebergement === "true" && <Details title="Hébergement payant" value={mission?.hebergementPayant === "true" ? "Oui" : "Non"} />}
                <div></div>
              </Bloc>
            </Col>
            <Col md={6} style={{ padding: 0 }}>
              <Row style={{ borderBottom: "2px solid #f4f5f7", ...rowStyle }}>
                {tutor ? (
                  <Bloc
                    title="Le tuteur"
                    titleRight={
                      <Link to={`/user/${tutor._id}`}>
                        <SubtitleLink>{`${tutor.firstName} ${tutor.lastName} >`}</SubtitleLink>
                      </Link>
                    }>
                    <Details title="E-mail" value={tutor.email} copy />
                    <Details title="Tel. fixe" value={tutor.phone} copy />
                    <Details title="Tel. mobile" value={mission.mobile} copy />
                  </Bloc>
                ) : (
                  <Bloc title="Le tuteur">
                    <p>Cette mission n&apos;a pas de tuteur</p>
                    <Link to={`/mission/${mission._id}/edit`}>
                      <PanelActionButton title="Assigner un tuteur" icon="pencil" />
                    </Link>
                  </Bloc>
                )}
              </Row>
              <Row style={{ borderBottom: "2px solid #f4f5f7", ...rowStyle }}>
                {structure ? (
                  <Bloc
                    title="La structure"
                    titleRight={
                      <Link to={`/structure/${structure._id}`}>
                        <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
                      </Link>
                    }>
                    <Details title="Statut Légal" value={translate(structure.legalStatus)} />
                    <Details title="Région" value={structure.region} />
                    <Details title="Dép." value={structure.department} />
                    <Details title="Ville" value={structure.city} />
                    <Details title="Adresse" value={structure.address} />
                    <Details title="Présentation" value={structure.description} />
                  </Bloc>
                ) : null}
              </Row>
              {[MISSION_STATUS.ARCHIVED, MISSION_STATUS.CANCEL]?.includes(mission.status) && mission.statusComment ? (
                <Row style={rowStyle}>
                  <Bloc title={mission.status === MISSION_STATUS.ARCHIVED ? "Archivage" : mission.status === MISSION_STATUS.CANCEL ? "Annulation" : ""}>
                    <Details title="Motif" value={mission.statusComment} />
                  </Bloc>
                </Row>
              ) : null}
            </Col>
          </Row>
        </Box>
        */}
      </MissionView>
    </div>
  );
}
