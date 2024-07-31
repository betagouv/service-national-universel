import Img2 from "../../../assets/JVA_round.png";
import Img from "../../../assets/logo-snu.png";
import React, { useState } from "react";
import Panel from "../../missions/panel";
import StructureViewV2 from "./wrapperv2";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { translate, translateMission, translateVisibilty } from "snu-lib";
import Loader from "../../../components/Loader";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "../../../components/filters-system-v2";
import api from "../../../services/api";
import { formatStringDateTimezoneUTC } from "snu-lib";
import SelectStatusMissionV2 from "../../missions/components/SelectStatusMissionV2";

export default function Mission({ ...props }) {
  const [mission, setMission] = useState();
  const [structure, setStructure] = useState(null);

  //List state
  const [data, setData] = useState([]);
  const pageId = "missions-list-structure";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  React.useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/structure/${id}`);
      setStructure(data);
    })();
  }, [props.match.params.id]);

  //Filters
  const filterArray = [
    {
      title: "Statut",
      name: "status",
      translate: (e) => translate(e),
    },
    {
      title: "Visibilité",
      name: "visibility",
      translate: (value) => translateVisibilty(value),
    },
    {
      title: "Places restantes",
      name: "placesLeft",
    },
    {
      title: "Tuteur",
      name: "tutorName",
    },
    {
      title: "Place occupées",
      name: "placesStatus",
      translate: (value) => translateMission(value),
      missingLabel: "Non renseigné",
    },
  ];

  if (!structure) return <Loader />;

  return (
    <div className="flex w-full">
      <StructureViewV2 tab="missions" structure={structure}>
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route={`/elasticsearch/mission/by-structure/${structure._id}/search`}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par mots clés, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
            />
            <SortOption
              sortOptions={[
                { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                { label: "Nombre de place (croissant)", field: "placesLeft", order: "asc" },
                { label: "Nombre de place (décroissant)", field: "placesLeft", order: "desc" },
                { label: "Nom de la mission (A > Z)", field: "name.keyword", order: "asc" },
                { label: "Nom de la mission (Z > A)", field: "name.keyword", order: "desc" },
              ]}
              selectedFilters={selectedFilters}
              pagination={paramData}
              onPaginationChange={setParamData}
            />
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center px-4">
            <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
            <SelectedFilters
              filterArray={filterArray}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>
          <ResultTable
            paramData={paramData}
            setParamData={setParamData}
            currentEntryOnPage={data?.length}
            size={size}
            setSize={setSize}
            render={
              <div className="mt-6 mb-2 flex w-full flex-col divide-y divide-gray-100 border-y-[1px] border-gray-100">
                <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 ">
                  <div className="w-[40%]">Mission</div>
                  <div className="w-[5%]"></div>
                  <div className="w-[15%]">Places</div>
                  <div className="w-[20%]">Dates</div>
                  <div className="w-[20%]">Statut</div>
                </div>
                {data.map((hit) => (
                  <Hit
                    key={hit._id}
                    hit={hit}
                    callback={(e) => {
                      if (e._id === mission?._id) setMission(e);
                    }}
                  />
                ))}
              </div>
            }
          />
        </div>
      </StructureViewV2>
      <Panel
        mission={mission}
        onChange={() => {
          setMission(null);
        }}
      />
    </div>
  );
}

const Hit = ({ hit, callback }) => {
  const history = useHistory();
  const onChangeStatus = (e) => {
    callback(e);
  };
  return (
    <>
      <div className="flex items-center py-3 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/mission/${hit._id}`)}>
          {hit.isJvaMission === "true" ? <img src={Img2} className="mx-auto h-7 w-7 group-hover:scale-105" /> : <img src={Img} className="mx-auto h-7 w-7 group-hover:scale-105" />}
          <div className="flex w-full flex-col gap-1">
            <p className="w-10/12 truncate font-bold leading-6 text-gray-900">{hit.name}</p>
            <p className="text-sm font-normal leading-4 text-gray-500">
              {hit.address} • {hit.city} ({hit.department})
            </p>
          </div>
        </div>
        <div className="w-[5%]">
          {hit?.visibility === "HIDDEN" && (
            <div className="group relative cursor-pointer">
              <HiOutlineLockClosed size={20} className="text-gray-400" />
              <div className="absolute bottom-[calc(100%+15px)] left-[50%] z-10 hidden min-w-[275px] translate-x-[-58%] rounded-xl bg-white px-3 py-2.5 text-center text-xs leading-5 text-gray-600 drop-shadow-xl group-hover:block">
                <div className="absolute left-[50%] bottom-[-5px] h-[15px] w-[15px] translate-x-[-50%] rotate-45 bg-white"></div>
                La mission est <strong>fermée</strong> aux candidatures
              </div>
            </div>
          )}
        </div>

        <div className="flex w-[15%] flex-col gap-2">
          <p className="text-sm font-normal leading-none text-gray-900">{hit.placesLeft} places(s)</p>
          <p className="text-sm font-normal leading-none text-gray-500">
            sur <span className="text-gray-900">{hit.placesTotal}</span>
          </p>
        </div>
        <div className="flex w-[20%] flex-col gap-2 text-sm font-normal leading-none text-gray-500">
          <p>
            Du <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.startAt)}</span>
          </p>
          <p>
            Au <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.endAt)}</span>
          </p>
        </div>
        <div className="w-[20%]">
          <SelectStatusMissionV2 hit={hit} callback={onChangeStatus} />
        </div>
      </div>
    </>
  );
};
