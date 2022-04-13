import React from "react";

export default function Container({ children, ...props }) {
  return (
    <section className="md:p-4">
      <div className="mx-w-[80rem] rounded-lg shadow my-0 md:mx-auto px-10 py-8 relative overflow-hidden justify-between bg-white" {...props}>
        {children}
      </div>
    </section>
  );
}
