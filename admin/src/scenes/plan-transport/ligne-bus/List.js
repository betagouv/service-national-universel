import React, {useRef} from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { TabItem, Title, translateStatus } from "../components/commons";
import Select from "../components/Select";
import { BsArrowLeft, BsArrowRight, BsDownload } from "react-icons/bs";
import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import api from "../../../services/api";
import { apiURL, environment } from "../../../config";
import FilterSvg from "../../../assets/icons/Filter";
import ExportComponent from "../../../components/ExportXlsx";
import {ES_NO_LIMIT, getDepartmentNumber, getFilterLabel, MIME_TYPES, ROLES, translate} from "snu-lib";
import History from "../../../assets/icons/History";
import { useHistory } from "react-router-dom";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";
import Loader from "../../../components/Loader";
import Excel from "./components/Icons/Excel.png";
import { useSelector } from "react-redux";
import { PlainButton } from "../components/Buttons";
import DeleteFilters from "../../../components/buttons/DeleteFilters";
import ArrowUp from "../../../assets/ArrowUp";
import Comment from "../../../assets/comment";
import ListPanel from "./modificationPanel/List";
import { getTransportIcon } from "../util";

const FILTERS = [
  "SEARCH",
  "COHORT",
  "LINE_NUMBER",
  "DATE_ALLER",
  "DATE_RETOUR",
  "TAUX_REMPLISSAGE",
  "REGION_PDR",
  "DEPARTMENT_PDR",
  "CITY_PDR",
  "NAME_PDR",
  "CODE_PDR",
  "REGION_CENTER",
  "DEPARTMENT_CENTER",
  "NAME_CENTER",
  "CODE_CENTER",
  "MODIFICATION_ASKED",
  "MODIFICATION_STATUS",
  "MODIFICATION_OPINION",
];

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

const translateLineFillingRate = (e) => {
  if (e === 0) return "Vide";
  if (e === 100) return "Rempli";
  return `${Math.floor(e / 10) * 10}-${Math.floor(e / 10) * 10 + 10}%`;
};

export default function List() {
  const { user } = useSelector((state) => state.Auth);
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || "Février 2023 - C");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);
  const [hasValue, setHasValue] = React.useState(false);
  const history = useHistory();
  const fileInput = useRef(null);

  const getPlanDetransport = async () => {
    try {
      const { ok, code, data: reponseBus } = await api.get(`/ligne-de-bus/cohort/${cohort}/hasValue`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du plan de transport", translate(code));
      }
      setHasValue(reponseBus);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    getPlanDetransport();
  }, [cohort]);

  function importFile(e) {
    e.preventDefault();
    if (fileInput && fileInput.current) {
      fileInput.current.click();
    }
  }

  function getFileFromInput(e) {
    if (e && e.target && e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  }

  async function uploadFile(file) {
    setUploadError(null);
    if (file.type !== MIME_TYPES.EXCEL) {
      setUploadError("Le fichier doit être au format Excel.");
      return;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      setUploadError("Votre fichier dépasse la limite de 5Mo.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadFile(`/plan-de-transport/import/${cohort}`, [file]);
      if (res.code === "FILE_CORRUPTED") {
        setUploadError("Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support.");
      } else if (!res.ok) {
        capture(res.code);
        setUploadError("Une erreur s'est produite lors du téléversement de votre fichier.");
      } else {
        fileUploaded(res.data);
      }
    } catch (err) {
      setUploadError("Une erreur est survenue. Nous n'avons pu enregistrer le fichier. Veuillez réessayer dans quelques instants.");
    }
    setIsUploading(false);
  }

  function fileUploaded(data) {
    console.log("File Uploaded: ", data);
  }

  if (isLoading || isUploading) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <Title>Plan de transport</Title>
          <Select
            options={cohortList}
            value={cohort}
            onChange={(e) => {
              setCohort(e);
              history.replace({
                search: null,
              });
            }}
          />
        </div>
        {hasValue ? (
          <ReactiveList cohort={cohort} history={history} />
        ) : (
          <div className="flex flex-col items-center justify-center pt-12 gap-4 w-[450px] m-auto">
            <img src={Excel} alt="Excel" className="w-32 bg-[#f4f5f7]" />
            <div className="font-bold text-2xl leading-7 text-gray-800">Aucun document importé</div>
            {environment !== "production" && [ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role) && (
              <>
                <div className="text-gray-800 text-sm leading-5 text-center">
                  Importez votre plan de transport au format .xls (fichier Excel) afin de voir apparaître ici le plan de transport.
                </div>
                <PlainButton className="mt-2" onClick={() => history.push(`/ligne-de-bus/import?cohort=${cohort}`)}>
                  Importer mon fichier
                </PlainButton>
                <input type="file" accept="image/png, image/jpg, application/pdf" ref={fileInput} onChange={getFileFromInput} className="hidden" />
                {uploadError && <div className="text-red-900 mt-8 text-center text-sm font-bold">{uploadError}</div>}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const ReactiveList = ({ cohort, history }) => {
  const { user } = useSelector((state) => state.Auth);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("aller");
  const [panel, setPanel] = React.useState({ open: false, id: null });

  const getDefaultQuery = () => {
    return {
      query: {
        bool: {
          filter: [{ term: { "cohort.keyword": cohort } }],
        },
      },
      track_total_hits: true,
    };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <>
      <ReactiveBase url={`${apiURL}/es`} app="plandetransport" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div className="flex flex-1">
          <TabItem icon={<BsArrowRight />} title="Aller" onClick={() => setCurrentTab("aller")} active={currentTab === "aller"} />
          <TabItem icon={<BsArrowLeft />} title="Retour" onClick={() => setCurrentTab("retour")} active={currentTab === "retour"} />
        </div>
        <div className="flex flex-col bg-white py-4 mb-8 rounded-lg">
          <div className="flex items-center justify-between bg-white py-2 px-4">
            <div className="flex items-center gap-2">
              <DataSearch
                defaultQuery={getDefaultQuery}
                showIcon={false}
                componentId="SEARCH"
                dataField={["busId", "pointDeRassemblements.region", "pointDeRassemblements.city", "centerCode", "centerCity", "centerRegion"]}
                placeholder="Rechercher une ligne (numéro, ville, region)"
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
            <div className="flex gap-2 items-center">
              <button
                className="flex gap-2 items-center text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
                onClick={() => history.push("/ligne-de-bus/historique")}>
                <History className="text-gray-400" />
                Historique
              </button>
              <button
                className="text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
                onClick={() => history.push("/ligne-de-bus/demande-de-modification")}>
                Demande de modification
              </button>
              <ExportComponent
                title="Exporter"
                defaultQuery={getExportQuery}
                exportTitle="Plan_de_transport"
                icon={<BsDownload className="text-gray-400" />}
                index="plandetransport"
                react={{ and: FILTERS }}
                css={{
                  override: true,
                  button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                  loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                }}
                transform={async (data) => {
                  let all = data;

                  // Get the length of the longest array of PDRs
                  const maxPDRs = all.reduce((max, item) => (item.pointDeRassemblements.length > max ? item.pointDeRassemblements.length : max), 0);

                  return all.map((data) => {
                    let pdrs = {};

                    for (let i = 0; i < maxPDRs; i++) {
                      const pdr = data.pointDeRassemblements?.[i];
                      const num = i + 1;
                      pdrs[`N° DU DEPARTEMENT DU PDR ${num}`] = pdr?.department ? getDepartmentNumber(pdr.department) : "";
                      pdrs[`ID PDR ${num}`] = pdr?.meetingPointId || "";
                      pdrs[`TYPE DE TRANSPORT PDR ${num}`] = pdr?.transportType || "";
                      pdrs[`NOM + ADRESSE DU PDR ${num}`] = pdr?.name ? pdr.name + " / " + pdr.address : "";
                      pdrs[`HEURE ALLER ARRIVÉE AU PDR ${num}`] = pdr?.busArrivalHour || "";
                      pdrs[`HEURE DE DEPART DU PDR ${num}`] = pdr?.meetingHour || "";
                      pdrs[`HEURE DE RETOUR ARRIVÉE AU PDR ${num}`] = pdr?.returnHour || "";
                    }

                    return {
                      "NUMERO DE LIGNE": data.busId,
                      "DATE DE TRANSPORT ALLER": data.departureString,
                      "DATE DE TRANSPORT RETOUR": data.returnString,
                      ...pdrs,
                      "N° DU DEPARTEMENT DU CENTRE": getDepartmentNumber(data.centerDepartment),
                      "ID CENTRE": data.centerId,
                      "NOM + ADRESSE DU CENTRE": data.centerName + " / " + data.centerAddress,
                      "HEURE D'ARRIVEE AU CENTRE": data.centerArrivalTime,
                      "HEURE DE DÉPART DU CENTRE": data.centerDepartureTime,

                      // * followerCapacity !== Total des followers mais c'est la sémantique ici
                      "TOTAL ACCOMPAGNATEURS": data.followerCapacity,

                      "CAPACITÉ VOLONTAIRE TOTALE": data.youngCapacity,
                      "CAPACITÉ TOTALE LIGNE": data.totalCapacity,
                      "PAUSE DÉJEUNER ALLER": data.lunchBreak ? "Oui" : "Non",
                      "PAUSE DÉJEUNER RETOUR": data.lunchBreakReturn ? "Oui" : "Non",
                      "TEMPS DE ROUTE": data.travelTime,
                    };
                  });
                }}
              />
            </div>
          </div>
          <div className={`flex items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-x-2">
                <div className="uppercase text-xs text-snu-purple-800 mr-2">Ligne de bus</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Numéro de la ligne"
                  componentId="LINE_NUMBER"
                  dataField="busId.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "LINE_NUMBER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Numéro de ligne", "Numéro de ligne")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />

                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Date aller"
                  componentId="DATE_ALLER"
                  dataField="departureString.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DATE_ALLER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Date aller", "Date aller")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Date retour"
                  componentId="DATE_RETOUR"
                  dataField="returnString.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DATE_RETOUR") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Date retour", "Date retour")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Taux de remplissage"
                  componentId="TAUX_REMPLISSAGE"
                  dataField="lineFillingRate"
                  react={{ and: FILTERS.filter((e) => e !== "TAUX_REMPLISSAGE") }}
                  renderItem={(e, count) => {
                    return `${translateLineFillingRate(e)} (${count})`;
                  }}
                  renderLabel={(items) => {
                    if (Object.keys(items).length === 0) return "Taux de remplissage";
                    const translated = Object.keys(items).map((item) => {
                      if (item === "Non renseigné") return item;
                      return translateLineFillingRate(item);
                    });
                    let value = translated.join(", ");
                    value = "Taux de remplissage : " + value;
                    return <div>{value}</div>;
                  }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <div className="uppercase text-xs text-snu-purple-800 mr-2">Points de rassemblement</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Nom"
                  componentId="NAME_PDR"
                  dataField="pointDeRassemblements.name.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "NAME_PDR") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Nom", "Nom")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Région"
                  componentId="REGION_PDR"
                  dataField="pointDeRassemblements.region.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "REGION_PDR") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Région", "Région")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Département"
                  componentId="DEPARTMENT_PDR"
                  dataField="pointDeRassemblements.department.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT_PDR") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Département", "Département")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Ville"
                  componentId="CITY_PDR"
                  dataField="pointDeRassemblements.city.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CITY_PDR") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Ville", "Ville")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Code"
                  componentId="CODE_PDR"
                  dataField="pointDeRassemblements.code.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CODE_PDR") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Code", "Code")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <div className="uppercase text-xs text-snu-purple-800 mr-2">Centre</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Nom"
                  componentId="NAME_CENTER"
                  dataField="centerName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "NAME_CENTER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Nom", "Nom")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Région"
                  componentId="REGION_CENTER"
                  dataField="centerRegion.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "REGION_CENTER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Région", "Région")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Département"
                  componentId="DEPARTMENT_CENTER"
                  dataField="centerDepartment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT_CENTER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Département", "Département")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Code"
                  componentId="CODE_CENTER"
                  dataField="centerCode.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CODE_CENTER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Code", "Code")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <div className="uppercase text-xs text-snu-purple-800 mr-2">Modifications de status</div>

                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Modification demandée"
                  componentId="MODIFICATION_ASKED"
                  dataField="modificationBuses.requestMessage.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MODIFICATION_ASKED") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => <div>{getFilterLabel(items, "Modification demandée", "Modification demandée")}</div>}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Status de la modification"
                  componentId="MODIFICATION_STATUS"
                  dataField="modificationBuses.status.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MODIFICATION_STATUS") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderLabel={(items) => {
                    if (Object.keys(items).length === 0) return "Status de la modification";
                    const translated = Object.keys(items).map((item) => {
                      if (item === "Non renseigné") return item;
                      return translateStatus(item);
                    });
                    let value = translated.join(", ");
                    value = "Status de la modification : " + value;
                    return <div>{value}</div>;
                  }}
                  renderItem={(e, count) => {
                    if (e === "Non renseigné") return `Non renseigné (${count})`;
                    return `${translateStatus(e)} (${count})`;
                  }}
                  showMissing
                  missingLabel="Non renseigné"
                />
                {user.role === ROLES.ADMIN && (
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Opinion sur la modification"
                    componentId="MODIFICATION_OPINION"
                    dataField="modificationBuses.opinion.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "MODIFICATION_OPINION") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                    renderLabel={(items) => <div>{getFilterLabel(items, "Opinion sur la modification", "Opinion sur la modification")}</div>}
                    renderItem={(e, count) => {
                      return `${translate(e)} (${count})`;
                    }}
                    showMissing
                    missingLabel="Non renseigné"
                  />
                )}
              </div>
              <DeleteFilters />
            </div>
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
                  <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 w-full">
                    <div className="w-[30%]">Lignes</div>
                    <div className="w-[40%]">Points de rassemblements</div>
                    <div className="w-[15%]">Centres de destinations</div>
                    <div className="w-[10%]">Taux de remplissage</div>
                    <div className="w-[5%] h-1"></div>
                  </div>
                  {data?.map((hit) => {
                    return <Line key={hit._id} hit={hit} currentTab={currentTab} setPanel={setPanel} />;
                  })}
                  <hr />
                </div>
              )}
            />
          </div>
        </div>
      </ReactiveBase>
      <ListPanel busId={panel?.id} open={panel?.open} setOpen={setPanel} />
    </>
  );
};

const Line = ({ hit, currentTab, setPanel }) => {
  const history = useHistory();

  const meetingPoints =
    currentTab === "aller"
      ? //sort meetingPoints by meetingHour
        hit.pointDeRassemblements.sort((a, b) => a.meetingHour.replace(":", "") - b.meetingHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", ""));

  const hasPendingModification = hit.modificationBuses?.some((modification) => modification.status === "PENDING");

  return (
    <>
      <hr />
      <div className="flex py-6 items-center px-4 hover:bg-gray-50">
        <div className="w-[30%] cursor-pointer" onClick={() => history.push(`/ligne-de-bus/${hit._id.toString()}`)}>
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">
              {currentTab === "retour" ? `${hit.pointDeRassemblements[0].region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0].region}`}
            </div>
          </div>
        </div>
        <div className="w-[40%]">
          <div className="flex gap-2">
            {meetingPoints.map((meetingPoint) => {
              return (
                <TooltipMeetingPoint key={meetingPoint.meetingPointId} meetingPoint={meetingPoint} currentTab={currentTab}>
                  <a
                    href={`/point-de-rassemblement/${meetingPoint.meetingPointId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:scale-105 cursor-pointer gap-2 text-sm font-normal flex justify-center px-2 py-1 items-center bg-gray-100 rounded-3xl">
                    {meetingPoint.city}
                    <ArrowUp />
                  </a>
                </TooltipMeetingPoint>
              );
            })}
          </div>
        </div>
        <div className="w-[15%]">
          <div className="flex gap-2">
            <TooltipCenter key={hit.centerId} name={hit.centerName} region={hit.centerRegion} department={hit.centerDepartment}>
              <a
                href={`/centre/${hit.centerId}`}
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 cursor-pointer gap-2 text-sm font-normal flex justify-center px-2 py-1 items-center">
                {hit.centerCode}
                <ArrowUp />
              </a>
            </TooltipCenter>
          </div>
        </div>
        <div className="w-[10%] flex gap-4 items-center">
          <div className="text-sm font-normal">{hit.lineFillingRate}%</div>
          <div className="flex flex-col items-center">
            <svg className="-rotate-90 w-9 h-9" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#F0F0F0" strokeDashoffset={`calc(100 - 0)`} strokeWidth="15" />
              <circle
                className="percent fifty"
                strokeDasharray={100}
                strokeDashoffset={`calc(100 - ${Math.round(hit.lineFillingRate)})`}
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="#1E40AF"
                strokeWidth="15"
                pathLength="100"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="w-[5%] flex justify-center">
          {hit.modificationBuses?.length > 0 ? (
            <div
              className={`flex p-2 rounded-full cursor-pointer ${hasPendingModification ? "bg-orange-500" : "bg-gray-200"}`}
              onClick={() => setPanel({ open: true, id: hit._id })}>
              <Comment stroke={hasPendingModification && "white"} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const TooltipMeetingPoint = ({ children, meetingPoint, currentTab, ...props }) => {
  if (!meetingPoint) return children;

  return (
    <div className="relative flex flex-col items-center group " {...props}>
      {children}
      <div className="absolute hidden group-hover:flex !top-8 mb-3 items-center left-0">
        <div className="relative p-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-lg z-[500] rounded-lg">
          <div className="flex items-center justify-between w-[524px]">
            <div className="flex items-center">
              <div className="text-sm font-medium flex justify-center px-2 py-1 items-center bg-gray-100 rounded-lg">
                {currentTab === "aller" ? meetingPoint.meetingHour : meetingPoint.returnHour}
              </div>
              <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600]">
                <polygon points="0 0, 100 0, 50 55" transform="rotate(-90 50 50)" fill="#F5F5F5" />
              </svg>
              <div className="flex flex-col ml-1">
                <div className="text-sm font-medium">{meetingPoint.name}</div>
                <div className="text-xs text-gray-400">{`${meetingPoint.region} • ${meetingPoint.department}`}</div>
              </div>
            </div>
            {getTransportIcon(meetingPoint.transportType)}
          </div>
        </div>
      </div>
    </div>
  );
};

const TooltipCenter = ({ children, name, region, department, ...props }) => {
  return (
    <div className="relative flex flex-col items-center group" {...props}>
      {children}
      <div className="absolute flex-col hidden group-hover:flex !top-8 mb-3 items-center left-0">
        <div className="relative py-3 px-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-lg z-[500] rounded-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`${name}`}</div>
            <div className="text-xs text-gray-400">{`${region} • ${department}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
