import React, { useEffect, useMemo, useState } from "react";

import { HiChevronDown, HiChevronRight, HiChevronUp } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { COHORTS, REFERENT_ROLES, ROLES, academyList, departmentToAcademy, region2department, regionList, translate } from "snu-lib";
import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";
import { capture } from "../../../../../sentry";
import api from "../../../../../services/api";
import { getLink as getOldLink } from "../../../../../utils";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import KeyNumbers from "../../../components/KeyNumbers";
import { getDepartmentOptions, getFilteredDepartment } from "../../../components/common";
import HorizontalBar from "../../../components/graphs/HorizontalBar";
import InfoMessage from "../../../components/ui/InfoMessage";
import Engagement from "../../../components/ui/icons/Engagement";
import Inscription from "../../../components/ui/icons/Inscription";
import Sejour from "../../../components/ui/icons/Sejour";
import VolontaireSection from "./components/VolontaireSection";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);

  const [inscriptionGoals, setInscriptionGoals] = useState();
  const [volontairesData, setVolontairesData] = useState();
  const [inAndOutCohort, setInAndOutCohort] = useState();

  const [stats, setStats] = useState({});
  const [message, setMessage] = useState([]);

  const [cohortsNotFinished, setCohortsNotFinished] = useState([]);

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const regionOptions = user.role === ROLES.REFERENT_REGION ? [{ key: user.region, label: user.region }] : regionList.map((r) => ({ key: r, label: r }));
  const academyOptions =
    user.role === ROLES.REFERENT_REGION
      ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a, label: a }))
      : academyList.map((a) => ({ key: a, label: a }));

  const filterArray = [
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          id: "region",
          name: "Région",
          fullValue: "Toutes",
          options: regionOptions,
        }
      : null,
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          id: "academy",
          name: "Académie",
          fullValue: "Toutes",
          options: academyOptions,
        }
      : null,
    {
      id: "department",
      name: "Département",
      fullValue: "Tous",
      options: departmentOptions,
    },
    {
      id: "cohort",
      name: "Cohorte",
      fullValue: "Toutes",
      options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
      sort: (e) => orderCohort(e),
    },
  ].filter((e) => e);

  const [selectedFilters, setSelectedFilters] = React.useState({
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"],
  });

  async function fetchInscriptionGoals() {
    const res = await getInscriptionGoals();
    setInscriptionGoals(res);
  }
  async function fetchCurrentInscriptions() {
    const res = await getCurrentInscriptions(selectedFilters);
    setVolontairesData(res);
  }
  async function fetchInOutCohort() {
    const res = await getInAndOutCohort(selectedFilters);
    setInAndOutCohort(res);
  }

  useEffect(() => {
    fetchInscriptionGoals();
    fetchInOutCohort();
  }, []);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) getDepartmentOptions(user, setDepartmentOptions);
    else getFilteredDepartment(setSelectedFilters, selectedFilters, setDepartmentOptions, user);
    fetchCurrentInscriptions();
    fetchInOutCohort();
  }, [JSON.stringify(selectedFilters)]);

  const goal = useMemo(
    () =>
      inscriptionGoals &&
      inscriptionGoals
        .filter((e) => filterByRegionAndDepartement(e, selectedFilters, user))
        // if selectedFilters.cohort is empty --> we select all cohorts thus no .filter()
        .filter((e) => !selectedFilters?.cohort?.length || selectedFilters.cohort.includes(e.cohort))
        .reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals, selectedFilters.cohort, selectedFilters.department, selectedFilters.region, selectedFilters.academy],
  );

  React.useEffect(() => {
    const updateStats = async (id) => {
      const response = await api.post("/elasticsearch/dashboard/general/todo", { filters: { meetingPointIds: [id], cohort: [] } });
      const s = response.data;
      setStats(s);
    };
    updateStats();
  }, []);

  const getMessage = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/alerte-message`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
      }
      setMessage(response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des messages");
    }
  };

  const getCohorts = async () => {
    try {
      const { ok, code, data: cohorts } = await api.get(`/cohort`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des cohortes", translate(code));
      setCohortsNotFinished(cohorts.filter((c) => new Date(c.dateEnd) > Date.now()).map((e) => e.name));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des cohortes");
    }
  };

  React.useEffect(() => {
    getMessage();
    getCohorts();
  }, []);

  return (
    <DashboardContainer active="general" availableTab={["general", "engagement", "sejour", "inscription"]}>
      <div className="flex flex-col gap-8 mb-4">
        {message?.length ? message.map((hit) => <InfoMessage key={hit._id} data={hit} />) : null}
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
        <div className="flex w-full gap-4">
          <Actus stats={stats} user={user} cohortsNotFinished={cohortsNotFinished} />
          <KeyNumbers />
        </div>
        <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Inscriptions</h1>
        <div className="rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <HorizontalBar
            title="Objectif des inscriptions"
            labels={["Sur liste principale", "Sur liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
            values={[
              volontairesData?.VALIDATED?.total || 0,
              volontairesData?.WAITING_LIST?.total || 0,
              volontairesData?.WAITING_VALIDATION?.total || 0,
              volontairesData?.WAITING_CORRECTION?.total || 0,
              volontairesData?.IN_PROGRESS?.total || 0,
            ]}
            goal={goal}
            showTooltips={true}
            legendUrls={[
              getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"VALIDATED"%5D'] }),
              getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_LIST"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_VALIDATION"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_CORRECTION"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"IN_PROGRESS"%5D'] }),
            ]}
          />
        </div>
        <VolontaireSection volontairesData={volontairesData} inAndOutCohort={inAndOutCohort} filter={selectedFilters} />
      </div>
    </DashboardContainer>
  );
}

const NoteContainer = ({ title, number, content, btnLabel, link }) => {
  return (
    <div className="flex h-36 w-full flex-col justify-between rounded-lg bg-blue-50 py-3.5 px-3">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5 text-gray-900">{title}</span>
        <p className="text-xs font-normal leading-4 text-gray-900">
          <span className="font-bold text-blue-600">{Number(number) >= 1000 ? "1000+" : number} </span>
          {content}
        </p>
      </div>
      {link && (
        <div className="flex justify-end">
          <Link className="flex items-center gap-2 rounded-full bg-blue-600 py-1 pr-2 pl-3 text-xs font-medium text-white" to={link}>
            <span>{btnLabel}</span>
            <HiChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

function Actus({ stats, user, cohortsNotFinished }) {
  const [fullNote, setFullNote] = useState(false);

  function shouldShow(parent, key, index = null) {
    true;
    if (fullNote) return true;

    const entries = Object.entries(parent);
    for (let i = 0, limit = 0; i < entries.length && limit < 3; i++) {
      if (Array.isArray(entries[i][1])) {
        for (let j = 0; j < entries[i][1].length && limit < 3; j++) {
          if (entries[i][0] === key && index === j) return true;
          limit++;
        }
      } else {
        if (entries[i][0] === key) return true;
        limit++;
      }
    }
    return false;
  }

  function total(parent) {
    const entries = Object.entries(parent);
    let limit = 0;
    for (let i = 0; i < entries.length; i++) {
      if (Array.isArray(entries[i][1])) {
        for (let j = 0; j < entries[i][1].length; j++) limit++;
      } else limit++;
    }
    return limit;
  }

  if (!stats.inscription)
    return (
      <div className={`flex w-[70%] flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] h-[584px]"}`}>
        <div className="text-slate-300 py-8 m-auto text-center animate-pulse text-xl">Chargement des actualités</div>
      </div>
    );

  return (
    <div className={`flex w-[70%] flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!fullNote ? "h-[584px]" : "h-fit"}`}>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Inscription />
            <div className="text-sm font-bold leading-5 text-gray-900">Inscriptions</div>
            <div className="rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">{total(stats.inscription)}</div>
          </div>
          {shouldShow(stats.inscription, "inscription_en_attente_de_validation") && (
            <NoteContainer
              title="Dossier"
              number={stats.inscription.inscription_en_attente_de_validation}
              content="dossiers d'inscription sont en attente de validation."
              link={`/inscription?status=WAITING_VALIDATION&cohort=${cohortsNotFinished.join("~")}`}
              btnLabel="À instruire"
            />
          )}
          {shouldShow(stats.inscription, "inscription_corrigé_à_instruire_de_nouveau") && (
            <NoteContainer
              title="Dossier"
              number={stats.inscription.inscription_corrigé_à_instruire_de_nouveau}
              content="dossiers d'inscription corrigés sont à instruire de nouveau."
              link={`/inscription?status=WAITING_VALIDATION&cohort=${cohortsNotFinished.join("~")}`}
              btnLabel="À instruire"
            />
          )}
          {shouldShow(stats.inscription, "inscription_en_attente_de_correction") && (
            <NoteContainer
              title="Dossier"
              number={stats.inscription.inscription_en_attente_de_correction}
              content="dossiers d'inscription en attente de correction."
              link={`/inscription?status=WAITING_CORRECTION&cohort=${cohortsNotFinished.join("~")}`}
              btnLabel="À relancer"
            />
          )}
          {stats.inscription.inscription_en_attente_de_validation_cohorte.map(
            (item, key) =>
              shouldShow(stats.inscription, "inscription_en_attente_de_validation_cohorte", key) && (
                <NoteContainer
                  key={"inscription_en_attente_de_validation_cohorte" + item.cohort}
                  title="Dossier"
                  number={item.count}
                  content={`dossiers d'inscription en attente de validation pour le séjour de ${item.cohort}`}
                  link={`/inscription?cohort=${item.cohort}&status=WAITING_VALIDATION`}
                  btnLabel="À relancer"
                />
              ),
          )}
          {/* {stats.inscription.inscription_sans_accord_renseigné.map(
            (item, key) =>
              shouldShow(stats.inscription, "inscription_sans_accord_renseigné", key) && (
                <NoteContainer
                  key={"inscription_sans_accord_renseigné" + item.cohort}
                  title=""
                  number={item.count}
                  content={`volontaires sans accord renseigné pour le séjour de ${item.cohort}`}
                  link={`volontaire?status=VALIDATED~WAITING_LIST&cohort=${item.cohort}&parentAllowSNU=N/A`}
                  btnLabel="À relancer"
                />
              ),
          )} */}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Sejour />
            <div className="text-sm font-bold leading-5 text-gray-900">Séjours</div>
            <div className=" rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">{total(stats.sejour)}</div>
          </div>
          {stats.sejour.sejour_rassemblement_non_confirmé.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_rassemblement_non_confirmé", key) && (
                <NoteContainer
                  title="Point de rassemblement"
                  key={"sejour_rassemblement_non_confirmé" + item.cohort}
                  number={item.count}
                  content={`volontaires n'ont pas confirmé leur point de rassemblement pour le séjour de ${item.cohort}`}
                  link={`/volontaire?status=VALIDATED&hasMeetingInformation=false~N/A&statusPhase1=AFFECTED&cohort=${item.cohort}`}
                  btnLabel="À déclarer"
                />
              ),
          )}
          {stats.sejour.sejour_participation_non_confirmée.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_participation_non_confirmée", key) && (
                <NoteContainer
                  title="Point de rassemblement"
                  key={"sejour_participation_non_confirmée" + item.cohort}
                  number={item.count}
                  content={`volontaires n'ont pas confirmé leur participation pour le séjour de ${item.cohort}`}
                  link={`/volontaire?status=VALIDATED&youngPhase1Agreement=false~N/A&statusPhase1=AFFECTED&cohort=${item.cohort}`}
                  btnLabel="À déclarer"
                />
              ),
          )}
          {stats.sejour.sejour_point_de_rassemblement_à_déclarer.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_point_de_rassemblement_à_déclarer", key) && (
                <NoteContainer
                  title="Point de rassemblement"
                  key={"sejour_point_de_rassemblement_à_déclarer" + item.cohort + item.department}
                  number=""
                  content={`Au moins 1 point de rassemblement est à déclarer pour le séjour de ${item.cohort} (${item.department})`}
                  link={`/point-de-rassemblement/liste/liste-points?cohort=${item.cohort}&department=${item.department}`}
                  btnLabel="À déclarer"
                />
              ),
          )}
          {stats.sejour.sejour_emploi_du_temps_non_déposé.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_emploi_du_temps_non_déposé", key) && (
                <NoteContainer
                  title="Emploi du temps"
                  key={"sejour_emploi_du_temps_non_déposé" + item.cohort}
                  number={item.count}
                  content={`emplois du temps n'ont pas été déposés. ${item.cohort}`}
                  link={`/centre/liste/session?hasTimeSchedule=false&cohort=${item.cohort}`}
                  btnLabel="À relancer"
                />
              ),
          )}
          {stats.sejour.sejour_contact_à_renseigner.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_contact_à_renseigner", key) && (
                <NoteContainer
                  title="Contact"
                  key={"sejour_contact_à_renseigner" + item.cohort + item.department}
                  number=""
                  content={`Au moins 1 contact de convocation doit être renseigné pour le séjour de ${item.cohort} (${item.department})`}
                  link={user.role === ROLES.REFERENT_DEPARTMENT ? `/team` : null}
                  btnLabel="À renseigner"
                />
              ),
          )}
          {stats.sejour.sejour_volontaires_à_contacter.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_volontaires_à_contacter", key) && (
                <NoteContainer
                  title="Cas particuliers"
                  key={"sejour_volontaires_à_contacter" + item.cohort}
                  number={item.count}
                  content={`volontaires à contacter pour préparer leur accueil pour le séjour de ${item.cohort}`}
                  link={null}
                  btnLabel="À contacter"
                />
              ),
          )}
          {stats.sejour.sejour_chef_de_centre.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_chef_de_centre", key) && (
                <NoteContainer
                  title="Chef de centre"
                  key={"sejour_chef_de_centre" + item.cohort}
                  number={item.count}
                  content={`chefs de centre sont à renseigner pour le séjour de  ${item.cohort}`}
                  link={`centre/liste/session?headCenterExist=Non&cohort=${item.cohort}`}
                  btnLabel="À renseigner"
                />
              ),
          )}
          {stats.sejour.sejour_centre_à_déclarer.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_centre_à_déclarer", key) && (
                <NoteContainer
                  title="Centre"
                  key={"sejour_centre_à_déclarer" + item.cohort + item.department}
                  number=""
                  content={`Au moins 1 centre est en attente de déclaration pour le séjour de ${item.cohort} (${item.department})`}
                  link={`/centre/liste/session?cohort=${item.cohort}&department=${item.department}`}
                  btnLabel="À déclarer"
                />
              ),
          )}
          {stats.sejour.sejourPointage.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejourPointage", key) && (
                <NoteContainer
                  title="Pointage"
                  key={"sejourPointage" + item.cohort}
                  number={item.count}
                  content={`centres n'ont pas pointés tous leurs volontaires à l'arrivée au séjour de ${item.cohort}`}
                  link={null}
                  btnLabel="À renseigner"
                />
              ),
          )}
          {/* ON A PLUS LA JDM DE MEMOIRE */}
          {/* {stats.sejour.sejour_pointage_jdm.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_pointage_jdm", key) && (
                <NoteContainer
                  title="Pointage"
                  key={"sejour_pointage_jdm" + item.cohort}
                  number={item.count}
                  content={`centres n'ont pas pointés tous leurs volontaires à la JDM sur le séjour de ${item.cohort}`}
                  link={null}
                  btnLabel="À renseigner"
                />
              ),
          )} */}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Engagement />
            <div className="text-sm font-bold leading-5 text-gray-900">Engagement</div>
            <div className="rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">{total(stats.engagement)}</div>
          </div>
          {shouldShow(stats.engagement, "engagement_contrat_à_éditer") && (
            <NoteContainer
              title="Contrat"
              number={stats.engagement.engagement_contrat_à_éditer}
              content="contrats d'engagement sont à éditer par la structure d'accueil et à envoyer en signature."
              btnLabel="À suivre"
              link={`/volontaire?status=VALIDATED&statusPhase2=IN_PROGRESS~WAITING_REALISATION&phase2ApplicationStatus=VALIDATED~IN_PROGRESS&statusPhase2Contract=DRAFT`}
            />
          )}
          {shouldShow(stats.engagement, "engagement_contrat_en_attente_de_signature") && (
            <NoteContainer
              title="Contrat"
              number={stats.engagement.engagement_contrat_en_attente_de_signature}
              content="contrats d'engagement sont en attente de signature."
              btnLabel="À suivre"
              link={`/volontaire?status=VALIDATED&statusPhase2=IN_PROGRESS~WAITING_REALISATION&phase2ApplicationStatus=VALIDATED~IN_PROGRESS&statusPhase2Contract=SENT`}
            />
          )}
          {shouldShow(stats.engagement, "engagement_dossier_militaire_en_attente_de_validation") && (
            <NoteContainer
              title="Dossier d’éligibilité"
              number={stats.engagement.engagement_dossier_militaire_en_attente_de_validation}
              content="dossiers d'éligibilité en préparation militaire sont en attente de vérification."
              btnLabel="À vérifier"
              link={`/volontaire?status=VALIDATED&statusMilitaryPreparationFiles=WAITING_VERIFICATION`}
            />
          )}
          {shouldShow(stats.engagement, "engagement_mission_en_attente_de_validation") && (
            <NoteContainer
              title="Mission"
              number={stats.engagement.engagement_mission_en_attente_de_validation}
              content="missions sont en attente de validation."
              btnLabel="À instruire"
              link={`/mission?status=WAITING_VALIDATION`}
            />
          )}
          {shouldShow(stats.engagement, "engagement_phase3_en_attente_de_validation") && (
            <NoteContainer
              title="Phase 3"
              number={stats.engagement.engagement_phase3_en_attente_de_validation}
              content="demandes de validation de phase 3 à suivre."
              btnLabel="À suivre"
              link={`/volontaire?status=VALIDATED&statusPhase3=WAITING_VALIDATION`}
            />
          )}
          {/* {shouldShow(stats.engagement, "volontaires_à_suivre_sans_contrat") && (
            <NoteContainer
              title="Volontaires"
              number={stats.engagement.volontaires_à_suivre_sans_contrat}
              content="volontaires ayant commencé leur mission sans contrat signé"
              btnLabel="À suivre"
            />
          )}
          {shouldShow(stats.engagement, "volontaires_à_suivre_sans_statut") && (
            <NoteContainer
              title="Volontaires"
              number={stats.engagement.volontaires_à_suivre_sans_statut}
              content="volontaires ayant commencé leur mission sans statut à jour"
              btnLabel="À suivre"
            />
          )}
          {shouldShow(stats.engagement, "volontaires_à_suivre_achevé_sans_statut") && (
            <NoteContainer
              title="Volontaires"
              number={stats.engagement.volontaires_à_suivre_achevé_sans_statut}
              content="volontaires ayant achevé leur mission sans statut à jour"
              btnLabel="À suivre"
            />
          )} */}
        </div>
      </div>
      <div className="flex justify-center">
        <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setFullNote(!fullNote)}>
          <span>{fullNote ? "Voir moins" : "Voir plus"}</span>
          {fullNote ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function filterByRegionAndDepartement(e, filters, user) {
  if (filters?.department?.length) return filters.department.includes(e.department);
  else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
  if (filters?.region?.length) return filters.region.includes(e.region);
  if (filters?.academy?.length) return filters.academy.includes(e.academy);
  return true;
}

const getInscriptionGoals = async () => {
  let dataMerged = [];
  const responses = await api.post("/elasticsearch/dashboard/inscription/inscriptionGoal");
  if (!responses?.hits?.hits) {
    toastr.error("Une erreur est survenue");
    return [];
  }
  const result = responses.hits.hits;
  result.map((e) => {
    const { department, region, academy, cohort, max } = e._source;
    dataMerged[department] = { cohort, department, region, academy, max: (dataMerged[department]?.max ? dataMerged[department].max : 0) + max };
  });

  return result.map((e) => e._source);
};

async function getCurrentInscriptions(filters) {
  const responses = await api.post("/elasticsearch/dashboard/inscription/youngForInscription", { filters: filters });
  if (!responses?.aggregations?.status?.buckets) return {};
  let result = responses.aggregations.status.buckets.reduce((acc, status) => {
    acc[status.key] = {
      total: status.doc_count,
      phase1: status.statusPhase1.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {}),
      phase2: status.statusPhase2.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {}),
      phase3: status.statusPhase3.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {}),
    };
    return acc;
  }, {});
  return result;
}

async function getInAndOutCohort(filters) {
  const responses = await api.post("/elasticsearch/dashboard/inscription/getInAndOutCohort", { filters: filters });
  if (!responses?.aggregations) return {};
  const aggreg = responses.aggregations;
  let result = Object.keys(aggreg).reduce((acc, cohort) => {
    const type = cohort.split("&")[0];
    acc[type] = acc[type] ? acc[type] + aggreg[cohort].doc_count : aggreg[cohort].doc_count;
    return acc;
  }, {});

  return result;
}
