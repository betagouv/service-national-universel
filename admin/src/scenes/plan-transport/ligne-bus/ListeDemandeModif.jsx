import dayjs from "@/utils/dayjs.utils";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ROLES, translate } from "snu-lib";
import ExternalLink from "../../../assets/icons/ExternalLink";
import { Filters, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import Loader from "../../../components/Loader";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { getInitials, getStatusClass, translateStatus } from "../components/commons";
import Thumbs from "./components/Icons/Thumbs";

export default function ListeDemandeModif() {
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = useState(urlParams.get("cohort"));
  const [tagsOptions, setTagsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.Auth.user);

  const [data, setData] = useState([]);
  const pageId = "demande-modification-bus";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({ page: 0 });
  const [size, setSize] = useState(10);

  const getTags = async () => {
    try {
      setTagsOptions([]);
      setSelectedFilters({});
      setLoading(true);
      const { ok, code, data: reponseTags } = await api.get(`/tags?type=modification_bus`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des tags", translate(code));
      }
      const options = reponseTags.map((tag) => {
        return { value: tag._id, label: tag.name };
      });
      setTagsOptions(options);
      setLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des tags");
    }
  };

  React.useEffect(() => {
    getTags();
  }, [cohort]);

  if (loading) return <Loader />;

  const filterArray = [
    {
      title: "Numéro de ligne",
      name: "lineName",
      missingLabel: "Non renseigné",
    },
    {
      title: "Type",
      name: "tagIds",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A") return item;
        return tagsOptions.find((option) => option.value === item)?.label || item;
      },
    },
    {
      title: "Statut",
      name: "status",
      missingLabel: "Non renseigné",
      translate: translateStatus,
    },
    [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role)
      ? {
          title: "Avis",
          name: "opinion",
          missingLabel: "Non renseigné",
          translate: (item) => {
            if (item === "N/A") return item;
            return item === "true" ? "Favorable" : "Défavorable";
          },
        }
      : null,
    { title: "Rôle", name: "requestUserRole", missingLabel: "Non renseigné", translate: translate },
  ].filter((e) => e);

  return (
    <>
      <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
        <div className="flex items-stretch gap-2 bg-white px-4 pt-2">
          <Filters
            defaultUrlParam={`cohort=${cohort}`}
            pageId={pageId}
            route="/elasticsearch/modificationbus/search"
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher..."
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
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
          }
        />
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
      <div className="flex items-center gap-6 py-4 px-4 hover:bg-gray-50">
        <div className="flex w-[35%] cursor-pointer flex-col gap-1" onClick={() => history.push(`/ligne-de-bus/${modification.lineId}?demande=${modification._id.toString()}`)}>
          <div className="text-start text-sm text-[#242526] line-clamp-3">{modification.requestMessage}</div>
          <div className="text-sm text-[#738297]">{dayjs(modification.createdAt).format("DD/MM/YYYY • HH:mm")}</div>
        </div>
        <div className="flex w-[12%] items-center gap-2">
          <div className="text-base font-medium text-[#242526]">{modification.lineName}</div>
          <ExternalLink className="h-3 w-3 cursor-pointer text-[#9CA3AF] hover:scale-110" onClick={() => history.push(`/ligne-de-bus/${modification.lineId}`)} />
        </div>
        <div className="flex w-[23%] pr-4">
          {modification?.tagIds?.length === 0 ? (
            <div className=" rounded-lg bg-gray-100 p-2 text-sm leading-4 text-gray-700">Non renseigné</div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="rounded-lg bg-[#E8EDFF] px-2 py-1">
                <div className="text-sm text-[#0063CB]  line-clamp-2">{tagsOptions.find((option) => option.value === modification.tagIds[0])?.label}</div>
              </div>
              {modification.tagIds.length > 1 && (
                <div
                  ref={refContainer}
                  className="relative flex h-full cursor-pointer items-center justify-center rounded-lg bg-[#E8EDFF] px-2 py-1 text-sm leading-4 text-[#0063CB]">
                  +{modification.tagIds.length - 1}
                  <div ref={refChildren} className={`absolute top-[105%] left-[95%] z-10 w-96 rounded-xl bg-white shadow-lg ${!open ? "hidden" : ""}`}>
                    <div className="flex flex-col gap-2 p-3">
                      {modification.tagIds.map((value, index) => (
                        <div key={index + modification._id.toString()} className="w-fit max-w-full rounded-lg bg-[#E8EDFF] px-2 py-1">
                          <div className="truncate text-sm text-[#0063CB]">{tagsOptions.find((option) => option.value === value)?.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex w-[12%] items-center gap-2">
          <div className={`flex items-center justify-center whitespace-nowrap rounded-full py-1 px-3 text-sm text-white ${getStatusClass(modification.status)}`}>
            {translateStatus(modification.status)}
          </div>
          {modification?.opinion && [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
            <div className="flex items-center justify-center rounded-full bg-[#3D5B85] p-2 text-sm text-white">
              <Thumbs className={`h-4 w-4 text-white ${modification.opinion === "false" && "rotate-180"}`} />
            </div>
          )}
        </div>
        <div className="w-[18%]">
          <a href={getlink(modification.requestUserId, modification.requestUserRole)} className="group hover:cursor-pointer">
            <div className="flex gap-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 uppercase text-blue-600 group-hover:bg-blue-600 group-hover:text-slate-100">
                {getInitials(modification.requestUserName)}
              </div>
              <div className="max-w-xs">
                <p className="truncate font-medium decoration-2 underline-offset-2">{modification.requestUserName}</p>
                <p className="truncate capitalize text-gray-400 decoration-2 underline-offset-2">{translate(modification.requestUserRole)}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
};
