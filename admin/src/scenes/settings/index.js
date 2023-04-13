import React from "react";
import { MdInfoOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { isSuperAdmin, ROLES } from "snu-lib";
import logo from "../../assets/logo-snu.png";
import Breadcrumbs from "../../components/Breadcrumbs";
import ButtonPrimary from "../../components/ui/buttons/ButtonPrimary";
import { capture } from "../../sentry";
import api from "../../services/api";
import DatePickerInput from "./components/DatePickerInput";
import InputText from "../../components/ui/forms/InputText";
import InputTextarea from "../../components/ui/forms/InputTextarea";
import Select from "../../components/forms/Select";
import SimpleToggle from "./components/SimpleToggle";
import ToggleDate from "./components/ToggleDate";
import { BiLoaderAlt } from "react-icons/bi";
import { settings, uselessSettings } from "./utils";

const cohortList = [
  { label: "Février 2023 - C", value: "Février 2023 - C" },
  { label: "Avril 2023 - A", value: "Avril 2023 - A" },
  { label: "Avril 2023 - B", value: "Avril 2023 - B" },
  { label: "Juin 2023", value: "Juin 2023" },
  { label: "Juillet 2023", value: "Juillet 2023" },
];

export default function Settings() {
  const { user } = useSelector((state) => state.Auth);
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || "Février 2023 - C");
  const [isLoading, setIsLoading] = React.useState(true);
  const readOnly = isSuperAdmin(user) ? false : true;
  const [noChange, setNoChange] = React.useState(true);
  const history = useHistory();
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState({
    ...settings,
    ...uselessSettings,
  });

  const getCohort = async () => {
    try {
      const { ok, data: reponseCohort } = await await api.get("/cohort/" + cohort);
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

  React.useEffect(() => {
    setIsLoading(true);
    getCohort();
  }, [cohort]);

  React.useEffect(() => {
    if (!mounted) return;
    setNoChange(false);
  }, [data]);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      delete data.name;
      delete data.snuId;
      const { ok, code } = await api.put(`/cohort/${cohort}`, data);
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
      <div className="flex flex-col h-100 items-center justify-center m-6">
        <img src={logo} alt="logo" className="w-56 pb-8" />
        <div className="text-3xl text-center pb-4">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
        <div className="text-center text-lg mt-4 text-gray-500">
          Besoin d&apos;aide ?{" "}
          <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="hover:underline scale-105 cursor-pointer">
            Cliquez ici
          </a>
        </div>
      </div>
    );

  return (
    <>
      <Breadcrumbs items={[{ label: "Paramétrage dynamique" }]} />
      <div className="flex flex-col w-full px-8 pb-8">
        <div className="py-8 flex items-center justify-between">
          <div className="text-2xl leading-7 font-bold text-gray-900">Paramétrage dynamique</div>
          <div className="flex items-center w-[258px]">
            <Select
              label="Cohorte"
              options={cohortList}
              selected={cohortList.find((e) => e.value === cohort)}
              setSelected={(e) => {
                setCohort(e.value);
                history.replace({ search: `?cohort=${e.value}` });
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-8 w-full">
          {/* Informations générales */}
          <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex flex-col w-full gap-8">
              <p className="text-gray-900 leading-5 text-lg font-medium">Informations générales</p>
              <div className="flex">
                <div className="flex flex-col w-[45%] gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Identification</p>
                      <MdInfoOutline data-tip data-for="identification" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="identification" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                      <p className="text-gray-900  text-xs font-medium">Dates du séjour</p>
                      <MdInfoOutline data-tip data-for="dates_du_séjour" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="dates_du_séjour" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">Précision de la date de départ en séjour et de celle de retour.</p>
                      </ReactTooltip>
                    </div>
                    <div className="flex gap-4 w-full">
                      <DatePickerInput
                        mode="single"
                        label="Début"
                        value={data.dateStart}
                        onChange={(e) => setData({ ...data, dateStart: e })}
                        readOnly={readOnly}
                        disabled={isLoading}
                      />
                      <DatePickerInput mode="single" label="Fin" value={data.dateEnd} onChange={(e) => setData({ ...data, dateEnd: e })} readOnly={readOnly} disabled={isLoading} />
                    </div>
                  </div>
                </div>
                <div className="flex w-[10%] justify-center items-center">
                  <div className="w-[1px] h-[90%] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex flex-col w-[45%] gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Toolkit d’aide</p>
                      <MdInfoOutline data-tip data-for="toolkit" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="toolkit" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">Liens vers un articles d&apos;aide pour suivre la cohorte.</p>
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
                      <p className="text-gray-900  text-xs font-medium">Zones concernées</p>
                      <MdInfoOutline data-tip data-for="zones_concernées" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="zones_concernées" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                      <p className="text-gray-900  text-xs font-medium">Éligibilité</p>
                      <MdInfoOutline data-tip data-for="eligibilité" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="eligibilité" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
          {/* <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
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
                    <DatePickerInput mode="single" label="Ouverture" disabled={isLoading} readOnly={readOnly} />
                    <DatePickerInput mode="range" label="Fermeture" disabled={isLoading} readOnly={readOnly} />
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
                      <DatePickerInput mode="single" label="Fermeture" disabled={isLoading} readOnly={readOnly} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Instruction</p>
                      <MdInfoOutline data-tip data-for="instruction" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="instruction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          <li>Ouverture et fermeture de la proposition du séjour sur le formulaire d’inscription.</li>
                          <li>Blocage de l’accès au dossier des dossiers d’inscription “en cours”.</li>
                        </ul>
                      </ReactTooltip>
                    </div>
                    <div className="flex gap-4 w-full">
                      <DatePickerInput mode="single" label="Fermeture" disabled={isLoading} readOnly={readOnly} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* TODO implementer parametres sur la plateforme */}
          {/* Préparation des affectations et des transports (phase 1) */}
          <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex flex-col w-full gap-8">
              <p className="text-gray-900 leading-5 text-lg font-medium">Préparation des affectations et des transports (phase 1)</p>
              <div className="flex">
                <div className="flex flex-col w-[45%] gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Remplissage des centres </p>
                      <MdInfoOutline data-tip data-for="remplissage_centres" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="remplissage_centres" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Remplissage des points de rassemblement</p>
                      <MdInfoOutline data-tip data-for="remplissage_PDR" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="remplissage_PDR" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          Ouverture ou fermerture pour les utilisateurs de la possibilité de déclarer un point de rassemblement sur le séjour.
                        </p>
                      </ReactTooltip>
                    </div>
                    <SimpleToggle
                      label="Référents régionaux"
                      disabled={isLoading || readOnly}
                      value={data.manualAffectionOpenForAdmin}
                      onChange={() => setData({ ...data, manualAffectionOpenForAdmin: !data.manualAffectionOpenForAdmin })}
                    />
                    <SimpleToggle
                      label="Référents départementaux"
                      disabled={isLoading || readOnly}
                      value={data.manualAffectionOpenForAdmin}
                      onChange={() => setData({ ...data, manualAffectionOpenForAdmin: !data.manualAffectionOpenForAdmin })}
                    /> */}
                  </div>
                </div>
                <div className="flex w-[10%] justify-center items-center">
                  <div className="w-[1px] h-[90%] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex flex-col w-[45%] gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Création de groupe et modification du schéma de répartition</p>
                      <MdInfoOutline data-tip data-for="création_groupe" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="création_groupe" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                      <p className="text-gray-900  text-xs font-medium">Téléchargement du schéma de répartition</p>
                      <MdInfoOutline data-tip data-for="téléchargement_schema" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="téléchargement_schema" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de télécharger le schéma de répartition.
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
                    {/* <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Demande de correction sur le plan de transport</p>
                      <MdInfoOutline data-tip data-for="demande_correction" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="demande_correction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de demander une correction sur le plan de transport.
                        </p>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Référents régionaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.manualAffectionOpenForAdmin}
                      onChange={() => setData({ ...data, manualAffectionOpenForAdmin: !data.manualAffectionOpenForAdmin })}
                    /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Affectation et pointage (phase 1) */}
          <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex flex-col w-full gap-8">
              <p className="text-gray-900 leading-5 text-lg font-medium">Affectation et pointage (phase 1)</p>
              <div className="flex">
                <div className="flex flex-col w-[45%] gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Annonce et visibilité des affectations par les volontaires</p>
                      <MdInfoOutline data-tip data-for="annonce_affectation" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="annonce_affectation" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="flex flex-1 text-gray-900  text-xs font-medium">
                        Affectation manuelle des volontaires et modification de leur affectation et de leur point de rassemblement
                      </p>
                      <MdInfoOutline data-tip data-for="affectation_manuelle" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="affectation_manuelle" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                      onChange={() => setData({ ...data, manualAffectionOpenForAdmin: !data.manualAffectionOpenForAdmin })}
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
                      onChange={() => setData({ ...data, manualAffectionOpenForReferentRegion: !data.manualAffectionOpenForReferentRegion })}
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
                      onChange={() => setData({ ...data, manualAffectionOpenForReferentDepartment: !data.manualAffectionOpenForReferentDepartment })}
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
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Confirmation du point de rassemblement par les volontaires</p>
                      <MdInfoOutline data-tip data-for="confirmation_PDR" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="confirmation_PDR" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                          <li>Fin de la possibilité de confirmer le point de rassemblement pour le volontaire sur son compte.</li>
                          <li>
                            Fin de la possibilité pour un utilisateur de choisir l’option “Je laisse [Prénom du volontaire] choisir son point de rassemblement” dans la modale de
                            choix du point de rassemblement.
                          </li>
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
                </div>
                <div className="flex w-[10%] justify-center items-center">
                  <div className="w-[1px] h-[90%] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex flex-col w-[45%] gap-4">
                  {/* TODO implementer parametres sur la plateforme */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900  text-xs font-medium">Disponibilité des listes de transport par centre (envoi par email)</p>
                      <MdInfoOutline data-tip data-for="disponibilité_liste" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="disponibilité_liste" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                      <p className="text-gray-900  text-xs font-medium">Pointage</p>
                      <MdInfoOutline data-tip data-for="pointage" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="pointage" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
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
                      <p className="text-gray-900  text-xs font-medium">Début de validation de la phase 1</p>
                      <MdInfoOutline data-tip data-for="validation_phase" className="text-gray-400 h-5 w-5 cursor-pointer" />
                      <ReactTooltip id="validation_phase" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className="text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">Par défaut 9e jour après le début du séjour.</p>
                      </ReactTooltip>
                    </div>
                    <DatePickerInput
                      mode="single"
                      label="Volontaires (non Terminales)"
                      value={data.validationDate}
                      disabled={isLoading}
                      readOnly={readOnly}
                      onChange={(e) => setData({ ...data, validationDate: e })}
                    />
                    <DatePickerInput
                      mode="single"
                      label="Volontaires (Terminales)"
                      disabled={isLoading}
                      readOnly={readOnly}
                      value={data.validationDateForTerminaleGrade}
                      onChange={(e) => setData({ ...data, validationDateForTerminaleGrade: e })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center justify-center gap-3 ">
              <ButtonPrimary disabled={isLoading || noChange} className="w-[300px] h-[50px]" onClick={onSubmit}>
                {isLoading && <BiLoaderAlt className="animate-spin h-4 w-4" />}
                Enregistrer
              </ButtonPrimary>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
