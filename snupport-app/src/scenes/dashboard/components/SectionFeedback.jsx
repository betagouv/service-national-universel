import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { classNames } from "../../../utils";
import { arrow } from "../utils";

const SectionFeedback = ({ timePeriod, startDate, endDate }) => {
  const [neutralFeedbacks, setNeutralFeedbacks] = useState(0);
  const [wowFeedbacks, setWowFeedbacks] = useState(0);
  const [thanksFeedbacks, setThanksFeedbacks] = useState(0);
  const [unhappyFeedbacks, setUnhappyFeedbacks] = useState(0);

  useEffect(() => {
    update();
  }, [timePeriod, startDate, endDate]);

  async function update() {
    const { ok, data } = await API.post({ path: `/ticket/stats/feedback`, body: { period: timePeriod, startDate, endDate } });
    if (ok) {
      let feedbackObject = {
        WOW: 0,
        THANKS: 0,
        NEUTRAL: 0,
        UNHAPPY: 0,
      };
      data.forEach((feedback) => {
        feedbackObject[feedback._id] = feedback.count;
      });
      setWowFeedbacks(feedbackObject.WOW);
      setThanksFeedbacks(feedbackObject.THANKS);
      setNeutralFeedbacks(feedbackObject.NEUTRAL);
      setUnhappyFeedbacks(feedbackObject.UNHAPPY);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h6 className="text-xl font-bold text-gray-900">Satisfaction utilisateurs</h6>
      <div className="grid grid-cols-4 gap-5">
        <Card icon="😍" title="WOW" value={wowFeedbacks} isPositive={true} percentage="0" />
        <Card icon="😁" title="Merci" value={thanksFeedbacks} isPositive={true} percentage="0" />
        <Card icon="😞" title="Mécontent" value={unhappyFeedbacks} isPositive={false} percentage="0" />
        <Card icon="😶" title="Neutre" value={neutralFeedbacks} isPositive={true} percentage="0" />
      </div>
    </div>
  );
};

const Card = ({ icon, title, value, isPositive, percentage }) => (
  <div className="flex items-center rounded-lg bg-white p-6 shadow">
    <div className="mr-5 flex h-[44px] w-[44px] items-center justify-center rounded-md border border-[#D1D1D1] bg-white text-xl">{icon}</div>
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
);

export default SectionFeedback;
