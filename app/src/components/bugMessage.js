import React from "react";
import Warning from "../assets/RoundWarning";

export default function BugMessage({ title, children }) {
  return (
    <div className="flex bg-[#fff] p-8 border mx-4 mb-4 mt-4 border-[#e2e2ea] rounded-[10px] items-center">
      <article>
        <h2 className="flex items-center text-xl font-bold mt-0">
          <Warning className="mr-2" />
          {title}
        </h2>
        <section className="mt-2">
          <p className="text-sm">{children}</p>
        </section>
      </article>
    </div>
  );
}
