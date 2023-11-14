import React from "react";
import { IField } from "./types";

const Field = ({ label, value }: IField) => (
    <div className="flex w-full justify-between sm:flex-col md:flex-row pb-1">
        <p className="font-400 text-[16px] text-[#666666]">{label}&nbsp;:</p>
        <p className="font-400 md:text-right text-[16px] text-[#161616] break-all">
            {value ? value : "-"}
        </p>
    </div>
);

export default Field;
