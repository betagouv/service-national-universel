import React from "react";
import cx from "classnames";

interface Props {
  count: number;
  className?: string;
}

export default function BadgeNotif({ count, className }: Props) {
  return (
    <div
      className={cx(
        `rounded-full self-center px-[9px] text-xs font-medium leading-[22px]`,
        className,
        {
          "text-gray-400 bg-gray-100": !count,
          "text-blue-600 bg-blue-100": count,
        }
      )}
    >
      {count}
    </div>
  );
}
