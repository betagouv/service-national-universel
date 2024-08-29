import React, { useState, useEffect } from "react";
import { MdInfoOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { BiLoaderAlt } from "react-icons/bi";
import { isAfter } from "date-fns";
import { isSuperAdmin, ROLES, COHORT_TYPE } from "snu-lib";
import { Container } from "@snu/ds/admin";

import api from "@/services/api";

import { capture } from "@/sentry";
import logo from "@/assets/logo-snu.png";

import Breadcrumbs from "@/components/Breadcrumbs";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import InputText from "@/components/ui/forms/InputText";
import InputTextarea from "@/components/ui/forms/InputTextarea";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import NumberInput from "@/components/ui/forms/NumberInput";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { settings, uselessSettings } from "./utils";
import { InformationsConvoyage } from "@/scenes/settings/InformationsConvoyage";
import { CleSettings } from "@/scenes/settings/CleSettings";
import { getDefaultCohort } from "@/utils/session";

export default function Settings() {
  const { user } = useSelector((state) => state.Auth);
  const cohorts = useSelector((state) => state.Cohorts);

  const urlParams = new URLSearchParams(window.location.search);

  const cohort = urlParams.get("cohort") ? decodeURIComponent(urlParams.get("cohort")) : getDefaultCohort(cohorts);
  const [isLoading, setIsLoading] = useState(true);
  const readOnly = !isSuperAdmin(user);
  const [noChange, setNoChange] = useState(true);
  const history = useHistory();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState({});
  const [data, setData] = useState({
    ...settings,
    ...uselessSettings,
  });
  const [showSpecificDatesReInscription, setShowSpecificDatesReInscription] = useState(false);

  const getCohort = async () => {
    try {
      const { ok, data: reponseCohort } = await api.get("/cohort/" + encodeURIComponent(cohort));
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du séjour");
      }
      delete reponseCohort.dsnjExportDates;
      const { uselessInformation, ...base } = reponseCohort;

      setData({
        ...settings,
        ...base,
        uselessInformation: {
          ...uselessSettings,
          ...uselessInformation,
        },
      });

      setIsLoading(false);
      setMounted(true);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du séjour");
    }
  };

  useEffect(() => {
    if (!cohort) return;
    setIsLoading(true);
    getCohort();
  }, [cohort]);

  useEffect(() => {
    if (!mounted) return;
    setNoChange(false);
    if (!showSpecificDatesReInscription && (data.reInscriptionStartDate || data.reInscriptionEndDate)) {
      setShowSpecificDatesReInscription(true);
    }
  }, [data]);

  const onSubmit = async () => {
    try {
      let err = {};
      if (!data.dateStart) err.dateStart = "La date de début est obligatoire";
      if (!data.dateEnd) err.dateEnd = "La date de fin est obligatoire";
      if (!data.inscriptionStartDate) err.inscriptionStartDate = "La date d'ouverture des inscriptions est obligatoire";
      if (!data.inscriptionEndDate) err.inscriptionEndDate = "La date de fermeture des inscriptions est obligatoire";
      if (!data.instructionEndDate) err.instructionEndDate = "La date de fermeture des inscriptions est obligatoire";

      if (isAfter(new Date(data.reInscriptionStartDate), new Date(data.reInscriptionEndDate)))
        err.reInscriptionStartDate = "La date d'ouverture des réinscriptions est antérieure a la date de cloture.";
      if (isAfter(new Date(data.reInscriptionEndDate), new Date(data.inscriptionEndDate)))
        err.reInscriptionEndDate = "Les dates de cloture de réinscription ne peuvent pas etre postérieures a celles de réinscription.";
      setError(err);
      if (Object.values(err).length > 0) {
        return toastr.warning("Veuillez corriger les erreurs dans le formulaire");
      }

      setIsLoading(true);
      delete data.snuId;
      const { ok, code } = await api.put(`/cohort/${encodeURIComponent(cohort)}`, data);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", code);
        await getCohort();
        return setIsLoading(false);
      }
      toastr.success("La session a bien été mise à jour");
      await getCohort();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session");
      await getCohort();
      setIsLoading(false);
    }
  };

  if (user.role !== ROLES.ADMIN)
    return (
      <div className="h-100 m-6 flex flex-col items-center justify-center">
        <img src={logo} alt="logo" className="w-56 pb-8" />
        <div className="pb-4 text-center text-3xl">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
        <div className="mt-4 text-center text-lg text-gray-500">
          Besoin d&apos;aide ?{" "}
          <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="scale-105 cursor-pointer hover:underline">
            Cliquez ici
          </a>
        </div>
      </div>
    );

  return (
    <>
      <Breadcrumbs items={[{ label: "Paramétrage dynamique" }]} />
      <div className="flex w-full flex-col px-8 pb-8">
        <div className="flex items-center justify-between py-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Paramétrage dynamique</div>
          <SelectCohort cohort={cohort} onChange={(cohortName) => history.replace({ search: `?cohort=${encodeURIComponent(cohortName)}` })} />
        </div>
        <div className="flex w-full flex-col gap-8">
          {/* Informations générales */}
          <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex w-full flex-col gap-8">
              <p className="text-lg font-medium leading-5 text-gray-900">Informations générales</p>
              <div className="flex">
                <div className="flex w-[45%] flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Identification</p>
                      <MdInfoOutline data-tip data-for="identification" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="identification" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          <li>Nom donné à la cohorte.</li>
                          <li>Identifiant technique donné à la cohorte.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <InputText label="Nom de la cohort" value={data.name} disabled />
                    <InputText label="Identifiant" value={data.snuId} disabled />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Dates du séjour</p>
                      <MdInfoOutline data-tip data-for="dates_du_séjour" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="dates_du_séjour" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Précision de la date de départ en séjour et de celle de retour.</p>
                      </ReactTooltip>
                    </div>
                    <div className="flex w-full gap-4">
                      <DatePickerInput
                        mode="single"
                        label="Début"
                        value={data.dateStart}
                        error={error.dateStart}
                        onChange={(e) => setData({ ...data, dateStart: e })}
                        readOnly={readOnly}
                        disabled={isLoading}
                      />
                      <DatePickerInput
                        mode="single"
                        label="Fin"
                        value={data.dateEnd}
                        error={error.dateEnd}
                        onChange={(e) => setData({ ...data, dateEnd: e })}
                        readOnly={readOnly}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-[10%] items-center justify-center">
                  <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex w-[45%] flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Toolkit d’aide</p>
                      <MdInfoOutline data-tip data-for="toolkit" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="toolkit" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Liens vers un articles d&apos;aide pour suivre la cohorte.</p>
                      </ReactTooltip>
                    </div>
                    <InputText
                      placeholder="Indiquez l’URL d’un article de la BDC"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.uselessInformation?.toolkit || ""}
                      onChange={(e) => setData({ ...data, uselessInformation: { ...data.uselessInformation, toolkit: e.target.value } })}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Zones concernées</p>
                      <MdInfoOutline data-tip data-for="zones_concernées" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="zones_concernées" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Précision de la ou des zones géographiques ou scolaires concernées par le séjour.
                        </p>
                      </ReactTooltip>
                    </div>
                    <InputTextarea
                      placeholder="Précisez en quelques mots"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data?.uselessInformation?.zones || ""}
                      onChange={(e) => setData({ ...data, uselessInformation: { ...data.uselessInformation, zones: e.target.value } })}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Éligibilité</p>
                      <MdInfoOutline data-tip data-for="eligibilité" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="eligibilité" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Précision des critères d’éligibilité des volontaires pour le séjour (niveau scolaire).
                        </p>
                      </ReactTooltip>
                    </div>
                    <InputTextarea
                      placeholder="Précisez en quelques mots"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data?.uselessInformation?.eligibility || ""}
                      onChange={(e) => setData({ ...data, uselessInformation: { ...data.uselessInformation, eligibility: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* TODO implementer parametres sur la plateforme */}
          {/* Inscriptions (phase 0) */}
          <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex flex-col w-full gap-8">
              <p className="text-gray-900 leading-5 text-lg font-medium">Inscriptions (phase 0)</p>
              <div className="flex">
                <div className="flex flex-col w-[45%] gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Inscriptions</p>
                      <MdInfoOutline data-tip data-for="inscriptions" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="inscriptions" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          <li>Ouverture et fermeture de la proposition du séjour sur le formulaire d’inscription.</li>
                          <li>Blocage de l’accès au dossier des dossiers d’inscription “en cours”.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <DatePickerInput
                      mode="single"
                      isTime
                      label="Ouverture"
                      placeholder="Date et heure"
                      value={data.inscriptionStartDate}
                      error={error.inscriptionStartDate}
                      onChange={(e) => setData({ ...data, inscriptionStartDate: e })}
                      readOnly={readOnly}
                      disabled={isLoading}
                    />
                    <DatePickerInput
                      mode="single"
                      isTime
                      label="Fermeture"
                      placeholder="Date et heure"
                      value={data.inscriptionEndDate}
                      onChange={(e) => setData({ ...data, inscriptionEndDate: e })}
                      readOnly={readOnly}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Réinscriptions</p>
                    </div>
                    <SimpleToggle
                      label="Dates spécifiques"
                      disabled={isLoading || readOnly}
                      value={showSpecificDatesReInscription}
                      onChange={(v) => {
                        if (v == false) setData({ ...data, reInscriptionEndDate: null, reInscriptionStartDate: null });
                        setShowSpecificDatesReInscription(v);
                      }}
                    />
                    {showSpecificDatesReInscription && (
                      <>
                        <DatePickerInput
                          mode="single"
                          isTime
                          label="Ouverture"
                          placeholder="Date et heure"
                          value={data.reInscriptionStartDate || data.inscriptionStartDate}
                          error={error.reInscriptionStartDate}
                          onChange={(e) => setData({ ...data, reInscriptionStartDate: e })}
                          readOnly={readOnly}
                          disabled={isLoading}
                        />
                        <DatePickerInput
                          mode="single"
                          isTime
                          label="Fermeture"
                          placeholder="Date et heure"
                          value={data.reInscriptionEndDate || data.inscriptionEndDate}
                          error={error.reInscriptionEndDate}
                          // onChange={(e) => {}}
                          onChange={(e) => setData({ ...data, reInscriptionEndDate: e })}
                          readOnly={readOnly}
                          disabled={isLoading || !data.inscriptionEndDate}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex w-[10%] justify-center items-center">
                  <div className="w-[1px] h-[90%] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex flex-col w-[45%] gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Modification de son dossier déposé par un volontaire</p>
                      <MdInfoOutline data-tip data-for="modification_volontaire" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip
                        id="modification_volontaire"
                        type="light"
                        place="top"
                        effect="solid"
                        className="custom-tooltip-radius !opacity-100 !shadow-md"
                        tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          <li>
                            Fermeture de la possibilité de modifier ou corriger son dossier d’inscription (pour les dossiers “en attente de validation” et “en attente de
                            correction”).
                          </li>
                          <li>Le bouton d’accès au dossier est masqué sur le compte volontaire et l’URL d’accès au formulaire bloquée.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <div className="flex gap-4 w-full">
                      <DatePickerInput
                        mode="single"
                        isTime
                        label="Fermeture"
                        placeholder="Date"
                        value={data.inscriptionModificationEndDate}
                        onChange={(e) => setData({ ...data, inscriptionModificationEndDate: e })}
                        readOnly={readOnly}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Instruction</p>
                      <MdInfoOutline data-tip data-for="instruction" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="instruction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          <li> Fermeture de la proposition de séjour pour le changement de séjour.</li>
                          <li>Le lendemain, les dossiers restants “en attente de validation” et “en attente de correction” seront basculés sur un autre séjour via script.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <div className="flex gap-4 w-full">
                      <DatePickerInput
                        mode="single"
                        isTime
                        label="Fermeture"
                        placeholder="Date"
                        value={data.instructionEndDate}
                        onChange={(e) => setData({ ...data, instructionEndDate: e })}
                        readOnly={readOnly}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TODO implementer parametres sur la plateforme */}
          {/* Préparation des affectations et des transports (phase 1) */}
          <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex w-full flex-col gap-8">
              <p className="text-lg font-medium leading-5 text-gray-900">Préparation des affectations et des transports (phase 1)</p>
              <div className="flex">
                <div className="flex w-[45%] flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Remplissage des centres </p>
                      <MdInfoOutline data-tip data-for="remplissage_centres" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="remplissage_centres" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          <li>Ouverture ou fermeture pour les utilisateurs de la possibilité de déclarer un centre sur le séjour.</li>
                          <li>Ouverture et fermeture pour les utilisateurs de la possibilité de modifier le nombre de places ouvertes sur le séjour</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <SimpleToggle
                      label="Référents régionaux"
                      disabled={isLoading || readOnly}
                      value={data.sessionEditionOpenForReferentRegion}
                      onChange={() => setData({ ...data, sessionEditionOpenForReferentRegion: !data.sessionEditionOpenForReferentRegion })}
                    />
                    <SimpleToggle
                      label="Référents départementaux"
                      disabled={isLoading || readOnly}
                      value={data.sessionEditionOpenForReferentDepartment}
                      onChange={() => setData({ ...data, sessionEditionOpenForReferentDepartment: !data.sessionEditionOpenForReferentDepartment })}
                    />
                    <SimpleToggle
                      label="Transporteurs"
                      disabled={isLoading || readOnly}
                      value={data.sessionEditionOpenForTransporter}
                      onChange={() => setData({ ...data, sessionEditionOpenForTransporter: !data.sessionEditionOpenForTransporter })}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Remplissage des points de rassemblement</p>
                      <MdInfoOutline data-tip data-for="remplissage_PDR" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="remplissage_PDR" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Ouverture ou fermerture pour les utilisateurs de la possibilité de déclarer un point de rassemblement sur le séjour.
                        </p>
                      </ReactTooltip>
                    </div>
                    <SimpleToggle
                      label="Référents régionaux"
                      disabled={isLoading || readOnly}
                      value={data.pdrEditionOpenForReferentRegion}
                      onChange={() => setData({ ...data, pdrEditionOpenForReferentRegion: !data.pdrEditionOpenForReferentRegion })}
                    />
                    <SimpleToggle
                      label="Référents départementaux"
                      disabled={isLoading || readOnly}
                      value={data.pdrEditionOpenForReferentDepartment}
                      onChange={() => setData({ ...data, pdrEditionOpenForReferentDepartment: !data.pdrEditionOpenForReferentDepartment })}
                    />
                    <SimpleToggle
                      label="Transporteurs"
                      disabled={isLoading || readOnly}
                      value={data.pdrEditionOpenForTransporter}
                      onChange={() => setData({ ...data, pdrEditionOpenForTransporter: !data.pdrEditionOpenForTransporter })}
                    />
                  </div>
                  <InformationsConvoyage
                    disabled={isLoading || readOnly}
                    informationsConvoyageData={data?.informationsConvoyage}
                    handleChange={(informationsConvoyage) => setData({ ...data, informationsConvoyage: informationsConvoyage })}
                  />
                </div>
                <div className="flex w-[10%] items-center justify-center">
                  <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex w-[45%] flex-col gap-4">
                  {data.type !== COHORT_TYPE.CLE && (
                    <>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs  font-medium text-gray-900">Création de groupe et modification du schéma de répartition</p>
                          <MdInfoOutline data-tip data-for="création_groupe" className="h-5 w-5 cursor-pointer text-gray-400" />
                          <ReactTooltip id="création_groupe" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                              Ouverture ou fermeture pour les utilisateurs de la possibilité de créer et modifier des groupes sur le schéma de répartition.
                            </p>
                          </ReactTooltip>
                        </div>
                        <ToggleDate
                          label="Référents régionaux"
                          disabled={isLoading}
                          readOnly={readOnly}
                          value={data.repartitionSchemaCreateAndEditGroupAvailability}
                          onChange={() => setData({ ...data, repartitionSchemaCreateAndEditGroupAvailability: !data.repartitionSchemaCreateAndEditGroupAvailability })}
                          range={{
                            from: data?.uselessInformation?.repartitionSchemaCreateAndEditGroupAvailabilityFrom || undefined,
                            to: data?.uselessInformation?.repartitionSchemaCreateAndEditGroupAvailabilityTo || undefined,
                          }}
                          onChangeRange={(range) => {
                            setData({
                              ...data,
                              uselessInformation: {
                                ...data.uselessInformation,
                                repartitionSchemaCreateAndEditGroupAvailabilityFrom: range?.from,
                                repartitionSchemaCreateAndEditGroupAvailabilityTo: range?.to,
                              },
                            });
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs  font-medium text-gray-900">Accès au schéma de répartition </p>
                          <MdInfoOutline data-tip data-for="acces_schema" className="h-5 w-5 cursor-pointer text-gray-400" />
                          <ReactTooltip id="acces_schema" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                              Autoriser ou bloquer l’accès à la consultation du schéma de répartition.
                            </p>
                          </ReactTooltip>
                        </div>
                        <SimpleToggle
                          label="Référents régionaux"
                          disabled={isLoading || readOnly}
                          value={data.schemaAccessForReferentRegion}
                          onChange={() => setData({ ...data, schemaAccessForReferentRegion: !data.schemaAccessForReferentRegion })}
                        />
                        <SimpleToggle
                          label="Référents départementaux"
                          disabled={isLoading || readOnly}
                          value={data.schemaAccessForReferentDepartment}
                          onChange={() => setData({ ...data, schemaAccessForReferentDepartment: !data.schemaAccessForReferentDepartment })}
                        />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Téléchargement du schéma de répartition</p>
                      <MdInfoOutline data-tip data-for="téléchargement_schema" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="téléchargement_schema" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de télécharger le schéma de répartition. L’ouverture active les notifications au
                          transporteur lors des modifications sur le schéma de répartition.
                        </p>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Transporteur"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.repartitionSchemaDownloadAvailability}
                      onChange={() => setData({ ...data, repartitionSchemaDownloadAvailability: !data.repartitionSchemaDownloadAvailability })}
                      range={{
                        from: data?.uselessInformation?.repartitionSchemaDownloadAvailabilityFrom || undefined,
                        to: data?.uselessInformation?.repartitionSchemaDownloadAvailabilityTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            repartitionSchemaDownloadAvailabilityFrom: range?.from,
                            repartitionSchemaDownloadAvailabilityTo: range?.to,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Modification du plan de transport</p>
                      <MdInfoOutline data-tip data-for="demande_correction" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="demande_correction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de modifier le plan de transport au niveau d'une ligne"
                        </p>
                      </ReactTooltip>
                    </div>
                    <SimpleToggle
                      label="Transporteurs"
                      disabled={isLoading || readOnly}
                      value={data.busEditionOpenForTransporter}
                      onChange={() => setData({ ...data, busEditionOpenForTransporter: !data.busEditionOpenForTransporter })}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Demande de correction sur le plan de transport</p>
                      <MdInfoOutline data-tip data-for="demande_correction" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="demande_correction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de demander une correction sur le plan de transport.
                        </p>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Référents régionaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.isTransportPlanCorrectionRequestOpen}
                      onChange={() => setData({ ...data, isTransportPlanCorrectionRequestOpen: !data.isTransportPlanCorrectionRequestOpen })}
                      range={{
                        from: data?.uselessInformation?.isTransportPlanCorrectionRequestOpenFrom || undefined,
                        to: data?.uselessInformation?.isTransportPlanCorrectionRequestOpenTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            isTransportPlanCorrectionRequestOpenFrom: range?.from,
                            isTransportPlanCorrectionRequestOpenTo: range?.to,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Affectation et pointage (phase 1) */}
          <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex w-full flex-col gap-8">
              <p className="text-lg font-medium leading-5 text-gray-900">Affectation et pointage (phase 1)</p>
              <div className="flex">
                <div className="flex w-[45%] flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Annonce et visibilité des affectations par les volontaires</p>
                      <MdInfoOutline data-tip data-for="annonce_affectation" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="annonce_affectation" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          <li>Ouverture ou fermeture de la visibilité sur l’affectation par le volontaire sur son compte.</li>
                          <li>Blocage des emails envoyés automatiquement par la plateforme lors de l’affectation manuelle.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Volontaires"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.isAssignmentAnnouncementsOpenForYoung}
                      onChange={() => setData({ ...data, isAssignmentAnnouncementsOpenForYoung: !data.isAssignmentAnnouncementsOpenForYoung })}
                      range={{
                        from: data?.uselessInformation?.isAssignmentAnnouncementsOpenForYoungFrom || undefined,
                        to: data?.uselessInformation?.isAssignmentAnnouncementsOpenForYoungTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            isAssignmentAnnouncementsOpenForYoungFrom: range?.from,
                            isAssignmentAnnouncementsOpenForYoungTo: range?.to,
                          },
                        });
                      }}
                    />
                  </div>
                  {data.type !== COHORT_TYPE.CLE && (
                    <>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <p className="flex flex-1 text-xs  font-medium text-gray-900">
                            Affectation manuelle des volontaires et modification de leur affectation et de leur point de rassemblement
                          </p>
                          <MdInfoOutline data-tip data-for="affectation_manuelle" className="h-5 w-5 cursor-pointer text-gray-400" />
                          <ReactTooltip
                            id="affectation_manuelle"
                            type="light"
                            place="top"
                            effect="solid"
                            className="custom-tooltip-radius !opacity-100 !shadow-md"
                            tooltipRadius="6">
                            <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                              Ouverture ou fermeture pour les utilisateurs du droit à affecter manuellement des volontaires et/ou à modifier leur centre d’affectation ou point de
                              rassemblement.
                            </p>
                          </ReactTooltip>
                        </div>
                        <ToggleDate
                          label="Modérateurs"
                          disabled={isLoading}
                          readOnly={readOnly}
                          value={data.manualAffectionOpenForAdmin}
                          onChange={() =>
                            setData({
                              ...data,
                              manualAffectionOpenForAdmin: !data.manualAffectionOpenForAdmin,
                            })
                          }
                          range={{
                            from: data?.uselessInformation?.manualAffectionOpenForAdminFrom || undefined,
                            to: data?.uselessInformation?.manualAffectionOpenForAdminTo || undefined,
                          }}
                          onChangeRange={(range) => {
                            setData({
                              ...data,
                              uselessInformation: {
                                ...data.uselessInformation,
                                manualAffectionOpenForAdminFrom: range?.from,
                                manualAffectionOpenForAdminTo: range?.to,
                              },
                            });
                          }}
                        />
                        <ToggleDate
                          label="Référents régionaux"
                          disabled={isLoading}
                          readOnly={readOnly}
                          value={data.manualAffectionOpenForReferentRegion}
                          onChange={() =>
                            setData({
                              ...data,
                              manualAffectionOpenForReferentRegion: !data.manualAffectionOpenForReferentRegion,
                            })
                          }
                          range={{
                            from: data?.uselessInformation?.manualAffectionOpenForReferentRegionFrom || undefined,
                            to: data?.uselessInformation?.manualAffectionOpenForReferentRegionTo || undefined,
                          }}
                          onChangeRange={(range) => {
                            setData({
                              ...data,
                              uselessInformation: {
                                ...data.uselessInformation,
                                manualAffectionOpenForReferentRegionFrom: range?.from,
                                manualAffectionOpenForReferentRegionTo: range?.to,
                              },
                            });
                          }}
                        />
                        <ToggleDate
                          label="Référents départementaux"
                          disabled={isLoading}
                          readOnly={readOnly}
                          value={data.manualAffectionOpenForReferentDepartment}
                          onChange={() =>
                            setData({
                              ...data,
                              manualAffectionOpenForReferentDepartment: !data.manualAffectionOpenForReferentDepartment,
                            })
                          }
                          range={{
                            from: data?.uselessInformation?.manualAffectionOpenForReferentDepartmentFrom || undefined,
                            to: data?.uselessInformation?.manualAffectionOpenForReferentDepartmentTo || undefined,
                          }}
                          onChangeRange={(range) => {
                            setData({
                              ...data,
                              uselessInformation: {
                                ...data.uselessInformation,
                                manualAffectionOpenForReferentDepartmentFrom: range?.from,
                                manualAffectionOpenForReferentDepartmentTo: range?.to,
                              },
                            });
                          }}
                        />
                      </div>
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs  font-medium text-gray-900">Confirmation du point de rassemblement par les volontaires</p>
                          <MdInfoOutline data-tip data-for="confirmation_PDR" className="h-5 w-5 cursor-pointer text-gray-400" />
                          <ReactTooltip id="confirmation_PDR" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                            <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                              <li>Fin de la possibilité de confirmer le point de rassemblement pour le volontaire sur son compte.</li>
                              <li>
                                Fin de la possibilité pour un utilisateur de choisir l’option “Je laisse [Prénom du volontaire] choisir son point de rassemblement” dans la modale
                                de choix du point de rassemblement.
                              </li>
                              <li>Cela prend effet à 23h59 heure de Paris.</li>
                            </ul>
                          </ReactTooltip>
                        </div>
                        <DatePickerInput
                          mode="single"
                          label="Fin"
                          disabled={isLoading}
                          readOnly={readOnly}
                          value={data.pdrChoiceLimitDate}
                          onChange={(value) => setData({ ...data, pdrChoiceLimitDate: value })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex w-[10%] items-center justify-center">
                  <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex w-[45%] flex-col gap-4">
                  {/* TODO implementer parametres sur la plateforme */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Disponibilité des listes de transport par centre (envoi par email)</p>
                      <MdInfoOutline data-tip data-for="disponibilité_liste" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="disponibilité_liste" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          <li>
                            Ouverture ou fermeture de l’accès à la liste des volontaires d’un même centre par ligne de transport et par point de rassemblement envoyé par email
                            (activation/désactivation du token).
                          </li>
                          <li>Attention : si les dates sont modifiées après une première activation du token, les token activés ne seront pas mis à jour.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Tout utilisateur"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.busListAvailability}
                      onChange={() => setData({ ...data, busListAvailability: !data.busListAvailability })}
                      range={{
                        from: data?.uselessInformation?.busListAvailabilityFrom || undefined,
                        to: data?.uselessInformation?.busListAvailabilityTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            busListAvailabilityFrom: range?.from,
                            busListAvailabilityTo: range?.to,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Pointage</p>
                      <MdInfoOutline data-tip data-for="pointage" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="pointage" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de réaliser le pointage des volontaires.
                        </p>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Chefs de centre"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.youngCheckinForHeadOfCenter}
                      onChange={() => setData({ ...data, youngCheckinForHeadOfCenter: !data.youngCheckinForHeadOfCenter })}
                      range={{
                        from: data?.uselessInformation?.youngCheckinForHeadOfCenterFrom || undefined,
                        to: data?.uselessInformation?.youngCheckinForHeadOfCenterTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            youngCheckinForHeadOfCenterFrom: range?.from,
                            youngCheckinForHeadOfCenterTo: range?.to,
                          },
                        });
                      }}
                    />
                    <ToggleDate
                      label="Modérateurs"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.youngCheckinForAdmin}
                      onChange={() => setData({ ...data, youngCheckinForAdmin: !data.youngCheckinForAdmin })}
                      range={{
                        from: data?.uselessInformation?.youngCheckinForAdminFrom || undefined,
                        to: data?.uselessInformation?.youngCheckinForAdminTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            youngCheckinForAdminFrom: range?.from,
                            youngCheckinForAdminTo: range?.to,
                          },
                        });
                      }}
                    />
                    <ToggleDate
                      label="Référents régionaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.youngCheckinForRegionReferent}
                      onChange={() => setData({ ...data, youngCheckinForRegionReferent: !data.youngCheckinForRegionReferent })}
                      range={{
                        from: data?.uselessInformation?.youngCheckinForRegionReferentFrom || undefined,
                        to: data?.uselessInformation?.youngCheckinForRegionReferentTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            youngCheckinForRegionReferentFrom: range?.from,
                            youngCheckinForRegionReferentTo: range?.to,
                          },
                        });
                      }}
                    />
                    <ToggleDate
                      label="Référents départementaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.youngCheckinForDepartmentReferent}
                      onChange={() => setData({ ...data, youngCheckinForDepartmentReferent: !data.youngCheckinForDepartmentReferent })}
                      range={{
                        from: data?.uselessInformation?.youngCheckinForDepartmentReferentFrom || undefined,
                        to: data?.uselessInformation?.youngCheckinForDepartmentReferentTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        setData({
                          ...data,
                          uselessInformation: {
                            ...data.uselessInformation,
                            youngCheckinForDepartmentReferentFrom: range?.from,
                            youngCheckinForDepartmentReferentTo: range?.to,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Début de validation de la phase 1</p>
                      <MdInfoOutline data-tip data-for="validation_phase" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="validation_phase" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Par défaut 9e jour après le début du séjour.</p>
                      </ReactTooltip>
                    </div>
                    <NumberInput days={data.daysToValidate} label={"Nombre de jour pour validation"} onChange={(e) => setData({ ...data, daysToValidate: e })} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {data.type === COHORT_TYPE.CLE && (
            <CleSettings cleSettingsData={data} isLoading={isLoading} readOnly={readOnly} onChange={(cleSettingsData) => setData({ ...data, ...cleSettingsData })} />
          )}

          {!readOnly && (
            <div className="flex items-center justify-center gap-3 ">
              <ButtonPrimary disabled={isLoading || noChange} className="h-[50px] w-[300px]" onClick={onSubmit}>
                {isLoading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
                Enregistrer
              </ButtonPrimary>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
