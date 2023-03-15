import React from "react";
import Iceberg from "../../../../../assets/Iceberg.js";

export function LieuAffectation({ center }) {
  return (
    <div className="bg-gray-100 md:bg-gray-50 rounded-2xl flex p-4 gap-4 md:w-auto justify-between items-center h-fit">
      <article className="md:order-last">
        <h1 className="font-semibold text-xl leading-7">Votre lieu d&apos;affectation</h1>
        <p className="text-sm leading-5 text-gray-700">
          {center?.name}, {center?.city}
          <br />({center?.zip}), {center?.department}
        </p>
      </article>
      <Iceberg className="w-10 h-10 md:w-16 md:h-16" />
    </div>
  );
}
