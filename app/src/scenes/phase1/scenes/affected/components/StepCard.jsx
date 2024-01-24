import React from "react";
import { BsCheck2 } from "react-icons/bs";

export function StepCard({ state = "todo", stepNumber, children }) {
  if (state === "done") {
    return (
      <div className="w-full flex items-center -ml-4">
        <div className="translate-x-5 flex-none flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
          <BsCheck2 className="h-5 w-5 text-white" />
        </div>
        <div className="w-full bg-white rounded-xl border p-8">{children}</div>
      </div>
    );
  }

  if (state === "todo") {
    return (
      <div className="w-full flex items-center -ml-4">
        <div className="translate-x-5 flex-none flex h-9 w-9 items-center justify-center rounded-full bg-white border">{stepNumber}</div>
        <div className="w-full bg-white rounded-xl border p-8">{children}</div>
      </div>
    );
  }

  if (state === "disabled") {
    return (
      <div className="flex items-center">
        <div className="translate-x-5 flex-none flex h-9 w-9 items-center justify-center rounded-full border bg-white">
          <BsCheck2 className="h-5 w-5 text-gray-500" />
        </div>
        <div className="w-full bg-white rounded-xl border p-8">{children}</div>
      </div>
    );
  }
}
