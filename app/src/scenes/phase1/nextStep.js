import React from "react";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import MedicalFile from "./MedicalFile";
import Rules from "./Rules";

export default function NextStep() {
  return (
    <>
      <MedicalFile />
      <ImageRight />
      <AutoTest />
      <Rules />
    </>
  );
}
