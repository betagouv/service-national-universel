import React from "react";
import { useSelector } from "react-redux";
import CardMission from "./CardMission";
import Pagination from "../../../../../components/nav/Pagination";

export default function MissionList({ missions, page, setPage, total }) {
  const young = useSelector((state) => state.Auth.young);
  return (
    <div className="p-3">
      <Pagination currentPage={page} count={total} pageCount={total} itemsPerPage={20} itemsCount={missions.length} changePage={setPage} className="my-4" />
      {missions?.map((mission) => (
        <CardMission mission={mission._source} key={mission._id} youngLocation={young?.location} />
      ))}
    </div>
  );
}
