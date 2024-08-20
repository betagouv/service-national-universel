import React, { useEffect, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { Badge, Box, Loading } from "../components/commons";
import People from "../../../assets/icons/People";
import IcebergColor from "../../../assets/icons/IcebergColor";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { getDepartmentNumber } from "snu-lib";

export default function SchemaDepartmentDetail({ departmentData, cohortName, department, className }) {
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, [departmentData]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(`/schema-de-repartition/department-detail/${department}/${cohortName}`);
      if (result.ok) {
        setData(result.data);
      } else {
        setError("Impossible de charger les données.");
      }
    } catch (err) {
      capture(err);
      setError("Impossible de charger les données.");
    }
    setLoading(false);
  }

  return (
    <div className={`mt-[80px] ${className}`}>
      <div className="mb-2 text-center text-lg font-bold text-gray-800">
        {shown ? "Masquer" : "Afficher"} les volontaires accueillis en {department}
      </div>
      <div className="flex items-center justify-center">
        <div
          className="bf-[#FFFFFF] flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full text-gray-700 shadow hover:bg-gray-700 hover:text-[#FFFFFF]"
          onClick={() => setShown(!shown)}>
          <ChevronDown className={shown ? "rotate-180" : ""} />
        </div>
      </div>
      {shown && (
        <>
          <div className="my-6 flex items-start">
            <Box className="grow">
              <div className="mb-2">Volontaires extérieurs accueillis</div>
              <div className="flex items-center">
                <People className="mr-2 text-gray-400" />
                {loading ? (
                  <Loading width="w-100" />
                ) : error ? (
                  <span className="text-[#DC5318]">{error}</span>
                ) : (
                  <span className="text-2xl font-bold text-[#171725]">{data.affectedYoungs}</span>
                )}
              </div>
            </Box>
            <Box className="mx-4 grow">
              <div className="mb-2">Places disponibles</div>
              <div className="flex items-center">
                {loading ? (
                  <Loading width="w-100" />
                ) : error ? (
                  <span className="text-[#DC5318]">{error}</span>
                ) : (
                  <span className="text-2xl font-bold text-[#171725]">{data.placesLeft}</span>
                )}
              </div>
            </Box>
            <Box className="grow">
              <div className="mb-2">
                Centres en {department} ({getDepartmentNumber(department)})
              </div>
              {loading ? (
                <Loading width="w-100" />
              ) : error ? (
                <span className="text-[#DC5318]">{error}</span>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2 text-2xl font-bold text-[#171725]">{data.centers.length}</span>
                  <Badge>{data.placesTotal > 1 ? data.placesTotal + " places" : data.placesTotal + " place"}</Badge>
                </div>
              )}
            </Box>
          </div>
          <Box className="mt-4">
            <div className="border-b border-b-gray-200 py-4 text-lg text-gray-900">Détail des affectations</div>
            <div className="mt-8 grid grid-cols-3">
              {loading ? (
                <Loading />
              ) : error ? (
                <div className="text-[#DC5318]">{error}</div>
              ) : (
                <>
                  {data.centers.map((center) => (
                    <CenterDetail key={center._id} center={center} />
                  ))}
                </>
              )}
            </div>
          </Box>
        </>
      )}
    </div>
  );
}

function CenterDetail({ center }) {
  return (
    <div className="pr-4 pb-4">
      <div className="p-4 shadow">
        <div className="mb-2 flex items-start border-b border-b-gray-200 pb-4">
          <IcebergColor className="mr-4 h-[36px] w-[38px]" />
          <div className="grow">
            <div className="text-base font-bold text-gray-900">{center.name}</div>
            <div className="text-sm text-gray-500">
              {center.city} • {center.department} ({getDepartmentNumber(center.department)})
            </div>
          </div>
        </div>

        <div className="">
          {center.groups && center.groups.length > 0 ? (
            center.groups.map((group, index) => (
              <div key={"group-" + index} className="mb-3 flex items-center">
                <div className="mr-7 flex w-[50px] items-center">
                  <People className="mr-1.5 text-gray-400" />
                  <div className="text-base font-bold text-gray-900">{group.youngsVolume}</div>
                </div>
                <div className="grow">
                  <div className="text-base font-bold text-gray-900">
                    De : {group.department} ({getDepartmentNumber(group.department)})
                  </div>
                  <div className="text-sm text-gray-500">{group.region}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center opacity-50">Aucun groupe pour l&apos;instant.</div>
          )}
        </div>

        <div className="mt-2 border-t border-t-gray-200 pt-4 align-middle">
          <People className="mr-1.5 mb-[5px] inline-block text-gray-400" />
          <span className="text-base font-bold text-gray-900">{center.affectedYoungs} volontaires accueillis&nbsp;</span>
          <span className="text-sm text-gray-500"> / {center.placesTotal} places</span>
        </div>
      </div>
    </div>
  );
}
