import React from "react";

export default function Container({ children, ...props }) {
  return (
    <section className="md:p-4">
      <div className="relative my-0 max-w-[80rem] justify-between overflow-hidden rounded-lg bg-white px-4 py-8 shadow md:mx-auto md:!px-8 lg:!px-16" {...props}>
        {children}
      </div>
    </section>
  );
}
