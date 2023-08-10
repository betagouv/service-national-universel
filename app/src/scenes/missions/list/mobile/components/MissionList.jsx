import React from "react";
import CardMission from "./CardMission";
import Pagination from "../../../../../components/nav/Pagination";

export default function MissionList({ missions, page, setPage, total, location, setSort }) {
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
      {missions?.map((mission) => (
        <CardMission mission={mission} location={location} key={mission._id} />
      ))}
      <Pagination currentPage={page} count={total} pageCount={total} itemsPerPage={20} itemsCount={missions.length} changePage={setPage} />
    </div>
  );
}
