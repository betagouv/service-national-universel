import React from "react";
import Field from "./Field";
import { Field as TField } from "../common/types";

type OwnProps = {
  title?: string | React.ReactNode;
  fields?: TField[];
  children?: React.ReactNode;
  className?: string;
};

const List = ({ title, fields, children, className }: OwnProps) => (
  <div className={`pt-1 pb-1 ${className}`}>
    {title && (
      <h2 className="mt-0 mb-[19px] text-[18px] font-semibold leading-[32px]">
        {title}
      </h2>
    )}
    {fields &&
      fields.map(({ label, value }, i) => (
        <Field label={label} value={value} key={`title-${i}`}></Field>
      ))}
    {children}
  </div>
);

export default List;
