import React, { useEffect, useState } from "react";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import None from "../../../assets/icons/None";
import Badge from "../../../components/Badge";
import Loader from "../../../components/Loader";
import { Filters, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import api from "../../../services/api";
import { YOUNG_STATUS_COLORS, formatDateFR, getAge, translatePhase1 } from "../../../utils";
import Panel from "../../volontaires/panel";

export default function General({ updateFilter, focusedSession, filterArray }) {
  const [young, setYoung] = useState();

  //List state
  const pageId = "pointage-list";
  const [data, setData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });

  useEffect(() => {
    updateFilter(selectedFilters);
  }, [selectedFilters]);

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  if (!focusedSession) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div className="relative flex-1">
            <div className="mx-4">
              <div className="flex w-full flex-row justify-between">
                <Filters
                  pageId={pageId}
                  route={`/elasticsearch/young/by-session/${focusedSession._id}/search`}
                  setData={(value) => setData(value)}
                  filters={filterArray}
                  searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                />
              </div>
              <div className="mt-2 flex flex-row flex-wrap items-center">
                <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
                <SelectedFilters
                  filterArray={filterArray}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                />
              </div>
            </div>
            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              render={
                <table className="mt-6 w-full">
                  <thead className="">
                    <tr className="border-y-[1px] border-gray-100 text-xs uppercase text-gray-400">
                      <th className="py-3 pl-4">Volontaire</th>
                      <th className="">Présence à l&apos;arrivée</th>
                      <th className="">Présence JDM</th>
                      <th className="">Départ</th>
                      <th className="">Fiche Sanitaire</th>
                      <th className="">Statut phase 1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((hit) => (
                      <Line key={hit._id} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} />
                    ))}
                  </tbody>
                </table>
              }
            />
          </div>
        </div>
      </div>
      <Panel
        value={young}
        onChange={() => {
          setYoung(null);
        }}
      />
    </div>
  );
}

const Line = ({ hit, onClick, selected }) => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  const bgColor = selected && "bg-snu-purple-300";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  return (
    <tr className={`${!selected && "hover:!bg-gray-100"}`} onClick={onClick}>
      <td className={`${bgColor} ml-2 rounded-l-lg py-3 pl-4`}>
        <div>
          <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.firstName} ${hit.lastName}`}</div>
          <div className={`text-xs font-normal ${secondTextColor}`}>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </div>
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`text-xs font-normal ${mainTextColor}`}>
          {!value.cohesionStayPresence && <span className="italic text-gray-400">Non renseignée</span>}
          {value.cohesionStayPresence === "true" && "Présent"}
          {value.cohesionStayPresence === "false" && "Absent"}
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`text-xs font-normal ${mainTextColor}`}>
          {!value.presenceJDM && <span className="italic text-gray-400">Non renseignée</span>}
          {value.presenceJDM === "true" && "Présent"}
          {value.presenceJDM === "false" && "Absent"}
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`text-xs font-normal ${mainTextColor}`}>
          {value.departSejourAt ? (
            <div className="flex cursor-pointer items-center gap-1">
              <ArrowCircleRight className="text-gray-400" />
              <div>{!value.departSejourAt ? "Renseigner un départ" : formatDateFR(value.departSejourAt)}</div>
            </div>
          ) : (
            <None className="text-gray-500" />
          )}
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`text-xs font-normal ${mainTextColor}`}>
          {!value.cohesionStayMedicalFileReceived && <span className="italic text-gray-400">Non renseignée</span>}
          {value.cohesionStayMedicalFileReceived === "true" && "Réceptionnée"}
          {value.cohesionStayMedicalFileReceived === "false" && "Non réceptionnée"}
        </div>
      </td>
      <td className={`${bgColor} rounded-r-lg`}>
        <div>
          <Badge text={translatePhase1(value.statusPhase1)} color={YOUNG_STATUS_COLORS[value.statusPhase1]} />
        </div>
      </td>
    </tr>
  );
};
