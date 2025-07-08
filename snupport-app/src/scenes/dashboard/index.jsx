import React, { useState } from "react";
import { HiOutlineCollection, HiOutlineTicket } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import KnowledgeBase from "./components/KnowledgeBase";

import SectionFeedback from "./components/SectionFeedback";
import SectionSource from "./components/SectionSource";
import SectionTags from "./components/SectionTags";
import TabButton from "./components/TabButton";
import TicketActivities from "./components/TicketActivities";

import TimeFilter from "./components/TimeFilter";

const Dashboard = () => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const messageTicketName = user.role === "AGENT" ? "tickets" : "messages";
  const [currentTab, setCurrentTab] = useState(0);
  const [timePeriod, setTimePeriod] = useState("7");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  return (
    <div className="flex-1 overflow-y-auto px-20 py-12">
      <div className="mb-[50px] flex items-center justify-between">
        <div>
          <span className="text-sm font-medium uppercase text-gray-500">tableau de bord</span>
          <h4 className="mt-1.5 text-3xl font-bold text-black-dark">{`Bonjour ${user?.firstName} 👋`}</h4>
        </div>
        <div className="flex">
          <TabButton
            isActive={currentTab === 0}
            name={`${messageTicketName}`}
            icon={<HiOutlineTicket />}
            onClick={() => {
              setCurrentTab(0);
            }}
          />
          {user.role === "AGENT" && (
            <TabButton
              isActive={currentTab === 1}
              name="base de connaissance"
              icon={<HiOutlineCollection />}
              onClick={() => {
                setCurrentTab(1);
              }}
            />
          )}
        </div>
      </div>

      {currentTab === 0 && (
        <div className="flex flex-col gap-[70px]">
          <div className="flex flex-1 items-center rounded-lg bg-white py-[26px] px-6 shadow">
            <TimeFilter timePeriod={timePeriod} setTimePeriod={setTimePeriod} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
          </div>
          <TicketActivities messageTicketName={messageTicketName} user={user} timePeriod={timePeriod} startDate={startDate} endDate={endDate} />
          {user.role === "AGENT" && <SectionFeedback timePeriod={timePeriod} startDate={startDate} endDate={endDate} />}
          <SectionTags history={history} user={user} timePeriod={timePeriod} startDate={startDate} endDate={endDate} />
          {user.role === "AGENT" && <SectionSource history={history} timePeriod={timePeriod} startDate={startDate} endDate={endDate} />}
        </div>
      )}
      {user.role === "AGENT" && currentTab === 1 && <KnowledgeBase />}
    </div>
  );
};

export default Dashboard;
