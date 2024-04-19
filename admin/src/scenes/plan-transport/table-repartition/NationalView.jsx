import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { ROLES } from "snu-lib";

import { capture } from "@/sentry";
import API from "@/services/api";

import useDocumentTitle from "@/hooks/useDocumentTitle";

import Breadcrumbs from "@/components/Breadcrumbs";

import { regionList, SubTitle, Title } from "../components/commons";
import RegionRow from "./components/RegionRow";
import SelectCohort from "@/components/cohorts/SelectCohort";

export default function NationalView() {
  const history = useHistory();

  const cohorts = useSelector((state) => state.Cohorts);
  const user = useSelector((state) => state.Auth.user);

  const urlParams = new URLSearchParams(history.location.search);
  useDocumentTitle("Table de répartition");

  const [cohort, setCohort] = useState(urlParams.get("cohort") || cohorts?.[0]?.name);
  const [youngsByRegion, setYoungsByRegion] = useState([]);
  const [placesCenterByRegion, setPlacesCenterByRegion] = useState({});
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [searchRegion, setSearchRegion] = useState("");
  const [regions, setRegions] = useState(regionList);
  const [data, setData] = useState([]);

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
        if (!cohort) return;
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

  const handleChangeCohort = (cohortName) => {
    setCohort(cohortName);
    history.replace({ search: `?cohort=${cohortName}` });
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
          <SelectCohort cohort={cohort} onChange={handleChangeCohort} />
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
              <RegionRow
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
