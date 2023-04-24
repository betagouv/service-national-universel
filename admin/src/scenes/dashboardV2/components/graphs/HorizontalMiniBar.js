import React, { useEffect, useState } from "react";
import { Legends } from "./graph-commons";

export default function HorizontalMiniBar({ title, values, labels, legendUrls, className = "", onLegendClicked = () => {} }) {
  const [total, setTotal] = useState(0);
  const [barStyle, setBarStyle] = useState({});
  const [formattedLabels, setFormattedLabels] = useState(labels);

  useEffect(() => {
    if (values && values.length > 0) {
      const total = values.reduce((acc, val) => acc + val, 0);
      if (total > 0) {
        setTotal(total);

        const percent = Math.round((values[0] / total) * 100);
        setBarStyle({
          width: percent + "%",
        });

        setFormattedLabels(
          labels.map((lab, idx) => {
            if (idx === 0) {
              return lab;
            } else {
              return lab + " (" + Math.round((values[idx] / total) * 100) + "%)";
            }
          }),
        );
      } else {
        setTotal(0);
        setBarStyle({});
        setFormattedLabels(labels);
      }
    } else {
      setTotal(0);
      setBarStyle({});
    }
  }, [values]);

  return (
    <div className={`relative px-8 py-6 ${className}`}>
      <div className="bg-blue-100 rounded p-1.5 text-blue-600 text-xs font-bold absolute top-[16px] right-[16px]">{total} AU TOTAL</div>
      <div className="text-base text-gray-900 font-bold">{title}</div>
      <div className="bg-gray-100 rounded-full h-[6px] my-2.5">
        <div className="bg-blue-700 rounded-full h-[6px] w-[0%]" style={barStyle} />
      </div>
      <div className="">
        <Legends className="" legendUrls={legendUrls} onLegendClicked={onLegendClicked} values={values} labels={formattedLabels} />
      </div>
    </div>
  );
}
