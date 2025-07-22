import React, { useEffect, useState } from "react";
import { HiOutlineLogout, HiOutlineUsers } from "react-icons/hi";
import API from "../../../services/api";
import { capitalize } from "../utils";
import Card from "./Card";

const TicketActivities = ({ messageTicketName, timePeriod, startDate, endDate }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    update();
  }, [timePeriod, startDate, endDate]);

  async function update() {
    const { data } = await API.post({ path: `/ticket/stats/date`, body: { period: timePeriod, startDate, endDate } });
    setStats(data);
  }

  return (
    <div className="flex flex-col gap-5">
      <h6 className="text-xl font-bold text-gray-900">{`L’activité  ${messageTicketName} en quelques chiffres`}</h6>
      <div className="flex justify-between gap-10">
        <Card
          icon={<HiOutlineUsers />}
          title={`Nouveaux ${messageTicketName}`}
          value={stats?.ticketsCreated}
          isPositive={true}
          percentage="0"
          info={stats?.ticketsCreatedSpam && `Dont spams : ${stats?.ticketsCreatedSpam}`}
        />
        <Card
          icon={<HiOutlineLogout />}
          title={`${capitalize(messageTicketName)} "fermés"}`}
          value={stats?.ticketsClosed}
          isPositive={true}
          percentage="0"
          info={stats?.ticketsClosedSpam && `Dont spams : ${stats?.ticketsClosedSpam}`}
        />
      </div>
    </div>
  );
};

export default TicketActivities;
