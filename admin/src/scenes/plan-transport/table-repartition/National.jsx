import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { ROLES } from "snu-lib";
import Pencil from "../../../assets/icons/Pencil";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Select from "../components/Select";
import { capture } from "../../../sentry";
import API from "../../../services/api";
import { Loading, regionList, SubTitle, Title } from "../components/commons";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { parseQuery } from "../util";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { getCohortSelectOptions } from "@/services/cohort.service";

export default function National() {
  useDocumentTitle("Table de répartition");
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);
  const [cohort, setCohort] = useState(getDefaultCohort());
  const [cohortList, setCohortList] = useState([]);
  const [youngsByRegion, setYoungsByRegion] = useState([]);
  const [placesCenterByRegion, setPlacesCenterByRegion] = useState({});
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [searchRegion, setSearchRegion] = useState("");
  const [regions, setRegions] = useState(regionList);
  const [data, setData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const cohortList = getCohortSelectOptions(cohorts);
    setCohortList(cohortList);
    if (!cohort) setCohort(cohortList[0].value);
  }, []);

  function getDefaultCohort() {
    const { cohort } = parseQuery(location.search);
    if (cohort) {
      return cohort;
    }
    return undefined;
  }

  const getRepartitionRegion = async () => {
    try {
      const { data, ok } = await API.get(`/table-de-repartition/national/${cohort}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      setData(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingQuery(true);

        await getRepartitionRegion();

        //get youngs by region
        const response = await API.post("/elasticsearch/young/search", {
          filters: { cohort: [cohort], status: ["VALIDATED"] },
        });
        if (!response.responses.length) return toastr.error("Oups, une erreur est survenue lors de la récupération des volontaires");
        setYoungsByRegion(response.responses[1].aggregations.region.names.buckets);

        //get places center by region
        const { ok, data } = await API.post("/elasticsearch/sessionphase1/export?needCohesionCenterInfo=true", {
          filters: { cohort: [cohort] },
        });
        if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des centres");

        const sessionPlacesBycohesionCenterRegion = data.reduce((acc, item) => {
          const { region, placesTotal } = item._source;
          if (!acc[region]) {
            acc[region] = 0;
          }
          acc[region] += placesTotal;
          return acc;
        }, {});

        setPlacesCenterByRegion(sessionPlacesBycohesionCenterRegion);
        setLoadingQuery(false);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      }
    })();
  }, [cohort]);

  React.useEffect(() => {
    let regions = regionList.filter((e) => {
      if (searchRegion === "") return true;
      return e.toLowerCase().includes(searchRegion.toLowerCase());
    });
    setRegions(regions);
  }, [searchRegion]);

  const onCreate = async (fromRegion, toRegion) => {
    try {
      //update real time
      setData([...data, { fromRegion, toRegion }]);
      const { ok } = await API.post(`/table-de-repartition/region`, { fromRegion, toRegion, cohort });
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'ajout de la region d'accueil");
      await getRepartitionRegion();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout de la region d'accueil");
      await getRepartitionRegion();
    }
  };

  const onDelete = async (fromRegion, toRegion) => {
    try {
      //update real time
      let update = data.filter((e) => e.fromRegion !== fromRegion || e.toRegion !== toRegion);
      setData(update);
      const { ok } = await API.post(`/table-de-repartition/delete/region`, { fromRegion, toRegion, cohort });
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la suppression de la region d'accueil");
      await getRepartitionRegion();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression de la region d'accueil");
      await getRepartitionRegion();
    }
  };

  const handleChangeCohort = (value) => {
    setCohort(value);
    history.push(`/table-repartition?cohort=${value}`);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Table de répartition" }]} />
      <div className="flex w-full flex-col px-8 pb-8 ">
        <div className="flex items-center justify-between py-8">
          <div className="flex flex-col gap-3">
            <Title>Table de répartition</Title>
            {user.role == ROLES.ADMIN && <SubTitle>Assignez une ou des régions d’accueil à votre région</SubTitle>}
          </div>
          <Select options={cohortList} value={cohort} onChange={handleChangeCohort} />
        </div>
        <div className="flex flex-col gap-2 rounded-lg bg-white pb-3">
          <div className="flex w-full items-center justify-between px-4 py-3">
            <input
              type="text"
              name="search"
              className=" w-1/3 rounded-lg border border-gray-300 px-4 py-2"
              placeholder="Rechercher une region"
              onChange={(e) => setSearchRegion(e.target.value)}
            />
            {/* <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:bg-white hover:!text-blue-600 transition ease-in-out">
              Exporter
            </button> */}
          </div>

          <hr />
          <div className="flex items-center px-4 py-2">
            <div className="w-[30%] text-xs uppercase leading-3 text-[#7E858C]">Région</div>
            <div className="w-[60%] text-xs uppercase leading-3 text-[#7E858C]">Région d&apos;accueil</div>
            <div className="w-[10%] text-center text-xs uppercase leading-3 text-[#7E858C]">Avancement</div>
          </div>

          {regions?.length ? (
            regions.map((region) => (
              <Region
                key={"region" + region}
                region={region}
                youngsInRegion={youngsByRegion.find((r) => r.key === region)?.doc_count || 0}
                placesCenterByRegion={placesCenterByRegion}
                onCreate={onCreate}
                onDelete={onDelete}
                data={data}
                loadingQuery={loadingQuery}
                cohort={cohort}
                user={user}
              />
            ))
          ) : (
            <>
              <hr />
              <div className="flex w-full items-center justify-center px-4 pb-4 pt-2">
                <div className="text-sm leading-6 text-[#7E858C]">Aucune région ne correspond à votre recherche</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const Region = ({ region, youngsInRegion, placesCenterByRegion, loadingQuery, onCreate, data, onDelete, cohort, user }) => {
  const [open, setOpen] = React.useState(false);
  const [assignRegion, setAssignRegion] = React.useState([]);
  const [avancement, setAvancement] = React.useState(0);
  const editDisabled = user.role !== ROLES.ADMIN;
  const history = useHistory();

  React.useEffect(() => {
    let assignRegion = data.filter((e) => e.fromRegion === region) || [];
    setAssignRegion(assignRegion);
    setAvancement(assignRegion.length ? assignRegion[0].avancement : 0);
  }, [data]);

  return (
    <>
      <hr />
      <div className="flex items-center px-4 py-2">
        <div
          className={`flex w-[30%] flex-col gap-1 ${assignRegion.length ? "cursor-pointer" : ""}`}
          onClick={() => assignRegion.length && history.push(`/table-repartition/regional?cohort=${cohort}&region=${region}`)}>
          <div className="text-base font-bold leading-6 text-[#242526]">{region}</div>
          <div className="flex items-center text-xs leading-4 text-gray-800">{loadingQuery ? <Loading width="w-1/3" /> : `${youngsInRegion} volontaires`}</div>
        </div>
        <div className="w-[60%]">
          {loadingQuery ? (
            <Loading width="w-1/3" />
          ) : (
            <div className="relative flex flex-row flex-wrap items-center gap-2">
              {assignRegion.map((assign, i) => (
                <div key={i + "assign"} className="rounded-full bg-gray-100 p-2 text-xs text-gray-700">
                  {assign.toRegion}
                </div>
              ))}
              {!editDisabled && (
                <>
                  {assignRegion.length === 0 ? (
                    <button className="cursor-pointer rounded-full bg-blue-600 px-2 py-1 text-xs leading-5 text-white hover:scale-105" onClick={() => setOpen(!open)}>
                      À assigner
                    </button>
                  ) : (
                    <div className="flex cursor-pointer items-center rounded-full bg-blue-600 p-2 hover:scale-105" onClick={() => setOpen(!open)}>
                      <Pencil className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {open ? (
                    <SelectHostRegion
                      region={region}
                      setOpen={setOpen}
                      placesCenterByRegion={placesCenterByRegion}
                      onCreate={onCreate}
                      assignRegion={assignRegion}
                      onDelete={onDelete}
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
        <div className="w-[10%] text-center">
          {loadingQuery ? (
            <Loading width="w-2/3" />
          ) : (
            <div className="flex justify-center">
              <div className={`rounded-lg px-2 py-1 text-xs font-bold uppercase leading-5 ${avancement === 100 ? "bg-[#E4F3EC] text-green-600" : "bg-[#E8EDFF] text-blue-600"}`}>
                {avancement} %
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const SelectHostRegion = ({ region, placesCenterByRegion, setOpen, onCreate, assignRegion, onDelete }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const onChange = (fromRegion, toRegion) => {
    if (assignRegion.filter((e) => e.toRegion === toRegion)?.length !== 0) onDelete(fromRegion, toRegion);
    else onCreate(fromRegion, toRegion);
  };

  return (
    <div ref={ref} className="absolute top-[110%] left-[0px] z-50 flex h-60 w-[90%] flex-col overflow-y-auto rounded-lg bg-white py-2 shadow-ninaButton">
      {regionList.map((r, i) => {
        return (
          <div key={r + i} className="flex cursor-pointer flex-row items-center justify-between px-3 py-2 hover:bg-gray-100" onClick={() => onChange(region, r)}>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input type={"checkbox"} checked={assignRegion.find((e) => e.toRegion === r) || false} readOnly />
              {r}
            </div>
            <div className="text-sm uppercase text-gray-500">{placesCenterByRegion[r] ? placesCenterByRegion[r] : 0} places</div>
          </div>
        );
      })}
    </div>
  );
};
