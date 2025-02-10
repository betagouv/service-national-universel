import React from "react";
import { PieCanvas as NPie } from "@nivo/pie";

export type PieProps = {
  readonly data: Array<{
    value: string | number;
    label: string;
    color: string;
  }>;
  readonly width?: number;
  readonly height?: number;
  readonly isPourcent?: boolean;
};

export const Pie = ({
  width = 900,
  height = 500,
  data: pData = [],
  isPourcent,
}: PieProps) => {
  // NivoPie requires an id
  const data = pData.map((rest) => ({ id: rest.label, ...rest }));

  return (
    <NPie
      width={width}
      height={height}
      margin={{ top: 24, right: 24, bottom: 80, left: 80 }}
      activeOuterRadiusOffset={8}
      data={data}
      colors={data.map(({ color }) => color)}
      padAngle={2}
      valueFormat={(value) =>
        isPourcent ? `${(value * 100).toFixed(2)}%` : value?.toString()
      }
    />
  );
};
