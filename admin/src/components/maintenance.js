import React from "react";
import { GoTools } from "react-icons/go";

export default function Maintenance() {
  return (
    <div className="flex items-center m-4">
      <div className="bg-yellow-50 p-3 rounded-lg shadow-sm ">
        <div className="flex space-x-2 items-center ">
          <GoTools className="text-yellow-600 text-base" />
          <h5 className="text-yellow-600 text-base">MAINTENANCE</h5>
        </div>
        <div className="text-yellow-900  pt-2 text-sm">
          Le site est actuellement en maintenance suite à un problème technique sur la plateforme. Nous faisons notre possible pour rétablir la situation.
        </div>
      </div>
    </div>
  );
}
