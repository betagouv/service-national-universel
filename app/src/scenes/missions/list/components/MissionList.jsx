import React from "react";
import CardMission from "./CardMission";
import Pagination from "../../../../components/nav/Pagination";

export default function MissionList({ data, page, setPage, total, location, setSort }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <p>
          {total} mission{total > 1 ? "s" : ""}
        </p>
        <select name="selectedSort" onChange={(e) => setSort(e.target.value)}>
          <option value="geo" defaultValue>
            La plus proche
          </option>
          <option value="date">La plus récente</option>
          <option value="short">La plus courte</option>
          <option value="long">La plus longue</option>
        </select>
      </div>
      {data?.hits?.map((mission) => (
        <CardMission mission={mission} location={location} key={mission._id} />
      ))}
      <Pagination currentPage={page} count={data.total.value} pageCount={data.total.value} itemsPerPage={20} itemsCount={data.hits.length} changePage={setPage} />
    </div>
  );
}
