import React, { useEffect, useState } from "react";
import { graphColors } from "./graph-commons";

export default function HorizontalBar({ title, values, labels, goal, className = "" }) {
  const [bars, setBars] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPercent, setTotalPercent] = useState(0);
  const [x100, setX100] = useState(null);

  useEffect(() => {
    if (values && values.length > 0) {
      const total = values.reduce((value, originalValue) => value + originalValue, 0);
      setTotal(total);
      setTotalPercent(Math.round((total / goal) * 100));

      const colors = graphColors[values.length];
      setBars(
        values.map((value, idx) => {
          return {
            color: colors[idx],
            label: labels[idx],
            value,
            percent: Math.round((value / goal) * 100),
            width: Math.min(Math.round((value / Math.max(total, goal)) * 100), 100),
          };
        }),
      );

      if (total > goal) {
        setX100(Math.round((goal / total) * 100));
      } else {
        setX100(null);
      }
    } else {
      setBars([]);
      setTotal(0);
      setTotalPercent(0);
      setX100(null);
    }
  }, [values]);

  return (
    <div className={` ${className}`}>
      <div className="flex justify-between mb-4">
        {title && (
          <div className="text-base font-bold text-gray-900">
            {title} : {goal}
          </div>
        )}
        <div className="font-medium text-base text-gray-900 text-right">
          <span>Total :</span> <span className="font-bold">{totalPercent}%</span> <span className="text-[#9CA3AF] font-normal">({total})</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-[31px] rounded-full bg-gray-100 overflow-hidden">
          {bars.map((bar, idx) => (
            <div className="inline-block h-[100%]" style={{ width: bar.width + "%", backgroundColor: bar.color }} key={"bar-" + idx}></div>
          ))}
        </div>
        {x100 && (
          <div className="border-[1px] border-white bg-red-600 w-[5px] rounded-full absolute top-[-4px] bottom-[-4px]" style={{ left: x100 + "%" }}>
            <div className="absolute bg-red-600 text-white text-[8px] font-bold py-[2px] px-1 border-[1px] border-white rounded-[4px] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
              100%
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between mr-8 last:mr-0">
        {bars.map((bar, idx) => (
          <div key={"legend-" + idx}>
            <div className="flex">
              <div className="rounded-full w-[12px] h-[12px] mr-2" style={{ backgroundColor: bar.color }}></div>
              <div>
                <div className="text-base font-bold text-gray-900">{bar.percent}%</div>
                <div className="text-sm text-gray-600 font-medium">{bar.label}</div>
                <div className="text-sm text-[#9CA3AF]">({bar.value})</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
