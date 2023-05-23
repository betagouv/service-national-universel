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
      <div className="absolute top-[16px] right-[16px] rounded bg-blue-100 p-1.5 text-xs font-bold text-blue-600">{total} AU TOTAL</div>
      <div className="text-base font-bold text-gray-900">{title}</div>
      <div className="my-2.5 h-[6px] rounded-full bg-gray-100">
        <div className="h-[6px] w-[0%] rounded-full bg-blue-700" style={barStyle} />
      </div>
      <div className="">
        <Legends className="" legendUrls={legendUrls} onLegendClicked={onLegendClicked} values={values} labels={formattedLabels} />
      </div>
    </div>
  );
}
