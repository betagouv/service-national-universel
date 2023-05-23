import React from "react";
import Iceberg from "../../../../../assets/Iceberg";

export default function CenterInfo({ center }) {
  return (
    <div className="my-2 flex h-fit items-center justify-between gap-4 rounded-2xl bg-gray-100 p-4 md:w-auto md:bg-gray-50">
      <article className="md:order-last">
        <h1 className="text-xl font-semibold leading-7">Votre lieu d&apos;affectation</h1>
        <p className="text-sm leading-5 text-gray-700">
          {center?.name}, {center?.city}
          <br />({center?.zip}), {center?.department}
        </p>
      </article>
      <Iceberg className="h-10 w-10 md:h-16 md:w-16" />
    </div>
  );
}
