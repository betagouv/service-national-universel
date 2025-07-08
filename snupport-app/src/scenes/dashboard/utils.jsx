import React from "react";
import { HiArrowDown, HiArrowUp } from "react-icons/hi";

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const arrow = (value) => (value ? <HiArrowUp /> : <HiArrowDown />);
