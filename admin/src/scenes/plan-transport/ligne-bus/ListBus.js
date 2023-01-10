import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { ES_NO_LIMIT, formatDateFR, getFilterLabel, translate, translatePhase1, youngPlanDeTranportExportFields } from "snu-lib";
import ExternalLink from "../../../assets/icons/ExternalLink";
import Loader from "../../../components/Loader";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { Title } from "../components/commons";
import FilterSvg from "../../../assets/icons/Filter";
import DeleteFilters from "../../../components/buttons/DeleteFilters";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { DepartmentFilter, RegionFilter } from "../../../components/filters";
import ModalExport from "../../../components/modals/ModalExport";
import { BsDownload } from "react-icons/bs";
import { capture } from "../../../sentry";

const FILTERS = ["SEARCH", "PDRID", "PDRNAME", "PDRCITY", "REGION", "DEPARTMENT"];

const contactTypes = {
  email: "Adresse e-mail",
  phone: "Téléphone",
};

export default function ListPDR(props) {
  const id = props.match && props.match.params && props.match.params.id;
  const [bus, setBus] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const history = useHistory();

  const fetchData = async () => {
    try {
      if (!id) return <div />;

      const { ok: okBus, code: codeBus, data: reponseBus } = await api.get(`/ligne-de-bus/${id}`);
      if (!okBus) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la liste des volontaires", translate(codeBus));
        return history.push(`/ligne-de-bus/${id}`);
      }
      setBus(reponseBus);
      setLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la ligne de bus");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const getDefaultQuery = () => ({
    query: { bool: { filter: [{ terms: { "ligneId.keyword": [bus?._id?.toString()] } }, { terms: { "status.keyword": ["VALIDATED"] } }] } },
    sort: [{ "lastName.keyword": "asc" }],
    track_total_hits: true,
  });

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  function transformVolontaires(data, values) {
    let all = data;
    return all.map((data) => {
      let b = bus;
      let center = bus.centerDetail;
      let PDR = bus.meetingsPointsDetail.find((option) => option._id.toString() === data.meetingPointId);
      const allFields = {
        identity: {
          ID: data._id.toString(),
          Cohorte: data.cohort,
          Prénom: data.firstName,
          Nom: data.lastName,
        },
        contact: {
          Email: data.email,
          Téléphone: data.phone,
        },
        location: {
          Département: data.department,
          Académie: data.academy,
          Région: data.region,
        },
        representative1: {
          "Statut représentant légal 1": translate(data.parent1Status),
          "Prénom représentant légal 1": data.parent1FirstName,
          "Nom représentant légal 1": data.parent1LastName,
          "Contact du représentant légal 1": data.parent1ContactPreference ? contactTypes[data.parent1ContactPreference] : "",
          "Email représentant légal 1": data.parent1Email,
          "Téléphone représentant légal 1": data.parent1Phone,
        },
        representative2: {
          "Statut représentant légal 2": translate(data.parent2Status),
          "Prénom représentant légal 2": data.parent2FirstName,
          "Nom représentant légal 2": data.parent2LastName,
          "Contact du représentant légal 2": data.parent2ContactPreference ? contactTypes[data.parent2ContactPreference] : "",
          "Email représentant légal 2": data.parent2Email,
          "Téléphone représentant légal 2": data.parent2Phone,
        },
        phase1Affectation: {
          "ID centre": center?._id?.toString() || "",
          "Code centre": center?.code2022 || "",
          "Nom du centre": center?.name || "",
          "Adresse du centre": center?.address || "",
          "Ville du centre": center?.city || "",
          "Département du centre": center?.department || "",
          "Région du centre": center?.region || "",
        },
        phase1Transport: {
          "ID du transport": b?.busId || "",
          "ID du point de rassemblement": PDR.code || "",
          "Nom du point de rassemblement": PDR.name || "",
          "Adresse du point de rassemblement": PDR.address || "",
          "Ville du point de rassemblement": PDR.city || "",
          "Département du point de rassemblement": PDR.department || "",
          "Région du point de rassemblement": PDR.region || "",
          "Date et heure de départ (aller)": formatDateFR(b?.departuredDate) + " - " + PDR?.departureHour || "",
          "Date et heure d’arrivée (retour)": formatDateFR(b?.returnDate) + " - " + PDR?.returnHour || "",
        },
        status: {
          "Statut général": translate(data.status),
          "Statut Phase 1": translatePhase1(data.statusPhase1),
          "Droit à l'image": translate(data.parent1AllowImageRights),
        },
      };

      let fields = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col w-full px-8 pb-8 pt-4">
      <div className="py-8 flex items-center gap-4">
        <Title>Volontaires</Title>
        <div className="flex items-center gap-2 rounded-full bg-gray-200 py-1 px-2 leading-7">
          <div className="text-gray-800 text-xs leading-5">{bus.busId}</div>
          <Link to={`/ligne-de-bus/${bus._id}`} target="_blank">
            <ExternalLink className="text-[#9CA3AF] font-bold leading-5" />
          </Link>
        </div>
      </div>

      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div className="flex flex-col bg-white py-4 mb-8 rounded-xl">
          <div className="flex items-stretch justify-between  bg-white py-2 px-4">
            <div className="flex items-center gap-2">
              <DataSearch
                defaultQuery={getDefaultQuery}
                showIcon={false}
                componentId="SEARCH"
                dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                URLParams={true}
                autosuggest={false}
                className="datasearch-searchfield"
                innerClass={{ input: "searchbox" }}
              />
              <div
                className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
                onClick={() => setFilterVisible((e) => !e)}>
                <FilterSvg className="text-gray-400" />
                Filtres
              </div>
            </div>
            <button
              className="flex gap-2 items-center text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
              onClick={() => setIsExportOpen(true)}>
              <BsDownload className="text-gray-400" />
              Exporter
            </button>
            <ModalExport
              isOpen={isExportOpen}
              setIsOpen={setIsExportOpen}
              index="young"
              transform={transformVolontaires}
              exportFields={youngPlanDeTranportExportFields}
              filters={FILTERS}
              getExportQuery={getExportQuery}
            />
          </div>
          <div className={`flex flex-wrap items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="ID du point de rassemblement"
              componentId="PDRID"
              dataField="meetingPointId.keyword"
              react={{ and: FILTERS.filter((e) => e !== "PDRID") }}
              renderItem={(e, count) => {
                if (e === "Non renseigné") return `Non renseigné (${count})`;
                return `${bus.meetingsPointsDetail.find((option) => option.meetingPointId === e)?.code} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={true}
              showMissing
              searchPlaceholder="Rechercher..."
              missingLabel="Non renseigné"
              renderLabel={(items) => {
                if (Object.keys(items).length === 0) return "ID du point de rassemblement";
                const translated = Object.keys(items).map((item) => {
                  if (item === "Non renseigné") return item;
                  return bus.meetingsPointsDetail.find((option) => option.meetingPointId.toString() === item)?.code;
                });
                let value = translated.join(", ");
                value = "ID du point de rassemblement : " + value;
                return <div>{value}</div>;
              }}
            />
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Nom du point de rassemblement"
              componentId="PDRNAME"
              dataField="meetingPointId.keyword"
              react={{ and: FILTERS.filter((e) => e !== "PDRNAME") }}
              renderItem={(e, count) => {
                if (e === "Non renseigné") return `Non renseigné (${count})`;
                return `${bus.meetingsPointsDetail.find((option) => option.meetingPointId === e)?.name} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={true}
              showMissing
              searchPlaceholder="Rechercher..."
              missingLabel="Non renseigné"
              renderLabel={(items) => {
                if (Object.keys(items).length === 0) return "Nom du point de rassemblement";
                const translated = Object.keys(items).map((item) => {
                  if (item === "Non renseigné") return item;
                  return bus.meetingsPointsDetail.find((option) => option.meetingPointId.toString() === item)?.name;
                });
                let value = translated.join(", ");
                value = "Nom du point de rassemblement : " + value;
                return <div>{value}</div>;
              }}
            />
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Commune du point de rassemblement"
              componentId="PDRCITY"
              dataField="meetingPointId.keyword"
              react={{ and: FILTERS.filter((e) => e !== "PDRCITY") }}
              renderItem={(e, count) => {
                if (e === "Non renseigné") return `Non renseigné (${count})`;
                return `${bus.meetingsPointsDetail.find((option) => option.meetingPointId === e)?.city} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={true}
              showMissing
              searchPlaceholder="Rechercher..."
              missingLabel="Non renseigné"
              renderLabel={(items) => {
                if (Object.keys(items).length === 0) return "Commune du point de rassemblement";
                const translated = Object.keys(items).map((item) => {
                  if (item === "Non renseigné") return item;
                  return bus.meetingsPointsDetail.find((option) => option.meetingPointId.toString() === item)?.city;
                });
                let value = translated.join(", ");
                value = "Commune du point de rassemblement : " + value;
                return <div>{value}</div>;
              }}
            />
            <RegionFilter
              defaultQuery={getDefaultQuery}
              filters={FILTERS}
              renderLabel={(items) => <div>{getFilterLabel(items, "Région du volontaire", "Région du volontaire")}</div>}
            />
            <DepartmentFilter
              defaultQuery={getDefaultQuery}
              filters={FILTERS}
              renderLabel={(items) => <div>{getFilterLabel(items, "Département du volontaire", "Département du volontaire")}</div>}
            />
            <DeleteFilters />
          </div>
          <div className="reactive-result">
            <ReactiveListComponent
              pageSize={20}
              defaultQuery={getDefaultQuery}
              react={{ and: FILTERS }}
              paginationAt="bottom"
              showTopResultStats={false}
              render={({ data }) => (
                <div className="flex w-full flex-col mt-6 mb-2">
                  <hr />
                  <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 w-full gap-6">
                    <div className="w-[33%]">Volontaire</div>
                    <div className="w-[33%]">Point de rassemblement</div>
                    <div className="w-[33%]">Centre de destination</div>
                  </div>
                  {data?.map((hit) => {
                    return <Line key={hit._id} young={hit} bus={bus} />;
                  })}
                  <hr />
                </div>
              )}
            />
          </div>
        </div>
      </ReactiveBase>
    </div>
  );
}

const Line = ({ young, bus }) => {
  //   const b = bus.find((option) => option._id.toString() === young.ligneId);
  //   const c = centers.find((option) => option._id.toString() === b?.centerId);

  const p = bus.meetingsPointsDetail.find((option) => option._id.toString() === young.meetingPointId);
  const c = bus.centerDetail;

  return (
    <>
      <hr />
      <div className="flex py-4 items-center px-4 hover:bg-gray-50 gap-6">
        <div className="w-[33%] flex flex-col gap-1">
          <div className="text-base font-bold leading-6 text-gray-800">
            {young.firstName} {young.lastName}
          </div>
          <div className="text-sm leading-4 text-[#738297]">
            {young.department} • {young.region}
          </div>
        </div>
        <div className="w-[33%] flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium leading-6 text-gray-800">{p.code}</div>
            <Link to={`/point-de-rassemblement/${p._id}?cohort=${bus.cohort}`} target="_blank">
              <ExternalLink className="text-[#9CA3AF] font-bold leading-5" />
            </Link>
          </div>
          <div className="text-sm leading-4 text-[#738297]">{p.name}</div>
          <div className="text-sm leading-4 text-[#738297] font-light">
            {p.zip} {p.city}
          </div>
        </div>
        <div className="w-[33%] flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium leading-6 text-gray-800">{c.code2022}</div>
            <Link to={`/centre/${c._id}?cohorte=${bus.cohort}`} target="_blank">
              <ExternalLink className="text-[#9CA3AF] font-bold leading-5" />
            </Link>
          </div>
          <div className="text-sm leading-4 text-[#738297]">{c.name}</div>
          <div className="text-sm leading-4 text-[#738297] font-light">
            {c.zip} {c.city}
          </div>
        </div>
      </div>
    </>
  );
};
