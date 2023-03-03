import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

export default function test() {
  const history = useHistory();

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <div className="py-2 px-3 bg-blue-600 text-white w-fit cursor-pointer rounded" onClick={() => history.push("/filters/volontaire")}>
          Test Volontaire
        </div>

        <div className="py-2 px-3 bg-blue-600 text-white w-fit cursor-pointer rounded" onClick={() => history.push("/filters/custom")}>
          Test Custom
        </div>

        <div className="py-2 px-3 bg-blue-600 text-white w-fit cursor-pointer rounded" onClick={() => history.push("/filters/customComponent")}>
          Test Custom Component
        </div>
      </div>
    </>
  );
}
