import React from "react";

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    ?.join("")
    .substring(0, 2)
    .toUpperCase();

export default ({ email, className = "", color = "bg-accent-color  text-white", initials = getInitials(email) }) => {
  return <div className={`flex h-10  w-10 items-center justify-center rounded-full ${color} ${className}`}>{initials || "UN"}</div>;
};
