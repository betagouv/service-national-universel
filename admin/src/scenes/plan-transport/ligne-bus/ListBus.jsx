import React from "react";
import { BsDownload } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { formatDateFR, getDepartmentNumber, translate, translatePhase1, youngPlanDeTranportExportFields } from "snu-lib";
import ExternalLink from "../../../assets/icons/ExternalLink";
import Loader from "../../../components/Loader";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { Title } from "../components/commons";

import { formatPhoneE164 } from "../../../utils/formatPhoneE164";

const contactTypes = {
  email: "Adresse e-mail",
  phone: "Téléphone",
};

export default function ListBus(props) {
  const id = props.match && props.match.params && props.match.params.id;
  if (!id) return <div />;
  const [bus, setBus] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const history = useHistory();

  const [data, setData] = React.useState([]);
  const pageId = "listYoungBus";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });

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
          Téléphone: formatPhoneE164(data.phone, data.phoneZone),
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
          "Téléphone représentant légal 1": formatPhoneE164(data.parent1Phone, data.parent1PhoneZone),
        },
        representative2: {
          "Statut représentant légal 2": translate(data.parent2Status),
          "Prénom représentant légal 2": data.parent2FirstName,
          "Nom représentant légal 2": data.parent2LastName,
          "Contact du représentant légal 2": data.parent2ContactPreference ? contactTypes[data.parent2ContactPreference] : "",
          "Email représentant légal 2": data.parent2Email,
          "Téléphone représentant légal 2": formatPhoneE164(data.parent2Phone, data.parent2PhoneZone),
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
          "ID du point de rassemblement": PDR?.code || "",
          "Nom du point de rassemblement": PDR?.name || "",
          "Adresse point de rassemblement": PDR?.address || "",
          "Ville du point de rassemblement": PDR?.city || "",
          "Département du point de rassemblement": PDR?.department || "",
          "Région du point de rassemblement": PDR?.region || "",
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

  const filterArray = [
    {
      title: "ID du PDR",
      name: "meetingPointId",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        return bus.meetingsPointsDetail.find((option) => option.meetingPointId.toString() === item)?.code;
      },
    },
    {
      title: "Nom du PDR",
      name: "meetingPointName",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        return bus.meetingsPointsDetail.find((option) => option.meetingPointId === item)?.name;
      },
    },
    {
      title: " Commune du point du PDR",
      name: "meetingPointCity",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        return bus.meetingsPointsDetail.find((option) => option.meetingPointId === item)?.city;
      },
    },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseigné",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="flex w-full flex-col px-8 pb-8 pt-4">
      <div className="flex items-center gap-4 py-8">
        <Title>Volontaires</Title>
        <div className="flex items-center gap-2 rounded-full bg-gray-200 py-1 px-2 leading-7">
          <div className="text-xs leading-5 text-gray-800">{bus.busId}</div>
          <Link to={`/ligne-de-bus/${bus._id}`} target="_blank">
            <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
        <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
          <Filters
            pageId={pageId}
            route={`/elasticsearch/young/in-bus/${String(bus?._id)}/search`}
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
          />
          <button className="text-grey-700 flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium" onClick={() => setIsExportOpen(true)}>
            <BsDownload className="text-gray-400" />
            Exporter
          </button>
          <ModalExport
            isOpen={isExportOpen}
            setIsOpen={setIsExportOpen}
            route={`/elasticsearch/young/in-bus/${String(bus?._id)}/export`}
            exportTitle={`Volontaires - ${bus.busId}`}
            transform={transformVolontaires}
            exportFields={youngPlanDeTranportExportFields}
            selectedFilters={selectedFilters}
            filters={filterArray}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center px-4">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          render={
            <div className="mt-6 mb-2 flex w-full flex-col">
              <hr />
              <div className="flex w-full items-center gap-6 py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[33%]">Volontaire</div>
                <div className="w-[33%]">Point de rassemblement</div>
                <div className="w-[33%]">Centre de destination</div>
              </div>
              {data?.map((hit) => {
                return <Line key={hit?._id} young={hit} bus={bus} />;
              })}
              <hr />
            </div>
          }
        />
      </div>
    </div>
  );
}

const Line = ({ young, bus }) => {
  //   const b = bus.find((option) => option._id.toString() === young.ligneId);
  //   const c = centers.find((option) => option._id.toString() === b?.centerId);

  const p = bus.meetingsPointsDetail.find((option) => option._id.toString() === young.meetingPointId);
  const c = bus.centerDetail;

  if (!p || !c) {
    capture("Problem with bus line");
    return null;
  }

  return (
    <>
      <hr />
      <div className="flex items-center gap-6 py-4 px-4 hover:bg-gray-50">
        <div className="flex w-[33%] flex-col gap-1">
          <Link to={`/volontaire/${young._id}`} target="_blank">
            <div className="text-base font-bold leading-6 text-gray-800">
              {young.firstName} {young.lastName}
            </div>
          </Link>
          <div className="text-sm leading-4 text-[#738297]">
            {young.department} • {young.region}
          </div>
        </div>
        <div className="flex w-[33%] flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium leading-6 text-gray-800">{p.code}</div>
            <Link to={`/point-de-rassemblement/${p._id}?cohort=${bus.cohort}`} target="_blank">
              <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
            </Link>
          </div>
          <div className="text-sm leading-4 text-[#738297]">{p.name}</div>
          <div className="text-sm font-light leading-4 text-[#738297]">
            {p.zip} {p.city}
          </div>
        </div>
        <div className="flex w-[33%] flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium leading-6 text-gray-800">{c.code2022}</div>
            <Link to={`/centre/${c._id}?cohorte=${bus.cohort}`} target="_blank">
              <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
            </Link>
          </div>
          <div className="text-sm leading-4 text-[#738297]">{c.name}</div>
          <div className="text-sm font-light leading-4 text-[#738297]">
            {c.zip} {c.city}
          </div>
        </div>
      </div>
    </>
  );
};
