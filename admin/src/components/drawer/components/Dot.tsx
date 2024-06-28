import React from "react";

interface Props {
  active?: boolean;
  className?: string;
}

export const Dot = ({ active, className }: Props) => {
  const color = active ? "#D0D2E2" : "#B3B5CD";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {!active && <circle cx="11.5" cy="12.5" r="1.5" fill={color} />}
      {active && <circle cx="12" cy="12" r="3" fill={color} />}
    </svg>
  );
};
