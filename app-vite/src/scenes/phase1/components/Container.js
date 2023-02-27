import React from "react";

export default function Container({ children, ...props }) {
  return (
    <section className="md:p-4">
      <div className="max-w-[80rem] rounded-lg shadow my-0 md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 relative overflow-hidden justify-between bg-white" {...props}>
        {children}
      </div>
    </section>
  );
}
