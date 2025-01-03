import React, { useState } from "react";
import { BsDownload } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { Link, RouteComponentProps, useHistory } from "react-router-dom";
import {
  CohesionCenterType,
  formatDateFR,
  getDepartmentNumber,
  LigneBusType,
  LigneToPointType,
  PointDeRassemblementType,
  translate,
  translatePhase1,
  youngPlanDeTranportExportFields,
} from "snu-lib";
import ExternalLink from "../../../assets/icons/ExternalLink";
import Loader from "../../../components/Loader";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { formatPhoneE164 } from "../../../utils/formatPhoneE164";
import { Title } from "../components/commons";
import { Filter } from "@/components/filters-system-v2/components/Filters";

const contactTypes = {
  email: "Adresse e-mail",
  phone: "Téléphone",
};

const pageId = "listYoungPDR";

export default function ListPDR(props: RouteComponentProps<{ id: string }>) {
  const history = useHistory();

  const [bus, setBus] = React.useState<LigneBusType[]>();
  const [PDRDetails, setPDRDetails] = React.useState<LigneToPointType[]>([]);
  const [centers, setCenters] = React.useState<CohesionCenterType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  const [data, setData] = React.useState<LigneBusType[]>([]);
  const [selectedFilters, setSelectedFilters] = React.useState<{ [key: string]: Filter }>({});
  const [paramData, setParamData] = React.useState({ page: 0 });
  const [size, setSize] = useState(10);
  const [PDR, setPDR] = React.useState<PointDeRassemblementType>();

  const cohort = new URLSearchParams(props.location.search).get("cohort");

  const id = props.match?.params?.id;

  const fetchData = async () => {
    try {
      if (!id || !cohort) return;

      const { ok, code, data } = await api.get(`/point-de-rassemblement/${id}/bus/${cohort}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la liste des volontaires", translate(code));
        return history.push(`/point-de-rassemblement/${id}`);
      }

      const centerIds: string[] = [];
      for await (const b of data.bus as LigneBusType[]) {
        if (!b.centerId && centerIds.includes(b.centerId)) continue;
        centerIds.push(b.centerId);
        const { ok, code, data } = await api.get(`/cohesion-center/${b.centerId}`);
        if (!ok) {
          toastr.error("Oups, une erreur est survenue lors de la récupération de la liste des centres de destinations", translate(code));
          return history.push(`/point-de-rassemblement/${id}`);
        }
        setCenters((centers) => [...centers, data]);
      }

      setPDR(data.meetingPoint);
      setBus(data.bus);
      setPDRDetails(data.meetingPointsDetail);
      setLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", "");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  function transformVolontaires(data, values) {
    const all = data;
    return all.map((data) => {
      const b = bus?.find((option) => option?._id?.toString() === data.ligneId);
      const center = centers.find((option) => option?._id?.toString() === b?.centerId);
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
          "Adresse du point de rassemblement": PDR?.address || "",
          "Ville du point de rassemblement": PDR?.city || "",
          "Département du point de rassemblement": PDR?.department || "",
          "Région du point de rassemblement": PDR?.region || "",
          "Date et heure de départ (aller)": formatDateFR(b?.departuredDate) + " - " + PDRDetails.find((option) => option?.lineId === b?._id.toString())?.departureHour || "",
          "Date et heure d’arrivée (retour)": formatDateFR(b?.returnDate) + " - " + PDRDetails.find((option) => option?.lineId === b?._id.toString())?.returnHour || "",
        },
        status: {
          "Statut général": translate(data.status),
          "Statut Phase 1": translatePhase1(data.statusPhase1),
          "Droit à l'image": translate(data.parent1AllowImageRights),
        },
      };

      const fields = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  if (!id) return <div />;
  if (loading) return <Loader />;

  const filterArray: Filter[] = [
    {
      title: "Ligne",
      name: "ligneId",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        return bus?.find((option) => option._id.toString() === item)?.busId;
      },
    },
    {
      title: "ID du centre de destination",
      name: "sessionPhase1Id",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        return bus?.find((option) => option?.sessionId?.toString() === item)?.centerId;
      },
    },
    {
      title: "Nom du centre de destination",
      name: "sessionPhase1Name",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        const b = bus?.find((option) => option?.sessionId?.toString() === item);
        return centers.find((option) => option._id.toString() === b?.centerId)?.name;
      },
    },
    {
      title: "Ville du centre de destination",
      name: "sessionPhase1City",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        const b = bus?.find((option) => option?.sessionId?.toString() === item);
        return centers.find((option) => option._id.toString() === b?.centerId)?.city;
      },
    },
    {
      title: "Région du volontaire",
      name: "region",
      missingLabel: "Non renseigné",
    },
    {
      title: "Département du volontaire",
      name: "department",
      missingLabel: "Non renseigné",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
  ];

  return (
    <div className="flex w-full flex-col px-8 pb-8 pt-4">
      <div className="flex items-center gap-4 py-8">
        <Title>Volontaires</Title>
        <div className="flex items-center gap-2 rounded-full bg-gray-200 py-1 px-2 leading-7">
          <div className="text-xs leading-5 text-gray-800">
            {PDR?.address}, {PDR?.zip}, {PDR?.city}
          </div>
          <Link to={`/point-de-rassemblement/${PDR?._id}`} target="_blank">
            <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
        <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
          <div className="flex items-center gap-2">
            <Filters
              defaultUrlParam={`cohort=${cohort}`}
              pageId={pageId}
              route={`/elasticsearch/young/by-point-de-rassemblement/${PDR?._id}/search`}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
            />
          </div>
          <button className="text-grey-700 flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium" onClick={() => setIsExportOpen(true)}>
            <BsDownload className="text-gray-400" />
            Exporter
          </button>
          <ModalExport
            isOpen={isExportOpen}
            setIsOpen={setIsExportOpen}
            route={`/elasticsearch/young/by-point-de-rassemblement/${PDR?._id}/export`}
            transform={transformVolontaires}
            exportFields={youngPlanDeTranportExportFields}
            selectedFilters={selectedFilters}
            exportTitle="volontaires"
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
          size={size}
          setSize={setSize}
          render={
            <div className="mt-6 mb-2 flex w-full flex-col">
              <hr />
              <div className="flex w-full items-center gap-6 py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[40%]">Volontaire</div>
                <div className="w-[20%]">Ligne</div>
                <div className="w-[40%]">Centre de destination</div>
              </div>
              {data?.map((hit) => {
                return <Line key={hit._id} young={hit} bus={bus} centers={centers} cohort={cohort} />;
              })}
              <hr />
            </div>
          }
        />
      </div>
    </div>
  );
}

const Line = ({ young, bus, centers, cohort }) => {
  const b = bus.find((option) => option._id.toString() === young.ligneId);
  const c = centers.find((option) => option._id.toString() === b?.centerId);

  if (!b || !c) {
    capture("Line not found", { young, bus, centers, cohort });
    return null;
  }

  return (
    <>
      <hr />
      <div className="flex items-center gap-6 py-4 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] flex-col gap-1">
          <Link to={`/volontaire/${young._id}`} target="_blank">
            <div className="text-base font-bold leading-6 text-gray-800">
              {young.firstName} {young.lastName}
            </div>
          </Link>
          <div className="text-sm leading-4 text-[#738297]">
            {young.department} • {young.region}
          </div>
        </div>
        <div className="flex w-[20%] items-center gap-2">
          <div className="text-sm leading-6 text-gray-800">{b.busId}</div>
          <Link to={`/ligne-de-bus/${b._id}`} target="_blank">
            <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
          </Link>
        </div>
        <div className="flex w-[40%] flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium leading-6 text-gray-800">{c.code2022}</div>
            <Link to={`/centre/${c._id}?cohorte=${cohort}`} target="_blank">
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
