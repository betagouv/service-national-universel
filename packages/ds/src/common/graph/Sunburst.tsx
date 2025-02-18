import React from "react";
import { Sunburst as NSunburst } from "@nivo/sunburst";

type SunburstData = {
  value?: string | number;
  label?: string;
  name: string;
  color?: string;
  textColor?: string;
  index?: number;
  children?: SunburstData[];
};

export type SunburstProps = {
  readonly data: { name: string; children: SunburstData[] };
  readonly width?: number;
  readonly height?: number;
  readonly isPourcent?: boolean;
};

const COLORS_THEME = [
  "rgb(232, 193, 160)",
  "rgb(244, 117, 96)",
  "rgb(241, 225, 91)",
  "rgb(232, 168, 56)",
  "rgb(97, 205, 187)",
  "rgb(151, 227, 213)",
  "rgb(141, 211, 199)",
  "rgb(255, 255, 179)",
  "rgb(190, 186, 218)",
  "rgb(251, 128, 114)",
  "rgb(128, 177, 211)",
  "rgb(253, 180, 98);",
  "rgb(179, 222, 105)",
  "rgb(252, 205, 229)",
  "rgb(217, 217, 217)",
  "rgb(188, 128, 189)",
  "rgb(204, 235, 197)",
  "rgb(255, 237, 111)",
];

const generateColor = (index: number = 0) => {
  return COLORS_THEME[index % COLORS_THEME.length];
};

export const Sunburst = ({
  width = 900,
  height = 500,
  data,
  // isPourcent,
}: SunburstProps) => {
  // NivoPie requires an id

  return (
    <NSunburst<SunburstData>
      width={width}
      height={height}
      margin={{ top: 24, right: 24, bottom: 80, left: 80 }}
      id="name"
      value="value"
      data={data}
      childColor={(parent, child) => {
        return child.data.color || generateColor(child.data.index);
      }}
      arcLabelsTextColor={(d) => d.data.textColor || "black"}
      tooltip={({ id, value }) => (
        <div className="bg-white p-2 border border-gray-200 rounded">
          {id}: {value}
        </div>
      )}
      // @ts-ignore
      colors={data.children?.map(({ color }) => color)}
      enableArcLabels
      arcLabel={(d) => d.data.label || `${d.id} (${d.value})`}
      animate={false}
    />
  );
};
