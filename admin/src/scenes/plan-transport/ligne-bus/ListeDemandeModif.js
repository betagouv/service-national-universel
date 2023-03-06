import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React from "react";
import { useHistory } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { getInitials, getStatusClass, Title, translateStatus } from "../components/commons";
import Select from "../components/Select";
import FilterSvg from "../../../assets/icons/Filter";
import { toastr } from "react-redux-toastr";
import { getFilterLabel, ROLES, translate } from "snu-lib";
import { capture } from "../../../sentry";
import Loader from "../../../components/Loader";
import dayjs from "dayjs";
import ExternalLink from "../../../assets/icons/ExternalLink";
import Thumbs from "./components/Icons/Thumbs";
import DeleteFilters from "../../../components/buttons/DeleteFilters";
import { useSelector } from "react-redux";

const FILTERS = ["SEARCH", "LIGNE", "TAGS", "STATUS", "OPINION", "ROLE"];

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

export default function ListeDemandeModif() {
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || "Février 2023 - C");
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [tagsOptions, setTagsOptions] = React.useState([]);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  const getTags = async () => {
    try {
      const { ok, code, data: reponseTags } = await api.get(`/tags?type=modification_bus`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des tags", translate(code));
      }
      const options = reponseTags.map((tag) => {
        return { value: tag._id, label: tag.name };
      });
      setTagsOptions(options);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des tags");
    }
  };

  React.useEffect(() => {
    getTags();
  }, []);

  const getDefaultQuery = () => {
    return {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": cohort } }] } },
      track_total_hits: true,
    };
  };

  if (!tagsOptions) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: `/ligne-de-bus?cohort=${cohort}` }, { label: "Toutes les demandes de modifications" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <Title>Demandes de modifications</Title>
          <Select
            options={cohortList}
            value={cohort}
            onChange={(e) => {
              setCohort(e);
              history.replace({ search: `?cohort=${e}` });
            }}
          />
        </div>

        <ReactiveBase url={`${apiURL}/es`} app="modificationbus" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div className="flex flex-col bg-white py-4 mb-8 rounded-xl">
            <div className="flex items-stretch gap-2 bg-white py-2 px-4">
              <DataSearch
                defaultQuery={getDefaultQuery}
                showIcon={false}
                componentId="SEARCH"
                dataField={["lineName", "requestUserName", "requestMessage"]}
                placeholder="Rechercher..."
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
            <div className={`flex items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
              <MultiDropdownList
                defaultQuery={getDefaultQuery}
                className="dropdown-filter"
                placeholder="Numéro de ligne"
                componentId="LIGNE"
                dataField="lineName.keyword"
                react={{ and: FILTERS.filter((e) => e !== "LIGNE") }}
                renderItem={(e, count) => {
                  return `${translate(e)} (${count})`;
                }}
                title=""
                URLParams={true}
                showSearch={false}
                renderLabel={(items) => <div>{getFilterLabel(items, "Numéro de ligne", "Numéro de ligne")}</div>}
              />
              <MultiDropdownList
                defaultQuery={getDefaultQuery}
                className="dropdown-filter"
                placeholder="Type"
                componentId="TAGS"
                dataField="tagIds.keyword"
                react={{ and: FILTERS.filter((e) => e !== "TAGS") }}
                renderItem={(e, count) => {
                  if (e === "Non renseigné") return `Non renseigné (${count})`;
                  return `${tagsOptions.find((option) => option.value === e)?.label} (${count})`;
                }}
                title=""
                URLParams={true}
                showSearch={false}
                showMissing
                missingLabel="Non renseigné"
                renderLabel={(items) => {
                  if (Object.keys(items).length === 0) return "Type";
                  const translated = Object.keys(items).map((item) => {
                    if (item === "Non renseigné") return item;
                    return tagsOptions.find((option) => option.value === item)?.label;
                  });
                  let value = translated.join(", ");
                  value = "Type : " + value;
                  return <div>{value}</div>;
                }}
              />
              <MultiDropdownList
                defaultQuery={getDefaultQuery}
                className="dropdown-filter"
                placeholder="Statut"
                componentId="STATUS"
                dataField="status.keyword"
                react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                renderItem={(e, count) => {
                  return `${translateStatus(e)} (${count})`;
                }}
                title=""
                URLParams={true}
                showSearch={false}
                showMissing
                missingLabel="Non renseigné"
                renderLabel={(items) => {
                  if (Object.keys(items).length === 0) return "Statut";
                  const translated = Object.keys(items).map((item) => {
                    if (item === "Non renseigné") return item;
                    return translateStatus(item);
                  });
                  let value = translated.join(", ");
                  value = "Statut : " + value;
                  return <div>{value}</div>;
                }}
              />
              {[ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Avis"
                  componentId="OPINION"
                  dataField="opinion.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "OPINION") }}
                  renderItem={(e, count) => {
                    if (e === "Non renseigné") return `Non renseigné (${count})`;
                    if (e === "true") return `Favorable (${count})`;
                    if (e === "false") return `Défavorable (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  showMissing
                  missingLabel="Non renseigné"
                  renderLabel={(items) => {
                    if (Object.keys(items).length === 0) return "Avis";
                    const translated = Object.keys(items).map((item) => {
                      if (item === "Non renseigné") return item;
                      if (item === "true") return "Favorable";
                      if (item === "false") return "Défavorable";
                    });
                    let value = translated.join(", ");
                    value = "Avis : " + value;
                    return <div>{value}</div>;
                  }}
                />
              )}
              <MultiDropdownList
                defaultQuery={getDefaultQuery}
                className="dropdown-filter"
                componentId="ROLE"
                dataField="requestUserRole.keyword"
                renderItem={(e, count) => {
                  return `${translate(e)} (${count})`;
                }}
                react={{ and: FILTERS.filter((e) => e !== "ROLE") }}
                title=""
                URLParams={true}
                showSearch={false}
                renderLabel={(items) => <div>{getFilterLabel(items, "Rôle")}</div>}
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
                      <div className="w-[35%]">Contenu</div>
                      <div className="w-[12%]">Ligne</div>
                      <div className="w-[23%]">Type</div>
                      <div className="w-[12%]">État </div>
                      <div className="w-[18%]">Auteur</div>
                    </div>
                    {data?.map((hit) => {
                      return <Line key={hit._id} modification={hit} tagsOptions={tagsOptions} user={user} />;
                    })}
                    <hr />
                  </div>
                )}
              />
            </div>
          </div>
        </ReactiveBase>
      </div>
    </>
  );
}

const Line = ({ modification, tagsOptions, user }) => {
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const refContainer = React.useRef(null);
  const refChildren = React.useRef(null);

  function getlink(userId, role) {
    if (Object.values(ROLES).includes(role)) return `/user/${userId}`;
    if (role === "Volontaire") return `/volontaire/${userId}`;
    return null;
  }

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && refContainer.current?.contains(event.target)) {
        if (refChildren.current && !refChildren.current?.contains(event.target)) {
          setOpen((open) => !open);
        }
      } else {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <>
      <hr />
      <div className="flex py-4 items-center px-4 hover:bg-gray-50 gap-6">
        <div className="w-[35%] flex flex-col gap-1 cursor-pointer" onClick={() => history.push(`/ligne-de-bus/${modification.lineId}?demande=${modification._id.toString()}`)}>
          <div className="line-clamp-3 text-sm text-[#242526] text-start">{modification.requestMessage}</div>
          <div className="text-sm text-[#738297]">{dayjs(modification.createdAt).locale("fr").format("DD/MM/YYYY • HH:mm")}</div>
        </div>
        <div className="w-[12%] flex items-center gap-2">
          <div className="text-base text-[#242526] font-medium">{modification.lineName}</div>
          <ExternalLink className="h-3 w-3 text-[#9CA3AF] cursor-pointer hover:scale-110" onClick={() => history.push(`/ligne-de-bus/${modification.lineId}`)} />
        </div>
        <div className="w-[23%] flex pr-4">
          {modification?.tagIds?.length === 0 ? (
            <div className=" text-sm text-gray-700 p-2 bg-gray-100 leading-4 rounded-lg">Non renseigné</div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="px-2 py-1 rounded-lg bg-[#E8EDFF]">
                <div className="text-sm text-[#0063CB]  line-clamp-2">{tagsOptions.find((option) => option.value === modification.tagIds[0])?.label}</div>
              </div>
              {modification.tagIds.length > 1 && (
                <div
                  ref={refContainer}
                  className="relative flex justify-center items-center text-sm text-[#0063CB] h-full leading-4 px-2 py-1 rounded-lg bg-[#E8EDFF] cursor-pointer">
                  +{modification.tagIds.length - 1}
                  <div ref={refChildren} className={`absolute top-[105%] left-[95%] bg-white shadow-lg rounded-xl z-10 w-96 ${!open ? "hidden" : ""}`}>
                    <div className="flex flex-col p-3 gap-2">
                      {modification.tagIds.map((value, index) => (
                        <div key={index + modification._id.toString()} className="px-2 py-1 rounded-lg bg-[#E8EDFF] w-fit max-w-full">
                          <div className="text-sm text-[#0063CB] truncate">{tagsOptions.find((option) => option.value === value)?.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center w-[12%]">
          <div className={`flex items-center justify-center text-white text-sm rounded-full py-1 px-3 whitespace-nowrap ${getStatusClass(modification.status)}`}>
            {translateStatus(modification.status)}
          </div>
          {modification?.opinion && [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
            <div className="flex items-center justify-center text-white text-sm rounded-full p-2 bg-[#3D5B85]">
              <Thumbs className={`text-white h-4 w-4 ${modification.opinion === "false" && "rotate-180"}`} />
            </div>
          )}
        </div>
        <div className="w-[18%]">
          <a href={getlink(modification.requestUserId, modification.requestUserRole)} className="hover:cursor-pointer group">
            <div className="flex gap-2">
              <div className="rounded-full w-10 h-10 overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white text-blue-600 uppercase group-hover:bg-blue-600 group-hover:text-slate-100">
                {getInitials(modification.requestUserName)}
              </div>
              <div className="max-w-xs">
                <p className="font-medium truncate underline-offset-2 decoration-2">{modification.requestUserName}</p>
                <p className="capitalize text-gray-400 truncate underline-offset-2 decoration-2">{translate(modification.requestUserRole)}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
};
