import React from "react";
import { Container } from "@snu/ds/admin";
import TW_COLORS from "tailwindcss/colors";

export default function Colors() {
  const colors = [
    {
      title: "Deep Blue",
      textShadow: "#0C1035",
      shades: [
        "bg-deep-blue-900",
        "bg-deep-blue-800",
        "bg-deep-blue-700",
        "bg-deep-blue-600",
        "bg-deep-blue-500",
        "bg-deep-blue-400",
        "bg-deep-blue-300",
        "bg-deep-blue-200",
        "bg-deep-blue-100",
        "bg-deep-blue-50",
      ],
    },
    {
      title: "Gray",
      textShadow: TW_COLORS.gray[900],
      shades: ["bg-gray-900", "bg-gray-800", "bg-gray-700", "bg-gray-600", "bg-gray-500", "bg-gray-400", "bg-gray-300", "bg-gray-200", "bg-gray-100", "bg-gray-50"],
    },
    {
      title: "Red",
      textShadow: TW_COLORS.red[900],
      shades: ["bg-red-900", "bg-red-800", "bg-red-700", "bg-red-600", "bg-red-500", "bg-red-400", "bg-red-300", "bg-red-200", "bg-red-100", "bg-red-50"],
    },
    {
      title: "Orange",
      textShadow: TW_COLORS.orange[900],
      shades: [
        "bg-orange-900",
        "bg-orange-800",
        "bg-orange-700",
        "bg-orange-600",
        "bg-orange-500",
        "bg-orange-400",
        "bg-orange-300",
        "bg-orange-200",
        "bg-orange-100",
        "bg-orange-50",
      ],
    },
    {
      title: "Amber",
      textShadow: TW_COLORS.amber[900],
      shades: ["bg-amber-900", "bg-amber-800", "bg-amber-700", "bg-amber-600", "bg-amber-500", "bg-amber-400", "bg-amber-300", "bg-amber-200", "bg-amber-100", "bg-amber-50"],
    },
    {
      title: "Emerald",
      textShadow: TW_COLORS.emerald[900],
      shades: [
        "bg-emerald-900",
        "bg-emerald-800",
        "bg-emerald-700",
        "bg-emerald-600",
        "bg-emerald-500",
        "bg-emerald-400",
        "bg-emerald-300",
        "bg-emerald-200",
        "bg-emerald-100",
        "bg-emerald-50",
      ],
    },
    {
      title: "Teal",
      textShadow: TW_COLORS.teal[900],
      shades: ["bg-teal-900", "bg-teal-800", "bg-teal-700", "bg-teal-600", "bg-teal-500", "bg-teal-400", "bg-teal-300", "bg-teal-200", "bg-teal-100", "bg-teal-50"],
    },
    {
      title: "Cyan",
      textShadow: TW_COLORS.cyan[900],
      shades: ["bg-cyan-900", "bg-cyan-800", "bg-cyan-700", "bg-cyan-600", "bg-cyan-500", "bg-cyan-400", "bg-cyan-300", "bg-cyan-200", "bg-cyan-100", "bg-cyan-50"],
    },
    {
      title: "Sky",
      textShadow: TW_COLORS.sky[900],
      shades: ["bg-sky-900", "bg-sky-800", "bg-sky-700", "bg-sky-600", "bg-sky-500", "bg-sky-400", "bg-sky-300", "bg-sky-200", "bg-sky-100", "bg-sky-50"],
    },
    {
      title: "Blue",
      textShadow: TW_COLORS.blue[900],
      shades: ["bg-blue-900", "bg-blue-800", "bg-blue-700", "bg-blue-600", "bg-blue-500", "bg-blue-400", "bg-blue-300", "bg-blue-200", "bg-blue-100", "bg-blue-50"],
    },
    {
      title: "Indigo",
      textShadow: TW_COLORS.indigo[900],
      shades: [
        "bg-indigo-900",
        "bg-indigo-800",
        "bg-indigo-700",
        "bg-indigo-600",
        "bg-indigo-500",
        "bg-indigo-400",
        "bg-indigo-300",
        "bg-indigo-200",
        "bg-indigo-100",
        "bg-indigo-50",
      ],
    },
    {
      title: "Violet",
      textShadow: TW_COLORS.violet[900],
      shades: [
        "bg-violet-900",
        "bg-violet-800",
        "bg-violet-700",
        "bg-violet-600",
        "bg-violet-500",
        "bg-violet-400",
        "bg-violet-300",
        "bg-violet-200",
        "bg-violet-100",
        "bg-violet-50",
      ],
    },
    {
      title: "Pink",
      textShadow: TW_COLORS.pink[900],
      shades: ["bg-pink-900", "bg-pink-800", "bg-pink-700", "bg-pink-600", "bg-pink-500", "bg-pink-400", "bg-pink-300", "bg-pink-200", "bg-pink-100", "bg-pink-50"],
    },
    {
      title: "Rose",
      textShadow: TW_COLORS.rose[900],
      shades: ["bg-rose-900", "bg-rose-800", "bg-rose-700", "bg-rose-600", "bg-rose-500", "bg-rose-400", "bg-rose-300", "bg-rose-200", "bg-rose-100", "bg-rose-50"],
    },
  ];

  return (
    <Container title="Colors">
      <div className="flex items-start justify-between">
        {colors.map((c) => (
          <div key={c.title} className="flex flex-col items-stretch justify-start mb-6 mr-2">
            <h1 className="font-bold text-sm text-center capitalize">{c.title}</h1>
            <div className="flex flex-col items-stretch justify-start min-w-[100px]">
              {c.shades.map((shade) => (
                <div
                  key={shade}
                  className={`flex items-center justify-center my-1 w-full h-8 font-bold text-base ${shade} text-white tracking-wide rounded-lg`}
                  style={{ textShadow: `0 0 4px ${c.textShadow}` }}>
                  {shade.split("-").pop()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
