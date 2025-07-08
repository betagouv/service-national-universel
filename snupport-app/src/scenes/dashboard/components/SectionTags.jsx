import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { classNames } from "../../../utils";
import { arrow } from "../utils";

const SectionTags = ({ history, user, timePeriod, startDate, endDate }) => {
  const [tags, setTags] = useState([{}]);

  useEffect(() => {
    update();
  }, [timePeriod, startDate, endDate]);

  async function update() {
    const { data } = await API.post({ path: "/ticket/stats/tags", body: { period: timePeriod, startDate, endDate }, query: { source: "dashboard" } });
    setTags(data);
  }

  const Card = ({ tag, value, isPositive, percentage }) => (
    <div
      className={`flex ${user.role === "AGENT" && "cursor-pointer"} flex-col divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow`}
      onClick={() => {
        if (user.role === "AGENT") history.push("/ticket?tagId=" + tag.key);
      }}
    >
      <div className="flex flex-col px-4 pt-5 pb-3">
        <div className="mb-1 h-max w-max rounded-md bg-purple-100 py-1.5 px-2.5 text-sm font-medium text-purple-800">{tag.name}</div>
        <div className="flex items-center gap-2 pl-2">
          <h5 className="text-2xl font-semibold text-gray-900">{value}</h5>
          <div className={classNames(isPositive ? "text-green-500" : "text-red-500", "flex items-center")}>
            <span className="text-base">{arrow(isPositive)}</span>
            <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <h6 className="text-xl font-bold text-gray-900">Top 12 des sujets</h6>
      <div className="grid grid-cols-4 gap-5">
        {tags?.slice(0, 12)?.map((tag, index) => (
          <Card key={tag.key + index} tag={tag} value={tag.doc_count} isPositive={tag.percentage >= 0 ? true : false} percentage={tag.percentage} />
        ))}
      </div>
    </div>
  );
};

export default SectionTags;
