import React from "react";
import CardMission from "./CardMission";
import Pagination from "../../../../components/nav/Pagination";

export default function MissionList({ data, location, page, setPage, size, setSize, setSort }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <p>
          {data?.total?.value} mission{data?.total?.value > 1 ? "s" : ""}
        </p>
        <select name="selectedSort" onChange={(e) => setSort(e.target.value)}>
          <option value="geo" defaultValue>
            La plus proche
          </option>
          <option value="recent">La plus récente</option>
          <option value="short">La plus courte</option>
          <option value="long">La plus longue</option>
        </select>
      </div>
      {data?.hits?.map((mission) => (
        <CardMission mission={mission} location={location} key={mission._id} />
      ))}
      <Pagination
        currentPageNumber={page}
        setCurrentPageNumber={setPage}
        itemsCountTotal={data.total.value}
        itemsCountOnCurrentPage={data.hits.length}
        size={size}
        setSize={setSize}
      />
    </div>
  );
}
