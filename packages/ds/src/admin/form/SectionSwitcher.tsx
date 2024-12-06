import React from "react";
import cx from "classnames";
import Switcher from "./Switcher";

interface SectionSwitcherProps {
  title: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
  titleClassName?: string;
  disabled?: boolean;
}

export default function SectionSwitcher({
  title,
  titleClassName,
  value,
  onChange,
  disabled,
  className,
}: SectionSwitcherProps) {
  return (
    <div className={cx("flex flex-col w-full pr-12", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2
            className={cx("mt-0 text-sm leading-5 font-bold", titleClassName)}
          >
            {title}
          </h2>
          <div className="text-sm leading-5 font-bold text-blue-600">
            {value ? "Oui" : "Non"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Switcher
            label="Inclure"
            value={value}
            disabled={disabled}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
