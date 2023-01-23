import React, { useEffect, useState } from "react";

import HistoricComponent from "../../../components/views/Historic2";
import UserHeader from "../composants/UserHeader";
import { formatHistory } from "../../../utils";
import API from "../../../services/api";
import Loader from "../../../components/Loader";

export default function Edit({ user, currentUser }) {
  const [data, setData] = useState([]);
  const formattedData = formatHistory(data, user.role);
  const getPatches = async () => {
    try {
      const { ok, data } = await API.get(`/referent/${user._id}/patches`);
      if (!ok) return;
      setData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?._id) getPatches();
  }, [user]);

  return (
    <>
      <UserHeader user={user} currentUser={currentUser} tab="historique" />
      <div className="p-[30px]">{!data?.length ? <Loader /> : <HistoricComponent model="referent" data={formattedData} />}</div>
    </>
  );
}
