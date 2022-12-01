import React, { useEffect, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { Badge, Box, Loading } from "../components/commons";
import People from "../../../assets/icons/People";
import IcebergColor from "../../../assets/icons/IcebergColor";
import { capture } from "../../../sentry";
import api from "../../../services/api";

export default function SchemaDepartmentDetail({ departmentData, cohort, department, className }) {
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
      const result = await api.get(`/schema-de-repartition/department-detail/${department}/${cohort}`);
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
      <div className="text-gray-800 text-lg font-bold mb-2 text-center">Masquer les volontaires accueillis en {department}</div>
      <div className="flex items-center justify-center">
        <div
          className="w-[38px] h-[38px] bf-[#FFFFFF] shadow rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-700 hover:text-[#FFFFFF] cursor-pointer"
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
                  <span className="text-2xl text-[#171725] font-bold">{data.affectedYoungs}</span>
                )}
              </div>
            </Box>
            <Box className="grow mx-4">
              <div className="mb-2">Places disponibles</div>
              <div className="flex items-center">
                {loading ? (
                  <Loading width="w-100" />
                ) : error ? (
                  <span className="text-[#DC5318]">{error}</span>
                ) : (
                  <span className="text-2xl text-[#171725] font-bold">{data.placesLeft}</span>
                )}
              </div>
            </Box>
            <Box className="grow">
              <div className="mb-2">Centres en {department}</div>
              {loading ? (
                <Loading width="w-100" />
              ) : error ? (
                <span className="text-[#DC5318]">{error}</span>
              ) : (
                <div className="flex items-center">
                  <span className="text-2xl text-[#171725] font-bold mr-2">{data.centers.length}</span>
                  <Badge>{data.placesTotal > 1 ? data.placesTotal + " places" : data.placesTotal + " place"}</Badge>
                </div>
              )}
            </Box>
          </div>
          <Box className="mt-4">
            <div className="border-b border-b-gray-200 text-lg text-gray-900 py-4">Détail des affectations</div>
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
      <div className="shadow p-4">
        <div className="flex items-start pb-4 border-b border-b-gray-200 mb-2">
          <IcebergColor className="w-[38px] h-[36px] mr-4" />
          <div className="grow">
            <div className="text-base text-gray-900 font-bold">{center.name}</div>
            <div className="text-sm text-gray-500">
              {center.city} • {center.department}
            </div>
          </div>
        </div>

        <div className="">
          {center.groups &&
            center.groups.map((group, index) => (
              <div key={"group-" + index} className="flex items-center mb-3">
                <div className="flex items-center mr-7 w-[50px]">
                  <People className="text-gray-400 mr-1.5" />
                  <div className="text-base text-gray-900 font-bold">{group.youngsVolume}</div>
                </div>
                <div className="grow">
                  <div className="text-base text-gray-900 font-bold">De : {group.department}</div>
                  <div className="text-sm text-gray-500">{group.region}</div>
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center pt-4 border-t border-t-gray-200 mt-2">
          <People className="text-gray-400 mr-1.5" />
          <div className="text-base text-gray-900 font-bold">{center.affectedYoungs} volontaires accueillis&nbsp;</div>
          <div className="text-sm text-gray-500"> / {center.placesTotal} places</div>
        </div>
      </div>
    </div>
  );
}
