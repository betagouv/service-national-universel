import React, { useEffect, useState } from "react";
import { HiOutlineChat, HiOutlineDesktopComputer, HiOutlineInbox, HiOutlineMail } from "react-icons/hi";
import API from "../../../services/api";
import { classNames } from "../../../utils";
import { arrow } from "../utils";

const SectionSource = ({ history, timePeriod, startDate, endDate }) => {
  const [sourceEmail, setSourceEmail] = useState(0);
  const [sourceEmailSpam, setSourceEmailSpam] = useState(0);
  const [sourcePlatform, setSourcePlatform] = useState(0);
  const [sourceChat, setSourceChat] = useState(0);
  const [sourceForm, setSourceForm] = useState(0);

  useEffect(() => {
    update();
  }, [timePeriod, startDate, endDate]);

  async function update() {
    const {
      ok,
      data: { sources, mailSpam },
    } = await API.post({ path: `/ticket/stats/source`, body: { period: timePeriod, startDate, endDate } });
    if (ok) {
      let sourceObject = {
        PLATFORM: 0,
        CHAT: 0,
        MAIL: 0,
        FORM: 0,
      };

      sources.forEach((source) => {
        sourceObject[source._id] = source.count;
      });
      setSourceEmail(sourceObject.MAIL);
      setSourcePlatform(sourceObject.PLATFORM);
      setSourceChat(sourceObject.CHAT);
      setSourceForm(sourceObject.FORM);
      setSourceEmailSpam(mailSpam);
    }
  }

  const Card = ({ icon, title, value, isPositive, percentage, search, info = "" }) => (
    <div className="flex cursor-pointer flex-col items-start rounded-lg bg-white py-[26px] px-6 shadow" onClick={() => history.push("/ticket?source=" + search)}>
      <div className="flex">
        <div className="mr-5 flex h-12 w-12 items-center justify-center rounded-md bg-purple-snu text-2xl text-white">{icon}</div>
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="flex items-center gap-2">
            <h5 className="text-2xl font-semibold text-gray-900">{value}</h5>
            <div className={classNames(isPositive ? "text-green-500" : "text-red-500", "flex items-center")}>
              <span className="text-base">{arrow(isPositive)}</span>
              <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
            </div>
          </div>
        </div>
      </div>
      <span className="self-end text-sm font-medium italic text-red-500">{info}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <h6 className="text-xl font-bold text-gray-900">Canaux d'émission</h6>
      <div className="grid grid-cols-4 gap-5">
        <Card icon={<HiOutlineMail />} title="E-mail" value={sourceEmail} isPositive={true} percentage="0" search={"MAIL"} info={`Dont spams : ${sourceEmailSpam}`} />
        <Card icon={<HiOutlineDesktopComputer />} title="Plateforme" value={sourcePlatform} isPositive={true} percentage="0" search={"PLATFORM"} />
        <Card icon={<HiOutlineChat />} title="Chat" value={sourceChat} isPositive={true} percentage="0" search={"CHAT"} />
        <Card icon={<HiOutlineInbox />} title="Formulaire" value={sourceForm} isPositive={true} percentage="0" search={"FORM"} />
      </div>
    </div>
  );
};

export default SectionSource;
