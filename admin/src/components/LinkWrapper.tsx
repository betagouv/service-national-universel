import React from "react";
import cx from "classnames";

export default function LinkWrapper({ children, link, hasLink }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={cx(`group flex w-full flex-col`, {
        "hover:cursor-pointer hover:text-blue-600": hasLink,
        "hover:text-inherit": !hasLink,
      })}>
      {children}
    </a>
  );
}
